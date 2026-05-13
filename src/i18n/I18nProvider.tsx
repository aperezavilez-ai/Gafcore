import {
  createContext,
  useContext,
  useState,
  useCallback,
  useLayoutEffect,
  useRef,
  type ReactNode,
} from "react";
import { type LangCode, t as translate } from "@/i18n/translations";
import {
  detectBrowserPreferredLang,
  isLangCode,
  langToBcp47,
} from "@/lib/locale-detect";

interface I18nContextType {
  lang: LangCode;
  setLang: (lang: LangCode) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType>({
  lang: "es",
  setLang: () => {},
  t: (key) => key,
});

function readLangFromUrl(): LangCode | null {
  if (typeof window === "undefined") return null;
  const qp = new URLSearchParams(window.location.search).get("lang");
  if (qp && isLangCode(qp.toLowerCase())) return qp.toLowerCase() as LangCode;
  return null;
}

function stripLangQueryParam() {
  if (typeof window === "undefined") return;
  const url = new URL(window.location.href);
  if (!url.searchParams.has("lang")) return;
  url.searchParams.delete("lang");
  const next = `${url.pathname}${url.search}${url.hash}`;
  window.history.replaceState({}, "", next);
}

export function I18nProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<LangCode>("es");
  const bootstrapped = useRef(false);

  useLayoutEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    const fromUrl = readLangFromUrl();
    if (fromUrl) {
      setLangState(fromUrl);
      try {
        localStorage.setItem("gaf-lang", fromUrl);
      } catch {
        /* ignore */
      }
      document.documentElement.lang = langToBcp47(fromUrl);
      stripLangQueryParam();
      return;
    }

    try {
      const stored = localStorage.getItem("gaf-lang");
      if (stored && isLangCode(stored)) {
        setLangState(stored);
        document.documentElement.lang = langToBcp47(stored);
        return;
      }
    } catch {
      /* ignore */
    }

    const detected = detectBrowserPreferredLang();
    setLangState(detected);
    try {
      localStorage.setItem("gaf-lang", detected);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = langToBcp47(detected);
  }, []);

  const setLang = useCallback((newLang: LangCode) => {
    setLangState(newLang);
    document.documentElement.lang = langToBcp47(newLang);
    if (typeof window !== "undefined") {
      try {
        localStorage.setItem("gaf-lang", newLang);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const t = useCallback((key: string) => translate(key, lang), [lang]);

  return (
    <I18nContext.Provider value={{ lang, setLang, t }}>
      {children}
    </I18nContext.Provider>
  );
}

export function useI18n() {
  return useContext(I18nContext);
}
