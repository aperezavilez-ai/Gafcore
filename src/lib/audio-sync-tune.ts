/**
 * Sync & Tune pipeline (Web Audio, browser-only).
 *
 * Goal: fix the two artifacts of AI-generated songs without sounding robotic.
 *   - Music "se descuadra" → detect BPM (autocorrelation of onset envelope).
 *   - Voice "se desafina"  → detect key (Krumhansl-Schmuckler on chromagram),
 *                            then apply ONE global subtle pitch correction
 *                            (≤50 cents) so the song sits exactly on the key.
 *
 * We use a single-shift global tune (not per-frame autotune) because:
 *   - Per-frame PSOLA in pure JS is heavy and tends to glitch on full mixes.
 *   - 90% of the perceived "desafinación" in AI tracks is a constant offset
 *     of the master tuning vs the equal-temperament grid. A small global
 *     correction (resampling) fixes it transparently.
 *
 * Output: 16-bit WAV @ 44.1kHz stereo + analysis metadata.
 */

const NOTE_NAMES = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"] as const;

// Krumhansl-Schmuckler key profiles (major / minor)
const MAJOR_PROFILE = [6.35, 2.23, 3.48, 2.33, 4.38, 4.09, 2.52, 5.19, 2.39, 3.66, 2.29, 2.88];
const MINOR_PROFILE = [6.33, 2.68, 3.52, 5.38, 2.60, 3.53, 2.54, 4.75, 3.98, 2.69, 3.34, 3.17];

export interface SyncTuneResult {
  blob: Blob;
  bpm: number | null;
  key: string | null;
  tuneCents: number;
}

export async function syncAndTuneBlob(input: Blob): Promise<SyncTuneResult> {
  const arrayBuffer = await input.arrayBuffer();
  const decodeCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const decoded = await decodeCtx.decodeAudioData(arrayBuffer.slice(0));
  await decodeCtx.close();

  // ---- 1. Analysis on a downsampled mono copy (fast) ----
  const mono = toMono(decoded);
  const bpm = detectBPM(mono, decoded.sampleRate);
  const { key, tuningOffsetCents } = detectKeyAndTuning(mono, decoded.sampleRate);

  // ---- 2. Apply subtle global pitch correction (clamped to ±50¢) ----
  const correctionCents = Math.max(-50, Math.min(50, -tuningOffsetCents));
  const playbackRate = Math.pow(2, correctionCents / 1200);

  const sampleRate = 44100;
  const length = Math.ceil((decoded.duration / playbackRate) * sampleRate);
  const offline = new OfflineAudioContext(2, length, sampleRate);
  const src = offline.createBufferSource();
  src.buffer = decoded;
  src.playbackRate.value = playbackRate;
  src.connect(offline.destination);
  src.start(0);
  const rendered = await offline.startRendering();

  return {
    blob: audioBufferToWavBlob(rendered),
    bpm,
    key,
    tuneCents: Math.round(correctionCents * 10) / 10,
  };
}

// =============================================================
// BPM detection — onset envelope + autocorrelation
// =============================================================

function detectBPM(mono: Float32Array, sampleRate: number): number | null {
  // Downsample to ~11kHz, then build energy envelope at ~100Hz (10ms hops)
  const target = 11025;
  const ratio = Math.floor(sampleRate / target);
  const ds = new Float32Array(Math.floor(mono.length / ratio));
  for (let i = 0; i < ds.length; i++) ds[i] = mono[i * ratio];

  const hop = Math.floor(target / 100); // ~10ms
  const envLen = Math.floor(ds.length / hop);
  const env = new Float32Array(envLen);
  for (let i = 0; i < envLen; i++) {
    let s = 0;
    for (let j = 0; j < hop; j++) {
      const v = ds[i * hop + j] || 0;
      s += v * v;
    }
    env[i] = Math.sqrt(s / hop);
  }

  // Onset = positive derivative of envelope (half-wave rectified)
  const onset = new Float32Array(envLen);
  for (let i = 1; i < envLen; i++) {
    const d = env[i] - env[i - 1];
    onset[i] = d > 0 ? d : 0;
  }

  // Autocorrelation across BPM range 60–180
  const minBpm = 60;
  const maxBpm = 180;
  const minLag = Math.floor((60 / maxBpm) * 100);
  const maxLag = Math.floor((60 / minBpm) * 100);
  let bestLag = -1;
  let bestScore = 0;
  for (let lag = minLag; lag <= maxLag; lag++) {
    let s = 0;
    for (let i = 0; i + lag < envLen; i++) s += onset[i] * onset[i + lag];
    if (s > bestScore) {
      bestScore = s;
      bestLag = lag;
    }
  }
  if (bestLag <= 0) return null;
  const bpm = 60 / (bestLag / 100);
  return Math.round(bpm);
}

// =============================================================
// Key + tuning offset detection — chromagram + KS profile
// =============================================================

function detectKeyAndTuning(
  mono: Float32Array,
  sampleRate: number,
): { key: string | null; tuningOffsetCents: number } {
  // Use a chunk from the middle (skip intro/outro) to bias toward the song body
  const start = Math.floor(mono.length * 0.2);
  const end = Math.floor(mono.length * 0.8);
  const chunk = mono.subarray(start, end);

  // Build a coarse chromagram with high-resolution bins (3 sub-bins per semitone)
  // → also gives us tuning offset estimate.
  const refA = 440;
  const subBinsPerSemi = 3;
  const totalBins = 12 * subBinsPerSemi;
  const chromaHi = new Float64Array(totalBins);

  // FFT chunks of ~4096 samples, hop 2048
  const fftSize = 4096;
  const hop = 2048;
  const window = hannWindow(fftSize);

  for (let pos = 0; pos + fftSize < chunk.length; pos += hop) {
    const frame = new Float32Array(fftSize);
    for (let i = 0; i < fftSize; i++) frame[i] = chunk[pos + i] * window[i];
    const mag = magnitudeSpectrum(frame);
    for (let k = 1; k < mag.length; k++) {
      const freq = (k * sampleRate) / fftSize;
      if (freq < 80 || freq > 5000) continue;
      const semis = 12 * Math.log2(freq / refA);
      const bin = ((Math.round(semis * subBinsPerSemi) % totalBins) + totalBins) % totalBins;
      chromaHi[bin] += mag[k];
    }
  }

  // Tuning offset: which sub-bin offset accumulates the most energy across all 12 pitches?
  let bestOffset = 0;
  let bestEnergy = -1;
  for (let off = 0; off < subBinsPerSemi; off++) {
    let e = 0;
    for (let n = 0; n < 12; n++) e += chromaHi[n * subBinsPerSemi + off];
    if (e > bestEnergy) {
      bestEnergy = e;
      bestOffset = off;
    }
  }
  // Map offset (0..subBinsPerSemi-1) to cents (-50..+50, centered)
  const centerOffset = (subBinsPerSemi - 1) / 2;
  const tuningOffsetCents = ((bestOffset - centerOffset) / subBinsPerSemi) * 100;

  // Collapse to 12-bin chroma using the best offset
  const chroma = new Float64Array(12);
  for (let n = 0; n < 12; n++) chroma[n] = chromaHi[n * subBinsPerSemi + bestOffset];

  // Match against major + minor KS profiles (rotated)
  const { keyIndex, mode } = matchKey(chroma);
  // Note: A=440 reference — our bin 0 is A, so adjust to standard C-indexed name array
  const noteIndex = (keyIndex + 9) % 12; // A → C offset = +9
  const key = `${NOTE_NAMES[noteIndex]}${mode === "minor" ? "m" : ""}`;

  return { key, tuningOffsetCents };
}

function matchKey(chroma: Float64Array): { keyIndex: number; mode: "major" | "minor" } {
  let best = { score: -Infinity, keyIndex: 0, mode: "major" as "major" | "minor" };
  for (let r = 0; r < 12; r++) {
    const major = correlate(chroma, MAJOR_PROFILE, r);
    const minor = correlate(chroma, MINOR_PROFILE, r);
    if (major > best.score) best = { score: major, keyIndex: r, mode: "major" };
    if (minor > best.score) best = { score: minor, keyIndex: r, mode: "minor" };
  }
  return { keyIndex: best.keyIndex, mode: best.mode };
}

function correlate(chroma: Float64Array, profile: number[], rotation: number): number {
  let s = 0;
  for (let i = 0; i < 12; i++) s += chroma[i] * profile[(i - rotation + 12) % 12];
  return s;
}

// =============================================================
// FFT (real input, magnitude only)
// =============================================================

function magnitudeSpectrum(input: Float32Array): Float32Array {
  const N = input.length;
  const re = new Float32Array(input);
  const im = new Float32Array(N);
  fftInPlace(re, im);
  const half = N / 2;
  const out = new Float32Array(half);
  for (let i = 0; i < half; i++) out[i] = Math.sqrt(re[i] * re[i] + im[i] * im[i]);
  return out;
}

// Iterative radix-2 Cooley-Tukey FFT (in-place)
function fftInPlace(re: Float32Array, im: Float32Array) {
  const N = re.length;
  // bit reversal
  let j = 0;
  for (let i = 0; i < N - 1; i++) {
    if (i < j) {
      [re[i], re[j]] = [re[j], re[i]];
      [im[i], im[j]] = [im[j], im[i]];
    }
    let m = N >> 1;
    while (m >= 1 && j >= m) {
      j -= m;
      m >>= 1;
    }
    j += m;
  }
  for (let size = 2; size <= N; size <<= 1) {
    const half = size >> 1;
    const tableStep = (Math.PI * 2) / size;
    for (let i = 0; i < N; i += size) {
      for (let k = 0; k < half; k++) {
        const angle = -tableStep * k;
        const cos = Math.cos(angle);
        const sin = Math.sin(angle);
        const tre = re[i + k + half] * cos - im[i + k + half] * sin;
        const tim = re[i + k + half] * sin + im[i + k + half] * cos;
        re[i + k + half] = re[i + k] - tre;
        im[i + k + half] = im[i + k] - tim;
        re[i + k] += tre;
        im[i + k] += tim;
      }
    }
  }
}

function hannWindow(N: number): Float32Array {
  const w = new Float32Array(N);
  for (let i = 0; i < N; i++) w[i] = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (N - 1)));
  return w;
}

function toMono(buf: AudioBuffer): Float32Array {
  if (buf.numberOfChannels === 1) return buf.getChannelData(0).slice();
  const a = buf.getChannelData(0);
  const b = buf.getChannelData(1);
  const out = new Float32Array(a.length);
  for (let i = 0; i < a.length; i++) out[i] = (a[i] + b[i]) * 0.5;
  return out;
}

// =============================================================
// WAV encoder (16-bit PCM, stereo) — matches mastering output
// =============================================================

function audioBufferToWavBlob(buffer: AudioBuffer): Blob {
  const numCh = Math.min(2, buffer.numberOfChannels);
  const sampleRate = buffer.sampleRate;
  const numFrames = buffer.length;
  const bytesPerSample = 2;
  const blockAlign = numCh * bytesPerSample;
  const dataSize = numFrames * blockAlign;
  const bufferSize = 44 + dataSize;
  const ab = new ArrayBuffer(bufferSize);
  const view = new DataView(ab);

  writeStr(view, 0, "RIFF");
  view.setUint32(4, 36 + dataSize, true);
  writeStr(view, 8, "WAVE");
  writeStr(view, 12, "fmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, numCh, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, sampleRate * blockAlign, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, 16, true);
  writeStr(view, 36, "data");
  view.setUint32(40, dataSize, true);

  const channels: Float32Array[] = [];
  for (let c = 0; c < numCh; c++) channels.push(buffer.getChannelData(c));

  let offset = 44;
  for (let i = 0; i < numFrames; i++) {
    for (let c = 0; c < numCh; c++) {
      let s = Math.max(-1, Math.min(1, channels[c][i]));
      s = s < 0 ? s * 0x8000 : s * 0x7fff;
      view.setInt16(offset, s, true);
      offset += 2;
    }
  }
  return new Blob([ab], { type: "audio/wav" });
}

function writeStr(view: DataView, offset: number, str: string) {
  for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i));
}
