export interface MusicStore {
  id: string;
  name: string;
  category: "major" | "streaming" | "social" | "download" | "other";
  icon: string;
  baseUrl: string;
}

export const MUSIC_STORES: MusicStore[] = [
  // Major platforms
  { id: "spotify", name: "Spotify", category: "major", icon: "🟢", baseUrl: "https://open.spotify.com" },
  { id: "apple_music", name: "Apple Music", category: "major", icon: "🍎", baseUrl: "https://music.apple.com" },
  { id: "amazon_music", name: "Amazon Music", category: "major", icon: "📦", baseUrl: "https://music.amazon.com" },
  { id: "youtube_music", name: "YouTube Music", category: "major", icon: "▶️", baseUrl: "https://music.youtube.com" },
  { id: "deezer", name: "Deezer", category: "major", icon: "🎵", baseUrl: "https://www.deezer.com" },
  { id: "tidal", name: "TIDAL", category: "major", icon: "🌊", baseUrl: "https://tidal.com" },
  // Streaming
  { id: "pandora", name: "Pandora", category: "streaming", icon: "📻", baseUrl: "https://www.pandora.com" },
  { id: "iheart", name: "iHeartRadio", category: "streaming", icon: "❤️", baseUrl: "https://www.iheart.com" },
  { id: "audiomack", name: "Audiomack", category: "streaming", icon: "🔊", baseUrl: "https://audiomack.com" },
  { id: "soundcloud", name: "SoundCloud", category: "streaming", icon: "☁️", baseUrl: "https://soundcloud.com" },
  { id: "anghami", name: "Anghami", category: "streaming", icon: "🎶", baseUrl: "https://www.anghami.com" },
  { id: "boomplay", name: "Boomplay", category: "streaming", icon: "💥", baseUrl: "https://www.boomplay.com" },
  { id: "jiosaavn", name: "JioSaavn", category: "streaming", icon: "🇮🇳", baseUrl: "https://www.jiosaavn.com" },
  { id: "kkbox", name: "KKBOX", category: "streaming", icon: "🎵", baseUrl: "https://www.kkbox.com" },
  { id: "netease", name: "NetEase Cloud Music", category: "streaming", icon: "☁️", baseUrl: "https://music.163.com" },
  { id: "qq_music", name: "QQ Music", category: "streaming", icon: "🐧", baseUrl: "https://y.qq.com" },
  { id: "yandex", name: "Yandex Music", category: "streaming", icon: "🔍", baseUrl: "https://music.yandex.com" },
  { id: "zvuk", name: "Zvuk", category: "streaming", icon: "🔔", baseUrl: "https://zvuk.com" },
  { id: "resso", name: "Resso", category: "streaming", icon: "🎤", baseUrl: "https://www.resso.com" },
  { id: "gaana", name: "Gaana", category: "streaming", icon: "🎹", baseUrl: "https://gaana.com" },
  // Social
  { id: "tiktok", name: "TikTok", category: "social", icon: "🎬", baseUrl: "https://www.tiktok.com" },
  { id: "instagram", name: "Instagram / Facebook", category: "social", icon: "📸", baseUrl: "https://www.instagram.com" },
  { id: "facebook", name: "Facebook Reels", category: "social", icon: "📘", baseUrl: "https://www.facebook.com" },
  { id: "youtube", name: "YouTube", category: "social", icon: "▶️", baseUrl: "https://www.youtube.com" },
  { id: "youtube_shorts", name: "YouTube Shorts", category: "social", icon: "📱", baseUrl: "https://www.youtube.com/shorts" },
  { id: "whatsapp", name: "WhatsApp Status", category: "social", icon: "💬", baseUrl: "https://www.whatsapp.com" },
  { id: "snapchat", name: "Snapchat", category: "social", icon: "👻", baseUrl: "https://www.snapchat.com" },
  { id: "triller", name: "Triller", category: "social", icon: "🎞️", baseUrl: "https://www.triller.co" },
  { id: "capcut", name: "CapCut", category: "social", icon: "✂️", baseUrl: "https://www.capcut.com" },
  // Download stores
  { id: "itunes", name: "iTunes", category: "download", icon: "🎵", baseUrl: "https://www.apple.com/itunes" },
  { id: "amazon_store", name: "Amazon Store", category: "download", icon: "🛒", baseUrl: "https://www.amazon.com/music" },
  { id: "beatport", name: "Beatport", category: "download", icon: "🎛️", baseUrl: "https://www.beatport.com" },
  { id: "juno", name: "Juno Download", category: "download", icon: "⬇️", baseUrl: "https://www.junodownload.com" },
  { id: "medianet", name: "MediaNet", category: "download", icon: "📁", baseUrl: "https://www.mndigital.com" },
  // Other
  { id: "shazam", name: "Shazam", category: "other", icon: "🔎", baseUrl: "https://www.shazam.com" },
  { id: "claromusica", name: "Claro Música", category: "other", icon: "📱", baseUrl: "https://www.claromusica.com" },
  { id: "saavn", name: "Saavn", category: "other", icon: "🎵", baseUrl: "https://www.saavn.com" },
  { id: "gracenote", name: "Gracenote", category: "other", icon: "📝", baseUrl: "https://www.gracenote.com" },
  { id: "7digital", name: "7digital", category: "other", icon: "7️⃣", baseUrl: "https://www.7digital.com" },
  { id: "tencent", name: "Tencent Music", category: "other", icon: "🎵", baseUrl: "https://www.tencentmusic.com" },
  { id: "flowhiphop", name: "FLO", category: "other", icon: "🌸", baseUrl: "https://www.music-flo.com" },
  { id: "joox", name: "JOOX", category: "other", icon: "🎵", baseUrl: "https://www.joox.com" },
  { id: "trebel", name: "Trebel", category: "other", icon: "🎵", baseUrl: "https://www.trebelmusic.com" },
  { id: "peloton", name: "Peloton", category: "other", icon: "🚴", baseUrl: "https://www.onepeloton.com" },
];

export const STORE_CATEGORIES = ["major", "streaming", "social", "download", "other"] as const;

export type StoreCategory = (typeof STORE_CATEGORIES)[number];

export function getStoreById(id: string): MusicStore | undefined {
  return MUSIC_STORES.find((s) => s.id === id);
}

export function getStoresByCategory(category: StoreCategory): MusicStore[] {
  return MUSIC_STORES.filter((s) => s.category === category);
}
