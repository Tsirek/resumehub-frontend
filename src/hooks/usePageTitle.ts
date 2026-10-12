import { useEffect } from 'react';
import { useOutletContext } from 'react-router';

/** Контекст, который DashboardLayout передаёт страницам через <Outlet context={...} /> */
export interface DashboardOutletContext {
  setTitle: (title: string | null) => void;
}

/** Переопределяет заголовок в шапке кабинета, пока страница открыта. null → заголовок из router. */
export function usePageTitle(title: string | null) {
  const { setTitle } = useOutletContext<DashboardOutletContext>();

  useEffect(() => {
    setTitle(title);
    return () => setTitle(null);
  }, [title, setTitle]);
}