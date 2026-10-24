// القسم الخاص والسري: باسورد منفصل (server) + رمز SMS (Supabase Phone MFA) + قفل بعد دقيقتين
import { sb } from './api.js';

export const status = async () => (await sb.rpc('vault_status')).data || { has_vault: false, open: false };
export const create = async pw => (await sb.rpc('set_vault_password', { pw })).data;
export const change = async (oldPw, pw) => (await sb.rpc('set_vault_password', { pw, old_pw: oldPw })).data;
export async function unlock(pw) { const { data, error } = await sb.rpc('unlock_vault', { pw }); return error ? 'error' : data; }
export const lock = () => sb.rpc('lock_vault');
export const touch = () => sb.rpc('touch_vault');

// الخطوة التانية: SMS على الموبايل المسجل. بترجّع بيانات التحدي اللي هتتبعت مع الرمز
export async function mfaSend(phone) {
  const { data: f } = await sb.auth.mfa.listFactors();
  let fac = (f?.phone || []).find(x => x.status === 'verified');
  if (!fac) {
    for (const x of f?.phone || []) await sb.auth.mfa.unenroll({ factorId: x.id });   // نظّف أي محاولة قديمة ناقصة
    const r = await sb.auth.mfa.enroll({ factorType: 'phone', phone });
    if (r.error) throw r.error;
    fac = r.data;
  }
  const c = await sb.auth.mfa.challenge({ factorId: fac.id });
  if (c.error) throw c.error;
  return { factorId: fac.id, challengeId: c.data.id };
}
export async function mfaVerify(ch, code) {
  const { error } = await sb.auth.mfa.verify({ factorId: ch.factorId, challengeId: ch.challengeId, code });
  if (error) throw error;
}
