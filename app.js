// التطبيق الرئيسي: الدخول → قفل التطبيق (باسورد/بصمة) → عرض البيانات
import { sb, currentUser, loadProfile, saveProfile, listItems, listIssuers, saveItem, delItem, upload, signed, removeFiles, shrink, logs, e164, fromE164, isPhone } from './api.js';
import * as V from './vault.js';
import * as K from './lock.js';
import { mountAuth } from './auth.js';
import { t, lang, setLang, apply } from './i18n.js';
import { $, esc, mi, fld, sel, val, toast, modal, langBtn } from './ui.js';
import { CFG } from './config.js';
import QRCode from 'https://cdn.jsdelivr.net/npm/qrcode@1.5.3/+esm';

const app = $('#app');
const S = { nav: 'home', tab: 'public', items: [], issuers: [], profile: null, vault: { has_vault: false, open: false }, offline: !navigator.onLine, log: [], reveal: {}, form: null, uid: null, qr: '', photoUrl: '', pubUrl: '' };
const GOV = ['القاهرة', 'الجيزة', 'الإسكندرية', 'الدقهلية', 'البحر الأحمر', 'البحيرة', 'الفيوم', 'الغربية', 'الإسماعيلية', 'المنوفية', 'المنيا', 'القليوبية', 'الوادي الجديد', 'السويس', 'الشرقية', 'أسوان', 'أسيوط', 'بني سويف', 'بورسعيد', 'دمياط', 'جنوب سيناء', 'كفر الشيخ', 'مطروح', 'الأقصر', 'قنا', 'شمال سيناء', 'سوهاج'];
const ROLES = ['student', 'grad', 'employee', 'owner'];
const ICON = { id: 'badge', lic: 'directions_car', birth: 'description', cert: 'school', course: 'menu_book', dig: 'vpn_key', phone: 'phone', edu: 'school', exp: 'work', skill: 'bolt', proj: 'rocket_launch', photo: 'photo_camera', doc: 'description', other: 'article' };
const TYPES = Object.keys(ICON);
const lvl = i => i.level === 'secret' && i.secret_until && new Date(i.secret_until) <= new Date() ? 'public' : i.level;
const issuerName = i => i.issuers?.name || i.issuer_text || '';
const govOpts = v => sel('gov', t('governorate'), [['', t('choose')], ...GOV.map(g => [g, g])], v || '');
const roleOpts = v => sel('role', t('i_am'), ROLES.map(r => [r, t('role_' + r)]), v || 'student');
let hiddenAt = 0, idleT = null, vaultT = null, lastTouch = 0;

/* ---------------- الإقلاع ---------------- */
async function boot() {
  apply();
  if ('serviceWorker' in navigator) navigator.serviceWorker.register('sw.js').catch(() => {});
  const { data: { session } } = await sb.auth.getSession();           // الجلسة محفوظة: مفيش تسجيل دخول جديد
  if (!session) return authFlow();
  S.uid = session.user.id;
  if (K.has(S.uid)) return lockView();                                 // كل مرة تفتحي التطبيق: باسورد أو بصمة
  return afterLogin();
}
let current = null;
const authFlow = () => { current = authFlow; mountAuth(app, afterLogin); };
document.addEventListener('click', e => { if (e.target.closest('[data-lang]')) setLang(lang() === 'ar' ? 'en' : 'ar'); });
document.addEventListener('langchange', () => { if (S.ready) render(); else current && current(); });

async function afterLogin() {
  try {
    S.uid = (await currentUser()).id;
    S.profile = await loadProfile();
  } catch { return K.has(S.uid) ? lockView() : authFlow(); }
  if (!S.profile.onboarded) return onboard();
  return K.has(S.uid) ? lockView() : setLockView();
}

/* ---------------- جمع بيانات المستخدم لأول مرة ---------------- */
function onboard() {
  current = onboard;
  const p = S.profile, u = p.auth_phone ? fromE164(p.auth_phone) : p.phone || '';
  app.innerHTML = `${langBtn()}<div class="ac"><div class="wm">IDC</div><h2 class="c">${t('basic_title')}</h2><p class="mu c">${t('basic_hint')}</p>${fld('nm', t('full_name'), { v: p.full_name })}${fld('nid', t('national_id'), { d: 'ltr', m: 14 })}${fld('bd', t('birth'), { t: 'date' })}${fld('ph', t('phone'), { d: 'ltr', m: 11, v: u })}${govOpts('')}${roleOpts('student')}<div class="err"></div><button class="bt w" id="go">${t('next')}</button></div>`;
  $('#go').onclick = async () => {
    const row = { full_name: val('nm'), national_id: val('nid'), birth_date: val('bd'), phone: val('ph'), governorate: val('gov'), role: val('role') };
    if (!row.full_name) return ($('.err').textContent = t('err_name'));
    if (row.phone && !isPhone(row.phone)) return ($('.err').textContent = t('err_phone'));
    try { await saveProfile(S.uid, row); S.profile = await loadProfile(); } catch { return ($('.err').textContent = t('err_generic')); }
    setLockView();
  };
}

/* ---------------- كلمة مرور التطبيق + البصمة ---------------- */
function setLockView() {
  current = setLockView;
  app.innerHTML = `${langBtn()}<div class="lock"><div class="ac"><div class="wm">IDC</div><h2 class="c">${t('lock_set_title')}</h2><p class="mu c">${t('lock_set_hint')}</p>${fld('lp', t('app_password'), { t: 'password', d: 'ltr', ac: 'new-password' })}${fld('lp2', t('confirm_pw'), { t: 'password', d: 'ltr', ac: 'new-password' })}<div class="err"></div><button class="bt w" id="go">${t('save')}</button>${K.bioSupported() ? `<button class="bt o w" id="bio">${mi('fingerprint')} ${t('enable_bio')}</button>` : ''}</div></div>`;
  let wantBio = false;
  if ($('#bio')) $('#bio').onclick = () => { wantBio = true; $('#bio').textContent = t('bio_will'); };
  $('#go').onclick = async () => {
    const p = val('lp');
    if (p.length < 6) return ($('.err').textContent = t('err_lock_len'));
    if (p !== val('lp2')) return ($('.err').textContent = t('err_pw_match'));
    await K.setup(S.uid, p);
    if (wantBio) await K.enableBio(S.uid, S.profile.full_name).then(() => toast(t('bio_on'))).catch(() => toast(t('bio_fail')));
    enter();
  };
}
function lockView() {
  current = lockView;
  app.innerHTML = `${langBtn()}<div class="lock"><div class="ac"><div class="wm">IDC</div><h2 class="c">${t('unlock_title')}</h2>${fld('lp', t('app_password'), { t: 'password', d: 'ltr', ac: 'current-password' })}<div class="err"></div><button class="bt w" id="go">${t('unlock')}</button>${K.bioOn() ? `<button class="bt o w" id="bio">${mi('fingerprint')} ${t('use_bio')}</button>` : ''}<p class="c"><button class="bt t" id="sw">${t('switch_account')}</button></p></div></div>`;
  const go = async () => {
    const r = await K.unlockPw(val('lp'));
    if (r.ok) return enter();
    $('.err').textContent = r.wiped ? t('wiped') : `${t('wrong_pw')} ${r.left} ${t('attempts')}`;
  };
  $('#go').onclick = go;
  $('#lp').onkeydown = e => { if (e.key === 'Enter') go(); };
  if ($('#bio')) $('#bio').onclick = () => K.unlockBio().then(enter).catch(() => ($('.err').textContent = t('bio_fail')));
  $('#sw').onclick = async () => { await sb.auth.signOut(); await K.reset(); authFlow(); };
  if (K.bioOn()) $('#bio').click();
}

/* ---------------- تحميل البيانات ---------------- */
async function enter() {
  S.offline = !navigator.onLine;
  if (!S.offline) { try { await refresh(); } catch { S.offline = true; } }
  if (S.offline) await fromCache();
  startIdle(); S.ready = true; render();
}
async function fromCache() {
  const c = await K.loadCache();
  S.profile = c?.profile || S.profile || { full_name: '—', role: 'student' };
  S.items = c?.items || []; S.vault = { has_vault: false, open: false };
  if (!c) toast(t('no_cache'));
}
async function refresh() {
  const [p, items, iss, vs] = await Promise.all([loadProfile(), listItems(), listIssuers(), V.status()]);
  S.profile = p; S.items = items; S.issuers = iss; S.vault = vs;
  S.pubUrl = `${CFG.SITE_URL}/u.html?h=${p.handle}`;
  S.qr = await QRCode.toDataURL(S.pubUrl, { margin: 1, width: 220 });
  S.photoUrl = p.photo_path ? await signed('avatars', p.photo_path) : '';
  // نسخة الأوفلاين: بيانات عامة فقط، متشفرة على الجهاز
  const pub = items.filter(i => lvl(i) === 'public');
  const { national_id, birth_date, phone, email, auth_phone, ...safe } = p;   // نسخة الأوفلاين: من غير بيانات حساسة
  await K.saveCache({ profile: { ...safe, national_id: national_id ? '0'.repeat(10) + national_id.slice(-4) : null }, items: pub });
}

/* ---------------- الخزنة (الخاص والسري) ---------------- */
async function openVault() {
  S.vault = await V.status();
  let ch = null;
  const m = modal('');
  const draw = step => {
    const body = { create: `<h3>${t('vault_create')}</h3><p class="mu">${t('vault_create_hint')}</p>${fld('vp', t('vault_pw'), { t: 'password', d: 'ltr' })}${fld('vp2', t('confirm_pw'), { t: 'password', d: 'ltr' })}`,
      pw: `<h3>${t('vault_unlock')}</h3><p class="mu">${t('vault_step1')}</p>${fld('vp', t('vault_pw'), { t: 'password', d: 'ltr' })}`,
      sms: `<h3>${t('vault_unlock')}</h3><p class="mu">${t('vault_step2')}</p>${fld('vc', t('code'), { m: 6, d: 'ltr', ac: 'one-time-code' })}` }[step];
    m.el.innerHTML = `${body}<div class="err"></div><button class="bt w" id="vgo">${t('continue')}</button>`;
    $('#vgo', m.el).onclick = () => go(step);
  };
  const err = x => ($('.err', m.el).textContent = x);
  const go = async step => {
    if (step === 'create') {
      const p = val('vp'); if (p !== val('vp2')) return err(t('err_pw_match'));
      const r = await V.create(p);
      if (r !== 'ok') return err(t('vault_' + r));
      S.vault.has_vault = true; return step1(p);
    }
    if (step === 'pw') return step1(val('vp'));
    try { await V.mfaVerify(ch, val('vc')); } catch { return err(t('err_code')); }
    await sb.auth.refreshSession();
    m.close(); S.vault = await V.status(); await refresh(); startVaultTimer(); render();
  };
  const step1 = async p => {
    const r = await V.unlock(p);
    if (r === 'locked') return err(t('vault_locked'));
    if (r !== 'ok') return err(t('vault_wrong'));
    const phone = S.profile.phone;
    if (!isPhone(phone || '')) return err(t('vault_need_phone'));
    try { ch = await V.mfaSend(e164(phone)); } catch { return err(t('err_generic')); }
    draw('sms');
  };
  draw(S.vault.has_vault ? 'pw' : 'create');
}
function startVaultTimer() {
  clearTimeout(vaultT);
  vaultT = setTimeout(lockVault, 120000);                              // قفل تلقائي بعد دقيقتين
}
async function lockVault() {
  clearTimeout(vaultT); await V.lock().catch(() => {});
  S.vault.open = false; S.reveal = {};
  if (!S.offline) { try { S.items = await listItems(); } catch {} }
  render();
}
document.addEventListener('click', () => {
  if (S.vault.open && Date.now() - lastTouch > 30000) { lastTouch = Date.now(); V.touch(); startVaultTimer(); }
});

/* ---------------- قفل التطبيق لما تخرجي منه ---------------- */
function startIdle() {
  const lock = () => { K.lockNow(); V.lock().catch(() => {}); S.vault.open = false; S.ready = false; lockView(); };
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) hiddenAt = Date.now();
    else if (hiddenAt && Date.now() - hiddenAt > 60000 && S.ready) lock();
  });
  const bump = () => { clearTimeout(idleT); idleT = setTimeout(() => S.ready && lock(), 300000); };
  document.addEventListener('click', bump); bump();
}
window.addEventListener('offline', () => { S.offline = true; S.items = S.items.filter(i => lvl(i) === 'public'); S.nav = S.nav === 'home' ? 'home' : S.nav; S.tab = 'public'; S.vault.open = false; render(); });
window.addEventListener('online', async () => { S.offline = false; try { await refresh(); } catch {} render(); });

/* ---------------- الشاشات ---------------- */
function render() {
  if (!S.ready) return;
  const p = S.profile, nav = [['home', 'home'], ['wallet', 'account_balance_wallet'], ['cv', 'description'], ['security', 'shield']];
  const view = S.form ? formV() : { home: homeV, wallet: walletV, cv: cvV, security: secV, settings: setV }[S.nav]();
  app.innerHTML = `<div class="bar"><div class="wm">IDC</div><span class="sp"></span><button class="ib" data-a="lang"><b>${lang() === 'ar' ? 'EN' : 'ع'}</b></button><span class="chip ${S.offline ? '' : 'ok'}"><i style="background:${S.offline ? 'var(--mu)' : 'var(--gn)'}"></i>${S.offline ? t('offline') : t('online')}</span><button class="av" data-a="nav:settings" style="${S.photoUrl ? `background-image:url('${S.photoUrl}')` : ''}">${S.photoUrl ? '' : esc((p.full_name || '?')[0])}</button></div>${S.offline ? `<div class="card mu sm">${mi('wifi_off')} ${t('offline_note')}</div>` : ''}<main>${view}</main><nav class="nv">${nav.map(([k, i]) => `<button class="${S.nav === k && !S.form ? 'on' : ''}" data-a="nav:${k}">${mi(i)}${t('nav_' + k)}</button>`).join('')}</nav>`;
}

const line = (ic, v) => `<div class="ln">${mi(ic)}<span dir="auto">${esc(v || '—')}</span></div>`;
function cardHtml() {
  const p = S.profile, nid = p.national_id ? '•••• •••• ' + p.national_id.slice(-4) : '—';
  const av = S.photoUrl ? `<img class="avimg" src="${S.photoUrl}" alt="">` : `<div class="avph">${esc((p.full_name || '?')[0])}</div>`;
  return `<div class="idc" data-a="flip"><div class="idi"><div class="fc fr"><div class="row2"><b dir="ltr">IDC</b><span class="pill">${t('verified_id')}</span></div><div class="who">${av}<div><div class="nm">${esc(p.full_name)}</div><div class="sub">${t('role_' + (p.role || 'student'))}${p.governorate ? ' · ' + esc(p.governorate) : ''}</div></div></div><div class="bot"><div><small>${t('national_id')}</small><div class="nid" dir="ltr">${nid}</div></div>${S.qr ? `<img class="qr" src="${S.qr}" alt="QR">` : ''}</div></div><div class="fc bk"><b>${t('contact')}</b>${line('phone', p.phone)}${line('cake', p.birth_date)}${line('place', p.governorate)}${line('link', S.pubUrl)}</div></div></div><p class="mu c sm">${t('flip_hint')}</p>`;
}
function itemCard(i) {
  const l = lvl(i), c = l === 'secret' ? 'var(--yl)' : l === 'private' ? 'var(--gn)' : 'var(--bl)', hid = l === 'secret' && !S.reveal[i.id];
  const iss = issuerName(i), ver = i.issuers?.verified;
  const days = i.secret_until ? Math.ceil((new Date(i.secret_until) - Date.now()) / 864e5) : 0;
  return `<div class="card"><div class="it" style="--c:${c}"><div class="ic">${mi(l === 'secret' ? 'lock' : ICON[i.type] || 'article')}</div><div class="g"><b>${esc(i.title)}</b><div class="mu" dir="auto">${hid ? '••••••••' : esc(i.value)}</div><div>${iss ? `<span class="tag ${ver ? 'ok' : 'wn'}">${ver ? '✓' : '!'} ${esc(iss)}</span>` : ''}<span class="tag">${t('type_' + i.type)}</span>${i.level === 'secret' && l === 'public' ? `<span class="tag ok">${t('auto_revealed')}</span>` : ''}${l === 'secret' ? `<span class="tag wn">${i.secret_until ? `${t('secret_for')} ${days} ${t('days')}` : t('secret_forever')}</span>` : ''}</div></div>${l === 'secret' ? `<button class="ib" data-a="reveal:${i.id}">${mi(hid ? 'visibility' : 'visibility_off')}</button>` : ''}<button class="ib" data-a="edit:${i.id}">${mi('edit')}</button><button class="ib" data-a="del:${i.id}">${mi('delete')}</button></div>${i.file_path ? `<div class="att">${mi(i.file_kind === 'pdf' ? 'picture_as_pdf' : 'image')}<span class="g mu sm" dir="ltr">${esc(i.file_name)}</span><button class="ib" data-a="file:${i.id}">${mi('open_in_new')}</button></div>` : ''}</div>`;
}
const listOf = f => { const a = S.items.filter(f); return a.length ? a.map(itemCard).join('') : `<div class="card mu c">${t('empty')}</div>`; };
const addBtn = (level, type) => `<button class="bt o w" style="margin:0 0 12px" data-a="add:${level}:${type || ''}">${mi('add')} ${t('add')}</button>`;

function homeV() {
  const p = S.profile, pub = S.items.filter(i => lvl(i) === 'public'), pc = (S.photoUrl ? 25 : 0) + (S.items.some(i => i.file_path) ? 25 : 0) + (S.items.filter(i => ['edu', 'exp', 'skill', 'proj', 'cert', 'course'].includes(i.type)).length >= 2 ? 25 : 0) + (K.bioOn() || K.has(S.uid) ? 25 : 0);
  const next = !S.photoUrl ? t('next_photo') : !S.items.some(i => i.file_path) ? t('next_file') : pc < 100 ? t('next_cv') : t('next_done');
  return `<h2>${t('hello')} ${esc((p.full_name || '').split(' ')[0])}</h2><p class="mu">${t('role_' + (p.role || 'student'))}</p>${cardHtml()}<div class="card it"><svg width="64" height="64" viewBox="0 0 64 64"><circle cx="32" cy="32" r="28" fill="none" stroke="var(--ln)" stroke-width="6"/><circle cx="32" cy="32" r="28" fill="none" stroke="var(--bl)" stroke-width="6" stroke-linecap="round" stroke-dasharray="176" stroke-dashoffset="${176 * (1 - pc / 100)}" transform="rotate(-90 32 32)"/><text x="32" y="37" text-anchor="middle" font-size="15" font-weight="700" fill="var(--tx)">${pc}%</text></svg><div class="g"><b>${t('completion')}</b><div class="mu">${next}</div></div></div><h3 style="margin:16px 0 10px">${t('recent_docs')}</h3>${pub.slice(0, 3).map(itemCard).join('') || `<div class="card mu c">${t('empty')}</div>`}<button class="bt o w" data-a="nav:wallet">${t('view_all')}</button>`;
}
function walletV() {
  const tabs = S.offline ? '' : `<div class="tabs">${['public', 'private', 'secret'].map(k => `<button class="${S.tab === k ? 'on' : ''}" data-a="tab:${k}">${t('lvl_' + k)}</button>`).join('')}</div>`;
  const tab = S.offline ? 'public' : S.tab;
  let body;
  if (tab === 'public') body = (S.offline ? '' : addBtn('public')) + listOf(i => lvl(i) === 'public');
  else if (!S.vault.open) body = `<div class="card c"><div style="color:var(--bl)">${mi('shield', 44)}</div><h3>${t('vault_title')}</h3><p class="mu">${t('vault_intro')}</p><button class="bt w" data-a="vault">${S.vault.has_vault ? t('vault_unlock') : t('vault_create')}</button></div><div class="card"><b>${t('vault_layers')}</b>${['vl1', 'vl2', 'vl3', 'vl4', 'vl5'].map(k => `<div class="rw"><span>${t(k)}</span><span class="tag ok" style="margin:0">✓</span></div>`).join('')}</div>`;
  else body = `<div class="card sm mu">${mi('lock_open')} ${t('vault_open_note')} <button class="bt t" data-a="lockv">${t('lock_now')}</button></div>` + addBtn(tab) + listOf(i => lvl(i) === tab);
  return `<h2 style="margin-bottom:12px">${t('nav_wallet')}</h2>${tabs}${body}`;
}
function cvV() {
  const p = S.profile, g = ts => S.items.filter(i => ts.includes(i.type) && lvl(i) === 'public');
  const sec = [['cv_edu', 'school', ['edu']], ['cv_exp', 'work', ['exp']], ['cv_skill', 'bolt', ['skill']], ['cv_proj', 'rocket_launch', ['proj']], ['cv_cert', 'workspace_premium', ['cert', 'course']]];
  const pv = sec.map(([k, , ts]) => g(ts).length ? `<h3>${t(k)}</h3>${g(ts).map(i => `<div style="margin-bottom:8px"><b>${esc(i.title)}</b>${issuerName(i) ? ` <span style="color:#666">— ${esc(issuerName(i))}</span>` : ''}${i.value ? `<div style="color:#444;font-size:13px">${esc(i.value)}</div>` : ''}</div>`).join('')}` : '').join('');
  return `<h2>${t('nav_cv')}</h2><p class="mu">${t('cv_hint_' + (p.role || 'student'))}</p>${sec.map(([k, ic, ts], n) => `<details${n === 0 ? ' open' : ''}><summary>${mi(ic)} ${t(k)} (${g(ts).length})</summary><div>${g(ts).map(itemCard).join('')}<button class="bt o w" style="margin-top:0" data-a="add:public:${ts[0]}">${mi('add')} ${t('add')}</button></div></details>`).join('')}<button class="bt w" data-a="print">${mi('print')} ${t('cv_print')}</button><p class="mu sm">${t('cv_public_only')}</p><div class="cvp" style="margin-top:12px"><div style="border-bottom:3px solid #33449a;padding-bottom:10px"><h2 style="margin:0">${esc(p.full_name)}</h2><div style="color:#555">${t('role_' + (p.role || 'student'))}${p.governorate ? ' · ' + esc(p.governorate) : ''}${p.phone ? ' · ' + esc(p.phone) : ''}</div></div>${pv}</div>`;
}
function secV() {
  const vs = S.vault, bio = K.bioOn();
  return `<h2 style="margin-bottom:12px">${t('nav_security')}</h2><div class="bw"><div>${mi('verified_user', 52)}</div><div><div style="opacity:.7;font-size:12px">${t('sec_check')}</div><b style="font-size:20px">${vs.has_vault ? t('sec_strong') : t('sec_improve')}</b></div></div>
  <div class="card"><div class="rw"><span>${t('app_lock')}</span><button class="bt o" data-a="chlock">${t('change')}</button></div><div class="rw"><span>${t('biometric')}</span>${bio ? `<span class="tag ok" style="margin:0">✓</span>` : K.bioSupported() ? `<button class="bt o" data-a="bio">${t('enable')}</button>` : `<span class="mu sm">${t('unsupported')}</span>`}</div>${S.offline ? '' : `<div class="rw"><span>${t('vault_pw')}</span><button class="bt o" data-a="${vs.has_vault ? 'chvault' : 'vault'}">${vs.has_vault ? t('change') : t('enable')}</button></div>`}</div>
  <details open><summary>${mi('verified_user')} ${t('twofa_title')}</summary><div class="mu" style="line-height:1.9">${t('twofa_body')}</div></details>
  ${S.offline ? '' : `<div class="card"><b>${t('access_log')}</b>${S.log.length ? S.log.map(l => `<div class="rw"><span class="mu sm">${new Date(l.at).toLocaleString(lang() === 'ar' ? 'ar-EG' : 'en-GB')} · ${esc(l.action)}</span><span class="tag ${l.ok ? 'ok' : 'wn'}" style="margin:0">${l.ok ? t('ok') : t('fail')}</span></div>`).join('') : `<div class="mu">${t('none')}</div>`}<button class="bt t" data-a="loadlog">${t('refresh')}</button></div>`}`;
}
function setV() {
  const p = S.profile;
  return `<h2 style="margin-bottom:12px">${t('settings')}</h2><details open><summary>${mi('person')} ${t('profile')}</summary><div>${S.offline ? `<p class="mu">${t('online_only')}</p>` : `<label class="bt o" style="display:inline-flex;align-items:center;cursor:pointer;margin-top:6px">${t('change_photo')}<input type="file" accept="image/*" id="photo" style="display:none"></label>${fld('nm', t('full_name'), { v: p.full_name })}${fld('nid', t('national_id'), { d: 'ltr', m: 14, v: p.national_id })}${fld('bd', t('birth'), { t: 'date', v: p.birth_date })}${fld('ph', t('phone'), { d: 'ltr', m: 11, v: p.phone })}${govOpts(p.governorate)}${roleOpts(p.role)}<div class="err"></div><button class="bt w" data-a="saveprof">${t('save_changes')}</button>`}</div></details>
  <details><summary>${mi('language')} ${t('language')}</summary><div><button class="bt o" data-a="lang">${lang() === 'ar' ? 'English' : 'العربية'}</button></div></details>
  <details><summary>${mi('nfc')} ${t('card_link')}</summary><div class="mu"><p>${t('card_link_hint')}</p><div dir="ltr" style="word-break:break-all"><b>${esc(S.pubUrl)}</b></div></div></details>
  <details><summary>${mi('support_agent')} ${t('support')}</summary><div class="c"><div dir="ltr" style="font-size:22px;font-weight:700">${esc(CFG.SUPPORT_PHONE)}</div><a class="bt" style="display:inline-block;line-height:44px;text-decoration:none;margin-top:10px" href="tel:${esc(CFG.SUPPORT_PHONE.replace(/\s|-/g, ''))}">${t('call_now')}</a><p class="mu sm">${t('support_id')}: <b dir="ltr">IDC-${esc((S.uid || '').slice(0, 6))}</b></p></div></details>
  <details><summary>${mi('policy')} ${t('licenses')}</summary><div class="mu"><p>${t('license_text')}</p><p dir="ltr" class="sm">Cairo (OFL 1.1) · Material Icons (Apache 2.0) · supabase-js (MIT) · qrcode (MIT)</p></div></details>
  <button class="bt d w" data-a="logout">${t('logout')}</button>`;
}
function formV() {
  const f = S.form, i = f.item || { level: f.level, type: f.type || 'id', title: '', value: '', on_card: false };
  const off = S.offline;
  return `<div class="it" style="margin-bottom:8px"><button class="ib" data-a="cancel">${mi(lang() === 'ar' ? 'arrow_forward' : 'arrow_back')}</button><h2>${t(f.item ? 'edit_data' : 'add_data')}</h2></div><div class="card">${sel('type', t('type'), TYPES.map(k => [k, t('type_' + k)]), i.type)}${fld('title', t('title'), { v: i.title })}${fld('value', t('value'), { v: i.value, d: 'auto' })}${sel('level', t('section'), ['public', 'private', 'secret'].map(k => [k, t('lvl_' + k)]), i.level)}${sel('issuer', t('issuer'), [['', t('issuer_other')], ...S.issuers.map(x => [x.id, lang() === 'ar' ? x.name : x.name_en || x.name])], i.issuer_id || '')}${fld('issuer_text', t('issuer_text'), { v: i.issuer_text })}${fld('until', t('secret_until'), { t: 'date', v: i.secret_until ? i.secret_until.slice(0, 10) : '' })}<label class="sm mu" style="display:flex;gap:8px;margin-top:14px"><input type="checkbox" id="on_card" ${i.on_card ? 'checked' : ''}> ${t('on_card')}</label><div class="sl">${t('file_opt')}</div><input type="file" id="file" accept="image/*,application/pdf">${i.file_name ? `<div class="mu sm">${esc(i.file_name)}</div>` : ''}<div class="err"></div><button class="bt w" data-a="saveitem">${t('save')}</button>${f.item ? `<button class="bt d w" data-a="del:${i.id}">${t('delete')}</button>` : ''}</div>`;
}

/* ---------------- الأحداث ---------------- */
const ACT = {
  nav: k => { S.nav = k; S.form = null; if (k === 'security' && !S.offline) logs().then(l => { S.log = l; render(); }); },
  tab: k => { S.tab = k; },
  lang: () => setLang(lang() === 'ar' ? 'en' : 'ar'),
  flip: el => { el.classList.toggle('fp'); return 'skip'; },
  reveal: id => { if (!S.vault.open) return toast(t('open_vault_first')); S.reveal[id] = !S.reveal[id]; },
  vault: () => { openVault(); return 'skip'; },
  lockv: () => { lockVault(); return 'skip'; },
  add: (level, type) => { if (level !== 'public' && !S.vault.open) { toast(t('open_vault_first')); return; } S.form = { level, type }; },
  cancel: () => { S.form = null; },
  edit: id => { const i = S.items.find(x => x.id === id); if (i && i.level !== 'public' && !S.vault.open) return toast(t('open_vault_first')); S.form = { item: i }; },
  print: () => { window.print(); return 'skip'; },
  loadlog: async () => { S.log = await logs(); },
  bio: async () => { try { await K.enableBio(S.uid, S.profile.full_name); toast(t('bio_on')); } catch { toast(t('bio_fail')); } },
  chlock: () => { const m = modal(`<h3>${t('app_lock')}</h3>${fld('o', t('old_password'), { t: 'password', d: 'ltr' })}${fld('n', t('new_password'), { t: 'password', d: 'ltr' })}<div class="err"></div><button class="bt w" id="g">${t('save')}</button>`); $('#g', m.el).onclick = async () => { const n = val('n'); if (n.length < 6) return ($('.err', m.el).textContent = t('err_lock_len')); try { await K.changePw(val('o'), n); m.close(); toast(t('saved')); } catch { $('.err', m.el).textContent = t('wrong_pw_short'); } }; return 'skip'; },
  chvault: () => { const m = modal(`<h3>${t('vault_pw')}</h3>${fld('o', t('old_password'), { t: 'password', d: 'ltr' })}${fld('n', t('new_password'), { t: 'password', d: 'ltr' })}<div class="err"></div><button class="bt w" id="g">${t('save')}</button>`); $('#g', m.el).onclick = async () => { const r = await V.change(val('o'), val('n')); if (r === 'ok') { m.close(); toast(t('saved')); } else $('.err', m.el).textContent = t(r === 'wrong_old' ? 'wrong_pw_short' : 'vault_' + r); }; return 'skip'; },
  logout: async () => { if (!confirm(t('confirm_logout'))) return 'skip'; await V.lock().catch(() => {}); await sb.auth.signOut(); await K.reset(); location.reload(); return 'skip'; },
  saveprof: async () => {
    const row = { full_name: val('nm'), national_id: val('nid'), birth_date: val('bd'), phone: val('ph'), governorate: val('gov'), role: val('role') };
    if (!row.full_name) return ($('.err').textContent = t('err_name'));
    if (row.phone && !isPhone(row.phone)) return ($('.err').textContent = t('err_phone'));
    await saveProfile(S.uid, row); await refresh(); toast(t('saved'));
  },
  del: async id => { if (!confirm(t('confirm_del'))) return; const i = S.items.find(x => x.id === id); const { error } = await delItem(id); if (error) return toast(t('open_vault_first')); if (i?.file_path) removeFiles('documents', [i.file_path]); S.form = null; await refresh(); },
  file: async id => { const i = S.items.find(x => x.id === id), u = await signed('documents', i.file_path); if (u) window.open(u, '_blank'); else toast(t('err_generic')); return 'skip'; },
  saveitem: async () => {
    const f = S.form, level = val('level'), er = x => ($('.err').textContent = x);
    if (!val('title')) return er(t('err_title'));
    if (level !== 'public' && !S.vault.open) return er(t('open_vault_first'));
    if (S.offline) return er(t('online_only'));
    const until = val('until');
    const row = { type: val('type'), title: val('title'), value: val('value') || null, level, issuer_id: val('issuer') || null, issuer_text: val('issuer_text') || null, secret_until: level === 'secret' && until ? new Date(until + 'T00:00:00').toISOString() : null, on_card: level === 'public' && $('#on_card').checked };
    const { data, error } = await saveItem(row, f.item?.id);
    if (error) return er(t('err_generic'));
    const file = $('#file').files[0];
    if (file) {
      if (file.size > 5e6) return er(t('err_file_size'));
      const up = await shrink(file), path = `${S.uid}/${data.id}/${up.name.replace(/[^\w.\-]/g, '_')}`;
      const r = await upload('documents', path, up);
      if (!r.error) await saveItem({ file_path: path, file_name: up.name, file_kind: up.type === 'application/pdf' ? 'pdf' : 'img' }, data.id);
    }
    S.form = null; await refresh(); toast(t('saved'));
  }
};
app.addEventListener('click', async e => {
  const b = e.target.closest('[data-a]'); if (!b || !S.ready) return;
  const [a, ...args] = b.dataset.a.split(':');
  let r; try { r = await ACT[a]?.(...args, b); } catch { toast(t('err_generic')); }
  if (r !== 'skip') render();
});
app.addEventListener('change', async e => {
  if (e.target.id !== 'photo') return;
  const f = await shrink(e.target.files[0], 500), path = `${S.uid}/avatar.jpg`;
  const r = await upload('avatars', path, f); if (r.error) return toast(t('err_generic'));
  await sb.from('profiles').update({ photo_path: path }).eq('id', S.uid); await refresh(); render();
});

boot();
