export const cx = (...a) => a.filter(Boolean).join(" ");
export const iso = (d) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
export const parse = (s) => {
  const [y, m, d] = s.split("-");
  return new Date(+y, m - 1, +d);
};
export const monday = (d) => {
  const x = new Date(d);
  x.setDate(x.getDate() - ((x.getDay() + 6) % 7));
  return x;
};
export const fmt = (d, o) => d.toLocaleDateString("en-IN", o);
export const planFor = (plan, d) =>
  Object.values(plan).find((p) => p.days.includes(d.getDay()));
export const emptyLog = () => ({
  done: {},      // { [exerciseId]: [true, false, false] }
  sets: {},      // { [exerciseId]: [{ reps: 15, weight: 10, restSec: 60 }, ...] }
  photos: [],
  note: "",
  timer: {
    activeSec: 0,      // Total active working time in seconds
    restSec: 0,        // Total rest time in seconds
    exerciseGaps: [],  // Seconds taken between finishing one exercise and starting the next
    finished: false,
  },
});
export function pct(data, key) {
  const log = data.logs[key],
    plan = planFor(data.plan, parse(key));
  if (!log || !plan) return 0;
  const total = plan.items.reduce((a, e) => a + e.sets, 0);
  const done = plan.items.reduce(
    (a, e) => a + (log.done[e.id] || []).filter(Boolean).length,
    0,
  );
  return total ? done / total : 0;
}
export const isDone = (data, key) => pct(data, key) >= 0.8; // 80% of sets = a completed workout day

export function streak(data) {
  let n = 0;
  const d = new Date();
  if (!isDone(data, iso(d))) d.setDate(d.getDate() - 1);
  for (let i = 0; i < 400; i++) {
    if (planFor(data.plan, d)) {
      if (isDone(data, iso(d))) n++;
      else break;
    }
    d.setDate(d.getDate() - 1);
  }
  return n;
}
export function weekCount(data, from = new Date()) {
  const m = monday(from);
  let n = 0;
  for (let i = 0; i < 7; i++) {
    const x = new Date(m);
    x.setDate(m.getDate() + i);
    if (isDone(data, iso(x))) n++;
  }
  return n;
}


/** Format seconds into MM:SS or HH:MM:SS */
export const formatDuration = (sec = 0) => {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const rem = s % 60;
  if (h > 0) return `${h}h ${String(m).padStart(2, "0")}m`;
  return `${String(m).padStart(2, "0")}:${String(rem).padStart(2, "0")}`;
};

/** Calculate stats for a single day, month ("YYYY-MM"), or year ("YYYY") */
export function getPeriodStats(data, prefix) {
  const matchingKeys = Object.keys(data.logs || {}).filter((k) =>
    k.startsWith(prefix),
  );

  let workouts = 0;
  let totalVolumeKg = 0;
  let totalSets = 0;
  let activeSec = 0;
  let restSec = 0;
  let allRestIntervals = [];
  let allExerciseGaps = [];

  for (const key of matchingKeys) {
    const log = data.logs[key];
    if (!log) continue;
    if (isDone(data, key)) workouts++;

    activeSec += log.timer?.activeSec || 0;
    restSec += log.timer?.restSec || 0;
    if (log.timer?.exerciseGaps?.length) {
      allExerciseGaps.push(...log.timer.exerciseGaps);
    }

    Object.entries(log.sets || {}).forEach(([exId, setList]) => {
      const doneList = log.done?.[exId] || [];
      setList.forEach((s, idx) => {
        if (doneList[idx]) {
          totalSets++;
          totalVolumeKg += (Number(s.reps) || 0) * (Number(s.weight) || 0);
          if (s.restSec > 0) allRestIntervals.push(s.restSec);
        }
      });
    });
  }

  const avgSetRest = allRestIntervals.length
    ? Math.round(
        allRestIntervals.reduce((a, b) => a + b, 0) / allRestIntervals.length,
      )
    : 0;

  const avgExerciseGap = allExerciseGaps.length
    ? Math.round(
        allExerciseGaps.reduce((a, b) => a + b, 0) / allExerciseGaps.length,
      )
    : 0;

  return {
    workouts,
    totalVolumeKg,
    totalSets,
    activeSec,
    restSec,
    totalSec: activeSec + restSec,
    avgSetRest,
    avgExerciseGap,
  };
}