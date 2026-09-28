import { Outlet, useMatches } from 'react-router';
import type { RouteHandle } from '../../router/paths';
import { Sidebar } from './Sidebar';

export function DashboardLayout() {
  const matches = useMatches();
  // Заголовок берём из handle самого глубокого совпавшего маршрута
  const title =
    [...matches].reverse().map((m) => (m.handle as RouteHandle | undefined)?.title).find(Boolean) ?? '';

  return (
    <div className="flex min-h-screen">
      <Sidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-24 items-center border-b border-line bg-white px-8">
          <p className="text-xl font-medium text-ink">{title}</p>
        </header>
        <main className="flex-1 bg-page px-10 py-10">
          <Outlet />
        </main>
      </div>
    </div>
  );
}