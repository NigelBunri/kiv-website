// Turns a Website's `branding` JSON (validated server-side by
// apps/websites/branding.py - palette hex colors, a closed typography
// preset, a closed button shape/fill) into the --wb-* CSS custom
// properties app/globals.css's .wb-* rules read. Typography presets map
// to fonts already loaded build-time via next/font/google in
// app/layout.tsx (--font-sans, --font-serif) - never an arbitrary
// font name, since nothing else could resolve one at runtime under this
// site's CSP.
import type { CSSProperties } from "react";

type Branding = {
  palette?: { primary?: string; secondary?: string; background?: string; text?: string };
  typography?: { preset?: "system" | "sans" | "serif" };
  buttons?: { shape?: "rounded" | "pill" | "square"; fill?: "solid" | "outline" };
};

const BUTTON_RADIUS: Record<string, string> = {
  rounded: ".6rem",
  pill: "999px",
  square: ".15rem",
};

const FONT_STACK: Record<string, string> = {
  system: "system-ui, sans-serif",
  sans: "var(--font-sans), system-ui, sans-serif",
  serif: "var(--font-serif), Georgia, serif",
};

export function websiteBrandingStyle(rawBranding: Record<string, unknown> | null | undefined): CSSProperties {
  if (!rawBranding || typeof rawBranding !== "object") return {};
  const branding = rawBranding as Branding;

  const palette = branding.palette || {};
  const primary = palette.primary || "#1a1a2e";
  const shape = branding.buttons?.shape || "rounded";
  const fill = branding.buttons?.fill || "solid";

  const style: Record<string, string> = {
    "--brand-primary": primary,
    "--wb-btn-radius": BUTTON_RADIUS[shape] || BUTTON_RADIUS.rounded,
  };

  if (palette.background) style["--wb-bg"] = palette.background;
  if (palette.text) style["--wb-text"] = palette.text;
  style["--wb-font"] = FONT_STACK[branding.typography?.preset || "system"] || FONT_STACK.system;

  if (fill === "outline") {
    style["--wb-btn-bg"] = "transparent";
    style["--wb-btn-fg"] = primary;
    style["--wb-btn-border"] = `2px solid ${primary}`;
  } else {
    style["--wb-btn-bg"] = primary;
    style["--wb-btn-fg"] = "#fff";
    style["--wb-btn-border"] = "none";
  }

  return style as CSSProperties;
}
