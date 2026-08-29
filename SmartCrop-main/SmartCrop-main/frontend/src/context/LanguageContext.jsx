import React, { createContext, useState, useContext, useEffect } from 'react';
import { translations } from '../translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('smartcrop_lang') || 'en');

  const changeLanguage = (newLang) => {
    if (!newLang) return;
    setLang(newLang);
    localStorage.setItem('smartcrop_lang', newLang);
    window.dispatchEvent(new CustomEvent('smartCropLanguageUpdated', { detail: newLang }));
  };

  useEffect(() => {
    const handleSync = () => {
      const stored = localStorage.getItem('smartcrop_lang');
      if (stored) setLang(stored);
    };

    window.addEventListener('smartCropLanguageUpdated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('smartCropLanguageUpdated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const t = (key) => {
    return translations[lang]?.[key] || translations['en'][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ lang, changeLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => useContext(LanguageContext);
