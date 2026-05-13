// Catálogo de hashtags virales por nicho/red.
// La IA selecciona los más relevantes según las redes y nichos elegidos.

export const HASHTAGS_BY_NETWORK: Record<string, string[]> = {
  instagram: ["#reels", "#reelsviral", "#explorepage", "#instagood", "#viral", "#trending", "#fyp", "#instadaily"],
  facebook: ["#viral", "#trending", "#facebookreels", "#reels", "#parati", "#shareit", "#viralvideo"],
  tiktok: ["#fyp", "#parati", "#foryou", "#foryoupage", "#viral", "#tiktokviral", "#trending", "#xyzbca"],
  youtube: ["#shorts", "#youtubeshorts", "#viral", "#trending", "#shortsvideo", "#shortsfeed"],
};

// Hashtags por nicho de mercado (claves coinciden con el campo `niche` del catálogo de NICHE_CATALOG)
export const HASHTAGS_BY_NICHE: Record<string, string[]> = {
  "Viral LatAm": ["#viralatam", "#latinos", "#latinoamerica", "#viralvideo"],
  "Trending Hub": ["#trendingnow", "#trending2026", "#hot", "#nowtrending"],
  "Música Urbana": ["#musicaurbana", "#reggaeton", "#urbano", "#trap", "#latinmusic"],
  "Reels FYP": ["#reelsfyp", "#reelsinstagram", "#reelitfeelit"],
  "Creators Spotlight": ["#creators", "#creatorcommunity", "#contentcreator"],
  "Daily Viral": ["#dailyviral", "#viraldaily", "#viralpost"],
  "Comunidad Viral": ["#comunidadviral", "#viralfb", "#compartir"],
  Tendencias: ["#tendencias", "#tendencia", "#hot"],
  Música: ["#musica", "#music", "#newmusic", "#nuevamusica"],
  Creators: ["#creadoresdecontenido", "#creators"],
  "Reels Show": ["#reelsshow", "#reels"],
  "FYP Global": ["#fypglobal", "#fypシ", "#foryouシ"],
  "Music Hits": ["#musichits", "#hitsmusic", "#newhit"],
  "Trend Zone": ["#trendzone", "#trendalert"],
  "Creators TT": ["#tiktokcreators", "#creatortiktok"],
  "Viral Cuts": ["#viralcuts", "#viralclip"],
  "Shorts Hub": ["#shortshub", "#shortsviral"],
  "Música Trending": ["#musicatrending", "#trendingmusic", "#musicaviral"],
  "Creators YT": ["#youtubecreator", "#creatoryt"],
  "Daily Shorts": ["#dailyshorts", "#shortsdaily"],
  "Viral Now": ["#viralnow", "#nowviral"],
};

export interface HashtagInput {
  network: string;
  niches?: Array<{ niche: string }>;
}

/**
 * Genera un set de hashtags virales optimizados para las redes y nichos dados.
 * - Mezcla hashtags base de cada red con los específicos del nicho.
 * - Limita a `max` para no saturar el caption.
 */
export function generateViralHashtags(inputs: HashtagInput[], max = 18): string {
  const set = new Set<string>();

  for (const { network, niches } of inputs) {
    (HASHTAGS_BY_NETWORK[network] ?? []).slice(0, 5).forEach((t) => set.add(t));
    (niches ?? []).forEach((n) => {
      (HASHTAGS_BY_NICHE[n.niche] ?? []).forEach((t) => set.add(t));
    });
  }

  // Fallback genérico siempre presente
  ["#viral", "#trending", "#fyp"].forEach((t) => set.add(t));

  return Array.from(set).slice(0, max).join(" ");
}
