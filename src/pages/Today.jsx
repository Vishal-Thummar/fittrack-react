import { Fragment, useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import {
  emptyLog,
  fmt,
  formatDuration,
  iso,
  pct,
  planFor,
  streak,
  weekCount,
} from "../lib/habit.js";
import { Button, Card, ProgressBar, Stat, Title } from "../components/ui.jsx";
import ExerciseRow from "../components/ExerciseRow.jsx";
import DriveImage from "../components/DriveImage.jsx";

const DEFAULT_REPS = [15, 12, 10, 8];

export default function Today() {
  const { data, setLog, addPhoto, notify } = useApp();
  const now = new Date(),
    key = iso(now),
    plan = planFor(data.plan, now),
    log = { ...emptyLog(), ...(data.logs[key] || {}) };

  const fileRef = useRef(),
    progress = pct(data, key) * 100;

  // Timer states: "idle" | "working" | "resting" | "paused" | "finished"
  const [phase, setPhase] = useState(log.timer?.finished ? "finished" : "idle");
  const [currentRest, setCurrentRest] = useState(0);
  const lastExerciseRef = useRef(null);

  // Live 1-second ticker for active workout & rest intervals
  useEffect(() => {
    if (phase !== "working" && phase !== "resting") return;

    const timerId = setInterval(() => {
      if (phase === "resting") {
        setCurrentRest((r) => r + 1);
      }
      setLog(key, (prev) => {
        const t = prev.timer || {
          activeSec: 0,
          restSec: 0,
          exerciseGaps: [],
          finished: false,
        };
        return {
          ...prev,
          timer: {
            ...t,
            activeSec:
              phase === "working" ? (t.activeSec || 0) + 1 : t.activeSec || 0,
            restSec:
              phase === "resting" ? (t.restSec || 0) + 1 : t.restSec || 0,
          },
        };
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [phase, key, setLog]);

  // Toggle set completion + record rest between sets or gap between exercises
  const toggle = (id, i, totalSets) => {
    const wasDone = Boolean(log.done?.[id]?.[i]);

    setLog(key, (prev) => {
      const doneArr = [...(prev.done?.[id] || [])];
      doneArr[i] = !wasDone;

      const existingSets = prev.sets?.[id] || [];
      const setsArr = Array.from({ length: totalSets }, (_, idx) => ({
        reps: DEFAULT_REPS[idx] ?? 10,
        weight: prev.w?.[id] || "",
        restSec: 0,
        ...(existingSets[idx] || {}),
      }));

      const t = prev.timer || {
        activeSec: 0,
        restSec: 0,
        exerciseGaps: [],
        finished: false,
      };
      const exerciseGaps = [...(t.exerciseGaps || [])];

      // Save rest duration when checking a new set
      if (!wasDone && currentRest > 0) {
        if (lastExerciseRef.current && lastExerciseRef.current !== id) {
          // Switched to a different exercise -> record transition time
          exerciseGaps.push({
            from: lastExerciseRef.current,
            to: id,
            sec: currentRest,
          });
        } else if (i > 0 && setsArr[i - 1]) {
          // Same exercise -> record rest after previous set
          setsArr[i - 1] = { ...setsArr[i - 1], restSec: currentRest };
        }
      }

      const nextLog = {
        ...prev,
        done: { ...prev.done, [id]: doneArr },
        sets: { ...prev.sets, [id]: setsArr },
        timer: { ...t, exerciseGaps },
      };

      if (pct({ ...data, logs: { ...data.logs, [key]: nextLog } }, key) >= 1) {
        notify("Workout complete! 💪");
      }
      return nextLog;
    });

    // Automatically start rest timer when a set is ticked
    if (!wasDone) {
      lastExerciseRef.current = id;
      setCurrentRest(0);
      setPhase("resting");
    }
  };

  // Update per-set reps or kg weight
  const updateSetData = (id, setIndex, field, value, totalSets) => {
    setLog(key, (prev) => {
      const existingSets = prev.sets?.[id] || [];
      const setsArr = Array.from({ length: totalSets }, (_, idx) => ({
        reps: DEFAULT_REPS[idx] ?? 10,
        weight: prev.w?.[id] || "",
        restSec: 0,
        ...(existingSets[idx] || {}),
      }));
      setsArr[setIndex] = { ...setsArr[setIndex], [field]: value };
      return {
        ...prev,
        sets: { ...prev.sets, [id]: setsArr },
      };
    });
  };

  const finishWorkout = () => {
    setPhase("finished");
    setCurrentRest(0);
    setLog(key, (prev) => ({
      ...prev,
      timer: { ...(prev.timer || {}), finished: true },
    }));
    notify("Workout finished & saved! 🎉");
  };

  const groups = plan
    ? plan.items.reduce(
        (m, e) => m.set(e.group, [...(m.get(e.group) || []), e]),
        new Map(),
      )
    : new Map();

  return (
    <>
      <section className="mb-4 flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-choc p-5 text-[#f4f1e4]">
        <div>
          <div className="text-sm opacity-80">
            {fmt(now, { weekday: "long", day: "numeric", month: "long" })}
          </div>
          <Title className="text-4xl text-brand sm:text-5xl">
            {plan ? plan.title : "Rest Day"}
          </Title>
        </div>
        <div className="flex gap-6">
          <Stat value={streak(data)} label="DAY STREAK" />
          <Stat
            value={`${weekCount(data)}/${data.goals.weekly}`}
            label="THIS WEEK"
          />
        </div>
      </section>

      {!plan ? (
        <Card>Sunday is rest day. Recover, stretch and drink water. 💧</Card>
      ) : (
        <>
          {/* Sticky Play / Pause / Rest Timer Bar */}
          <Card className="sticky top-16 z-30 border-2 border-brand shadow-md">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="text-xs font-bold uppercase tracking-wider text-mute">
                  {phase === "resting"
                    ? `⏳ Resting (${formatDuration(currentRest)})`
                    : phase === "working"
                      ? "🔥 Workout Active"
                      : phase === "paused"
                        ? "⏸ Workout Paused"
                        : phase === "finished"
                          ? "✅ Workout Finished"
                          : "Ready to Start"}
                </div>
                <div className="mt-1 flex flex-wrap gap-4 font-display text-2xl">
                  <span>Work: {formatDuration(log.timer?.activeSec || 0)}</span>
                  <span className="text-brand">
                    Total Rest: {formatDuration(log.timer?.restSec || 0)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {phase === "working" || phase === "resting" ? (
                  <>
                    {phase === "resting" && (
                      <Button
                        variant="primary"
                        onClick={() => {
                          setCurrentRest(0);
                          setPhase("working");
                        }}
                      >
                        ⚡ Next Set
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      onClick={() => setPhase("paused")}
                    >
                      ⏸ Pause
                    </Button>
                  </>
                ) : (
                  <Button
                    variant="primary"
                    onClick={() => {
                      setCurrentRest(0);
                      setPhase("working");
                    }}
                  >
                    ▶ {phase === "idle" ? "Start Workout" : "Resume"}
                  </Button>
                )}

                {phase !== "idle" && phase !== "finished" && (
                  <Button variant="ghost" onClick={finishWorkout}>
                    ⏹ Finish
                  </Button>
                )}
              </div>
            </div>
          </Card>

          <Card>
            <div className="mb-1 flex justify-between font-semibold">
              <span>Progress</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <ProgressBar value={progress} />
            <p className="mt-2 text-sm text-mute">
              Enter reps (15, 12, 10) and kg for each set. Ticking ✓ starts your
              rest timer automatically.
            </p>
            {[...groups].map(([group, items]) => (
              <Fragment key={group}>
                <Title as="h3" className="mt-4">
                  {group}
                </Title>
                {items.map((e) => (
                  <ExerciseRow
                    key={e.id}
                    exercise={e}
                    done={log.done?.[e.id] || []}
                    setsData={log.sets?.[e.id] || []}
                    legacyWeight={log.w?.[e.id]}
                    onToggle={(i) => toggle(e.id, i, e.sets)}
                    onSetChange={(i, field, val) =>
                      updateSetData(e.id, i, field, val, e.sets)
                    }
                  />
                ))}
              </Fragment>
            ))}
          </Card>
        </>
      )}

      <Card>
        <Title as="h3">Daily Photo</Title>
        <p className="mb-3 text-sm text-mute">
          Saved to your Drive (FitTrack folder) and shown in the timeline.
        </p>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          hidden
          onChange={(e) => {
            const f = e.target.files[0];
            e.target.value = "";
            if (f) addPhoto(key, f);
          }}
        />
        <Button variant="primary" onClick={() => fileRef.current.click()}>
          📷 Take / add photo
        </Button>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
          {(log.photos || []).map((id) => (
            <DriveImage key={id} id={id} />
          ))}
        </div>
        <textarea
          rows={2}
          placeholder="Notes (energy, weight, soreness…)"
          defaultValue={log.note}
          onBlur={(e) => setLog(key, (l) => ({ ...l, note: e.target.value }))}
          className="mt-3 w-full rounded-lg border border-line bg-bg p-3 text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/40"
        />
      </Card>
    </>
  );
}
