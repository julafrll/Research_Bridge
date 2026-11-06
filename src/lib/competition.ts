import { supabase } from '@/lib/supabase';
import { AWARDS } from '@/config/competition';
import type { GalleryProject } from '@/types/competition';

export const COMPETITION_BUCKET = 'competition-files';
export const MAX_FILE_MB = 25;

export async function signedFileUrl(path: string | null, expiresIn = 60 * 60): Promise<string | null> {
  if (!path) return null;
  const { data, error } = await supabase.storage.from(COMPETITION_BUCKET).createSignedUrl(path, expiresIn);
  if (error) return null;
  return data.signedUrl;
}

export async function uploadCompetitionFile(
  userId: string,
  kind: 'paper' | 'poster',
  file: File
): Promise<{ path: string; error: string | null }> {
  const safe = file.name.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(-80);
  const path = `${userId}/${kind}/${Date.now()}_${safe}`;
  const { error } = await supabase.storage.from(COMPETITION_BUCKET).upload(path, file, {
    upsert: false,
    contentType: file.type || undefined,
  });
  return { path, error: error?.message ?? null };
}

export async function fetchGallery(): Promise<GalleryProject[]> {
  const { data, error } = await supabase
    .from('competition_gallery')
    .select('*')
    .order('project_title');
  if (error) {
    console.error('Gallery load failed:', error.message);
    return [];
  }
  return (data as GalleryProject[]) ?? [];
}

export function awardLabel(key: string | null) {
  return AWARDS.find((a) => a.key === key) ?? null;
}
