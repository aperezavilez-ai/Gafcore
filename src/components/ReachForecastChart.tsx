import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from "recharts";
import { TrendingUp } from "lucide-react";

export interface NicheLite {
  handle: string;
  niche: string;
  followers: string; // "4.2M", "850K"
}

export function parseFollowers(s: string): number {
  if (!s) return 0;
  const m = String(s).trim().match(/([\d.]+)\s*([KMB])?/i);
  if (!m) return 0;
  const n = parseFloat(m[1]);
  const u = (m[2] || "").toUpperCase();
  if (u === "B") return n * 1_000_000_000;
  if (u === "M") return n * 1_000_000;
  if (u === "K") return n * 1_000;
  return n;
}

const fmt = (n: number) => {
  if (n >= 1_000_000_000) return (n / 1_000_000_000).toFixed(1) + "B";
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + "M";
  if (n >= 1_000) return (n / 1_000).toFixed(1) + "K";
  return String(Math.round(n));
};

const COLORS: Record<string, string> = {
  instagram: "#ec4899",
  facebook: "#3b82f6",
  tiktok: "#22d3ee",
  youtube: "#ef4444",
};

interface Props {
  byNetwork: { network: string; label: string; niches: NicheLite[] }[];
  sharesPerNetwork: number;
}

export function ReachForecastChart({ byNetwork, sharesPerNetwork }: Props) {
  const data = byNetwork.map((b) => {
    const sum = b.niches.reduce((acc, n) => acc + parseFollowers(n.followers), 0);
    return {
      network: b.label,
      key: b.network,
      reach: Math.round(sum * sharesPerNetwork * 0.12), // conservative ~12% impression rate
      audience: sum,
    };
  });
  const totalReach = data.reduce((a, b) => a + b.reach, 0);
  const totalAudience = data.reduce((a, b) => a + b.audience, 0);

  return (
    <div className="rounded-2xl border border-cyan-400/20 bg-cyan-500/5 p-4">
      <div className="flex items-center gap-2 mb-2">
        <TrendingUp size={16} className="text-cyan-300" />
        <h3 className="text-sm font-semibold text-foreground">Alcance estimado por la IA</h3>
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3 text-xs">
        <div className="rounded-lg bg-white/5 border border-white/10 p-2">
          <div className="text-muted-foreground">Audiencia total</div>
          <div className="text-base font-bold text-foreground">{fmt(totalAudience)}</div>
        </div>
        <div className="rounded-lg bg-white/5 border border-white/10 p-2">
          <div className="text-muted-foreground">Impresiones proyectadas</div>
          <div className="text-base font-bold text-cyan-300">{fmt(totalReach)}</div>
        </div>
      </div>
      <div className="h-48">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.06)" />
            <XAxis dataKey="network" stroke="rgba(255,255,255,0.5)" fontSize={11} />
            <YAxis stroke="rgba(255,255,255,0.5)" fontSize={11} tickFormatter={fmt} />
            <Tooltip
              contentStyle={{ background: "#0a1018", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 12 }}
              formatter={(v: any) => fmt(Number(v))}
            />
            <Bar dataKey="reach" radius={[8, 8, 0, 0]}>
              {data.map((d) => (
                <Cell key={d.key} fill={COLORS[d.key] || "#a78bfa"} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      <p className="mt-2 text-[11px] text-muted-foreground">
        * Estimación basada en seguidores de los nichos seleccionados por la IA × {sharesPerNetwork} compartidas/red, con tasa de impresión conservadora.
      </p>
    </div>
  );
}
