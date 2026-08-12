"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

function Shell({
  title,
  subtitle,
  badge = "Portfolio demo · local-only",
  children,
}: {
  title: string;
  subtitle: string;
  badge?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 dark:bg-black dark:text-zinc-100">
      <div className="mx-auto max-w-6xl px-4 py-10">
        <header className="mb-8">
          <p className="text-xs font-medium uppercase tracking-wider text-zinc-500">{badge}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 max-w-2xl text-sm text-zinc-600 dark:text-zinc-400">{subtitle}</p>
        </header>
        {children}
        <footer className="mt-10 border-t border-zinc-200 pt-4 text-xs text-zinc-500 dark:border-zinc-800">
          Honest demo: no multi-tenant backend. State (if any) stays in this browser.
        </footer>
      </div>
    </div>
  );
}

function Button({
  children,
  onClick,
  variant = "primary",
  disabled,
  type = "button",
  className = "",
}: {
  children: ReactNode;
  onClick?: () => void;
  variant?: "primary" | "secondary" | "ghost" | "danger";
  disabled?: boolean;
  type?: "button" | "submit";
  className?: string;
}) {
  const base =
    "inline-flex items-center justify-center rounded-lg px-3 py-2 text-sm font-medium transition disabled:opacity-50 " +
    className;
  const styles =
    variant === "primary"
      ? "bg-zinc-900 text-white hover:bg-zinc-700 dark:bg-zinc-100 dark:text-zinc-900"
      : variant === "secondary"
        ? "bg-white text-zinc-900 ring-1 ring-zinc-200 hover:bg-zinc-100 dark:bg-zinc-900 dark:text-zinc-100 dark:ring-zinc-700"
        : variant === "danger"
          ? "bg-red-600 text-white hover:bg-red-500"
          : "text-zinc-600 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900";
  return (
    <button type={type} disabled={disabled} onClick={onClick} className={`${base} ${styles}`}>
      {children}
    </button>
  );
}

const inputClass =
  "w-full rounded-lg border border-zinc-200 bg-white px-3 py-2 text-sm outline-none ring-zinc-400 focus:ring-2 dark:border-zinc-700 dark:bg-zinc-950";

function useLocalStorage<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    try {
      const raw = localStorage.getItem(key);
      if (raw != null) setValue(JSON.parse(raw) as T);
    } catch {
      /* ignore */
    }
    setReady(true);
  }, [key]);
  useEffect(() => {
    if (!ready) return;
    localStorage.setItem(key, JSON.stringify(value));
  }, [key, value, ready]);
  return [value, setValue] as const;
}

function uid() {
  return crypto.randomUUID();
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    return false;
  }
}


type Seat = { id: string; taken: boolean };
export default function Home() {
  const rows = ["A", "B", "C", "D"];
  const [seats, setSeats] = useState<Seat[]>(() =>
    rows.flatMap((row) => Array.from({ length: 8 }, (_, i) => ({ id: row + (i + 1), taken: (i + row.charCodeAt(0)) % 5 === 0 })))
  );
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [bookings, setBookings] = useLocalStorage<{ name: string; seats: string[]; at: number }[]>("ticket-booking-v1", []);
  const toggle = (id: string, taken: boolean) => {
    if (taken) return;
    setSelected((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  };
  const book = () => {
    if (!name.trim() || !selected.length) return;
    setSeats((prev) => prev.map((s) => (selected.includes(s.id) ? { ...s, taken: true } : s)));
    setBookings((prev) => [{ name: name.trim(), seats: selected, at: Date.now() }, ...prev]);
    setSelected([]);
    setName("");
  };
  return (
    <Shell title="Ticket Booking" subtitle="Pick seats on a simple map and store bookings locally.">
      <div className="mb-4 rounded-lg bg-zinc-800 py-2 text-center text-sm text-white">SCREEN</div>
      <div className="mx-auto grid max-w-md grid-cols-8 gap-2">
        {seats.map((s) => (
          <button
            key={s.id}
            type="button"
            disabled={s.taken}
            onClick={() => toggle(s.id, s.taken)}
            className={`aspect-square rounded text-xs font-medium ${
              s.taken
                ? "bg-zinc-300 text-zinc-500 dark:bg-zinc-800"
                : selected.includes(s.id)
                  ? "bg-emerald-500 text-white"
                  : "bg-white ring-1 ring-zinc-300 hover:bg-zinc-100 dark:bg-zinc-950 dark:ring-zinc-700"
            }`}
          >
            {s.id}
          </button>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap gap-2">
        <input className={`${inputClass} max-w-xs`} placeholder="Your name" value={name} onChange={(e) => setName(e.target.value)} />
        <Button onClick={book}>Book {selected.length || ""} seats</Button>
      </div>
      <h2 className="mb-2 mt-8 font-medium">Bookings</h2>
      <ul className="space-y-1 text-sm">
        {bookings.map((b, i) => (
          <li key={i}>{b.name}: {b.seats.join(", ")}</li>
        ))}
      </ul>
    </Shell>
  );
}
