import { useState } from "react";
import { Globe2, MapPin, Loader2, Crosshair } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface GeoScope {
  scope: "global" | "local";
  country?: string | null;
  region?: string | null;
  city?: string | null;
  radiusKm?: number | null;
  lat?: number | null;
  lng?: number | null;
}

interface Props {
  value: GeoScope;
  onChange: (v: GeoScope) => void;
}

export function GeoScopePicker({ value, onChange }: Props) {
  const [locating, setLocating] = useState(false);

  const set = (patch: Partial<GeoScope>) => onChange({ ...value, ...patch });

  const detectLocation = () => {
    if (!navigator.geolocation) {
      toast.error("Tu navegador no soporta geolocalización");
      return;
    }
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude, longitude } = pos.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${latitude}&lon=${longitude}`,
            { headers: { Accept: "application/json" } },
          );
          const j = await res.json();
          const a = j.address || {};
          set({
            lat: latitude,
            lng: longitude,
            country: a.country ?? value.country ?? null,
            region: a.state ?? a.region ?? value.region ?? null,
            city: a.city ?? a.town ?? a.village ?? value.city ?? null,
          });
          toast.success("Ubicación detectada");
        } catch {
          set({ lat: latitude, lng: longitude });
          toast.success("Ubicación capturada");
        } finally {
          setLocating(false);
        }
      },
      () => {
        setLocating(false);
        toast.error("No pudimos obtener tu ubicación");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  return (
    <div className="space-y-3">
      <div>
        <Label>Alcance geográfico</Label>
        <p className="text-xs text-muted-foreground mt-1">
          Indica a la IA si tu contenido se publica para todo el mundo o solo en una zona.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={() => set({ scope: "global" })}
          className={`rounded-2xl border p-3 text-left transition ${
            value.scope === "global"
              ? "border-cyan-400/60 bg-cyan-500/10"
              : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
          }`}
        >
          <div className="flex items-center gap-2">
            <Globe2 size={16} className="text-cyan-300" />
            <span className="text-sm font-semibold text-foreground">Global</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Visible en todos los países donde llegue.
          </p>
        </button>
        <button
          type="button"
          onClick={() => set({ scope: "local" })}
          className={`rounded-2xl border p-3 text-left transition ${
            value.scope === "local"
              ? "border-fuchsia-400/60 bg-fuchsia-500/10"
              : "border-white/10 bg-white/[0.03] hover:bg-white/[0.06]"
          }`}
        >
          <div className="flex items-center gap-2">
            <MapPin size={16} className="text-fuchsia-300" />
            <span className="text-sm font-semibold text-foreground">Local</span>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            Limitado a tu zona geográfica (estilo Facebook).
          </p>
        </button>
      </div>

      {value.scope === "local" && (
        <div className="space-y-3 rounded-2xl border border-fuchsia-400/20 bg-fuchsia-500/5 p-3">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <span className="text-xs font-semibold text-foreground">Tu zona</span>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={detectLocation}
              disabled={locating}
              className="border-white/15 bg-white/5"
            >
              {locating ? <Loader2 size={14} className="animate-spin" /> : <Crosshair size={14} />}
              <span className="ml-1">Usar mi ubicación</span>
            </Button>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Input
              placeholder="País"
              value={value.country ?? ""}
              onChange={(e) => set({ country: e.target.value })}
            />
            <Input
              placeholder="Estado / Región"
              value={value.region ?? ""}
              onChange={(e) => set({ region: e.target.value })}
            />
            <Input
              placeholder="Ciudad"
              value={value.city ?? ""}
              onChange={(e) => set({ city: e.target.value })}
            />
          </div>
          <div>
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Radio de alcance</span>
              <span className="text-foreground font-semibold">{value.radiusKm ?? 50} km</span>
            </div>
            <Slider
              value={[value.radiusKm ?? 50]}
              min={5}
              max={500}
              step={5}
              onValueChange={([v]) => set({ radiusKm: v })}
              className="mt-2"
            />
          </div>
          {value.lat != null && value.lng != null && (
            <p className="text-[11px] text-muted-foreground">
              Coordenadas: {Number(value.lat).toFixed(3)}, {Number(value.lng).toFixed(3)}
            </p>
          )}
          <p className="text-[11px] text-muted-foreground">
            La IA evitará publicar fuera de este rango.
          </p>
        </div>
      )}
    </div>
  );
}
