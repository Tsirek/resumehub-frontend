export interface ResumeImage {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  createdAt: string;
  isAvatar: boolean;
  status: ImageStatus;
  error: string | null;
  avatarStatus: ImageStatus | null;
  avatarError: string | null;
}

export interface ResumeImageUrl {
  url: string;
  expiresAt: string;
}

export type ImageStatus = 'queued' | 'processing' | 'ready' | 'failed';
export type ImageVariant = 'preview' | 'full' | 'avatar';

export interface AcceptedImage {
  imageId: string;
  status: 'queued';
}
