import type { AdditionalEntry, EducationEntry } from '../types';

export const createEmptyEducation = (): EducationEntry => ({
  id: crypto.randomUUID(),
  institution: '',
  specialty: '',
  period: '',
});

export const createEmptyAdditional = (): AdditionalEntry => ({
  id: crypto.randomUUID(),
  title: '',
  description: '',
});