import { cx, formatDuration } from "../lib/habit.js";
import { Input } from "./ui.jsx";

const DEFAULT_REPS = [15, 12, 10, 8];

export default function ExerciseRow({
  exercise,
  done = [],
  setsData = [],
  legacyWeight = "",
  onToggle,
  onSetChange,
}) {
  return (
    <div className="border-b border-line py-3.5 last:border-b-0">
      <div className="mb-2 flex items-center justify-between">
        <div>
          <div className="font-semibold text-ink">{exercise.name}</div>
          <div className="text-xs text-mute">
            {exercise.sets} sets {exercise.reps ? `• Target: ${exercise.reps}` : ""}
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {Array.from({ length: exercise.sets }).map((_, i) => {
          const isDone = Boolean(done[i]);
          const currentSet = setsData[i] || {
            reps: DEFAULT_REPS[i] ?? 10,
            weight: legacyWeight || "",
            restSec: 0,
          };

          return (
            <div key={i}>
              <div className="grid grid-cols-12 items-center gap-2">
                <span className="col-span-2 text-xs font-bold text-mute">
                  SET {i + 1}
                </span>

                <div className="col-span-4 flex items-center gap-1">
                  <Input
                    type="number"
                    placeholder="Reps"
                    value={currentSet.reps}
                    onChange={(e) => onSetChange(i, "reps", e.target.value)}
                    className="py-1.5 text-center text-sm"
                  />
                  <span className="text-xs text-mute">reps</span>
                </div>

                <div className="col-span-4 flex items-center gap-1">
                  <Input
                    type="number"
                    step="0.5"
                    placeholder="kg"
                    value={currentSet.weight}
                    onChange={(e) => onSetChange(i, "weight", e.target.value)}
                    className="py-1.5 text-center text-sm"
                  />
                  <span className="text-xs text-mute">kg</span>
                </div>

                <div className="col-span-2 flex justify-end">
                  <button
                    type="button"
                    onClick={() => onToggle(i)}
                    className={cx(
                      "flex h-9 w-9 items-center justify-center rounded-full border-2 text-sm font-bold transition",
                      isDone
                        ? "border-ok bg-ok text-[#2b1d16]"
                        : "border-line bg-bg text-mute hover:border-brand",
                    )}
                  >
                    {isDone ? "✓" : i + 1}
                  </button>
                </div>
              </div>

              {currentSet.restSec > 0 && (
                <div className="mt-1 text-center text-[11px] font-medium text-brand">
                  ⏳ Rested {formatDuration(currentSet.restSec)} before next set
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}