import { createClient } from "@supabase/supabase-js";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Create or retrieve a rater by name.
 * If the rater already exists, return their record; otherwise insert a new one.
 * @param {string} name
 * @returns {Promise<{id: string, name: string}>}
 */
export async function getOrCreateRater(name) {
  // Check if rater already exists
  const { data: existing, error: fetchError } = await supabase
    .from("raters")
    .select("*")
    .eq("name", name)
    .maybeSingle();

  if (fetchError) {
    console.error("Error fetching rater:", fetchError);
    throw fetchError;
  }

  if (existing) return existing;

  // Create new rater
  const { data: created, error: createError } = await supabase
    .from("raters")
    .insert({ name })
    .select()
    .single();

  if (createError) {
    console.error("Error creating rater:", createError);
    throw createError;
  }

  return created;
}

/**
 * Get all peserta from the database.
 * @returns {Promise<Array<{id: number, name: string, folder_name: string}>>}
 */
export async function getPeserta() {
  const { data, error } = await supabase
    .from("peserta")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    console.error("Error fetching peserta:", error);
    return [];
  }
  return data;
}

/**
 * List audio files for a specific participant from Supabase Storage.
 * @param {string} folderName - e.g. "peserta_1"
 * @returns {Promise<Array<{name: string, url: string}>>}
 */
export async function getAudioFiles(folderName) {
  const { data, error } = await supabase.storage
    .from("audio-files")
    .list(folderName, { limit: 100, sortBy: { column: "name", order: "asc" } });

  if (error) {
    console.error("Error listing audio files:", error);
    return [];
  }

  console.log(`Files in ${folderName}:`, data);

  if (!data || data.length === 0) {
    console.warn(`No files found in folder: ${folderName}`);
    return [];
  }

  return data
    .filter((file) => {
      const name = file.name.toLowerCase();
      return (
        file.name !== ".emptyFolderPlaceholder" &&
        (name.endsWith(".mp3") ||
          name.endsWith(".wav") ||
          name.endsWith(".ogg"))
      );
    })
    .map((file) => {
      const { data: urlData } = supabase.storage
        .from("audio-files")
        .getPublicUrl(`${folderName}/${file.name}`);

      return {
        name: file.name,
        url: urlData.publicUrl,
      };
    });
}

/**
 * Save a rating to the database.
 * @param {{raterId: string, pesertaId: number, audioFilename: string, rating: number}} params
 */
export async function saveRating({
  raterId,
  pesertaId,
  audioFilename,
  rating,
}) {
  const { data, error } = await supabase.from("ratings").upsert(
    {
      rater_id: raterId,
      peserta_id: pesertaId,
      audio_filename: audioFilename,
      rating: rating,
    },
    {
      onConflict: "rater_id,peserta_id,audio_filename",
    },
  );

  if (error) {
    console.error("Error saving rating:", error);
    throw error;
  }
  return data;
}

/**
 * Get all ratings by a specific rater (UUID).
 * @param {string} raterId
 */
export async function getRatingsByRater(raterId) {
  const { data, error } = await supabase
    .from("ratings")
    .select("*")
    .eq("rater_id", raterId);

  if (error) {
    console.error("Error fetching ratings:", error);
    return [];
  }
  return data;
}

/**
 * Get ratings by rater for a specific peserta.
 * @param {string} raterId
 * @param {number} pesertaId
 */
export async function getRatingsByRaterAndPeserta(raterId, pesertaId) {
  const { data, error } = await supabase
    .from("ratings")
    .select("*")
    .eq("rater_id", raterId)
    .eq("peserta_id", pesertaId);

  if (error) {
    console.error("Error fetching ratings:", error);
    return [];
  }
  return data;
}
