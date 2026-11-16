import { cx, fmt, iso, pct } from '../lib/habit.js';
import { Card } from './ui.jsx';

export default function MonthCalendar({ data }) {
  const n = new Date(), y = n.getFullYear(), m = n.getMonth();
  const blanks = (new Date(y, m, 1).getDay() + 6) % 7, days = new Date(y, m + 1, 0).getDate();
  return (
    <Card>
      <b>{fmt(n, { month: 'long', year: 'numeric' })}</b>
      <div className="mt-2 grid grid-cols-7 gap-1 text-center text-xs">
        {[...'MTWTFSS'].map((d, i) => <span key={i} className="text-mute">{d}</span>)}
        {Array.from({ length: blanks }, (_, i) => <div key={'b' + i} />)}
        {Array.from({ length: days }, (_, i) => { const p = pct(data, iso(new Date(y, m, i + 1)));
          return <div key={i} className={cx('grid aspect-square place-items-center rounded-md', p >= 0.8 ? 'bg-ok text-white' : p > 0 ? 'bg-brand/50' : 'bg-bg')}>{i + 1}</div>; })}
      </div>
    </Card>);
}
