import { FileText, Check } from 'lucide-react';

export function ResumePreview() {
  return <div className="rounded-2xl border border-line bg-white p-8 shadow-[8px_10px_0_0_rgba(30,36,51,0.06)]">
    <div className="flex items-center gap-3 text-primary"><FileText className="size-7"/><p className="text-lg font-semibold">Ваше резюме</p></div>
    <p className="mt-3 text-sm text-muted">Заполните профиль, опишите личный вклад в проекты и сохраните готовый документ.</p>
    <div className="mt-6 space-y-4">{['Контакты и специализация','Опыт и проекты','Навыки и образование','PDF для отправки работодателю'].map(label => <div key={label} className="flex items-center gap-3 rounded-xl bg-page p-4"><Check className="size-5 text-primary"/><span>{label}</span></div>)}</div>
    <p className="mt-6 text-xs text-muted">Отдельные версии резюме и снимки в откликах помогают отслеживать, что вы отправили.</p>
  </div>;
}
