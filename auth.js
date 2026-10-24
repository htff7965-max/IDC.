// تسجيل الدخول / إنشاء حساب / نسيت كلمة المرور (بالموبايل + SMS)
import { sb, e164, isPhone } from './api.js';
import { t } from './i18n.js';
import { $, esc, fld, val, toast, langBtn } from './ui.js';

export function mountAuth(root, done) {
  let mode = 'login', d = {}, sentAt = 0, busy = false;
  const err = m => { const e = $('.err', root); if (e) e.textContent = m || ''; };
  const V = {
    login: () => `<h2 class="c">${t('login')}</h2><p class="mu c">${t('login_hint')}</p>${fld('lg', t('email_or_phone'), { d: 'ltr', v: d.lg, ac: 'username' })}${fld('lp', t('password'), { t: 'password', d: 'ltr', ac: 'current-password' })}<div class="err"></div><button class="bt w" data-a="login">${t('login')}</button><p class="c"><button class="bt t" data-a="go:forgot">${t('forgot')}</button></p><p class="c mu">${t('no_account')}</p><button class="bt o w" style="margin-top:0" data-a="go:signup">${t('signup')}</button>`,
    signup: () => `<h2 class="c">${t('signup')}</h2><p class="mu c">${t('signup_hint')}</p>${fld('nm', t('full_name'), { v: d.nm, ac: 'name' })}${fld('em', t('email'), { t: 'email', d: 'ltr', v: d.em, ac: 'email' })}${fld('ph', t('phone'), { d: 'ltr', m: 11, v: d.ph, ac: 'tel' })}${fld('pw', t('password_new'), { t: 'password', d: 'ltr', ac: 'new-password' })}${fld('pw2', t('confirm_pw'), { t: 'password', d: 'ltr', ac: 'new-password' })}<div class="err"></div><button class="bt w" data-a="signup">${t('continue')}</button><p class="c"><button class="bt t" data-a="go:login">${t('back_login')}</button></p>`,
    otp: () => `<h2 class="c">${t('verify_phone')}</h2><p class="mu c">${t('sent_to')} <span dir="ltr">${esc(d.ph)}</span></p>${fld('cd', t('code'), { m: 6, d: 'ltr', ac: 'one-time-code' })}<div class="err"></div><button class="bt w" data-a="otp">${t('confirm')}</button><p class="c"><button class="bt t" data-a="resend">${t('resend')}</button></p>`,
    forgot: () => `<h2 class="c">${t('reset_title')}</h2><p class="mu c">${t('reset_hint')}</p>${fld('fp', t('phone'), { d: 'ltr', m: 11, v: d.ph, ac: 'tel' })}<div class="err"></div><button class="bt w" data-a="forgot">${t('send_code')}</button><p class="c"><button class="bt t" data-a="go:login">${t('back_login')}</button></p>`,
    forgotOtp: () => `<h2 class="c">${t('enter_code')}</h2><p class="mu c">${t('reset_sent')}</p>${fld('cd', t('code'), { m: 6, d: 'ltr', ac: 'one-time-code' })}<div class="err"></div><button class="bt w" data-a="forgotOtp">${t('confirm')}</button><p class="c"><button class="bt t" data-a="resend">${t('resend')}</button></p>`,
    newpw: () => `<h2 class="c">${t('password_new')}</h2><p class="mu c">${t('err_pw_len')}</p>${fld('np', t('password_new'), { t: 'password', d: 'ltr', ac: 'new-password' })}${fld('np2', t('confirm_pw'), { t: 'password', d: 'ltr', ac: 'new-password' })}<div class="err"></div><button class="bt w" data-a="newpw">${t('save_pw')}</button>`
  };
  const draw = () => { root.innerHTML = `${langBtn()}<div class="ac"><div class="wm">IDC</div>${V[mode]()}</div>`; };

  const A = {
    async login() {
      const lg = val('lg').toLowerCase(), password = val('lp'); d.lg = lg;
      if (!lg || !password) return err(t('err_cred'));
      const { error } = await sb.auth.signInWithPassword(isPhone(lg) ? { phone: e164(lg), password } : { email: lg, password });
      if (error) return err(t('err_cred'));
      done();
    },
    async signup() {
      d = { nm: val('nm'), em: val('em').toLowerCase(), ph: val('ph') };
      const pw = val('pw');
      if (!d.nm) return err(t('err_name'));
      if (!/\S+@\S+\.\S+/.test(d.em)) return err(t('err_email'));
      if (!isPhone(d.ph)) return err(t('err_phone'));
      if (pw.length < 8) return err(t('err_pw_len'));
      if (pw !== val('pw2')) return err(t('err_pw_match'));
      // الاسم اللي كتبتيه بيتخزن مع الحساب وبيظهر في التطبيق
      const { data, error } = await sb.auth.signUp({ email: d.em, password: pw, options: { data: { full_name: d.nm } } });
      if (error) return err(error.message);
      if (!data.session) return err(t('err_confirm_email'));
      const r = await sb.auth.updateUser({ phone: e164(d.ph) });             // بيبعت SMS للتأكيد
      if (r.error) return err(t('err_generic'));
      sentAt = Date.now(); mode = 'otp'; draw();
    },
    async otp() {
      const { error } = await sb.auth.verifyOtp({ phone: e164(d.ph), token: val('cd'), type: 'phone_change' });
      if (error) return err(t('err_code'));
      done();
    },
    async forgot() {
      d.ph = val('fp');
      if (!isPhone(d.ph)) return err(t('err_phone'));
      await sb.auth.signInWithOtp({ phone: e164(d.ph), options: { shouldCreateUser: false } }).catch(() => {});
      sentAt = Date.now(); mode = 'forgotOtp'; draw();                        // نفس الرد سواء الرقم مسجل أو لأ
    },
    async forgotOtp() {
      const { error } = await sb.auth.verifyOtp({ phone: e164(d.ph), token: val('cd'), type: 'sms' });
      if (error) return err(t('err_code'));
      mode = 'newpw'; draw();
    },
    async newpw() {
      const p = val('np');
      if (p.length < 8) return err(t('err_pw_len'));
      if (p !== val('np2')) return err(t('err_pw_match'));
      const { error } = await sb.auth.updateUser({ password: p });
      if (error) return err(error.message);
      toast(t('pw_changed')); done();
    },
    async resend() {
      if (Date.now() - sentAt < 30000) return toast(t('wait_30'));
      sentAt = Date.now();
      if (mode === 'otp') await sb.auth.updateUser({ phone: e164(d.ph) });
      else await sb.auth.signInWithOtp({ phone: e164(d.ph), options: { shouldCreateUser: false } }).catch(() => {});
      toast(t('code_resent'));
    }
  };
  root.onclick = async e => {
    const b = e.target.closest('[data-a]'); if (!b || busy) return;
    const [a, arg] = b.dataset.a.split(':');
    if (a === 'go') { mode = arg; draw(); return; }
    busy = true; b.disabled = true;
    try { await A[a](); } catch { err(t('err_generic')); }
    busy = false; b.disabled = false;
  };
  draw();
}
