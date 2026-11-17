"use client";

import {
  memo,
  useEffect,
  useId,
  useRef,
  useState,
  type RefObject,
} from "react";

const WORDS = ["wonderful", "fantastic", "perfect", "nice", "good"] as const;

/** Vertical travel of one letter, matching DesignBookmark Word Roll. */
const ROLL_TRAVEL = 1.05;

type Spring = { x: number; v: number; t: number; k: number; c: number };

type Letter = { el: HTMLSpanElement; s: Spring };

type LiveWord = {
  el: HTMLSpanElement;
  letters: Letter[];
  out: boolean;
};

type Timer = { t: number; fn: () => void };

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

function paintLetter(el: HTMLSpanElement, y: number) {
  // Positive Y = below the slot; negative = above. Letters always travel
  // on the vertical axis (slot/reel), never sideways.
  el.style.transform = `translate3d(0, ${y * ROLL_TRAVEL * 100}%, 0)`;
  el.style.opacity = String(clamp(1 - Math.abs(y) * 0.9, 0, 1));
}

/**
 * Imperative slot host: must not re-render after mount, otherwise React
 * would wipe the letter nodes the spring loop appends.
 */
const WishRollSlot = memo(function WishRollSlot({
  slotRef,
}: {
  slotRef: RefObject<HTMLSpanElement | null>;
}) {
  return (
    <span ref={slotRef} className="wish-roll-slot" aria-hidden="true" />
  );
});

/**
 * Slot-machine word roll for the student wish line.
 * DesignBookmark Word Roll: letter-by-letter vertical spring + width spring.
 * Click/tap (or Enter/Space) only — no autoplay.
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
  const rollingRef = useRef(false);
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

    const make = (word: string, startY: number): LiveWord => {
      const el = document.createElement("span");
      el.className = "wish-roll-word";
      el.setAttribute("aria-hidden", "true");
      const letters: Letter[] = [...word].map((ch) => {
        const l = document.createElement("span");
        l.className = "wish-roll-ch";
        l.textContent = ch;
        // Apply the first frame immediately so letters never flash at rest
        // (which reads as a sideways / pop-in before the reel starts).
        paintLetter(l, startY);
        el.appendChild(l);
        return { el: l, s: spring(startY, 420, 26) };
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
        // Outgoing letters roll up and out of the slot (−1 = above).
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

      // Incoming letters start below the slot (+1) and spring to rest (0).
      const startY = first || reduce ? 0 : 1;
      const w = make(word, startY);
      w.letters.forEach((l, k) => {
        if (first || reduce) {
          l.s.x = l.s.t = 0;
          paintLetter(l.el, 0);
        } else {
          after(0.06 + k * 0.028, () => {
            l.s.t = 0;
          });
        }
      });
      liveRef.current.push(w);

      // Measure at rest layout width (transforms don't affect layout width).
      const measured = Math.ceil(w.el.getBoundingClientRect().width);
      if (first || reduce) {
        widthRef.current.x = measured;
        widthRef.current.t = measured;
        slot.style.width = `${measured}px`;
      } else {
        // Keep the slot at least as wide as the outgoing word while letters
        // reel vertically. Shrinking early side-clips glyphs and reads as a
        // horizontal wipe instead of a vertical slot roll.
        const hold = Math.max(widthRef.current.x, measured);
        widthRef.current.t = hold;
        // Settle width after outgoing letters have cleared the reel.
        after(0.55, () => {
          widthRef.current.t = measured;
        });
      }

      rollingRef.current = !(first || reduce);
      if (rollingRef.current) {
        // Clear the flag after the staggered enter finishes (~last letter + settle).
        after(0.06 + w.letters.length * 0.028 + 0.55, () => {
          rollingRef.current = false;
        });
      }

      setAnnouncement(`Have a ${word} day!`);
      buttonRef.current?.setAttribute(
        "aria-label",
        `Change wish word. Currently: ${word}`,
      );
    };

    const next = () => {
      // Ignore rapid clicks while a reel is mid-flight to avoid stacking glitches.
      if (rollingRef.current && !reduceMotionRef.current) return;
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
        if (!w || !slotRef.current) return;
        const measured = Math.ceil(w.el.getBoundingClientRect().width);
        widthRef.current.t = measured;
        if (!rollingRef.current) {
          widthRef.current.x = measured;
          slotRef.current.style.width = `${measured}px`;
        }
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

      // Substeps keep the stiff letter springs stable (same as the reference).
      const sub = 4;
      for (let k = 0; k < sub; k++) {
        step(widthRef.current, dt / sub);
        liveRef.current.forEach((w) =>
          w.letters.forEach((l) => step(l.s, dt / sub)),
        );
      }

      slot.style.width = `${widthRef.current.x}px`;
      liveRef.current.forEach((w) =>
        w.letters.forEach((l) => paintLetter(l.el, l.s.x)),
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
        <WishRollSlot slotRef={slotRef} />
      </button>
      <span id={labelId} className="sr-only">
        {announcement}
      </span>
    </>
  );
}
