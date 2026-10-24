import { lang } from './i18n.js';
// أدوات صغيرة للواجهة
export const $ = (s, r = document) => r.querySelector(s);
export const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export const mi = (n, z) => `<i class="mi"${z ? ` style="font-size:${z}px"` : ''}>${n}</i>`;
export const val = id => ($('#' + id)?.value || '').trim();

export function fld(id, label, o = {}) {
  return `<div class="f"><input id="${id}" type="${o.t || 'text'}" placeholder=" " value="${esc(o.v || '')}"${o.d ? ` dir="${o.d}"` : ''}${o.m ? ` maxlength="${o.m}"` : ''}${o.ac ? ` autocomplete="${o.ac}"` : ''}><label${o.t === 'date' ? ' class="up"' : ''}>${label}</label></div>`;
}
export function sel(id, label, pairs, v) {
  return `<div class="sl">${label}</div><select id="${id}">${pairs.map(([k, l]) => `<option value="${esc(k)}"${k === v ? ' selected' : ''}>${esc(l)}</option>`).join('')}</select>`;
}
export function toast(m) {
  const e = document.createElement('div'); e.className = 'toast'; e.textContent = m; document.body.appendChild(e);
  setTimeout(() => e.remove(), 2600);
}
export function modal(html) {
  const o = document.createElement('div'); o.className = 'ov'; o.innerHTML = `<div>${html}</div>`;
  const close = () => o.remove();
  o.addEventListener('click', e => { if (e.target === o) close(); });
  document.body.appendChild(o);
  return { el: o.firstChild, close };
}
export const langBtn = () => `<div class="c"><button class="bt t" data-lang>${lang() === 'ar' ? 'English' : 'العربية'}</button></div>`;
