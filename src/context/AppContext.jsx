import { createContext, useCallback, useContext, useRef, useState } from 'react';
import { DEFAULT_PLAN } from '../lib/defaultPlan.js';
import { emptyLog } from '../lib/habit.js';
import * as drive from '../lib/drive.js';

const Ctx = createContext(null);
export const useApp = () => useContext(Ctx);
const INITIAL = { plan: DEFAULT_PLAN, logs: {}, goals: { weekly: 5, streakTarget: 30, weight: '' } };

export function AppProvider({ children }) {
  const [data, setData] = useState(INITIAL);
  const [user, setUser] = useState(null);
  const [status, setStatus] = useState('saved');
  const [loginMsg, setLoginMsg] = useState(drive.DEMO ? 'Demo mode: no Client ID set, data saves in this browser only.' : '');
  const [toast, setToast] = useState('');
  const latest = useRef(data), timer = useRef(), toastTimer = useRef();

  const notify = useCallback((m) => { setToast(m); clearTimeout(toastTimer.current); toastTimer.current = setTimeout(() => setToast(''), 2400); }, []);

  /** update(prev => next): change data immutably, then auto-save (debounced) */
  const update = useCallback((fn) => {
    const next = fn(latest.current); latest.current = next; setData(next); setStatus('saving');
    clearTimeout(timer.current);
    timer.current = setTimeout(async () => {
      try { await drive.saveData(latest.current); setStatus('saved'); }
      catch { setStatus('error'); notify('Could not save – check connection'); }
    }, 1200);
  }, [notify]);

  const setLog = useCallback((key, fn) => update((d) => ({ ...d, logs: { ...d.logs, [key]: fn(d.logs[key] || emptyLog()) } })), [update]);

  const load = (saved) => { const d = { ...INITIAL, ...(saved || {}) }; latest.current = d; setData(d); };

  const signIn = async () => {
    setLoginMsg('');
    try {
      if (drive.DEMO) { load(drive.loadDemo()); setUser({ email: 'demo' }); return; }
      await drive.getToken();
      const u = await drive.getUser();
      drive.L('signed in as', u.email);
      if (drive.ALLOWED_EMAIL && u.email.toLowerCase() !== drive.ALLOWED_EMAIL.toLowerCase()) { drive.revoke(); setLoginMsg('This account is not authorised.'); return; }
      setLoginMsg('Loading your data…');
      const saved = await drive.driveInit();
      load(saved); if (!saved) await drive.saveData(latest.current);
      setUser(u);
    } catch (e) { drive.L('FAILED', e); setLoginMsg('Failed: ' + (e.message || e.error || 'unknown error')); }
  };
  const signOut = () => { if (!drive.DEMO) drive.revoke(); setUser(null); setLoginMsg(''); };

  const addPhoto = async (key, file) => {
    notify('Uploading photo…');
    try { const id = await drive.uploadPhoto(file, key); setLog(key, (l) => ({ ...l, photos: [...l.photos, id] })); notify('Photo saved'); }
    catch { notify('Upload failed'); }
  };

  return <Ctx.Provider value={{ data, update, setLog, user, signIn, signOut, status, loginMsg, toast, notify, addPhoto }}>{children}</Ctx.Provider>;
}
