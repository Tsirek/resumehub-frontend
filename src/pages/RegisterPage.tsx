import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, Lock, Mail, User } from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Eyebrow } from '../components/ui/Eyebrow';
import { Input } from '../components/ui/Input';
import { useAuth } from '../context/AuthContext';
import { ROUTES } from '../router/paths';

interface FormState {
  name: string;
  email: string;
  password: string;
  confirm: string;
}

type Errors = Partial<Record<keyof FormState, string>>;

const validate = ({ name, email, password, confirm }: FormState): Errors => {
  const errors: Errors = {};
  if (!name.trim()) errors.name = 'Укажите имя';
  if (!/^\S+@\S+\.\S+$/.test(email)) errors.email = 'Некорректный email';
  if (password.length < 8) errors.password = 'Не менее 8 символов';
  if (confirm !== password) errors.confirm = 'Пароли не совпадают';
  return errors;
};

export default function RegisterPage() {
  const { register } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState<FormState>({ name: '', email: '', password: '', confirm: '' });
  const [errors, setErrors] = useState<Errors>({});
  const [serverError, setServerError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const set = (field: keyof FormState) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const nextErrors = validate(form);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setServerError(null);
    setLoading(true);
    try {
      // BACKEND: вызов через api/auth.ts; серверная валидация обязательна
      await register({ name: form.name.trim(), email: form.email, password: form.password });
      navigate(ROUTES.profile, { replace: true });
    } catch {
      setServerError('Не удалось создать аккаунт. Попробуйте ещё раз.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Eyebrow>Начните бесплатно</Eyebrow>
      <h1 className="mt-5 text-3xl text-ink">Создайте аккаунт</h1>
      <p className="mt-1 text-sm text-muted">Первое сильное резюме — за несколько минут.</p>

      <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-4" noValidate>
        <Input label="Имя" icon={User} placeholder="Как к вам обращаться" autoComplete="name"
          value={form.name} onChange={set('name')} error={errors.name} />
        <Input label="Email" type="email" icon={Mail} placeholder="name@example.ru" autoComplete="email"
          value={form.email} onChange={set('email')} error={errors.email} />
        <Input label="Пароль" type="password" icon={Lock} placeholder="Не менее 8 символов"
          autoComplete="new-password" value={form.password} onChange={set('password')} error={errors.password} />
        <Input label="Подтверждение пароля" type="password" icon={Lock} placeholder="Повторите пароль"
          autoComplete="new-password" value={form.confirm} onChange={set('confirm')} error={errors.confirm} />

        {serverError && (
          <p role="alert" className="text-sm text-red-600">
            {serverError}
          </p>
        )}

        <Button type="submit" fullWidth loading={loading} className="mt-6 h-10 rounded-xl text-sm">
          Создать аккаунт <ArrowRight aria-hidden className="size-4" />
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-muted">
        Уже есть аккаунт?{' '}
        <Link to={ROUTES.login} className="text-primary hover:underline">
          Войти
        </Link>
      </p>
    </>
  );
}