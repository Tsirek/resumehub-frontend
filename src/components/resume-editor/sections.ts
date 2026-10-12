export type SectionId =
  | 'contacts'
  | 'about'
  | 'experience'
  | 'projects'
  | 'skills'
  | 'education'
  | 'additional';

export const SECTIONS: { id: SectionId; label: string }[] = [
  { id: 'contacts', label: 'Контакты' },
  { id: 'about', label: 'О себе' },
  { id: 'experience', label: 'Опыт' },
  { id: 'projects', label: 'Проекты' },
  { id: 'skills', label: 'Навыки' },
  { id: 'education', label: 'Образование' },
  { id: 'additional', label: 'Дополнительно' },
];

export const isSectionId = (value: string | null): value is SectionId =>
  SECTIONS.some((s) => s.id === value);