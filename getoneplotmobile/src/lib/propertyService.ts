import { supabase } from './supabase';
import type { Property } from '../types/property';

export async function fetchUserProperties(userId: string) {
  const { data, error } = await supabase
    .from('properties')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data as Property[];
}

export async function deleteProperty(propertyId: string) {
  const { error } = await supabase
    .from('properties')
    .delete()
    .eq('id', propertyId);

  if (error) throw error;
  return true;
}

export async function saveProperty(property: Partial<Property>, userId: string) {
  const isEditing = !!property.id;

  const payload = {
    ...property,
    user_id: userId,
    updated_at: new Date().toISOString(),
  };

  if (isEditing) {
    const { data, error } = await supabase
      .from('properties')
      .update(payload)
      .eq('id', property.id)
      .select()
      .single();

    if (error) throw error;
    return data as Property;
  } else {
    const { data, error } = await supabase
      .from('properties')
      .insert([{ ...payload, status: 'pending' }])
      .select()
      .single();

    if (error) throw error;
    return data as Property;
  }
}

export async function uploadPropertyImages(images: { uri: string }[]) {
  const uploadedUrls: string[] = [];

  for (const img of images) {
    // If it's already a URL, skip upload
    if (img.uri.startsWith('http')) {
      uploadedUrls.push(img.uri);
      continue;
    }

    const filename = `${Date.now()}-${Math.random().toString(36).substring(7)}`;
    const ext = img.uri.split('.').pop();
    const path = `${filename}.${ext}`;

    const formData = new FormData();
    formData.append('file', {
      uri: img.uri,
      name: path,
      type: `image/${ext}`,
    } as any);

    const { data, error } = await supabase.storage
      .from('houseListingImages')
      .upload(path, formData, {
        contentType: `image/${ext}`,
      });

    if (error) throw error;

    // Construct the public URL (replace with your actual project URL)
    const { data: urlData } = supabase.storage
      .from('houseListingImages')
      .getPublicUrl(path);

    if (urlData) {
      uploadedUrls.push(urlData.publicUrl);
    }
  }

  return uploadedUrls;
}
