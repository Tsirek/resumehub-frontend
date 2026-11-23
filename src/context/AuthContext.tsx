import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { loginRequest, logoutRequest, registerRequest } from "../api/auth";
import { session } from "../lib/session";
import type { User } from "../types";
import { AuthContext, type AuthContextValue } from "../hooks/useAuth";
import { getProfile } from "../api/profile";

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(session.getUser);
  const [profileIdentity, setProfileIdentity] = useState<{
    userId: string;
    name: string;
  } | null>(null);
  const profileVersion = useRef(0);
  const userId = user?.id;
  useEffect(() => {
    if (!userId) return;
    const controller = new AbortController();
    const version = ++profileVersion.current;
    getProfile(controller.signal)
      .then((profile) => {
        if (!controller.signal.aborted && profileVersion.current === version) {
          setProfileIdentity(
            profile ? { userId, name: profile.fullName } : null,
          );
        }
      })
      .catch(() => {
        /* Ошибку загрузки показывает экран профиля. */
      });
    return () => controller.abort();
  }, [userId]);
  useEffect(() => {
    const expired = () => setUser(null);
    const changed = () => setUser(session.getUser());
    window.addEventListener("resumehub:session-expired", expired);
    window.addEventListener("storage", changed);
    return () => {
      window.removeEventListener("resumehub:session-expired", expired);
      window.removeEventListener("storage", changed);
    };
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      profileName:
        profileIdentity?.userId === user?.id
          ? (profileIdentity?.name ?? null)
          : null,
      updateProfileName: (name) => {
        if (user) {
          ++profileVersion.current;
          setProfileIdentity({ userId: user.id, name });
        }
      },
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
    [user, profileIdentity],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
