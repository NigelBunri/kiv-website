"use client";

import { useState } from "react";

// Small client island for the Jobs page (Server Component, IsAuthenticated
// end to end — the whole page sits behind KISTubeAuthGate already, so this
// button never needs to handle a signed-out state itself). Posts straight
// to the existing app/api/kistube/jobs/apply proxy route, which forwards
// to JobApplicationViewSet (apps.commerce.business_views) and auto-assigns
// applicant=request.user server-side.
export function JobApplyButton({ jobId }: { jobId: string }) {
  const [status, setStatus] = useState<"idle" | "pending" | "applied" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  async function apply() {
    if (status === "pending" || status === "applied") return;
    setStatus("pending");
    setErrorMessage("");
    try {
      const res = await fetch("/api/kistube/jobs/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ listing: jobId }),
      });
      const data = await res.json().catch(() => ({}));
      if (res.ok && data?.success) {
        setStatus("applied");
      } else {
        setErrorMessage(data?.message || "You may have already applied.");
        setStatus("error");
      }
    } catch {
      setErrorMessage("Unable to reach the server. Please try again shortly.");
      setStatus("error");
    }
  }

  if (status === "applied") {
    return (
      <button type="button" className="kt-button kt-button--subscribed" disabled>
        Applied
      </button>
    );
  }

  return (
    <div>
      <button
        type="button"
        className="kt-button kt-button--primary"
        onClick={apply}
        disabled={status === "pending"}
      >
        {status === "pending" ? "Applying…" : "Apply"}
      </button>
      {status === "error" && (
        <div style={{ fontSize: ".8rem", color: "var(--danger)", marginTop: ".35rem" }}>{errorMessage}</div>
      )}
    </div>
  );
}
