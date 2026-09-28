import { FileText, Star } from 'lucide-react';

const SKILLS = ['Product strategy', 'B2B SaaS', 'A/B Тесты'];

export function ResumePreview() {
  return (
    <div
      aria-hidden
      className="rounded-2xl border border-line bg-white p-5 shadow-[8px_10px_0_0_rgba(30,36,51,0.06)]"
    >
      <div className="mb-5 flex items-center gap-4 px-2">
        <span className="flex size-11 items-center justify-center rounded-lg bg-primary-soft text-primary">
          <FileText className="size-5" />
        </span>
        <p className="flex-1 font-medium text-muted">Резюме — Продакт-менеджер</p>
        <span className="flex items-center gap-1 rounded-full bg-success/10 px-3 py-1 text-[10px] text-success">
          <Star className="size-4" /> Сильное резюме • 92%
        </span>
      </div>

      <div className="grid grid-cols-[1.4fr_1fr] gap-7 rounded-xl bg-page p-5">
        {/* Документ */}
        <div className="rounded-md bg-white p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-lg text-ink">Иван Иванов</p>
              <p className="mt-1 text-[11px] uppercase text-primary">Senior Product Manager</p>
            </div>
            {/* Аватар: можно заменить на изображение из src/assets */}
            <span className="flex size-13 items-center justify-center rounded-full bg-gray-300 text-sm font-semibold text-white">
              ИИ
            </span>
          </div>
          <div className="my-4 h-0.5 bg-primary" />

          <p className="text-base text-ink">Профиль</p>
          <p className="mt-2 text-[10px] leading-snug text-muted">
            Продуктовый менеджер с 6-летним опытом запуска B2B SaaS. Увеличил подписки на 34% и вывел два
            продукта на международный рынок.
          </p>

          <p className="mt-4 text-base text-ink">Опыт работы</p>
          <p className="mt-1 text-[10px] text-muted">Senior Product Manager • Yandex</p>
          <ul className="mt-2 list-inside list-disc text-[9px] text-muted">
            <li>Руководил кросс-функциональной командой из 9 человек</li>
            <li>Рост MRR с 8 до 24 млн ₽ за 18 месяцев</li>
          </ul>

          <p className="mt-4 text-base text-ink">Ключевые навыки</p>
          <div className="mt-2 flex flex-wrap gap-1.5 pb-10">
            {SKILLS.map((skill) => (
              <span key={skill} className="rounded bg-primary-soft px-2 py-1 text-[7px] text-navy">
                {skill}
              </span>
            ))}
          </div>
        </div>

        {/* AI-панель */}
        <div className="rounded-md bg-navy p-4 text-white">
          <div className="flex items-center gap-3">
            <span className="flex size-8 items-center justify-center rounded-md bg-white/10">
              <Star className="size-4" />
            </span>
            <p className="text-xs">AI-помощник</p>
          </div>
          <p className="mt-4 text-[9px] text-white/70">
            Я усилил описание опыта и добавил измеримые результаты.
          </p>
          <div className="mt-4 rounded border border-white/15 bg-white/5 p-2">
            <p className="text-[8px] uppercase text-white/60">Улучшено</p>
            <p className="mt-1 text-[9px]">«Увеличил MMR в 3 раза за 18 месяцев»</p>
          </div>
          <div className="mt-3 rounded bg-success p-3">
            <p className="text-lg font-medium">86 %</p>
            <p className="text-[8px] text-white/80">Совпадение с вакансией</p>
          </div>
        </div>
      </div>
    </div>
  );
}