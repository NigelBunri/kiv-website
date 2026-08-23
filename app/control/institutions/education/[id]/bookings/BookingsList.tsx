"use client";

import { useState } from "react";

type Booking = {
  id: string;
  status: string;
  seat_count: number;
  amount_usd_label?: string;
  learner_display_name?: string;
  booked_item_title?: string;
  reserved_at?: string;
};

const ACTIONS = [
  { value: "confirm", label: "Confirm" },
  { value: "waitlist", label: "Waitlist" },
  { value: "pending", label: "Mark pending" },
  { value: "payment_pending", label: "Mark payment pending" },
  { value: "complete", label: "Mark complete" },
  { value: "cancel", label: "Cancel (refunds locked funds)" },
  { value: "expire", label: "Expire" },
];

export default function BookingsList({ institutionId, initialBookings }: { institutionId: string; initialBookings: Booking[] }) {
  const [bookings, setBookings] = useState(initialBookings);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  async function applyAction(booking: Booking, action: string) {
    if (action === "cancel" && !confirm("Cancel this booking? Any locked funds will be refunded to the learner.")) return;
    setBusyId(booking.id);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/education/institutions/${institutionId}/bookings/${booking.id}/action`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to update this booking.");
      const updated = data.data?.booking;
      setBookings((prev) => prev.map((b) => (b.id === booking.id ? { ...b, status: updated?.status || b.status } : b)));
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to update this booking." });
    } finally {
      setBusyId(null);
    }
  }

  return (
    <section className="control-section">
      {message ? <p className="control-error">{message.text}</p> : null}
      {bookings.length === 0 ? (
        <div className="control-empty">No bookings yet.</div>
      ) : (
        <div className="control-list">
          {bookings.map((booking) => (
            <div key={booking.id} className="control-list-row">
              <div>
                <div className="control-list-row-title">{booking.booked_item_title || "Booking"} — {booking.learner_display_name || "Learner"}</div>
                <div className="control-list-row-meta">
                  {booking.status} · {booking.seat_count} seat{booking.seat_count === 1 ? "" : "s"}{booking.amount_usd_label ? ` · ${booking.amount_usd_label}` : ""}
                </div>
              </div>
              <select
                value=""
                onChange={(e) => { if (e.target.value) applyAction(booking, e.target.value); }}
                disabled={busyId === booking.id}
              >
                <option value="">Change status…</option>
                {ACTIONS.map((a) => <option key={a.value} value={a.value}>{a.label}</option>)}
              </select>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
