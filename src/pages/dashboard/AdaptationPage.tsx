import { usePageTitle } from '../../hooks/usePageTitle';
export function AdaptationPage() {
  usePageTitle('Адаптация');
  return <div className="max-w-2xl"><h1 className="text-2xl font-bold">Адаптация резюме</h1><p className="mt-4 text-muted">Автоматическая адаптация под вакансию пока недоступна: для неё требуется отдельный метод ML Core. Сейчас можно создать копию резюме, изменить её в редакторе и прикрепить к отклику.</p></div>;
}
