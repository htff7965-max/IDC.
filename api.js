// الاتصال بـ Supabase + كل دوال قراءة/كتابة البيانات
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2.45.4/+esm';
import { CFG } from './config.js';

// الجلسة بتتحفظ في المتصفح (persistSession) فمش هتسجّلي دخول كل مرة
export const sb = createClient(CFG.SUPABASE_URL, CFG.SUPABASE_ANON_KEY, {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: false }
});

export const isPhone = p => /^01\d{9}$/.test(p);
export const e164 = p => '+20' + String(p).replace(/^0/, '');
export const fromE164 = p => (p ? '0' + String(p).replace(/^\+?20/, '') : '');

export const currentUser = async () => (await sb.auth.getUser()).data.user;

export async function loadProfile() {
  const u = await currentUser();
  const [a, b] = await Promise.all([
    sb.from('profiles').select('*').eq('id', u.id).single(),
    sb.from('profile_private').select('*').eq('id', u.id).maybeSingle()
  ]);
  if (a.error) throw a.error;
  return { ...b.data, ...a.data, id: u.id, email: u.email, auth_phone: u.phone };
}

export async function saveProfile(id, p) {
  const r1 = await sb.from('profiles').update({ full_name: p.full_name, governorate: p.governorate || null, role: p.role, onboarded: true }).eq('id', id);
  const r2 = await sb.from('profile_private').upsert({ id, national_id: p.national_id || null, birth_date: p.birth_date || null, phone: p.phone || null });
  if (r1.error || r2.error) throw (r1.error || r2.error);
}

export async function listItems() {
  const { data, error } = await sb.from('items').select('*, issuers(name,verified)').order('created_at', { ascending: false });
  if (error) throw error;
  return data;
}
export const listIssuers = async () => (await sb.from('issuers').select('id,name,name_en,verified').order('name')).data || [];
export const saveItem = (row, id) => id ? sb.from('items').update(row).eq('id', id).select().single() : sb.from('items').insert(row).select().single();
export const delItem = id => sb.from('items').delete().eq('id', id);
export const logs = async () => (await sb.from('access_logs').select('*').order('at', { ascending: false }).limit(10)).data || [];

// ملفات: الصور بتتصغّر قبل الرفع، والـ PDF حد أقصى 5MB
export async function shrink(file, max = 1200) {
  if (!file.type.startsWith('image/')) return file;
  const bmp = await createImageBitmap(file), k = Math.min(1, max / Math.max(bmp.width, bmp.height));
  const c = document.createElement('canvas'); c.width = bmp.width * k; c.height = bmp.height * k;
  c.getContext('2d').drawImage(bmp, 0, 0, c.width, c.height);
  return new Promise(r => c.toBlob(b => r(new File([b], file.name.replace(/\.\w+$/, '') + '.jpg', { type: 'image/jpeg' })), 'image/jpeg', .82));
}
export const upload = (bucket, path, file) => sb.storage.from(bucket).upload(path, file, { upsert: true, contentType: file.type });
export const signed = async (bucket, path) => (await sb.storage.from(bucket).createSignedUrl(path, 300)).data?.signedUrl;
export const removeFiles = (bucket, paths) => sb.storage.from(bucket).remove(paths);
