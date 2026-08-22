"use client";

import { createContext, useContext } from "react";
import type { ControlProfile } from "@/lib/controlAuth";

const ControlContext = createContext<ControlProfile | null>(null);

export function ControlProvider({ profile, children }: { profile: ControlProfile; children: React.ReactNode }) {
  return <ControlContext.Provider value={profile}>{children}</ControlContext.Provider>;
}

export function useControlProfile(): ControlProfile {
  const ctx = useContext(ControlContext);
  if (!ctx) throw new Error("useControlProfile must be used within the /control route tree.");
  return ctx;
}
