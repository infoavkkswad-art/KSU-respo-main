```tsx
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';


/* ==========================================================================
   LANGUAGE TYPES
   ========================================================================== */

export type Language = 'en' | 'hi';

type TranslationVariables = Record<
  string,
  string | number
>;

type TranslationKey = string;

interface LanguageContextValue {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (
    key: TranslationKey,
    variables?: TranslationVariables,
  ) => string;
}


/* ==========================================================================
   TRANSLATIONS
   ========================================================================== */

const translations: Record<
  Language,
  Record<string, string>
> = {
  en: {
    /* ------------------------------------------------------------------------
       HEADER
       ------------------------------------------------------------------------ */

    'header.trust.nimadsOwnPapad':
      "Nimad's Own Papad",

    'header.mainNavigation':
      'Main navigation',

    'header.mobileNavigation':
      'Mobile navigation',

    'header.language':
      'Language',

    'header.searchProducts':
      'Search products',

    'header.closeSearch':
      'Close search',

    'header.searchPlaceholder':
      'Search papads...',

    'header.search':
      'Search',

    'header.shopPapads':
      'Shop Papads',

    'header.closeMenu':
      'Close menu',

    'header.openMenu':
      'Open menu',

    'header.closeMobileMenu':
      'Close mobile menu',

    'header.cart':
      'Cart',

    'header.cartAria':
      'Cart with {count} items',

    /* ------------------------------------------------------------------------
       NAVIGATION
       ------------------------------------------------------------------------ */

    'nav.home':
      'Home',

    'nav.shop':
      'Shop',

    'nav.about':
      'Our Story',

    'nav.manufacturing':
      'Making',

    'nav.blog':
      'Journal',

    'nav.contact':
      'Contact',
  },

  hi: {
    /* ------------------------------------------------------------------------
       HEADER
       ------------------------------------------------------------------------ */

    'header.trust.nimadsOwnPapad':
      'निमाड़ का अपना पापड़',

    'header.mainNavigation':
      'मुख्य नेविगेशन',

    'header.mobileNavigation':
      'मोबाइल नेविगेशन',

    'header.language':
      'भाषा',

    'header.searchProducts':
      'उत्पाद खोजें',

    'header.closeSearch':
      'सर्च बंद करें',

    'header.searchPlaceholder':
      'पापड़ खोजें...',

    'header.search':
      'खोजें',

    'header.shopPapads':
      'पापड़ खरीदें',

    'header.closeMenu':
      'मेनू बंद करें',

    'header.openMenu':
      'मेनू खोलें',

    'header.closeMobileMenu':
      'मोबाइल मेनू बंद करें',

    'header.cart':
      'कार्ट',

    'header.cartAria':
      '{count} वस्तुओं वाला कार्ट',

    /* ------------------------------------------------------------------------
       NAVIGATION
       ------------------------------------------------------------------------ */

    'nav.home':
      'होम',

    'nav.shop':
      'दुकान',

    'nav.about':
      'हमारी कहानी',

    'nav.manufacturing':
      'निर्माण प्रक्रिया',

    'nav.blog':
      'जर्नल',

    'nav.contact':
      'संपर्क',
  },
};


/* ==========================================================================
   CONTEXT
   ========================================================================== */

const LanguageContext =
  createContext<LanguageContextValue | undefined>(
    undefined,
  );


/* ==========================================================================
   PROVIDER
   ========================================================================== */

interface LanguageProviderProps {
  children: ReactNode;
}

export function LanguageProvider({
  children,
}: LanguageProviderProps) {
  const [
    language,
    setLanguageState,
  ] = useState<Language>(() => {
    if (
      typeof window === 'undefined'
    ) {
      return 'en';
    }

    const savedLanguage =
      window.localStorage.getItem(
        'kawad-swad-language',
      );

    if (
      savedLanguage === 'hi'
    ) {
      return 'hi';
    }

    return 'en';
  });


  /* ------------------------------------------------------------------------
     SAVE LANGUAGE PREFERENCE
     ------------------------------------------------------------------------ */

  useEffect(() => {
    window.localStorage.setItem(
      'kawad-swad-language',
      language,
    );

    document.documentElement.lang =
      language;
  }, [language]);


  /* ------------------------------------------------------------------------
     LANGUAGE SWITCHER
     ------------------------------------------------------------------------ */

  const setLanguage = (
    nextLanguage: Language,
  ) => {
    setLanguageState(
      nextLanguage,
    );
  };


  /* ------------------------------------------------------------------------
     TRANSLATION FUNCTION
     ------------------------------------------------------------------------ */

  const t = (
    key: TranslationKey,
    variables?: TranslationVariables,
  ): string => {
    const currentTranslations =
      translations[language];

    const englishTranslations =
      translations.en;

    let value =
      currentTranslations[key] ??
      englishTranslations[key] ??
      key;

    if (variables) {
      Object.entries(
        variables,
      ).forEach(
        ([variable, replacement]) => {
          value = value.replace(
            new RegExp(
              `\\{${variable}\\}`,
              'g',
            ),
            String(replacement),
          );
        },
      );
    }

    return value;
  };


  const contextValue =
    useMemo<LanguageContextValue>(
      () => ({
        language,
        setLanguage,
        t,
      }),
      [language],
    );


  return (
    <LanguageContext.Provider
      value={contextValue}
    >
      {children}
    </LanguageContext.Provider>
  );
}


/* ==========================================================================
   HOOK
   ========================================================================== */

export function useLanguage() {
  const context =
    useContext(LanguageContext);

  if (!context) {
    throw new Error(
      'useLanguage must be used inside LanguageProvider',
    );
  }

  return context;
}
```
