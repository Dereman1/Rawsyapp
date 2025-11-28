import React, { createContext, useState, useContext, useEffect } from 'react';
import { Language, getLanguage, saveLanguage, t } from '../utils/i18n';
import { useAuth } from './AuthContext';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => Promise<void>;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [language, setLanguageState] = useState<Language>('en');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLanguage();
  }, [user]);

  const loadLanguage = async () => {
    try {
      const savedLang = await getLanguage();
      setLanguageState(savedLang);
    } catch (error) {
      console.error('Error loading language:', error);
    } finally {
      setLoading(false);
    }
  };

  const setLanguage = async (lang: Language) => {
    try {
      await saveLanguage(lang);
      setLanguageState(lang);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  };

  const translate = (key: string): string => {
    return t(key, language);
  };

  if (loading) {
    return null;
  }

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        t: translate,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
