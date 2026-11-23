import { useEffect, useState } from 'react';
import { request } from '../../api/client';
export function CoreModeNotice() {
  const [demo, setDemo] = useState(false);
  useEffect(() => {
    let active = true;
    request<{ github_report_mode: string }>('/capabilities').then(value => { if (active) setDemo(value.github_report_mode === 'demo'); }).catch(() => {});
    return () => { active = false; };
  }, []);
  return demo ? <p className="mt-6 rounded-xl bg-amber-50 p-3 text-xs text-amber-900">Тестовый Core. Отчёты демонстрируют процесс обработки и не являются оценкой навыков.</p> : null;
}
