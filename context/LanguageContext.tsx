import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Language = "en" | "my";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string, params?: Record<string, string | number>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

// Translation files
import { translations } from "../translations";

export const LanguageProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguageState] = useState<Language>(() => {
    // Get language from localStorage or default to Myanmar
    const saved = localStorage.getItem("language") as Language;
    return saved || "my";
  });

  useEffect(() => {
    localStorage.setItem("language", language);
    // screen reader / browser font ရွေးချယ်မှုအတွက် စာမျက်နှာ ဘာသာစကား သတ်မှတ်
    document.documentElement.lang = language === "my" ? "my" : "en";
  }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const t = (key: string, params?: Record<string, string | number>): string => {
    const keys = key.split(".");
    let value: any = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
      if (value === undefined) {
        console.warn(`Translation missing for key: ${key} in language: ${language}`);
        // Fallback to English if key not found
        let fallbackValue: any = translations["en"];
        for (const fk of keys) {
          fallbackValue = fallbackValue?.[fk];
        }
        value = fallbackValue || key;
        break;
      }
    }
    
    let result =
      typeof value === "string"
        ? value
        : value !== undefined && value !== null
        ? String(value)
        : key;

    if (params && typeof result === "string") {
      Object.entries(params).forEach(([paramKey, paramVal]) => {
        result = result.replace(
          new RegExp(`\\{${paramKey}\\}`, "g"),
          String(paramVal ?? ""),
        );
      });
    }

    return result;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within LanguageProvider");
  }
  return context;
};

