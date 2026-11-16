import { cx } from "../lib/habit.js";

export function Button({ variant = "outline", className, ...p }) {
  const v = {
    primary: "bg-brand border-choc text-[#2b1d16]",
    outline: "border-ink bg-card text-ink",
    ghost: "border-line bg-transparent text-ink px-3 py-1.5",
  }[variant];
  return (
    <button
      className={cx(
        "rounded-xl border-2 px-4 py-2.5 text-[15px] font-semibold transition active:scale-95 disabled:opacity-50",
        v,
        className,
      )}
      {...p}
    />
  );
}
export const Card = ({ className, ...p }) => (
  <div
    className={cx(
      "mb-4 rounded-2xl border border-line bg-card p-4 sm:p-5",
      className,
    )}
    {...p}
  />
);
export const Title = ({ as: T = "h2", className, ...p }) => (
  <T
    className={cx(
      "font-display tracking-wide",
      T === "h2" ? "text-3xl" : "text-xl",
      className,
    )}
    {...p}
  />
);
export const Input = ({ className, ...p }) => (
  <input
    className={cx(
      "w-full rounded-lg border border-line bg-bg px-3 py-2 text-ink outline-none focus:border-brand focus:ring-2 focus:ring-brand/40",
      className,
    )}
    {...p}
  />
);
export const ProgressBar = ({ value }) => (
  <div
    className="h-2.5 overflow-hidden rounded-full bg-line"
    role="progressbar"
    aria-valuenow={Math.round(value)}
  >
    <div
      className="h-full bg-ok transition-all duration-300"
      style={{ width: `${Math.min(100, value)}%` }}
    />
  </div>
);
export const Stat = ({ value, label }) => (
  <div>
    <b className="block font-display text-3xl font-normal text-brand">
      {value}
    </b>
    <span className="text-xs opacity-80">{label}</span>
  </div>
);
export function Segmented({ options, value, onChange }) {
  return (
    <div className="mb-4 inline-flex overflow-hidden rounded-xl border-2 border-ink">
      {options.map((o) => (
        <button
          key={o}
          onClick={() => onChange(o)}
          className={cx(
            "px-4 py-1.5 text-sm font-semibold capitalize",
            o === value ? "bg-brand text-[#2b1d16]" : "text-ink",
          )}
        >
          {o}
        </button>
      ))}
    </div>
  );
}
export const Toast = ({ text }) =>
  text ? (
    <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-ink px-5 py-2.5 text-sm text-bg shadow-lg md:bottom-6">
      {text}
    </div>
  ) : null;
