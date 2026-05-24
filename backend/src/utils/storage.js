import fs from 'fs';
import path from 'path';
import supabase from '../config/supabase.js';

const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'tickets';

export async function uploadToCloud(filePath, filename) {
  if (!supabase) return null;

  try {
    const fileBuffer = fs.readFileSync(filePath);
    const { data, error } = await supabase.storage
      .from(BUCKET)
      .upload(filename, fileBuffer, {
        contentType: 'image/jpeg',
        upsert: true,
      });

    if (error) throw error;

    const { data: urlData } = supabase.storage
      .from(BUCKET)
      .getPublicUrl(filename);

    return urlData?.publicUrl || null;
  } catch (err) {
    console.error('Supabase upload error:', err.message);
    return null;
  }
}

export async function deleteFromCloud(filename) {
  if (!supabase) return;

  try {
    const { error } = await supabase.storage
      .from(BUCKET)
      .remove([filename]);

    if (error) console.error('Supabase delete error:', error.message);
  } catch (err) {
    console.error('Supabase delete error:', err.message);
  }
}

export async function ensureBucket() {
  if (!supabase) return;

  try {
    const { data: buckets } = await supabase.storage.listBuckets();
    const exists = buckets?.some(b => b.name === BUCKET);
    if (!exists) {
      const { error } = await supabase.storage.createBucket(BUCKET, {
        public: true,
      });
      if (error) {
        console.warn(`Could not create bucket "${BUCKET}": ${error.message}`);
        console.warn('Create it manually in Supabase Dashboard → Storage.');
      } else {
        console.log(`Storage bucket "${BUCKET}" created.`);
      }
    }
  } catch (err) {
    console.warn('ensureBucket error:', err.message);
  }
}
