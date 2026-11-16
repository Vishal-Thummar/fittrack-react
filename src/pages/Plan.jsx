import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';
import { makeExercise } from '../lib/defaultPlan.js';
import { Button, Card, Input, Title } from '../components/ui.jsx';

const DAY = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function AddExercise({ onAdd }) {
  const [f, setF] = useState({ name: '', sets: 3, reps: '15,12,10' });
  const submit = () => { if (!f.name.trim()) return; onAdd(f); setF({ ...f, name: '' }); };
  return (
    <div className="mt-4 grid grid-cols-[1fr_4.5rem_6.5rem] gap-2 sm:grid-cols-[1fr_4.5rem_6.5rem_auto]">
      <Input className="col-span-3 sm:col-span-1" placeholder="New exercise name" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} />
      <Input type="number" min="1" value={f.sets} onChange={(e) => setF({ ...f, sets: e.target.value })} aria-label="Sets" />
      <Input value={f.reps} onChange={(e) => setF({ ...f, reps: e.target.value })} aria-label="Reps" />
      <Button variant="primary" onClick={submit} className="col-span-3 sm:col-span-1">Add</Button>
    </div>);
}

export default function Plan() {
  const { data, update } = useApp();
  const patchPlan = (key, fn) => update((d) => ({ ...d, plan: { ...d.plan, [key]: { ...d.plan[key], items: fn(d.plan[key].items) } } }));
  return (
    <>
      <Title>Workout Plan</Title>
      <p className="mb-4 text-sm text-mute">Edit sets and reps anytime. Changes sync to Drive.</p>
      {Object.entries(data.plan).map(([key, p]) => (
        <Card key={key}>
          <Title as="h3">{p.title}</Title>
          <p className="mb-2 text-sm text-mute">{p.days.map((d) => DAY[d]).join(' · ')}</p>
          {p.items.map((e, i) => (
            <div key={e.id} className="flex items-center gap-2 py-1.5">
              <span className="flex-1 text-[15px]">{e.name}</span>
              <Input type="number" min="1" defaultValue={e.sets} className="!w-16" aria-label="Sets"
                onBlur={(ev) => patchPlan(key, (it) => it.map((x, n) => n === i ? { ...x, sets: Math.max(1, +ev.target.value || 1) } : x))} />
              <Input defaultValue={e.reps} className="!w-24" aria-label="Reps"
                onBlur={(ev) => patchPlan(key, (it) => it.map((x, n) => n === i ? { ...x, reps: ev.target.value } : x))} />
              <Button variant="ghost" aria-label={`Delete ${e.name}`} onClick={() => patchPlan(key, (it) => it.filter((_, n) => n !== i))}>✕</Button>
            </div>))}
          <AddExercise onAdd={(f) => patchPlan(key, (it) => [...it, { ...makeExercise(f.name.trim(), Math.max(1, +f.sets || 3), f.reps, 'Added'), id: 'x' + Date.now() }])} />
        </Card>))}
    </>);
}
