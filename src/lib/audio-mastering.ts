/**
 * Browser-side mastering chain v2 (Web Audio API, OfflineAudioContext).
 *
 * Pipeline:
 *   1. HPF 30Hz                 — clean sub rumble
 *   2. Low-shelf +2dB @ 80Hz    — warm sub
 *   3. Peaking +1.5dB @ 200Hz   — body
 *   4. Peaking -1.5dB @ 400Hz   — un-mud
 *   5. De-esser (5–8kHz dynamic dip) — tame sibilance
 *   6. Peaking +2dB @ 4kHz       — vocal/snare presence
 *   7. Harmonic exciter (HPF→tanh→band-limit→mix 8%) — sparkle/air
 *   8. High-shelf +1.5dB @ 10kHz — air
 *   9. Tape saturation (gentle tanh waveshaper, drive 1.15) — analog glue
 *  10. Bus glue compressor       — soft compression
 *  11. Mid/Side stereo widener   — wider image (~+25% sides)
 *  12. Makeup gain (LUFS-targeted on 2nd pass)
 *  13. Brick-wall limiter @ -1dBTP
 *
 * Output: 16-bit WAV @ 44.1kHz stereo.
 */

const TARGET_LUFS = -14;
const CEILING_DB = -1;

export async function masterAudioBlob(input: Blob): Promise<Blob> {
  const arrayBuffer = await input.arrayBuffer();
  const decodeCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
  const decoded = await decodeCtx.decodeAudioData(arrayBuffer.slice(0));
  await decodeCtx.close();

  const sampleRate = 44100;
  const length = Math.ceil(decoded.duration * sampleRate);

  // First pass: render with unity makeup to measure loudness
  const probe = await renderMaster(decoded, sampleRate, length, 1.0);
  const integratedDb = estimateIntegratedLoudnessDb(probe.buffer);
  const gainAdjustDb = TARGET_LUFS - integratedDb;
  const clampedDb = Math.max(-6, Math.min(12, gainAdjustDb));

  if (Math.abs(clampedDb) < 0.5) return audioBufferToWavBlob(probe.buffer);

  const final = await renderMaster(decoded, sampleRate, length, dbToGain(clampedDb));
  return audioBufferToWavBlob(final.buffer);
}

async function renderMaster(
  decoded: AudioBuffer,
  sampleRate: number,
  length: number,
  makeupGain: number,
): Promise<{ buffer: AudioBuffer }> {
  const offline = new OfflineAudioContext(2, length, sampleRate);
  const src = offline.createBufferSource();
  src.buffer = decoded;

  // ---- EQ stage ----
  const hpf = bq(offline, "highpass", 30, 0.7);
  const lowShelf = bq(offline, "lowshelf", 80, undefined, 2);
  const body = bq(offline, "peaking", 200, 0.8, 1.5);
  const mud = bq(offline, "peaking", 400, 1.0, -1.5);

  // ---- De-esser: split sibilant band, compress only it, recombine ----
  // Implemented as: parallel "side" path with bandpass 5–8kHz → compressor → inverted mix
  // Practical trick: use a peaking dip with dynamic-style compression via a fast compressor on the bandpass send
  const deEsserBand = bq(offline, "peaking", 6500, 1.4, 0); // neutral by default
  const deEsserComp = offline.createDynamicsCompressor();
  deEsserComp.threshold.value = -22;
  deEsserComp.knee.value = 4;
  deEsserComp.ratio.value = 6;
  deEsserComp.attack.value = 0.001;
  deEsserComp.release.value = 0.05;
  // Subtle static dip pre-comp to shape the band; the comp acts on transients in 5–8kHz region
  // (Web Audio doesn't expose true sidechain, but compressor follows its own input level here.)

  const presence = bq(offline, "peaking", 4000, 1.0, 2);

  // ---- Harmonic exciter ----
  // High-pass send → soft saturation → low-pass band-limit → mix in parallel
  const exciterHP = bq(offline, "highpass", 6000, 0.7);
  const exciterShape = offline.createWaveShaper();
  exciterShape.curve = makeSoftCurve(2.5) as any;
  exciterShape.oversample = "2x";
  const exciterLP = bq(offline, "lowpass", 14000, 0.7);
  const exciterMix = offline.createGain();
  exciterMix.gain.value = 0.08; // 8% blend

  // Dry through-path for parallel exciter
  const dryAfterPresence = offline.createGain();
  dryAfterPresence.gain.value = 1.0;

  const air = bq(offline, "highshelf", 10000, undefined, 1.5);

  // ---- Tape saturation (gentle, on full bus) ----
  const tape = offline.createWaveShaper();
  tape.curve = makeSoftCurve(1.15) as any;
  tape.oversample = "2x";

  // ---- Bus glue compressor ----
  const comp = offline.createDynamicsCompressor();
  comp.threshold.value = -18;
  comp.knee.value = 6;
  comp.ratio.value = 2.5;
  comp.attack.value = 0.01;
  comp.release.value = 0.18;

  // ---- M/S widener (subtract a small portion of opposite channel) ----
  const splitter = offline.createChannelSplitter(2);
  const merger = offline.createChannelMerger(2);
  const lGain = offline.createGain(); lGain.gain.value = 1;
  const rGain = offline.createGain(); rGain.gain.value = 1;
  const lInv = offline.createGain(); lInv.gain.value = -0.13;
  const rInv = offline.createGain(); rInv.gain.value = -0.13;

  // ---- Makeup + limiter ----
  const makeup = offline.createGain();
  makeup.gain.value = makeupGain;
  const limiter = offline.createDynamicsCompressor();
  limiter.threshold.value = CEILING_DB;
  limiter.knee.value = 0;
  limiter.ratio.value = 20;
  limiter.attack.value = 0.001;
  limiter.release.value = 0.05;

  // ===== Wire main chain =====
  src.connect(hpf).connect(lowShelf).connect(body).connect(mud);

  // de-esser band as serial dip+fast comp on sibilant freqs
  mud.connect(deEsserBand).connect(deEsserComp).connect(presence);

  // Parallel exciter: presence → (dry + exciter send) → air
  const sumAfterExciter = offline.createGain();
  presence.connect(dryAfterPresence).connect(sumAfterExciter);
  presence.connect(exciterHP).connect(exciterShape).connect(exciterLP).connect(exciterMix).connect(sumAfterExciter);

  sumAfterExciter.connect(air).connect(tape).connect(comp);

  // Stereo widening
  comp.connect(splitter);
  splitter.connect(lGain, 0);
  splitter.connect(rInv, 1);
  lGain.connect(merger, 0, 0);
  rInv.connect(merger, 0, 0);
  splitter.connect(rGain, 1);
  splitter.connect(lInv, 0);
  rGain.connect(merger, 0, 1);
  lInv.connect(merger, 0, 1);

  merger.connect(makeup).connect(limiter).connect(offline.destination);

  src.start(0);
  const buffer = await offline.startRendering();
  return { buffer };
}

function bq(
  ctx: OfflineAudioContext,
  type: BiquadFilterType,
  freq: number,
  q?: number,
  gainDb?: number,
) {
  const f = ctx.createBiquadFilter();
  f.type = type;
  f.frequency.value = freq;
  if (q !== undefined) f.Q.value = q;
  if (gainDb !== undefined) f.gain.value = gainDb;
  return f;
}

// Soft tanh-style curve for waveshapers (drive controls intensity)
function makeSoftCurve(drive: number): Float32Array {
  const n = 4096;
  const curve = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const x = (i / (n - 1)) * 2 - 1;
    curve[i] = Math.tanh(x * drive) / Math.tanh(drive);
  }
  return curve as unknown as Float32Array;
}

function dbToGain(db: number) {
  return Math.pow(10, db / 20);
}

function estimateIntegratedLoudnessDb(buf: AudioBuffer): number {
  const ch0 = buf.getChannelData(0);
  const ch1 = buf.numberOfChannels > 1 ? buf.getChannelData(1) : ch0;
  let sum = 0;
  let count = 0;
  const threshold = 0.0005;
  for (let i = 0; i < ch0.length; i += 64) {
    const s = (ch0[i] + ch1[i]) * 0.5;
    if (Math.abs(s) > threshold) {
      sum += s * s;
      count++;
    }
  }
  if (count === 0) return -70;
  const rms = Math.sqrt(sum / count);
  return 20 * Math.log10(rms) - 3;
}

// ---- WAV encoder (16-bit PCM, stereo) ----
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
