/**
 * IndexedDB cache for decoded audio peaks (waveform thumbnails).
 *
 * Why: decoding a full MP3/WAV in the browser to draw a waveform takes
 * 200ms–2s per track. Peaks are tiny (≈8KB per track) and never change for
 * the same audio URL, so we persist them across reloads.
 */

const DB_NAME = "gafcore-audio-peaks";
const STORE = "peaks";
const VERSION = 1;
const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30; // 30 days

type CachedPeaks = {
  url: string;
  peaks: number[][]; // arrays per channel (stored as plain arrays for IDB compat)
  duration: number;
  cachedAt: number;
};

let dbPromise: Promise<IDBDatabase> | null = null;

function openDb(): Promise<IDBDatabase> {
  if (typeof indexedDB === "undefined") return Promise.reject(new Error("no idb"));
  if (dbPromise) return dbPromise;
  dbPromise = new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE)) {
        db.createObjectStore(STORE, { keyPath: "url" });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
  return dbPromise;
}

// Strip query string (signed URL params change on every refresh) so the same
// underlying file maps to a stable cache key.
function cacheKey(url: string): string {
  try {
    const u = new URL(url);
    return `${u.origin}${u.pathname}`;
  } catch {
    return url;
  }
}

export async function getCachedPeaks(
  url: string,
): Promise<{ peaks: Float32Array[]; duration: number } | null> {
  try {
    const db = await openDb();
    return await new Promise((resolve) => {
      const tx = db.transaction(STORE, "readonly");
      const req = tx.objectStore(STORE).get(cacheKey(url));
      req.onsuccess = () => {
        const row = req.result as CachedPeaks | undefined;
        if (!row) return resolve(null);
        if (Date.now() - row.cachedAt > MAX_AGE_MS) return resolve(null);
        resolve({
          peaks: row.peaks.map((arr) => Float32Array.from(arr)),
          duration: row.duration,
        });
      };
      req.onerror = () => resolve(null);
    });
  } catch {
    return null;
  }
}

export async function setCachedPeaks(
  url: string,
  peaks: Float32Array[],
  duration: number,
): Promise<void> {
  try {
    const db = await openDb();
    await new Promise<void>((resolve) => {
      const tx = db.transaction(STORE, "readwrite");
      tx.objectStore(STORE).put({
        url: cacheKey(url),
        peaks: peaks.map((arr) => Array.from(arr)),
        duration,
        cachedAt: Date.now(),
      } satisfies CachedPeaks);
      tx.oncomplete = () => resolve();
      tx.onerror = () => resolve();
      tx.onabort = () => resolve();
    });
  } catch {
    // Best-effort cache; ignore failures.
  }
}
