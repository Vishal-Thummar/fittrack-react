import { cx } from '../lib/habit.js';
import { Input } from './ui.jsx';

export default function ExerciseRow({ exercise: e, done = [], weight = '', onToggle, onWeight }) {
  return (
    <div className="flex flex-wrap items-center gap-3 border-t border-line py-3 first:border-0">
      <div className="min-w-[160px] flex-1 font-semibold">{e.name}
        <small className="block font-normal text-mute">{e.sets} sets × {e.reps}</small></div>
      <div className="flex gap-1.5">
        {Array.from({ length: e.sets }, (_, i) => (
          <button key={i} onClick={() => onToggle(i)} aria-label={`Set ${i + 1}`} aria-pressed={!!done[i]}
            className={cx('h-11 w-11 rounded-full border-2 text-sm font-semibold transition active:scale-90', done[i] ? 'border-ok bg-ok text-white' : 'border-choc/60 text-ink')}>{i + 1}</button>))}
      </div>
      <Input type="number" inputMode="decimal" placeholder="kg" defaultValue={weight} onBlur={(ev) => onWeight(ev.target.value)} className="!w-20" aria-label="Weight in kg" />
    </div>);
}
