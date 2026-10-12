import { Textarea } from '../ui/Textarea';
import { SectionCard } from './SectionCard';

interface AboutFormProps {
  value: string;
  onChange: (next: string) => void;
}

export function AboutForm({ value, onChange }: AboutFormProps) {
  return (
    <SectionCard title="О себе">
      <Textarea label="Ваш текст" rows={7} value={value} onChange={(e) => onChange(e.target.value)} />
    </SectionCard>
  );
}