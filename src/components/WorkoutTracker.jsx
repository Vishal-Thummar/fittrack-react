import { useEffect, useRef, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { emptyLog, formatDuration, iso, planFor } from "../lib/habit.js";
import { Button, Card, Input, Title } from "./ui.jsx";

export default function WorkoutTracker({ dateKey = iso(new Date()) }) {
  const { data, setLog, notify } = useApp();
  const log = data.logs[dateKey] || emptyLog();
  const plan = planFor(data.plan, new Date(dateKey));

  // Timer states: "idle" | "working" | "resting" | "paused" | "finished"
  const [phase, setPhase] = useState(log.timer?.finished ? "finished" : "idle");
  const [currentRest, setCurrentRest] = useState(0);
  const lastExerciseId = useRef(null);

  // Tick every second when active
  useEffect(() => {
    if (phase !== "working" && phase !== "resting") return;

    const id = setInterval(() => {
      if (phase === "resting") setCurrentRest((r) => r + 1);

      setLog(dateKey, (prev) => ({
        ...prev,
        timer: {
          ...prev.timer,
          activeSec:
            phase === "working"
              ? (prev.timer?.activeSec || 0) + 1
              : prev.timer?.activeSec || 0,
          restSec:
            phase === "resting"
              ? (prev.timer?.restSec || 0) + 1
              : prev.timer?.restSec || 0,
        },
      }));
    }, 1000);

    return () => clearInterval(id);
  }, [phase, dateKey, setLog]);

  if (!plan) return <Card>Rest day — no exercises scheduled.</Card>;

  const handleSetChange = (exId, setIdx, field, val) => {
    setLog(dateKey, (prev) => {
      const existing = prev.sets?.[exId] || [];
      const updated = [...existing];
      updated[setIdx] = {
        reps: 12,
        weight: 0,
        restSec: 0,
        ...updated[setIdx],
        [field]: Number(val),
      };
      return { ...prev, sets: { ...prev.sets, [exId]: updated } };
    });
  };

  const toggleSetDone = (exId, setIdx) => {
    const wasDone = Boolean(log.done?.[exId]?.[setIdx]);

    setLog(dateKey, (prev) => {
      const doneArr = [...(prev.done?.[exId] || [])];
      doneArr[setIdx] = !wasDone;

      const setsArr = [...(prev.sets?.[exId] || [])];
      let exerciseGaps = [...(prev.timer?.exerciseGaps || [])];

      // If checking off a set after a rest period, store the rest/transition time
      if (!wasDone && currentRest > 0) {
        if (lastExerciseId.current && lastExerciseId.current !== exId) {
          // User switched to a new exercise -> log transition gap
          exerciseGaps.push(currentRest);
        } else if (setIdx > 0 && setsArr[setIdx - 1]) {
          // Same exercise -> log rest between sets
          setsArr[setIdx - 1] = {
            ...setsArr[setIdx - 1],
            restSec: currentRest,
          };
        }
      }

      return {
        ...prev,
        done: { ...prev.done, [exId]: doneArr },
        sets: { ...prev.sets, [exId]: setsArr },
        timer: { ...prev.timer, exerciseGaps },
      };
    });

    if (!wasDone) {
      // Automatically start rest timer after completing a set
      lastExerciseId.current = exId;
      setCurrentRest(0);
      setPhase("resting");
    }
  };

  const finishWorkout = () => {
    setPhase("finished");
    setCurrentRest(0);
    setLog(dateKey, (prev) => ({
      ...prev,
      timer: { ...prev.timer, finished: true },
    }));
    notify("Workout saved to timeline!");
  };

  const defaultReps = [15, 12, 10, 8];

  return (
    <div>
      {/* Sticky Play / Pause / Rest Control Bar */}
      <Card className="sticky top-16 z-30 border-2 border-brand shadow-md">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-mute">
              {phase === "resting"
                ? "⏳ Resting Between Sets"
                : phase === "working"
                  ? "🔥 Workout Active"
                  : phase === "paused"
                    ? "⏸ Paused"
                    : phase === "finished"
                      ? "✅ Completed"
                      : "Ready to Start"}
            </span>
            <div className="mt-0.5 flex items-baseline gap-4 font-display text-2xl">
              <span>Work: {formatDuration(log.timer?.activeSec)}</span>
              <span className="text-brand">
                Rest:{" "}
                {formatDuration(
                  phase === "resting" ? currentRest : log.timer?.restSec,
                )}
              </span>
            </div>
          </div>

          <div className="flex gap-2">
            {phase === "working" || phase === "resting" ? (
              <Button variant="outline" onClick={() => setPhase("paused")}>
                ⏸ Pause
              </Button>
            ) : (
              <Button
                variant="primary"
                onClick={() => {
                  setCurrentRest(0);
                  setPhase("working");
                }}
              >
                ▶ {phase === "idle" ? "Start" : "Resume"}
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

      {/* Exercise Cards with Per-Set Kg & Reps */}
      {plan.items.map((ex) => {
        const doneArr = log.done?.[ex.id] || [];
        const setsArr = log.sets?.[ex.id] || [];

        return (
          <Card key={ex.id}>
            <div className="mb-3 flex items-center justify-between">
              <Title as="h3">{ex.name}</Title>
              <span className="text-xs font-semibold text-mute">
                {ex.sets} sets
              </span>
            </div>

            <div className="space-y-2.5">
              {Array.from({ length: ex.sets }).map((_, idx) => {
                const isChecked = Boolean(doneArr[idx]);
                const setData = setsArr[idx] || {
                  reps: defaultReps[idx] ?? 10,
                  weight: "",
                  restSec: 0,
                };

                return (
                  <div key={idx}>
                    <div className="grid grid-cols-12 items-center gap-2">
                      <span className="col-span-2 text-xs font-bold text-mute">
                        SET {idx + 1}
                      </span>

                      <div className="col-span-4">
                        <Input
                          type="number"
                          placeholder="Reps"
                          value={setData.reps}
                          onChange={(e) =>
                            handleSetChange(ex.id, idx, "reps", e.target.value)
                          }
                        />
                        <span className="text-[10px] text-mute">reps</span>
                      </div>

                      <div className="col-span-4">
                        <Input
                          type="number"
                          step="0.5"
                          placeholder="kg"
                          value={setData.weight}
                          onChange={(e) =>
                            handleSetChange(
                              ex.id,
                              idx,
                              "weight",
                              e.target.value,
                            )
                          }
                        />
                        <span className="text-[10px] text-mute">kg</span>
                      </div>

                      <div className="col-span-2 flex justify-end">
                        <button
                          onClick={() => toggleSetDone(ex.id, idx)}
                          className={`h-10 w-10 rounded-xl border-2 font-bold transition ${
                            isChecked
                              ? "border-ok bg-ok text-white"
                              : "border-line bg-bg text-mute"
                          }`}
                        >
                          ✓
                        </button>
                      </div>
                    </div>

                    {/* Show recorded rest between sets */}
                    {setData.restSec > 0 && (
                      <div className="my-1 text-center text-[11px] font-medium text-brand">
                        ↓ Rested {formatDuration(setData.restSec)} before next
                        set
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
