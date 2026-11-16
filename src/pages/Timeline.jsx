import { useMemo, useState } from "react";
import { useApp } from "../context/AppContext.jsx";
import { fmt, isDone, monday, parse, pct } from "../lib/habit.js";
import { Card, Segmented, Title } from "../components/ui.jsx";
import DriveImage from "../components/DriveImage.jsx";
import MonthCalendar from "../components/MonthCalendar.jsx";

export default function Timeline() {
  const { data } = useApp();
  const [view, setView] = useState("week");
  const groups = useMemo(() => {
    const label = (k) => {
      const d = parse(k);
      return view === "week"
        ? "Week of " +
            fmt(monday(d), { day: "numeric", month: "short", year: "numeric" })
        : view === "month"
          ? fmt(d, { month: "long", year: "numeric" })
          : String(d.getFullYear());
    };
    const keys = Object.keys(data.logs)
      .filter((k) => data.logs[k].photos.length || pct(data, k) > 0)
      .sort()
      .reverse();
    const m = new Map();
    keys.forEach((k) => m.set(label(k), [...(m.get(label(k)) || []), k]));
    return [...m];
  }, [data, view]);

  return (
    <>
      <Title>Timeline</Title>
      <div className="mt-3">
        <Segmented
          options={["week", "month", "year"]}
          value={view}
          onChange={setView}
        />
      </div>
      <MonthCalendar data={data} />
      {!groups.length && (
        <Card className="text-mute">
          Nothing yet. Log a workout or photo on the Today tab.
        </Card>
      )}
      {groups.map(([label, keys]) => (
        <section key={label} className="mb-6">
          <div className="mb-2 flex flex-wrap items-baseline justify-between gap-1">
            <Title as="h3">{label}</Title>
            <span className="text-sm text-mute">
              {keys.filter((k) => isDone(data, k)).length} workouts ·{" "}
              {keys.reduce((a, k) => a + data.logs[k].photos.length, 0)} photos
            </span>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4">
            {keys.flatMap((k) =>
              data.logs[k].photos.map((id) => (
                <figure key={id}>
                  <DriveImage id={id} />
                  <figcaption className="mt-1 text-sm text-mute">
                    {fmt(parse(k), { day: "numeric", month: "short" })} ·{" "}
                    {Math.round(pct(data, k) * 100)}%
                  </figcaption>
                </figure>
              )),
            )}
          </div>
        </section>
      ))}
    </>
  );
}
