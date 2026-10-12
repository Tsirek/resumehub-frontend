export const cn = (...classes: Array<string | false | null | undefined>) =>
  classes.filter(Boolean).join(' ');

export const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');

const GITHUB_PROFILE_RE = /^https?:\/\/(?:www\.)?github\.com\/([A-Za-z0-9](?:[A-Za-z0-9-]{0,38}))\/?$/;

/** "https://github.com/resume-demo" → "resume-demo". Ссылка на репозиторий вернёт null. */
export const parseGithubUsername = (url: string): string | null =>
  url.trim().match(GITHUB_PROFILE_RE)?.[1] ?? null;

const pluralRules = new Intl.PluralRules('ru');

/** Склонение по числу: pluralize(3, { one: 'файл', few: 'файла', many: 'файлов' }) */
export const pluralize = (n: number, forms: { one: string; few: string; many: string }) => {
  const category = pluralRules.select(n);
  return category === 'one' ? forms.one : category === 'few' ? forms.few : forms.many;
};