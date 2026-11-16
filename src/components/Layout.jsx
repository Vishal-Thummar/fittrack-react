import { useApp } from "../context/AppContext.jsx";
import { cx } from "../lib/habit.js";
import { Button, Toast } from "./ui.jsx";

export const TABS = [
  ["today", "Today", "🏋️"],
  ["timeline", "Timeline", "📅"],
  ["plan", "Plan", "📝"],
  ["goals", "Goals", "🎯"],
];
const Logo = () => (
  <h1 className="font-display text-3xl tracking-wide">
    FIT<span className="text-brand">TRACK</span>
  </h1>
);

export default function Layout({ tab, setTab, children }) {
  const { signOut, status, toast } = useApp();
  const dot = { saved: "text-ok", saving: "text-brand", error: "text-red-500" }[
    status
  ];
  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-40 border-b-[3px] border-brand bg-bg pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex max-w-4xl items-center gap-4 px-4 py-2.5">
          <Logo />
          <nav className="hidden flex-1 gap-1 md:flex">
            {TABS.map(([id, label]) => (
              <button
                key={id}
                onClick={() => setTab(id)}
                className={cx(
                  "rounded-lg px-3 py-2 text-[15px] font-semibold",
                  tab === id
                    ? "bg-brand text-[#2b1d16]"
                    : "text-mute hover:text-ink",
                )}
              >
                {label}
              </button>
            ))}
          </nav>
          <div className="ml-auto flex items-center gap-3">
            <span className={cx("text-xs", dot)} title="Sync status">
              ● {status}
            </span>
            <Button variant="ghost" onClick={signOut}>
              Sign out
            </Button>
          </div>
        </div>
      </header>
      <main className="mx-auto max-w-4xl px-4 pb-28 pt-5 md:pb-10">
        {children}
      </main>
      <nav className="fixed inset-x-0 bottom-0 z-40 grid grid-cols-4 border-t border-line bg-card pb-[env(safe-area-inset-bottom)] md:hidden">
        {TABS.map(([id, label, icon]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={cx(
              "flex flex-col items-center py-2 text-xs font-semibold",
              tab === id ? "text-ink" : "text-mute",
            )}
          >
            <span
              className={cx(
                "rounded-full px-4 py-0.5 text-lg",
                tab === id && "bg-brand",
              )}
            >
              {icon}
            </span>
            {label}
          </button>
        ))}
      </nav>
      <Toast text={toast} />
    </div>
  );
}
