/**
 * Libellés et réglages dépendants de la langue de l'article.
 *
 * Le site publie chaque article en `en`, `fr` et `vi` : tout ce qui est affiché
 * autour du texte (date, temps de lecture, sommaire, navigation) doit suivre la
 * langue du contenu, pas celle du site.
 */

export type Lang = 'en' | 'fr' | 'vi';

export const DEFAULT_LANG: Lang = 'en';

/** Ordre d'affichage stable des langues. */
export const LANG_ORDER: Lang[] = ['en', 'fr', 'vi'];

export function compareLang(a: Lang, b: Lang): number {
  return LANG_ORDER.indexOf(a) - LANG_ORDER.indexOf(b);
}

export function isLang(value: string | undefined): value is Lang {
  return value === 'en' || value === 'fr' || value === 'vi';
}

export function toLang(value: string | undefined): Lang {
  return isLang(value) ? value : DEFAULT_LANG;
}

/** Étiquette d'une langue, dans cette langue. */
export const langLabels: Record<Lang, string> = {
  en: 'English',
  fr: 'Français',
  vi: 'Tiếng Việt',
};

export const langFlags: Record<Lang, string> = {
  en: '🇬🇧',
  fr: '🇫🇷',
  vi: '🇻🇳',
};

/** Locale BCP-47 utilisée pour formater les dates. */
const dateLocales: Record<Lang, string> = {
  en: 'en-GB',
  fr: 'fr-FR',
  vi: 'vi-VN',
};

export function formatDate(date: Date, lang: Lang): string {
  return date.toLocaleDateString(dateLocales[lang], {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

/**
 * Vitesse de lecture, en « mots » séparés par des espaces et par minute.
 *
 * Le vietnamien s'écrit en syllabes séparées par des espaces : un même contenu
 * y produit environ 1,4x plus de tokens qu'en anglais, d'où un débit plus élevé
 * pour arriver à une estimation comparable.
 */
const wordsPerMinute: Record<Lang, number> = {
  en: 230,
  fr: 210,
  vi: 320,
};

/** Compte les mots du corps markdown, en ignorant code et syntaxe. */
export function readingTimeMinutes(markdown: string, lang: Lang): number {
  const prose = markdown
    .replace(/```[\s\S]*?```/g, ' ') // blocs de code
    .replace(/`[^`\n]*`/g, ' ') // code inline
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1') // liens et images : garder le libellé
    .replace(/^\s{0,3}\|.*$/gm, ' ') // lignes de tableau
    .replace(/[#>*_~\-]+/g, ' ');

  const words = prose.split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / wordsPerMinute[lang]));
}

type UiStrings = {
  readingTime: (minutes: number) => string;
  tableOfContents: string;
  alsoAvailableIn: string;
  backToBlog: string;
  publishedOn: string;
};

export const ui: Record<Lang, UiStrings> = {
  en: {
    readingTime: (m) => `${m} min read`,
    tableOfContents: 'Contents',
    alsoAvailableIn: 'Also available in',
    backToBlog: 'Back to the blog',
    publishedOn: 'Published on',
  },
  fr: {
    readingTime: (m) => `${m} min de lecture`,
    tableOfContents: 'Sommaire',
    alsoAvailableIn: 'Également disponible en',
    backToBlog: 'Retour au blog',
    publishedOn: 'Publié le',
  },
  vi: {
    readingTime: (m) => `${m} phút đọc`,
    tableOfContents: 'Nội dung',
    alsoAvailableIn: 'Cũng có bằng',
    backToBlog: 'Quay lại blog',
    publishedOn: 'Đăng ngày',
  },
};
