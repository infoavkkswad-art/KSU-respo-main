import { useEffect } from 'react';
import { Globe2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';

const languages = [
  { code: 'en', labelKey: 'common.english', flag: '🇬🇧' },
  { code: 'hi', labelKey: 'common.hindi', flag: '🇮🇳' },
  { code: 'gu', labelKey: 'common.gujarati', flag: '🇮🇳' },
] as const;

export function LanguageSelector() {
  const { i18n, t } = useTranslation();

  const currentLanguage =
    i18n.resolvedLanguage?.split('-')[0] || 'en';

  useEffect(() => {
    document.documentElement.lang = currentLanguage;
  }, [currentLanguage]);

  return (
    <label
      className="
        inline-flex
        min-h-[40px]
        items-center
        gap-1.5
        rounded-full
        border
        border-brand-green/10
        bg-white
        px-2.5
        text-brand-green
        shadow-soft
      "
      title={t('common.selectLanguage')}
    >
      <Globe2
        className="h-4 w-4 shrink-0"
        aria-hidden="true"
      />

      <span className="sr-only">
        {t('common.selectLanguage')}
      </span>

      <select
        value={currentLanguage}
        onChange={(event) =>
          i18n.changeLanguage(event.target.value)
        }
        className="
          max-w-[105px]
          cursor-pointer
          bg-transparent
          text-xs
          font-semibold
          text-brand-brown
          outline-none
          sm:text-sm
        "
        aria-label={t('common.selectLanguage')}
      >
        {languages.map((language) => (
          <option
            key={language.code}
            value={language.code}
          >
            {language.flag} {t(language.labelKey)}
          </option>
        ))}
      </select>
    </label>
  );
}
