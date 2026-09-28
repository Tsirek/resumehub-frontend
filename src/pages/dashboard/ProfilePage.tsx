import { useEffect, useState, type ChangeEvent } from 'react';
import { useNavigate } from 'react-router';
import { Star } from 'lucide-react';
import { getProfile, improveAboutWithAI, updateProfile } from '../../api/profile';
import { PageHeader } from '../../components/layout/PageHeader';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Textarea } from '../../components/ui/Textarea';
import { ROUTES } from '../../router/paths';
import type { Profile } from '../../types';

type SaveStatus = 'idle' | 'saving' | 'saved' | 'error';

const STATUS_TEXT: Record<SaveStatus, string> = {
  idle: '',
  saving: 'Сохраняем…',
  saved: 'Сохранено',
  error: 'Не удалось сохранить',
};

export default function ProfilePage() {
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loadError, setLoadError] = useState(false);
  const [status, setStatus] = useState<SaveStatus>('idle');
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;
    getProfile() // BACKEND: GET /profile
      .then((data) => !cancelled && setProfile(data))
      .catch(() => !cancelled && setLoadError(true));
    return () => {
      cancelled = true;
    };
  }, []);

  if (loadError) return <p role="alert" className="text-red-600">Не удалось загрузить профиль</p>;
  if (!profile) return <p className="text-muted">Загрузка…</p>;

  const handleChange =
    (field: keyof Profile) => (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) =>
      setProfile((prev) => (prev ? { ...prev, [field]: e.target.value } : prev));

  // Сохранение при потере фокуса поля, чтобы не добавлять кнопку, которой нет в макете
  const save = async (data: Profile) => {
    setStatus('saving');
    try {
      await updateProfile(data); // BACKEND: PUT /profile
      setStatus('saved');
    } catch {
      setStatus('error');
    }
  };

  const handleImprove = async () => {
    setAiLoading(true);
    try {
      const about = await improveAboutWithAI(profile.about); // BACKEND: POST /ai/improve-about
      const next = { ...profile, about };
      setProfile(next);
      await save(next);
    } finally {
      setAiLoading(false);
    }
  };

  return (
    <>
      <PageHeader
        title="Ваш опыт — в одном месте"
        subtitle="В макете редактор и профиль используют общие демонстрационные данные"
      />

      <section className="rounded-2xl bg-white p-10">
        <div className="grid gap-x-16 gap-y-6 md:grid-cols-2">
          <Input variant="outlined" label="Имя и фамилия" value={profile.fullName}
            onChange={handleChange('fullName')} onBlur={() => save(profile)} />
          <Input variant="outlined" label="Специализация" value={profile.specialization}
            onChange={handleChange('specialization')} onBlur={() => save(profile)} />
        </div>

        <div className="mt-6">
          <Textarea label="О себе" rows={6} value={profile.about}
            onChange={handleChange('about')} onBlur={() => save(profile)} />
        </div>

        <div className="mt-6 flex items-center gap-4">
          <Button onClick={handleImprove} loading={aiLoading} className="rounded-sm">
            <Star aria-hidden className="size-5" /> Проработать с ИИ
          </Button>
          <span aria-live="polite" className="text-sm text-muted">
            {STATUS_TEXT[status]}
          </span>
        </div>

        <div className="mt-4 divide-y-2 divide-line">
          <div className="flex items-center justify-between py-3">
            <span className="text-sm font-medium text-ink">Проекты Github</span>
            {/* BACKEND: в будущем — выбор репозиториев через GitHub OAuth */}
            <Button variant="secondary" size="sm" onClick={() => navigate(ROUTES.projects)}>
              Выбрать проекты
            </Button>
          </div>
          <div className="flex items-center justify-between py-3">
            <span className="text-sm font-medium text-ink">Полный редактор</span>
            <Button variant="secondary" size="sm" onClick={() => navigate(ROUTES.resumes)}>
              Открыть резюме
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}