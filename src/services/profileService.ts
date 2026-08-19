import { supabase } from "../../supabase";
import type { AppUser } from "../../store/useAppStore";

export const AVATAR_BUCKET = "avatars";

export interface PendingProfileSync {
  fullName?: string;
  avatarLocalUri?: string;
}

const AVATAR_MIME: Record<string, string> = {
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
  png: "image/png",
  webp: "image/webp",
  gif: "image/gif",
  heic: "image/heic",
  heif: "image/heif",
};

const isRemoteUrl = (value?: string) =>
  !!value && (value.startsWith("http://") || value.startsWith("https://"));

/**
 * Uploads a local image to the avatars bucket and returns its public URL.
 * Throws on failure so callers can queue a retry.
 */
export async function uploadAvatar(
  userId: string,
  localUri: string,
): Promise<string> {
  const ext = (localUri.split(".").pop() || "jpg").toLowerCase();
  const type = AVATAR_MIME[ext] || "image/jpeg";
  const path = `${userId}/avatar-${Date.now()}.${ext === "jpeg" ? "jpg" : ext}`;

  const { error: uploadError } = await supabase.storage
    .from(AVATAR_BUCKET)
    .upload(path, { uri: localUri, type, name: `avatar.${ext}` } as any, {
      upsert: true,
    });
  if (uploadError) throw uploadError;

  const { data } = supabase.storage.from(AVATAR_BUCKET).getPublicUrl(path);
  return data.publicUrl;
}

/**
 * Pushes the user's profile to the server:
 * 1. Uploads a new avatar if a local (non-http) uri is provided.
 * 2. Mirrors full_name / avatar_url into auth user_metadata — this is the
 *    source that survives re-login, so it is written first and its failure
 *    keeps the change queued for retry.
 * 3. Upserts the profiles row (best-effort; failure doesn't block progress).
 * Returns the final avatar URL (public URL, or the existing one).
 */
export async function syncProfileToServer(
  userId: string,
  user: AppUser,
  avatarLocalUri?: string,
): Promise<string> {
  let avatarUrl = user.avatarUrl;

  if (avatarLocalUri && !isRemoteUrl(avatarLocalUri)) {
    avatarUrl = await uploadAvatar(userId, avatarLocalUri);
  }

  const { error: metaError } = await supabase.auth.updateUser({
    data: {
      full_name: user.fullName,
      avatar_url: avatarUrl,
      username: user.username,
    },
  });
  if (metaError) throw metaError;

  const { error: profileError } = await supabase.from("profiles").upsert({
    id: userId,
    full_name: user.fullName ?? null,
    avatar_url: avatarUrl ?? null,
    updated_at: new Date().toISOString(),
  });
  if (profileError) {
    console.warn("Profile row upsert failed:", profileError);
  }

  return avatarUrl ?? "";
}

/**
 * Fetches the latest profile row from the server (used to reconcile
 * changes made on other devices once back online).
 */
export async function fetchProfileFromServer(
  userId: string,
): Promise<{ fullName?: string; avatarUrl?: string } | null> {
  const { data, error } = await supabase
    .from("profiles")
    .select("full_name, avatar_url")
    .eq("id", userId)
    .maybeSingle();
  if (error) {
    console.warn("Failed to fetch profile:", error);
    return null;
  }
  if (!data) return null;
  return {
    fullName: data.full_name ?? undefined,
    avatarUrl: data.avatar_url ?? undefined,
  };
}