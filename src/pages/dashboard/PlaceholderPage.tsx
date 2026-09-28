import { PageHeader } from '../../components/layout/PageHeader';

// Страницы «Проекты», «Адаптация», «Отклики» — пока не добрался
export default function PlaceholderPage({ title }: { title: string }) {
  return (
    <>
      <PageHeader title={title} subtitle="Раздел в разработке" />
      {/* BACKEND: данные раздела будут загружаться из API */}
    </>
  );
}