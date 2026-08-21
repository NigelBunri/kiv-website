"use client";

import { useState } from "react";
import { LoginForm } from "./LoginForm";
import { RegisterForm } from "./RegisterForm";

export function AuthTabs() {
  const [tab, setTab] = useState<"signin" | "register">("signin");

  return (
    <div className="auth-tabs">
      <div className="auth-tabs-switch" role="tablist">
        <button type="button" role="tab" aria-selected={tab === "signin"} className={tab === "signin" ? "active" : ""} onClick={() => setTab("signin")}>
          Sign in
        </button>
        <button type="button" role="tab" aria-selected={tab === "register"} className={tab === "register" ? "active" : ""} onClick={() => setTab("register")}>
          Create account
        </button>
      </div>
      {tab === "signin" ? <LoginForm /> : <RegisterForm />}
    </div>
  );
}
