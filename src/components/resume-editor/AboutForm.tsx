import { useState } from 'react';
import { Button } from '../ui/Button';
import { AnalysisImportDialog } from './AnalysisImportDialog';
import { Textarea } from '../ui/Textarea';
import { SectionCard } from './SectionCard';

interface AboutFormProps {
  value: string;
  onChange: (next: string) => void;
}

export function AboutForm({ value, onChange }: AboutFormProps) {
  const [analysisOpen, setAnalysisOpen] = useState(false);
  return (
    <SectionCard title="О себе">
      <Button size="sm" className="self-start" onClick={() => setAnalysisOpen(true)}>Использовать анализ</Button>
      {analysisOpen && <AnalysisImportDialog mode="about" current={value} onClose={() => setAnalysisOpen(false)} onApply={text => { onChange(text); setAnalysisOpen(false); }}/> }
      <Textarea label="Ваш текст" rows={7} value={value} onChange={(e) => onChange(e.target.value)} />
    </SectionCard>
  );
}