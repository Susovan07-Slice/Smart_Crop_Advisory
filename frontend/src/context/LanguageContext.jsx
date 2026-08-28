import React, { createContext, useState, useContext } from 'react';
import { translations } from '../translations';

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(localStorage.getItem('smartcrop_lang') || 'en');

  const changeLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('smartcrop_lang', newLang);
  };

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
