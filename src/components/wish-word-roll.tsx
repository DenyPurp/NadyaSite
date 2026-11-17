"use client";

import { useEffect, useId, useRef, useState } from "react";

const WORDS = ["wonderful", "amazing", "perfect", "nice", "good"] as const;

type Spring = { x: number; v: number; t: number; k: number; c: number };

type Letter = { el: HTMLSpanElement; s: Spring };

type LiveWord = {
  el: HTMLSpanElement;
  letters: Letter[];
  out: boolean;
};

function spring(x: number, k = 400, c = 30): Spring {
  return { x, v: 0, t: x, k, c };
}

function step(s: Spring, dt: number) {
  const a = -s.k * (s.x - s.t) - s.c * s.v;
  s.v += a * dt;
  s.x += s.v * dt;
}

function clamp(v: number, a: number, b: number) {
  return Math.max(a, Math.min(b, v));
}

type Timer = { t: number; fn: () => void };

/**
 * Slot-machine word roll for the student wish line.
 * Motion pattern adapted from DesignBookmark Word Roll
 * (letter-by-letter vertical spring + width spring). Click/tap only.
 */
export function WishWordRoll() {
  const labelId = useId();
  const slotRef = useRef<HTMLSpanElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const indexRef = useRef(0);
  const liveRef = useRef<LiveWord[]>([]);
  const widthRef = useRef(spring(0, 320, 30));
  const timersRef = useRef<Timer[]>([]);
  const reduceMotionRef = useRef(false);
  const [announcement, setAnnouncement] = useState(
    `Have a ${WORDS[0]} day!`,
  );

  useEffect(() => {
    const slot = slotRef.current;
    if (!slot) return;

    reduceMotionRef.current =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const after = (sec: number, fn: () => void) => {
      const t: Timer = { t: sec, fn };
      timersRef.current.push(t);
      return t;
    };

    const make = (word: string): LiveWord => {
      const el = document.createElement("span");
      el.className = "wish-roll-word";
      el.setAttribute("aria-hidden", "true");
      const letters: Letter[] = [...word].map((ch) => {
        const l = document.createElement("span");
        l.className = "wish-roll-ch";
        l.textContent = ch;
        el.appendChild(l);
        return { el: l, s: spring(1, 420, 26) };
      });
      slot.appendChild(el);
      return { el, letters, out: false };
    };

    const show = (word: string, first = false) => {
      const reduce = reduceMotionRef.current;
      const live = liveRef.current;

      live.forEach((w) => {
        if (w.out) return;
        w.out = true;
        if (reduce) {
          w.el.remove();
          liveRef.current = liveRef.current.filter((x) => x !== w);
          return;
        }
        w.letters.forEach((l, k) => {
          after(k * 0.022, () => {
            l.s.t = -1;
          });
        });
        after(1, () => {
          w.el.remove();
          liveRef.current = liveRef.current.filter((x) => x !== w);
        });
      });

      const w = make(word);
      w.letters.forEach((l, k) => {
        if (first || reduce) {
          l.s.x = l.s.t = 0;
        } else {
          after(0.06 + k * 0.028, () => {
            l.s.t = 0;
          });
        }
      });
      liveRef.current.push(w);

      const measured = w.el.offsetWidth;
      widthRef.current.t = measured;
      if (first || reduce) widthRef.current.x = measured;

      setAnnouncement(`Have a ${word} day!`);
      buttonRef.current?.setAttribute(
        "aria-label",
        `Change wish word. Currently: ${word}`,
      );
    };

    const next = () => {
      indexRef.current = (indexRef.current + 1) % WORDS.length;
      show(WORDS[indexRef.current]);
    };

    const onClick = () => next();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        next();
      }
    };

    const btn = buttonRef.current;
    btn?.addEventListener("click", onClick);
    btn?.addEventListener("keydown", onKeyDown);

    show(WORDS[0], true);

    if (document.fonts) {
      document.fonts.ready.then(() => {
        const w = liveRef.current[liveRef.current.length - 1];
        if (w) widthRef.current.t = w.el.offsetWidth;
      });
    }

    let last = performance.now();
    let raf = 0;
    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30);
      last = now;

      const timers = timersRef.current;
      for (let i = timers.length - 1; i >= 0; i--) {
        timers[i].t -= dt;
        if (timers[i].t <= 0) {
          const { fn } = timers.splice(i, 1)[0];
          fn();
        }
      }

      const sub = 4;
      for (let k = 0; k < sub; k++) {
        step(widthRef.current, dt / sub);
        liveRef.current.forEach((w) =>
          w.letters.forEach((l) => step(l.s, dt / sub)),
        );
      }

      slot.style.width = `${widthRef.current.x}px`;
      liveRef.current.forEach((w) =>
        w.letters.forEach((l) => {
          const y = l.s.x;
          l.el.style.transform = `translateY(${y * 105}%)`;
          l.el.style.opacity = String(clamp(1 - Math.abs(y) * 0.9, 0, 1));
        }),
      );

      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      btn?.removeEventListener("click", onClick);
      btn?.removeEventListener("keydown", onKeyDown);
      timersRef.current = [];
      liveRef.current.forEach((w) => w.el.remove());
      liveRef.current = [];
    };
  }, []);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className="wish-roll"
        aria-labelledby={labelId}
        aria-label={`Change wish word. Currently: ${WORDS[0]}`}
      >
        <span ref={slotRef} className="wish-roll-slot" aria-hidden="true" />
      </button>
      <span id={labelId} className="sr-only">
        {announcement}
      </span>
    </>
  );
}
