// Google sign-in + Google Drive storage (scope drive.file: the app only sees files it created)
const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID;
export const ALLOWED_EMAIL = import.meta.env.VITE_ALLOWED_EMAIL;
export const DEMO = !CLIENT_ID;
const D = 'https://www.googleapis.com/drive/v3/files', U = 'https://www.googleapis.com/upload/drive/v3/files';
let tc = null, token = null, folderId = null, fileId = null;
const cache = {};
export const L = (...a) => console.log('%c[FitTrack]', 'color:#f2c230;background:#2b1d16;padding:1px 6px', ...a);

const waitGoogle = () => new Promise((res) => { const t = setInterval(() => { if (window.google?.accounts) { clearInterval(t); res(); } }, 100); });

export async function getToken() {
  if (token && token.exp > Date.now() + 60000) return token.v;
  if (!tc) { await waitGoogle(); tc = google.accounts.oauth2.initTokenClient({ client_id: CLIENT_ID, scope: 'https://www.googleapis.com/auth/drive.file openid email', callback: () => {} }); }
  return new Promise((res, rej) => {
    tc.callback = (r) => r.error ? rej(r) : (token = { v: r.access_token, exp: Date.now() + r.expires_in * 1000 }, res(token.v));
    tc.requestAccessToken({ prompt: '' });
  });
}
export const revoke = () => { if (token) google.accounts.oauth2.revoke(token.v); token = null; folderId = fileId = null; };

async function g(url, opt = {}) {
  const t = await getToken(), c = new AbortController(), to = setTimeout(() => c.abort(), 20000);
  let r;
  try { r = await fetch(url, { ...opt, signal: c.signal, headers: { Authorization: 'Bearer ' + t, ...(opt.headers || {}) } }); }
  catch (e) { throw new Error(e.name === 'AbortError' ? 'Drive request timed out' : 'Network error: ' + e.message); }
  finally { clearTimeout(to); }
  L('drive', opt.method || 'GET', r.status);
  if (!r.ok) { let m = ''; try { m = (await r.json()).error.message; } catch {} throw new Error(`Drive error ${r.status}: ${m}`); }
  return r;
}
const multi = (meta, blob, type) => {
  const b = 'ft' + Date.now();
  return { headers: { 'Content-Type': 'multipart/related; boundary=' + b },
    body: new Blob([`--${b}\r\nContent-Type: application/json\r\n\r\n${JSON.stringify(meta)}\r\n--${b}\r\nContent-Type: ${type}\r\n\r\n`, blob, `\r\n--${b}--`]) };
};
const find = async (q) => (await (await g(`${D}?q=${encodeURIComponent(q)}&fields=files(id)&spaces=drive`)).json()).files[0]?.id;

export async function getUser() {
  const r = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', { headers: { Authorization: 'Bearer ' + token.v } });
  return r.json();
}
/** Finds/creates the FitTrack folder + data file. Returns saved data, or null if new. */
export async function driveInit() {
  folderId = await find("name='FitTrack' and mimeType='application/vnd.google-apps.folder' and trashed=false");
  if (!folderId) folderId = (await (await g(D, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ name: 'FitTrack', mimeType: 'application/vnd.google-apps.folder' }) })).json()).id;
  fileId = await find(`name='fittrack-data.json' and '${folderId}' in parents and trashed=false`);
  return fileId ? (await g(`${D}/${fileId}?alt=media`)).json() : null;
}
export async function saveData(data) {
  if (DEMO) return localStorage.setItem('fittrack', JSON.stringify(data));
  const blob = new Blob([JSON.stringify(data)], { type: 'application/json' });
  if (fileId) await g(`${U}/${fileId}?uploadType=multipart`, { method: 'PATCH', ...multi({}, blob, 'application/json') });
  else fileId = (await (await g(`${U}?uploadType=multipart`, { method: 'POST', ...multi({ name: 'fittrack-data.json', parents: [folderId] }, blob, 'application/json') })).json()).id;
}
export const loadDemo = () => { try { return JSON.parse(localStorage.getItem('fittrack')); } catch { return null; } };

export async function uploadPhoto(file, key) {
  if (DEMO) return new Promise((r) => { const fr = new FileReader(); fr.onload = () => r(fr.result); fr.readAsDataURL(file); });
  const m = multi({ name: `${key}_${Date.now()}.jpg`, parents: [folderId] }, file, file.type || 'image/jpeg');
  return (await (await g(`${U}?uploadType=multipart&fields=id`, { method: 'POST', ...m })).json()).id;
}
export async function fetchPhoto(id) {
  if (id.startsWith('data:')) return id;
  if (cache[id]) return cache[id];
  return (cache[id] = URL.createObjectURL(await (await g(`${D}/${id}?alt=media`)).blob()));
}
