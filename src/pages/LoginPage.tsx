import { useState, type FormEvent } from 'react';
import { Link, useLocation, useNavigate } from 'react-router';
import { ArrowRight, Lock, Mail } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Checkbox } from '../components/ui/Checkbox';
import { Eyebrow } from '../components/ui/Eyebrow';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/auth';
import { ROUTES } from '../router/paths';
import type { LoginPayload } from '../types';

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const from = (location.state as { from?: string } | null)?.from ?? ROUTES.profile;

  const [form, setForm] = useState<LoginPayload>({ email: '', password: '', remember: false });
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(form); // BACKEND: вызов через api/auth.ts
      navigate(from, { replace: true });
    } catch {
      setError('Неверный email или пароль');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Eyebrow tone="success">Ваш профиль вас ждет</Eyebrow>
      <h1 className="mt-5 text-3xl text-ink">С возвращением</h1>
      <p className="mt-1 text-sm text-muted">Войдите, чтобы продолжить работу над резюме</p>

      <form onSubmit={handleSubmit} className="mt-10 flex flex-col gap-6" noValidate>
        <Input
          label="Email"
          type="email"
          icon={Mail}
          placeholder="name@example.ru"
          autoComplete="email"
          required
          value={form.email}
          onChange={(e) => setForm({ ...form, email: e.target.value })}
        />
        <Input
          label="Пароль"
          type="password"
          icon={Lock}
          placeholder="Введите пароль"
          autoComplete="current-password"
          required
          value={form.password}
          onChange={(e) => setForm({ ...form, password: e.target.value })}
        />
        <Checkbox
          label="Запомнить меня"
          checked={form.remember}
          onChange={(e) => setForm({ ...form, remember: e.target.checked })}
        />

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <Button type="submit" fullWidth loading={loading} className="h-10 rounded-xl text-sm">
          Войти в аккаунт <ArrowRight aria-hidden className="size-4" />
        </Button>
      </form>

      <p className="mt-8 text-center text-sm text-muted">
        Нет аккаунта?{' '}
        <Link to={ROUTES.register} className="text-primary hover:underline">
          Зарегистрироваться
        </Link>
      </p>
    </>
  );
}