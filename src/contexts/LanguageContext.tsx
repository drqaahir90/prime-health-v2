import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../lib/db';
import type { Language, TranslationEntry } from '../types';

interface LanguageContextType {
  lang: Language;
  setLang: (lang: Language) => void;
  t: (key: string, fallback?: string) => string;
  dir: 'ltr' | 'rtl';
  isRTL: boolean;
  languages: { code: Language; label: string }[];
}

const LANG_LABELS: Record<Language, string> = {
  en: 'English',
  ar: 'العربية',
  so: 'Soomaali',
};

const LanguageContext = createContext<LanguageContextType>({
  lang: 'en',
  setLang: () => {},
  t: (key: string) => key,
  dir: 'ltr',
  isRTL: false,
  languages: [],
});

export const useLanguage = () => useContext(LanguageContext);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Language>(() => {
    const stored = localStorage.getItem('phc_language');
    return (stored as Language) || 'en';
  });

  const [translations, setTranslations] = useState<TranslationEntry[]>([]);

  const load = () => {
    setTranslations(db.getAll<TranslationEntry>('translations'));
  };

  useEffect(() => {
    load();
    return db.subscribe('translations', load);
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const setLang = useCallback((newLang: Language) => {
    setLangState(newLang);
    localStorage.setItem('phc_language', newLang);
  }, []);

  const t = useCallback((key: string, fallback?: string): string => {
    const entry = translations.find(tr => tr.key === key);
    if (!entry) return fallback || key;
    return entry[lang] || entry.en || fallback || key;
  }, [lang, translations]);

  const dir = lang === 'ar' ? 'rtl' : 'ltr';
  const isRTL = lang === 'ar';

  const languages = Object.entries(LANG_LABELS).map(([code, label]) => ({
    code: code as Language,
    label,
  }));

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, dir, isRTL, languages }}>
      {children}
    </LanguageContext.Provider>
  );
}
