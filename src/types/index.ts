export interface User {
  id: string;
  name: string;
  email: string;
}

export interface Profile {
  fullName: string;
  specialization: string;
  about: string;
}

export interface Resume {
  id: string;
  title: string;
  updatedAt: string; 
}

export interface LoginPayload {
  email: string;
  password: string;
  remember: boolean;
}

export interface RegisterPayload {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}