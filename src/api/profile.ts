import type { Profile } from "../types";
import { ApiError, request } from "./client";

interface ProfileDto {
  full_name: string;
  specialization: string;
  about: string;
}
const fromDto = (profile: ProfileDto): Profile => ({
  fullName: profile.full_name,
  specialization: profile.specialization,
  about: profile.about,
});

export async function getProfile(
  signal?: AbortSignal,
): Promise<Profile | null> {
  try {
    return fromDto(await request<ProfileDto>("/users/me/profile", { signal }));
  } catch (error) {
    // Отсутствующий профиль заполняется из данных регистрации, остальные ошибки показываем.
    if (error instanceof ApiError && error.status === 404) return null;
    throw error;
  }
}

export async function updateProfile(profile: Profile): Promise<Profile> {
  const saved = await request<ProfileDto>("/users/me/profile", {
    method: "PUT",
    body: JSON.stringify({
      full_name: profile.fullName,
      specialization: profile.specialization,
      about: profile.about,
    }),
  });
  return fromDto(saved);
}

export async function improveAboutWithAI(about: string): Promise<string> {
  const result = await request<{ text: string }>("/ai/improve-about", {
    method: "POST",
    body: JSON.stringify({ text: about }),
  });
  return result.text;
}
