import { useMemo, useState, useEffect, type ReactNode } from 'react';
import { loginRequest, logoutRequest, registerRequest } from '../api/auth';
import { session } from '../lib/session';
import type { User } from '../types';
import { AuthContext, type AuthContextValue } from './auth';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(session.getUser);

  useEffect(() => {
    const clear = () => setUser(null);
    window.addEventListener('rh-session-cleared', clear);
    return () => window.removeEventListener('rh-session-cleared', clear);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      isAuthenticated: user !== null,

      login: async (payload) => {
        const { token, refreshToken, user } = await loginRequest(payload);
        session.save(token, user, payload.remember, refreshToken);
        setUser(user);
      },

      register: async (payload) => {
        const { token, refreshToken, user } = await registerRequest(payload);
        session.save(token, user, true, refreshToken);
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
