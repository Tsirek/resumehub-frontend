import type { ChangeEvent } from 'react';
import type { ResumeContacts } from '../../types';
import { Input } from '../ui/Input';
import { SectionCard } from './SectionCard';

interface ContactsFormProps {
  value: ResumeContacts;
  onChange: (next: ResumeContacts) => void;
}

export function ContactsForm({ value, onChange }: ContactsFormProps) {
  const bind = (field: keyof ResumeContacts) => ({
    value: value[field],
    onChange: (e: ChangeEvent<HTMLInputElement>) => onChange({ ...value, [field]: e.target.value }),
  });

  return (
    <SectionCard title="Контакты">
      <Input variant="outlined" label="Имя и фамилия" autoComplete="name" {...bind('fullName')} />
      <Input
        variant="outlined"
        label="Желаемая должность"
        autoComplete="organization-title"
        {...bind('position')}
      />
      <Input variant="outlined" label="Email" type="email" autoComplete="email" {...bind('email')} />
      <Input
        variant="outlined"
        label="Город и формат работы"
        placeholder="Например, Москва / удалённо"
        {...bind('location')}
      />
    </SectionCard>
  );
}