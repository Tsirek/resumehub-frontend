export interface ResumeImage {
  id: string;
  filename: string;
  contentType: string;
  size: number;
  createdAt: string;
  isAvatar: boolean;
}

export interface ResumeImageUrl {
  url: string;
  expiresAt: string;
}
