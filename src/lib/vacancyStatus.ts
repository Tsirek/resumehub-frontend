import type { VacancyStatus } from '../types';

export const VACANCY_STATUS_LABELS: Record<VacancyStatus, string> = {
  saved: 'Сохранено',
  sent: 'Отправлено',
  interview: 'Интервью',
  offer: 'Оффер',
  rejected: 'Отказ',
};

export const VACANCY_STATUS_OPTIONS = (
  Object.keys(VACANCY_STATUS_LABELS) as VacancyStatus[]
).map((value) => ({ value, label: VACANCY_STATUS_LABELS[value] }));