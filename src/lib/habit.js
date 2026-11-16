export const cx = (...a) => a.filter(Boolean).join(' ');
export const iso = (d) => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
export const parse = (s) => { const [y, m, d] = s.split('-'); return new Date(+y, m - 1, +d); };
export const monday = (d) => { const x = new Date(d); x.setDate(x.getDate() - ((x.getDay() + 6) % 7)); return x; };
export const fmt = (d, o) => d.toLocaleDateString('en-IN', o);
export const planFor = (plan, d) => Object.values(plan).find((p) => p.days.includes(d.getDay()));
export const emptyLog = () => ({ done: {}, w: {}, photos: [], note: '' });

export function pct(data, key) {
  const log = data.logs[key], plan = planFor(data.plan, parse(key));
  if (!log || !plan) return 0;
  const total = plan.items.reduce((a, e) => a + e.sets, 0);
  const done = plan.items.reduce((a, e) => a + (log.done[e.id] || []).filter(Boolean).length, 0);
  return total ? done / total : 0;
}
export const isDone = (data, key) => pct(data, key) >= 0.8; // 80% of sets = a completed workout day

export function streak(data) {
  let n = 0; const d = new Date();
  if (!isDone(data, iso(d))) d.setDate(d.getDate() - 1);
  for (let i = 0; i < 400; i++) {
    if (planFor(data.plan, d)) { if (isDone(data, iso(d))) n++; else break; }
    d.setDate(d.getDate() - 1);
  }
  return n;
}
export function weekCount(data, from = new Date()) {
  const m = monday(from); let n = 0;
  for (let i = 0; i < 7; i++) { const x = new Date(m); x.setDate(m.getDate() + i); if (isDone(data, iso(x))) n++; }
  return n;
}
