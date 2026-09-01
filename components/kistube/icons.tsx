// Minimal original line-icon set for KISTube. No icon library is a
// dependency of this repo (checked package.json) and the product brief
// explicitly rules out reproducing another platform's iconography, so
// these are hand-drawn 20x20 strokes rather than a copied icon font.
type IconProps = { className?: string };
const base = { width: 20, height: 20, viewBox: "0 0 20 20", fill: "none", stroke: "currentColor", strokeWidth: 1.6, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function EducationIcon({ className }: IconProps) {
  return <svg {...base} className={className}><path d="M10 3 2 7l8 4 8-4-8-4Z" /><path d="M5 9v4c0 1.1 2.2 2 5 2s5-.9 5-2V9" /><path d="M17 7v6" /></svg>;
}
export function HealthIcon({ className }: IconProps) {
  return <svg {...base} className={className}><path d="M10 17s-6-3.7-6-8a3.6 3.6 0 0 1 6-2.6A3.6 3.6 0 0 1 16 9c0 4.3-6 8-6 8Z" /><path d="M8 9h1.2l.8-1.6.8 3.2.8-1.6H13" /></svg>;
}
export function MarketIcon({ className }: IconProps) {
  return <svg {...base} className={className}><path d="M3 6h14l-1 4H4L3 6Z" /><path d="M4 6 3.4 3.4H2" /><circle cx="8" cy="16" r="1.3" /><circle cx="14" cy="16" r="1.3" /><path d="M6 10v3.5h9" /></svg>;
}
export function JobsIcon({ className }: IconProps) {
  return <svg {...base} className={className}><rect x="3" y="6.5" width="14" height="9.5" rx="1.5" /><path d="M7 6.5V5a1.5 1.5 0 0 1 1.5-1.5h3A1.5 1.5 0 0 1 13 5v1.5" /><path d="M3 10.5h14" /></svg>;
}
export function FeedsIcon({ className }: IconProps) {
  return <svg {...base} className={className}><path d="M3 3v2.2A11.8 11.8 0 0 1 14.8 17H17" /><path d="M3 8.4A6.6 6.6 0 0 1 11.6 17" /><circle cx="4.6" cy="15.4" r="1.6" /></svg>;
}
export function TestimoniesIcon({ className }: IconProps) {
  return <svg {...base} className={className}><path d="M4 4h9l3 3v6a1 1 0 0 1-1 1H8l-4 3V4Z" /><path d="M7 8h6M7 11h4" /></svg>;
}
export function ChannelsIcon({ className }: IconProps) {
  return <svg {...base} className={className}><rect x="2.5" y="4.5" width="15" height="11" rx="2" /><path d="M8.3 7.8v4.4l3.8-2.2-3.8-2.2Z" fill="currentColor" stroke="none" /></svg>;
}
export function SearchIcon({ className }: IconProps) {
  return <svg {...base} className={className}><circle cx="8.8" cy="8.8" r="5.3" /><path d="m16.5 16.5-3.6-3.6" /></svg>;
}
export function MenuIcon({ className }: IconProps) {
  return <svg {...base} className={className}><path d="M3 5.5h14M3 10h14M3 14.5h14" /></svg>;
}
export function BellIcon({ className }: IconProps) {
  return <svg {...base} className={className}><path d="M5 8.5a5 5 0 0 1 10 0c0 3 1 4 1 4H4s1-1 1-4Z" /><path d="M8.2 15a1.8 1.8 0 0 0 3.6 0" /></svg>;
}
export function SavedIcon({ className }: IconProps) {
  return <svg {...base} className={className}><path d="M5 3h10v14l-5-3.2L5 17V3Z" /></svg>;
}
export function HistoryIcon({ className }: IconProps) {
  return <svg {...base} className={className}><circle cx="9.8" cy="10.2" r="6.3" /><path d="M9.8 7v3.2l2.4 1.6" /><path d="M3.8 6 2.5 3.6" /></svg>;
}
export function SettingsIcon({ className }: IconProps) {
  return <svg {...base} className={className}><circle cx="10" cy="10" r="2.6" /><path d="M10 3v1.6M10 15.4V17M17 10h-1.6M4.6 10H3M15 5l-1.1 1.1M6.1 13.9 5 15M15 15l-1.1-1.1M6.1 6.1 5 5" /></svg>;
}
export function ChannelIcon2({ className }: IconProps) {
  return <svg {...base} className={className}><rect x="2.5" y="5" width="15" height="10" rx="2" /><path d="M8.3 8v4l3.6-2-3.6-2Z" fill="currentColor" stroke="none" /></svg>;
}
export function ChevronDownIcon({ className }: IconProps) {
  return <svg {...base} width={14} height={14} viewBox="0 0 20 20" className={className}><path d="m5 8 5 5 5-5" /></svg>;
}
export function LogOutIcon({ className }: IconProps) {
  return <svg {...base} className={className}><path d="M8 17H4.5A1.5 1.5 0 0 1 3 15.5v-11A1.5 1.5 0 0 1 4.5 3H8" /><path d="M13 13.5 17 10l-4-3.5" /><path d="M17 10H7.5" /></svg>;
}
export function HomeIcon({ className }: IconProps) {
  return <svg {...base} className={className}><path d="M3 9.5 10 4l7 5.5" /><path d="M5 8.5V16h10V8.5" /></svg>;
}
export function UserIcon({ className }: IconProps) {
  return <svg {...base} className={className}><circle cx="10" cy="6.8" r="3" /><path d="M4 17c0-3 2.7-5 6-5s6 2 6 5" /></svg>;
}
export function ExternalIcon({ className }: IconProps) {
  return <svg {...base} className={className}><path d="M8 4H4v12h12v-4" /><path d="M11 3h6v6" /><path d="M9.5 10.5 17 3" /></svg>;
}
export function ThumbUpIcon({ className }: IconProps) {
  return <svg {...base} className={className}><path d="M6 17H4V9h2v8Z" /><path d="M6 9l3.5-6c1 0 2 .8 2 2.2V8h3.4a1.6 1.6 0 0 1 1.55 1.95l-1.2 5.3A2 2 0 0 1 13.3 17H6" /></svg>;
}
export function ShareIcon({ className }: IconProps) {
  return <svg {...base} className={className}><circle cx="15" cy="5" r="2" /><circle cx="15" cy="15" r="2" /><circle cx="5" cy="10" r="2" /><path d="m6.7 9 6.6-3M6.7 11l6.6 3" /></svg>;
}
export function FlagIcon({ className }: IconProps) {
  return <svg {...base} className={className}><path d="M5 3v14" /><path d="M5 4h9l-2 3 2 3H5" /></svg>;
}
