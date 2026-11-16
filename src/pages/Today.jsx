import { Fragment, useRef } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { emptyLog, fmt, iso, pct, planFor, streak, weekCount } from '../lib/habit.js';
import { Button, Card, ProgressBar, Stat, Title } from '../components/ui.jsx';
import ExerciseRow from '../components/ExerciseRow.jsx';
import DriveImage from '../components/DriveImage.jsx';

export default function Today() {
  const { data, setLog, addPhoto, notify } = useApp();
  const now = new Date(), key = iso(now), plan = planFor(data.plan, now), log = data.logs[key] || emptyLog();
  const fileRef = useRef(), progress = pct(data, key) * 100;

  const toggle = (id, i) => {
    const arr = [...(log.done[id] || [])]; arr[i] = !arr[i];
    const next = { ...log, done: { ...log.done, [id]: arr } };
    setLog(key, () => next);
    if (pct({ ...data, logs: { ...data.logs, [key]: next } }, key) >= 1) notify('Workout complete! 💪');
  };
  const groups = plan ? plan.items.reduce((m, e) => m.set(e.group, [...(m.get(e.group) || []), e]), new Map()) : new Map();

  return (
    <>
      <section className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-choc p-5 text-[#f4f1e4]">
        <div><div className="text-sm opacity-80">{fmt(now, { weekday: 'long', day: 'numeric', month: 'long' })}</div>
          <Title className="text-4xl text-brand sm:text-5xl">{plan ? plan.title : 'Rest Day'}</Title></div>
        <div className="flex gap-6"><Stat value={streak(data)} label="DAY STREAK" /><Stat value={`${weekCount(data)}/${data.goals.weekly}`} label="THIS WEEK" /></div>
      </section>

      {!plan ? <Card>Sunday is rest day. Recover, stretch and drink water. 💧</Card> : (
        <Card>
          <div className="mb-1 flex justify-between font-semibold"><span>Progress</span><span>{Math.round(progress)}%</span></div>
          <ProgressBar value={progress} />
          <p className="mt-2 text-sm text-mute">Warm up 5 minutes first. Tap a circle after each set.</p>
          {[...groups].map(([group, items]) => (
            <Fragment key={group}>
              <Title as="h3" className="mt-4">{group}</Title>
              {items.map((e) => <ExerciseRow key={e.id} exercise={e} done={log.done[e.id]} weight={log.w[e.id]}
                onToggle={(i) => toggle(e.id, i)} onWeight={(v) => setLog(key, (l) => ({ ...l, w: { ...l.w, [e.id]: v } }))} />)}
            </Fragment>))}
        </Card>)}

      <Card>
        <Title as="h3">Daily Photo</Title>
        <p className="mb-3 text-sm text-mute">Saved to your Drive (FitTrack folder) and shown in the timeline.</p>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden
          onChange={(e) => { const f = e.target.files[0]; e.target.value = ''; if (f) addPhoto(key, f); }} />
        <Button variant="primary" onClick={() => fileRef.current.click()}>📷 Take / add photo</Button>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">{log.photos.map((id) => <DriveImage key={id} id={id} />)}</div>
        <textarea rows={2} placeholder="Notes (energy, weight, soreness…)" defaultValue={log.note}
          onBlur={(e) => setLog(key, (l) => ({ ...l, note: e.target.value }))}
          className="mt-3 w-full rounded-lg border border-line bg-bg p-3 text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/40" />
      </Card>
    </>);
}
