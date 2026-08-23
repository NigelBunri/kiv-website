import { notFound } from "next/navigation";
import { authHeaders, kisApiBase } from "@/lib/session";
import { fetchControlProfile } from "@/lib/controlAuth";
import BookingsList from "./BookingsList";
import { BackLink } from "@/app/control/BackLink";

type Booking = {
  id: string;
  status: string;
  seat_count: number;
  amount_usd_label?: string;
  learner_display_name?: string;
  booked_item_title?: string;
  reserved_at?: string;
};

export default async function EducationBookingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const result = await fetchControlProfile();
  if (!result) return null;
  const { session } = result;
  const headers = authHeaders(session);

  const res = await fetch(`${kisApiBase()}/api/v1/broadcasts/education/institutions/${encodeURIComponent(id)}/bookings/`, {
    headers, cache: "no-store", signal: AbortSignal.timeout(15_000),
  });
  if (!res.ok) notFound();
  const data = await res.json();
  const bookings: Booking[] = Array.isArray(data?.bookings) ? data.bookings : [];

  return (
    <>
      <BackLink href={`/control/institutions/education/${id}`} label="Back to institution" />
      <div className="control-header">
        <h1>Bookings</h1>
        <p>Paid seat reservations against your courses, class sessions, and events.</p>
      </div>
      <BookingsList institutionId={id} initialBookings={bookings} />
    </>
  );
}
