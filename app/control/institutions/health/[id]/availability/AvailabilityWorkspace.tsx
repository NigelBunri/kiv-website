"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Service = { id: string; name: string };

type BlockedTime = { date: string; start: string; end: string; reason?: string };

type ServiceSetting = { enabled: boolean; durationMin: number; slotGapMin: number };

type Availability = {
  calendar_statuses: Record<string, string>;
  calendar_times: Record<string, string>;
  calendar_service_ids: Record<string, string[]>;
  blocked_times: BlockedTime[];
  service_availability: Record<string, ServiceSetting>;
};

const STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "limited", label: "Limited" },
  { value: "fully_booked", label: "Fully booked" },
  { value: "on_call", label: "On call" },
  { value: "holiday", label: "Holiday" },
  { value: "blocked", label: "Blocked" },
];

export default function AvailabilityWorkspace({
  institutionId,
  services,
  initialAvailability,
}: {
  institutionId: string;
  services: Service[];
  initialAvailability: Availability;
}) {
  const router = useRouter();
  const [calendarStatuses, setCalendarStatuses] = useState<Record<string, string>>(initialAvailability.calendar_statuses || {});
  const [calendarTimes, setCalendarTimes] = useState<Record<string, string>>(initialAvailability.calendar_times || {});
  const [calendarServiceIds, setCalendarServiceIds] = useState<Record<string, string[]>>(initialAvailability.calendar_service_ids || {});
  const [blockedTimes, setBlockedTimes] = useState<BlockedTime[]>(initialAvailability.blocked_times || []);
  const [serviceAvailability, setServiceAvailability] = useState<Record<string, ServiceSetting>>(initialAvailability.service_availability || {});
  const [message, setMessage] = useState<{ kind: "error" | "success"; text: string } | null>(null);

  const dates = Object.keys(calendarStatuses).sort();

  const [dayDate, setDayDate] = useState("");
  const [dayStatus, setDayStatus] = useState("available");
  const [dayTimes, setDayTimes] = useState("");
  const [dayServices, setDayServices] = useState<string[]>([]);

  function toggleDayService(id: string) {
    setDayServices((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));
  }

  function saveDay(event: React.FormEvent) {
    event.preventDefault();
    if (!dayDate) return;
    setCalendarStatuses((prev) => ({ ...prev, [dayDate]: dayStatus }));
    setCalendarTimes((prev) => {
      const next = { ...prev };
      if (dayTimes.trim()) next[dayDate] = dayTimes.trim();
      else delete next[dayDate];
      return next;
    });
    setCalendarServiceIds((prev) => ({ ...prev, [dayDate]: dayServices }));
    setDayDate(""); setDayStatus("available"); setDayTimes(""); setDayServices([]);
  }

  function editDay(date: string) {
    setDayDate(date);
    setDayStatus(calendarStatuses[date] || "available");
    setDayTimes(calendarTimes[date] || "");
    setDayServices(calendarServiceIds[date] || []);
  }

  function removeDay(date: string) {
    setCalendarStatuses((prev) => { const next = { ...prev }; delete next[date]; return next; });
    setCalendarTimes((prev) => { const next = { ...prev }; delete next[date]; return next; });
    setCalendarServiceIds((prev) => { const next = { ...prev }; delete next[date]; return next; });
  }

  const [blockDate, setBlockDate] = useState("");
  const [blockStart, setBlockStart] = useState("00:00");
  const [blockEnd, setBlockEnd] = useState("23:59");
  const [blockReason, setBlockReason] = useState("");
  function addBlockedTime(event: React.FormEvent) {
    event.preventDefault();
    if (!blockDate) return;
    setBlockedTimes((prev) => [...prev, { date: blockDate, start: blockStart, end: blockEnd, reason: blockReason }]);
    setBlockDate(""); setBlockStart("00:00"); setBlockEnd("23:59"); setBlockReason("");
  }
  function removeBlockedTime(index: number) {
    setBlockedTimes((prev) => prev.filter((_, i) => i !== index));
  }

  function updateServiceSetting(id: string, patch: Partial<ServiceSetting>) {
    setServiceAvailability((prev) => {
      const current: ServiceSetting = prev[id] || { enabled: false, durationMin: 30, slotGapMin: 10 };
      return { ...prev, [id]: { ...current, ...patch } };
    });
  }

  const [saving, setSaving] = useState(false);
  async function saveAll() {
    setSaving(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/control/institutions/health/${institutionId}/availability`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          calendar_statuses: calendarStatuses,
          calendar_times: calendarTimes,
          calendar_service_ids: calendarServiceIds,
          blocked_times: blockedTimes,
          service_availability: serviceAvailability,
          recurring_rules: [],
          slots: [],
        }),
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message || "Unable to save availability.");
      setMessage({ kind: "success", text: "Availability saved." });
      router.refresh();
    } catch (error: unknown) {
      setMessage({ kind: "error", text: error instanceof Error ? error.message : "Unable to save availability." });
    } finally {
      setSaving(false);
    }
  }

  return (
    <>
      {message ? <p className={message.kind === "error" ? "control-error" : "control-success"}>{message.text}</p> : null}

      <section className="control-section">
        <h2>Day status</h2>
        <p>Set a status for a specific date. Leave time slots blank to mark the whole day; list specific times (e.g. &ldquo;09:00, 09:30, 10:00&rdquo;) to offer fixed slots.</p>
        <form className="control-form" onSubmit={saveDay}>
          <label>Date<input type="date" value={dayDate} onChange={(e) => setDayDate(e.target.value)} required /></label>
          <label>
            Status
            <select value={dayStatus} onChange={(e) => setDayStatus(e.target.value)}>
              {STATUS_OPTIONS.map((opt) => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
            </select>
          </label>
          <label>Time slots (optional)<input value={dayTimes} onChange={(e) => setDayTimes(e.target.value)} placeholder="09:00, 09:30, 10:00" /></label>
          {services.length > 0 ? (
            <fieldset>
              <legend>Services offered this day</legend>
              {services.map((s) => (
                <label key={s.id} style={{ display: "block" }}>
                  <input type="checkbox" checked={dayServices.includes(s.id)} onChange={() => toggleDayService(s.id)} /> {s.name}
                </label>
              ))}
            </fieldset>
          ) : null}
          <div className="control-actions">
            <button type="submit" className="button primary" disabled={!dayDate}>Set day</button>
          </div>
        </form>
        {dates.length === 0 ? (
          <div className="control-empty">No dates configured yet.</div>
        ) : (
          <div className="control-list">
            {dates.map((date) => (
              <div key={date} className="control-list-row">
                <div>
                  <div className="control-list-row-title">{date}</div>
                  <div className="control-list-row-meta">
                    {calendarStatuses[date]}{calendarTimes[date] ? ` · ${calendarTimes[date]}` : " · all day"}
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <button type="button" className="button" onClick={() => editDay(date)}>Edit</button>
                  <button type="button" className="button" onClick={() => removeDay(date)}>Remove</button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      <section className="control-section">
        <h2>Blocked periods</h2>
        <form className="control-form" onSubmit={addBlockedTime}>
          <label>Date<input type="date" value={blockDate} onChange={(e) => setBlockDate(e.target.value)} required /></label>
          <label>Start<input type="time" value={blockStart} onChange={(e) => setBlockStart(e.target.value)} /></label>
          <label>End<input type="time" value={blockEnd} onChange={(e) => setBlockEnd(e.target.value)} /></label>
          <label>Reason<input value={blockReason} onChange={(e) => setBlockReason(e.target.value)} placeholder="Holiday, maintenance…" /></label>
          <div className="control-actions">
            <button type="submit" className="button primary" disabled={!blockDate}>Add blocked period</button>
          </div>
        </form>
        {blockedTimes.length === 0 ? (
          <div className="control-empty">No blocked periods.</div>
        ) : (
          <div className="control-list">
            {blockedTimes.map((block, index) => (
              <div key={`${block.date}-${index}`} className="control-list-row">
                <div>
                  <div className="control-list-row-title">{block.date}, {block.start}–{block.end}</div>
                  <div className="control-list-row-meta">{block.reason}</div>
                </div>
                <button type="button" className="button" onClick={() => removeBlockedTime(index)}>Remove</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {services.length > 0 ? (
        <section className="control-section">
          <h2>Per-service booking settings</h2>
          <div className="control-list">
            {services.map((s) => {
              const setting = serviceAvailability[s.id] || { enabled: false, durationMin: 30, slotGapMin: 10 };
              return (
                <div key={s.id} className="control-list-row">
                  <div>
                    <div className="control-list-row-title">{s.name}</div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      <input type="checkbox" checked={setting.enabled} onChange={(e) => updateServiceSetting(s.id, { enabled: e.target.checked })} /> Bookable
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      Duration
                      <input type="number" min={5} max={720} value={setting.durationMin} onChange={(e) => updateServiceSetting(s.id, { durationMin: Number(e.target.value) })} style={{ width: "72px" }} /> min
                    </label>
                    <label style={{ display: "flex", alignItems: "center", gap: "0.25rem" }}>
                      Gap
                      <input type="number" min={0} max={300} value={setting.slotGapMin} onChange={(e) => updateServiceSetting(s.id, { slotGapMin: Number(e.target.value) })} style={{ width: "72px" }} /> min
                    </label>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      <div className="control-actions">
        <button type="button" className="button primary" onClick={saveAll} disabled={saving}>{saving ? "Saving…" : "Save availability"}</button>
      </div>
    </>
  );
}
