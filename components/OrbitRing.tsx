"use client";

import Link from "next/link";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { products } from "@/lib/site";

// The 5 KIS-family products (from lib/site.ts, so slug/name/logo paths
// stay a single source of truth with the rest of the site) plus the 3
// entities above/beside them in the KCAN -> KIV -> KIS structure. KCAN,
// KIV and Shekinah Global have no dedicated page of their own yet (see
// app/about/page.tsx, the only place that currently explains them), so
// their boxes link there rather than to a 404.
const ORBIT_ITEMS = [
  ...products.map((p) => ({ key: p.slug, name: p.name, logo: `/images/${p.slug}-logo-512.png`, href: `/products/${p.slug}` })),
  { key: "kcan", name: "KCAN", logo: "/images/kcan-logo-512.png", href: "/about" },
  { key: "kiv", name: "KIV", logo: "/images/kiv-logo-512.png", href: "/about" },
  { key: "shekina-global", name: "Shekinah Global", logo: "/images/shekina-global-logo-512.png", href: "/about" },
];

const ITEM_COUNT = ORBIT_ITEMS.length; // 8
const ANGLE_STEP = 360 / ITEM_COUNT;
const DEGREES_PER_MS = 360 / 42000; // one full orbit every 42s

// The ring is full-size at/above WIDE_PX and shrinks continuously as the
// viewport narrows toward NARROW_PX, reaching FLOOR_SCALE right at that
// point - NARROW_PX matches globals.css's own `.orbit-stage { display:
// none; }` breakpoint (max-width: 980px), so the ring visibly shrinks
// away to nothing rather than staying full-size and then vanishing in
// one abrupt jump at that breakpoint. WIDE_PX is deliberately higher
// than the hero's own "carousel column stops growing" point (~46vw
// capping at 48rem, well below 1500px) - at these bigger item/radius
// values, full size needs to wait for a wide enough viewport that the
// ring's leftmost swing still clears the product carousel column
// (checked against .home-hero-copy/.product-carousel-card's own widths
// in globals.css - roughly 65px of clearance at 1500px, growing fast
// above that as the carousel's width caps out while the ring's anchor
// point keeps scaling with viewport width).
const WIDE_PX = 1500;
const NARROW_PX = 980;
const FLOOR_SCALE = 0.22;
const MAX_RADIUS_REM = 14;

function responsiveScaleForWidth(width: number): number {
  if (width >= WIDE_PX) return 1;
  if (width <= NARROW_PX) return FLOOR_SCALE;
  const t = (width - NARROW_PX) / (WIDE_PX - NARROW_PX);
  return FLOOR_SCALE + (1 - FLOOR_SCALE) * t;
}

// Projects a point at `angleDeg` around a horizontal ring (rotation
// around the vertical axis - items swing side to side and toward/away
// from the viewer, not up and down) onto: a horizontal offset, a
// front-to-back depth value in [-1, 1], and z-index/opacity/scale
// derived from that depth so the nearest item reads as "in front, big,
// bright" and the farthest as "behind the hero art, small, faint" -
// this stands in for a true CSS 3D projection (translateZ + perspective)
// with plain 2D transforms, which stays crisp/cheap and easy to reason
// about compared to nesting preserve-3d + a counter-rotating billboard
// child to keep each logo facing the viewer.
function projectOrbitPosition(angleDeg: number) {
  const rad = (angleDeg * Math.PI) / 180;
  const depth = Math.cos(rad); // 1 = nearest (front), -1 = farthest (back)
  const x = Math.sin(rad); // -1 = full left, 1 = full right
  const scale = 0.58 + 0.42 * ((depth + 1) / 2); // 0.58 (back) .. 1.0 (front)
  const opacity = 0.32 + 0.68 * ((depth + 1) / 2); // 0.32 (back) .. 1.0 (front)
  return { x, depth, scale, opacity };
}

export function OrbitRing() {
  const [angle, setAngle] = useState(0);
  // Starts at the full-size default rather than reading window.innerWidth
  // during render - this component renders on the server first (no
  // window there), and diverging from that initial value would be a
  // hydration mismatch. Corrected to the real width in the effect below,
  // immediately on mount and on every resize.
  const [responsiveScale, setResponsiveScale] = useState(1);
  const pausedRef = useRef(false);
  const reducedMotionRef = useRef(false);

  useEffect(() => {
    function handleResize() {
      setResponsiveScale(responsiveScaleForWidth(window.innerWidth));
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    reducedMotionRef.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotionRef.current) return; // stays at the initial angle - no orbit motion at all

    let frame: number;
    let last = performance.now();
    function tick(now: number) {
      const elapsed = now - last;
      last = now;
      if (!pausedRef.current) {
        setAngle((prev) => (prev + elapsed * DEGREES_PER_MS) % 360);
      }
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  return (
    <div
      className="orbit-stage"
      role="group"
      aria-label="Kingdom Impact Ventures product and entity portfolio"
      onMouseEnter={() => { pausedRef.current = true; }}
      onMouseLeave={() => { pausedRef.current = false; }}
      onFocus={() => { pausedRef.current = true; }}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node)) pausedRef.current = false;
      }}
    >
      {ORBIT_ITEMS.map((item, index) => {
        const { x, depth, scale, opacity } = projectOrbitPosition(angle + index * ANGLE_STEP);
        return (
          <Link
            key={item.key}
            href={item.href}
            className="orbit-item"
            style={{
              transform: `translate(-50%, -50%) translateX(${x * MAX_RADIUS_REM * responsiveScale}rem) scale(${scale * responsiveScale})`,
              opacity,
              zIndex: Math.round((depth + 1) * 50),
            }}
          >
            <span className="orbit-item-logo">
              <Image src={item.logo} alt="" width={140} height={140} />
            </span>
            <span className="orbit-item-name">{item.name}</span>
          </Link>
        );
      })}
    </div>
  );
}
