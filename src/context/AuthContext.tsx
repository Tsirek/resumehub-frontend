import { createContext, useContext, useMemo, useState, type ReactNode } from 'react';
import { loginRequest, logoutRequest, registerRequest } from '../api/auth';
import { session } from '../lib/session';
import type { LoginPayload, RegisterPayload, User } from '../types';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  register: (payload: RegisterPayload) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(session.getUser);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,

      login: async (payload) => {
        const { token, user } = await loginRequest(payload);
        session.save(token, user, payload.remember);
        setUser(user);
      },

      register: async (payload) => {
        const { token, user } = await registerRequest(payload);
        session.save(token, user, true);
        setUser(user);
      },

      logout: async () => {
        try {
          await logoutRequest();
        } finally {
          session.clear();
          setUser(null);
        }
      },
    }),
    [user],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}