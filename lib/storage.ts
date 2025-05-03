import { supabase } from './supabase';

export async function uploadImage(file: File, bucket: string, path: string): Promise<string> {
  const fileExt = file.name.split('.').pop();
  const fileName = `${path}-${Math.random().toString(36).substring(2, 15)}.${fileExt}`;
  const filePath = `${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from(bucket)
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  const { data } = supabase.storage
    .from(bucket)
    .getPublicUrl(filePath);

  return data.publicUrl;
}

export async function deleteImage(url: string, bucket: string): Promise<void> {
  const path = url.split('/').pop();
  if (!path) return;

  const { error } = await supabase.storage
    .from(bucket)
    .remove([path]);

  if (error) {
    throw error;
  }
}

export async function uploadMultipleImages(files: File[], bucket: string, path: string): Promise<string[]> {
  const uploadPromises = files.map(file => uploadImage(file, bucket, path));
  return Promise.all(uploadPromises);
}

export async function deleteMultipleImages(urls: string[], bucket: string): Promise<void> {
  const deletePromises = urls.map(url => deleteImage(url, bucket));
  await Promise.all(deletePromises);
} 