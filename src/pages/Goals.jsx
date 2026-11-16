import { useApp } from '../context/AppContext.jsx';
import { fmt, isDone, parse, streak, weekCount } from '../lib/habit.js';
import { Button, Card, Input, ProgressBar, Title } from '../components/ui.jsx';

export default function Goals() {
  const { data, update } = useApp();
  const G = data.goals, st = streak(data), wc = weekCount(data);
  const setGoal = (k, v) => update((d) => ({ ...d, goals: { ...d.goals, [k]: v } }));
  const months = Array.from({ length: 6 }, (_, i) => { const d = new Date(); d.setDate(1); d.setMonth(d.getMonth() - 5 + i); return d; });
  const counts = months.map((m) => Object.keys(data.logs).filter((k) => { const d = parse(k); return d.getMonth() === m.getMonth() && d.getFullYear() === m.getFullYear() && isDone(data, k); }).length);
  const max = Math.max(8, ...counts);
  const backup = () => { const a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })); a.download = 'fittrack-backup.json'; a.click(); };

  const Goal = ({ title, hint, k, min, current, unit }) => (
    <Card><Title as="h3">{title}</Title><p className="mb-3 text-sm text-mute">{hint}</p>
      <div className="flex items-center gap-3"><Input type="number" min={min} defaultValue={G[k]} className="!w-24" onBlur={(e) => setGoal(k, Math.max(min, +e.target.value || min))} />
        <span>{current} / {G[k]} {unit}</span></div>
      <div className="mt-3"><ProgressBar value={Math.min(100, (current / G[k]) * 100)} /></div></Card>);

  return (
    <>
      <Title>Goals & Habits</Title>
      <div className="mt-4 grid gap-x-4 md:grid-cols-2">
        <Goal title="Weekly target" hint="Workout days per week. Your chart has 6." k="weekly" min={1} current={wc} unit="days this week" />
        <Goal title="Streak challenge" hint="Build the habit: aim for a streak of days." k="streakTarget" min={1} current={st} unit="days" />
      </div>
      <Card><Title as="h3">Body weight goal (kg)</Title>
        <Input type="number" inputMode="decimal" placeholder="Target kg" defaultValue={G.weight} className="mt-2 !w-40" onBlur={(e) => setGoal('weight', e.target.value)} /></Card>
      <Card><Title as="h3">Workouts per month</Title>
        <div className="mt-3 flex h-32 items-end gap-2 sm:gap-4">
          {counts.map((n, i) => (
            <div key={i} className="flex flex-1 flex-col items-center justify-end text-xs">
              <div className="w-full rounded-t-md bg-brand" style={{ height: `${(n / max) * 90}px` }} /><span>{n}</span>
              <span className="text-mute">{fmt(months[i], { month: 'short' })}</span></div>))}
        </div></Card>
      <Card><Title as="h3">Backup</Title><Button className="mt-2" onClick={backup}>Download data (JSON)</Button></Card>
    </>);
}
