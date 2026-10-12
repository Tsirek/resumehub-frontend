import { Textarea } from '../ui/Textarea';
import { SectionCard } from './SectionCard';

interface TextSectionFormProps {
  title: string;
  label: string;
  placeholder?: string;
  value: string;
  onChange: (next: string) => void;
}

export function TextSectionForm({ title, label, placeholder, value, onChange }: TextSectionFormProps) {
  return (
    <SectionCard title={title}>
      <Textarea
        label={label}
        rows={6}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
    </SectionCard>
  );
}