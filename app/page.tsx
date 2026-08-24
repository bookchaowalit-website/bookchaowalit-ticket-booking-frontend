"use client";

import { useEffect, useMemo, useState } from "react";

type Seat = { id: string; taken: boolean };
type Booking = { name: string; seats: string[]; at: number };
const ROWS = ["A", "B", "C", "D"];
const INITIAL_SEATS: Seat[] = ROWS.flatMap((row) => Array.from({ length: 8 }, (_, index) => ({ id: row + (index + 1), taken: (index + row.charCodeAt(0)) % 5 === 0 })));

function useBookings() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  useEffect(() => { try { const raw = localStorage.getItem("ticket-booking-v2"); if (raw) setBookings(JSON.parse(raw) as Booking[]); } catch { /* keep empty */ } }, []);
  const save = (next: Booking[]) => { setBookings(next); window.localStorage.setItem("ticket-booking-v2", JSON.stringify(next)); };
  return [bookings, save] as const;
}

export default function Home() {
  const [seats, setSeats] = useState(INITIAL_SEATS);
  const [selected, setSelected] = useState<string[]>([]);
  const [name, setName] = useState("");
  const [bookings, saveBooking] = useBookings();
  const available = useMemo(() => seats.filter((seat) => !seat.taken).length, [seats]);
  const toggle = (id: string) => setSelected((current) => current.includes(id) ? current.filter((seat) => seat !== id) : [...current, id]);
  const book = () => {
    if (!name.trim() || selected.length === 0) return;
    setSeats((current) => current.map((seat) => selected.includes(seat.id) ? { ...seat, taken: true } : seat));
    saveBooking([{ name: name.trim(), seats: selected, at: Date.now() }, ...bookings]);
    setName(""); setSelected([]);
  };

  return (
    <main className="box-office">
      <header className="office-header">
        <div className="ticket-mark">B<span>✦</span>O</div>
        <div className="office-name"><span>BOOKCHAOWALIT PRESENTS</span><strong>SEAT MAP / 001</strong></div>
        <div className="office-line" /><span className="office-state">LOCAL BOOKING DEMO</span>
      </header>
      <section className="showbill">
        <div><p className="ticket-label">ONE SCREEN / FOUR ROWS</p><h1>Pick your<br /><em>place.</em></h1></div>
        <div className="show-details"><span>SHOW 01</span><strong>THE SIMPLE SEAT MAP</strong><p>Choose open seats, leave a name, and keep the booking in this browser.</p></div>
      </section>
      <section className="booking-window" aria-label="Seat booking">
        <div className="seat-side">
          <div className="stage-label"><span>STAGE</span><i /></div>
          <div className="seat-legend"><span><i className="legend-open" /> open</span><span><i className="legend-selected" /> selected</span><span><i className="legend-taken" /> unavailable</span></div>
          <div className="seat-map">
            {ROWS.map((row) => <div className="seat-row" key={row}><span className="row-label">{row}</span>{seats.filter((seat) => seat.id.startsWith(row)).map((seat) => <button key={seat.id} className={seat.taken ? "seat taken" : selected.includes(seat.id) ? "seat selected" : "seat"} disabled={seat.taken} aria-label={seat.taken ? `${seat.id} unavailable` : `Select seat ${seat.id}`} aria-pressed={selected.includes(seat.id)} onClick={() => toggle(seat.id)}>{seat.id.slice(1)}</button>)}</div>)}
          </div>
          <div className="availability-line"><span>{available} seats remain</span><span>{selected.length} selected</span></div>
        </div>
        <aside className="ticket-window">
          <p className="ticket-label">BOX OFFICE WINDOW</p><h2>Your<br /><em>reservation.</em></h2>
          <p className="window-note">No payment or remote reservation is connected. This is a seat-map interaction demo.</p>
          <label><span>Name</span><input value={name} onChange={(event) => setName(event.target.value)} placeholder="Your name" /></label>
          <div className="selection-receipt"><span>SEATS</span><strong>{selected.length ? selected.join(" · ") : "Choose on the map"}</strong></div>
          <button className="reserve-button" disabled={!name.trim() || selected.length === 0} onClick={book}>Reserve seats <span>→</span></button>
        </aside>
      </section>
      <section className="booking-history">
        <div><p className="ticket-label">LOCAL STUBS</p><h2>Recent bookings</h2></div>
        {bookings.length === 0 ? <p className="no-bookings">Your browser has no booking stubs yet.</p> : <div className="stub-list">{bookings.slice(0, 4).map((booking) => <div className="stub" key={`${booking.at}-${booking.name}`}><span>{new Date(booking.at).toLocaleDateString("en", { month: "short", day: "numeric" })}</span><strong>{booking.name}</strong><b>{booking.seats.join(" · ")}</b></div>)}</div>}
      </section>
      <footer className="office-footer"><span>BOOKCHAOWALIT / TICKET BOOKING</span><span>LOCAL BROWSER STATE · DEMO-GRADE</span></footer>
    </main>
  );
}
