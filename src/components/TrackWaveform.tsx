import { useEffect, useRef, useState } from "react";
import WaveSurfer from "wavesurfer.js";
import { Play, Pause, GitCompare, Loader2 } from "lucide-react";
import { getCachedPeaks, setCachedPeaks } from "@/lib/peaks-cache";

type Props = {
  masteredUrl: string;
  rawUrl?: string;
  height?: number;
};

// In-memory cache of decoded peaks per URL — survives re-mounts within the session.
// Peaks are channel arrays of normalized -1..1 floats; wavesurfer accepts them
// directly via the `peaks` option, skipping a fresh decode pass.
const peaksCache = new Map<string, { peaks: Array<Float32Array>; duration: number }>();
const inflight = new Map<string, Promise<{ peaks: Array<Float32Array>; duration: number }>>();

const PEAK_SAMPLES = 1024;

async function loadPeaks(url: string) {
  const cached = peaksCache.get(url);
  if (cached) return cached;
  const existing = inflight.get(url);
  if (existing) return existing;

  const promise = (async () => {
    // Try persistent IDB cache first (survives reloads).
    const persisted = await getCachedPeaks(url);
    if (persisted) {
      peaksCache.set(url, persisted);
      inflight.delete(url);
      return persisted;
    }

    const res = await fetch(url);
    const buf = await res.arrayBuffer();
    const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const audio = await ctx.decodeAudioData(buf.slice(0));
    await ctx.close();
    const channels: Float32Array[] = [];
    const blockSize = Math.max(1, Math.floor(audio.length / PEAK_SAMPLES));
    for (let c = 0; c < Math.min(2, audio.numberOfChannels); c++) {
      const data = audio.getChannelData(c);
      const out = new Float32Array(PEAK_SAMPLES);
      for (let i = 0; i < PEAK_SAMPLES; i++) {
        let max = 0;
        const start = i * blockSize;
        const end = Math.min(start + blockSize, data.length);
        for (let j = start; j < end; j++) {
          const v = Math.abs(data[j]);
          if (v > max) max = v;
        }
        out[i] = max;
      }
      channels.push(out);
    }
    const result = { peaks: channels, duration: audio.duration };
    peaksCache.set(url, result);
    inflight.delete(url);
    // Fire-and-forget persist
    void setCachedPeaks(url, channels, audio.duration);
    return result;
  })();

  inflight.set(url, promise);
  return promise;
}

export function TrackWaveform({ masteredUrl, rawUrl, height = 64 }: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const wsRef = useRef<WaveSurfer | null>(null);
  const [visible, setVisible] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [mode, setMode] = useState<"mastered" | "raw">("mastered");
  const [ready, setReady] = useState(false);

  const currentUrl = mode === "raw" && rawUrl ? rawUrl : masteredUrl;

  // Lazy-load: only mount wavesurfer once the row enters the viewport.
  useEffect(() => {
    if (!wrapRef.current || visible) return;
    const io = new IntersectionObserver(
      (entries) => {
        for (const e of entries) {
          if (e.isIntersecting) {
            setVisible(true);
            io.disconnect();
            break;
          }
        }
      },
      { rootMargin: "200px 0px" },
    );
    io.observe(wrapRef.current);
    return () => io.disconnect();
  }, [visible]);

  useEffect(() => {
    if (!visible || !containerRef.current) return;
    let cancelled = false;
    setReady(false);

    (async () => {
      let peaksOpt: Array<Float32Array> | undefined;
      let durationOpt: number | undefined;
      try {
        const cached = peaksCache.get(currentUrl);
        if (cached) {
          peaksOpt = cached.peaks;
          durationOpt = cached.duration;
        } else {
          const loaded = await loadPeaks(currentUrl);
          if (cancelled) return;
          peaksOpt = loaded.peaks;
          durationOpt = loaded.duration;
        }
      } catch {
        // fall back to wavesurfer's own decode on the URL
      }

      if (cancelled || !containerRef.current) return;

      const ws = WaveSurfer.create({
        container: containerRef.current,
        height,
        waveColor: mode === "raw" ? "rgba(255,255,255,0.25)" : "rgba(255,255,255,0.45)",
        progressColor: mode === "raw" ? "rgba(244,114,182,0.9)" : "rgba(16,185,129,0.95)",
        cursorColor: "rgba(255,255,255,0.6)",
        barWidth: 2,
        barGap: 1,
        barRadius: 2,
        normalize: true,
        url: currentUrl,
        peaks: peaksOpt,
        duration: durationOpt,
      });
      wsRef.current = ws;
      ws.on("ready", () => setReady(true));
      ws.on("play", () => setPlaying(true));
      ws.on("pause", () => setPlaying(false));
      ws.on("finish", () => setPlaying(false));
    })();

    return () => {
      cancelled = true;
      wsRef.current?.destroy();
      wsRef.current = null;
    };
  }, [visible, currentUrl, height, mode]);

  const toggle = () => {
    if (!wsRef.current) return;
    if (playing) wsRef.current.pause();
    else wsRef.current.play();
  };

  return (
    <div ref={wrapRef} className="rounded-xl border border-white/10 bg-white/[0.03] p-3 space-y-2">
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={toggle}
          disabled={!ready}
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white text-zinc-950 transition hover:scale-105 disabled:opacity-50"
        >
          {!visible || !ready ? (
            <Loader2 size={14} className="animate-spin text-zinc-500" />
          ) : playing ? (
            <Pause size={16} />
          ) : (
            <Play size={16} className="ml-0.5" />
          )}
        </button>
        <div className="flex-1 min-w-0 relative" style={{ minHeight: height }}>
          <div ref={containerRef} className="w-full" />
          {visible && !ready && (
            <div className="absolute inset-0 flex items-center">
              <div className="h-px w-full bg-gradient-to-r from-transparent via-white/15 to-transparent animate-pulse" />
            </div>
          )}
        </div>
      </div>
      {rawUrl && (
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-1.5 text-[10px] text-white/50">
            <GitCompare size={11} />
            <span>A/B Before/After</span>
          </div>
          <div className="flex gap-1 rounded-full bg-white/5 p-0.5">
            <button
              type="button"
              onClick={() => setMode("raw")}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition ${
                mode === "raw" ? "bg-pink-500/90 text-white" : "text-white/60 hover:text-white"
              }`}
            >
              Original
            </button>
            <button
              type="button"
              onClick={() => setMode("mastered")}
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold transition ${
                mode === "mastered" ? "bg-emerald-500/90 text-white" : "text-white/60 hover:text-white"
              }`}
            >
              Masterizado
            </button>
          </div>
        </div>
      )}
      {!rawUrl && (
        <div className="flex items-center gap-2 pt-1">
          <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[9px] font-semibold text-emerald-300">
            -14 LUFS
          </span>
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[9px] font-semibold text-white/70">
            -1 dBTP
          </span>
        </div>
      )}
    </div>
  );
}
