import { useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { formatDuration, getPeriodStats, iso } from "../lib/habit.js";
import { Card, Input, Segmented, Stat, Title } from "./ui.jsx";

export default function TimelineStats() {
  const { data } = useApp();
  const [view, setView] = useState("daily"); // "daily" | "monthly" | "yearly"
  const [selectedDate, setSelectedDate] = useState(iso(new Date()));

  const prefix =
    view === "daily"
      ? selectedDate // "2026-11-16"
      : view === "monthly"
        ? selectedDate.slice(0, 7) // "2026-11"
        : selectedDate.slice(0, 4); // "2026"

  const stats = getPeriodStats(data, prefix);
  const dayLog = view === "daily" ? data.logs[selectedDate] : null;

  return (
    <div>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <Title>Performance Stats</Title>
        <Segmented
          options={["daily", "monthly", "yearly"]}
          value={view}
          onChange={setView}
        />
      </div>

      {/* Period Selector */}
      <Card>
        <label className="mb-1 block text-xs font-semibold text-mute">
          Select {view === "daily" ? "Date" : view === "monthly" ? "Month" : "Year"}
        </label>
        {view === "daily" && (
          <Input
            type="date"
            value={selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
          />
        )}
        {view === "monthly" && (
          <Input
            type="month"
            value={selectedDate.slice(0, 7)}
            onChange={(e) => setSelectedDate(`${e.target.value}-01`)}
          />
        )}
        {view === "yearly" && (
          <Input
            type="number"
            min="2020"
            max="2035"
            value={selectedDate.slice(0, 4)}
            onChange={(e) => setSelectedDate(`${e.target.value}-01-01`)}
          />
        )}
      </Card>

      {/* Summary Grid */}
      <Card>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Stat value={stats.workouts} label="Workouts Done" />
          <Stat
            value={`${stats.totalVolumeKg.toLocaleString("en-IN")} kg`}
            label="Total Volume Lifted"
          />
          <Stat value={stats.totalSets} label="Total Sets" />
          <Stat
            value={formatDuration(stats.activeSec)}
            label="Active Workout Time"
          />
          <Stat
            value={formatDuration(stats.avgSetRest)}
            label="Avg Rest Between Sets"
          />
          <Stat
            value={formatDuration(stats.avgExerciseGap)}
            label="Avg Gap Between Exercises"
          />
        </div>
      </Card>

      {/* Daily Breakdown of Exercise Transition Gaps & Set Weights */}
      {view === "daily" && dayLog && (
        <Card>
          <Title as="h3" className="mb-3">
            Session Breakdown ({selectedDate})
          </Title>

          {dayLog.timer?.exerciseGaps?.length > 0 && (
            <div className="mb-3 rounded-xl bg-bg p-3 text-xs">
              <strong className="block text-ink">
                Exercise Transition Times:
              </strong>
              <span className="text-mute">
                {dayLog.timer.exerciseGaps
                  .map((g, i) => `Exercise ${i + 1} → ${i + 2}: ${formatDuration(g)}`)
                  .join(" • ")}
              </span>
            </div>
          )}

          {Object.entries(dayLog.sets || {}).map(([exId, sets]) => (
            <div key={exId} className="border-b border-line py-2 last:border-0">
              <div className="text-sm font-bold">{exId}</div>
              <div className="mt-1 flex flex-wrap gap-2 text-xs text-mute">
                {sets.map((s, idx) => (
                  <span
                    key={idx}
                    className="rounded-lg bg-bg px-2.5 py-1 font-medium text-ink"
                  >
                    Set {idx + 1}: {s.reps} × {s.weight}kg
                    {s.restSec ? ` (rest ${formatDuration(s.restSec)})` : ""}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}