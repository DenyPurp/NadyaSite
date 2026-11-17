import type { ReactNode } from "react";
import type { Season } from "@/lib/season";

type SeasonalDecorProps = {
  season: Season;
};

type Motif = {
  key: string;
  className: string;
  node: ReactNode;
};

function Leaf({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M16.2 3.2c6.8 2.4 11.4 8.6 10.6 15.4-3.1-.4-6.7-2.2-9.4-5.1.6 3.4 1.1 6.6.4 9.7-4.9-1.8-8.7-6.4-9.6-11.6C7.1 7.2 11.2 4.1 16.2 3.2Z"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeOpacity="0.35"
        strokeWidth="1.2"
        d="M16.4 5.2c-.2 4.8-.8 9.4-2.6 13.6"
      />
    </svg>
  );
}

function Blossom({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <circle cx="16" cy="16" r="3.2" fill="currentColor" />
      <ellipse cx="16" cy="8.2" rx="3.4" ry="5" fill="currentColor" opacity="0.72" />
      <ellipse cx="16" cy="23.8" rx="3.4" ry="5" fill="currentColor" opacity="0.72" />
      <ellipse cx="8.2" cy="16" rx="5" ry="3.4" fill="currentColor" opacity="0.72" />
      <ellipse cx="23.8" cy="16" rx="5" ry="3.4" fill="currentColor" opacity="0.72" />
    </svg>
  );
}

function Snowflake({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <g
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M16 4v24M6.5 9.5l19 13M6.5 22.5l19-13" />
        <path d="M16 8.2l-2.2-2.2M16 8.2l2.2-2.2M16 23.8l-2.2 2.2M16 23.8l2.2 2.2" />
        <path d="M9.4 11.2l-3.1.2M9.4 11.2l.8-3M22.6 20.8l3.1-.2M22.6 20.8l-.8 3" />
        <path d="M9.4 20.8l-3.1-.2M9.4 20.8l.8 3M22.6 11.2l3.1.2M22.6 11.2l-.8-3" />
      </g>
    </svg>
  );
}

function Book({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M7.2 6.4h8.1c1.4 0 2.5.6 3.2 1.5.7-.9 1.8-1.5 3.2-1.5h3.1v16.4h-3.4c-1.2 0-2.2.4-2.9 1.1-.7-.7-1.7-1.1-2.9-1.1H7.2V6.4Z"
        opacity="0.88"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        d="M16.1 8.2v14.2"
        opacity="0.45"
      />
    </svg>
  );
}

function Cup({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <path
        fill="currentColor"
        d="M8.2 10.5h12.4c.7 0 1.3.6 1.3 1.3v5.2c0 3.1-2.4 5.6-5.4 5.9l-.5.1h-3.2l-.5-.1c-3-.3-5.4-2.8-5.4-5.9v-5.2c0-.7.6-1.3 1.3-1.3Z"
        opacity="0.88"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        d="M22 12.4h1.6c1.5 0 2.7 1.2 2.7 2.7s-1.2 2.7-2.7 2.7H22"
        opacity="0.7"
      />
      <path
        fill="none"
        stroke="currentColor"
        strokeWidth="1.3"
        strokeLinecap="round"
        d="M12.2 7.4c.4-1 .2-1.8-.3-2.4M16.4 7.6c.5-1.1.3-2-.3-2.7"
        opacity="0.55"
      />
    </svg>
  );
}

function motifsFor(season: Season): Motif[] {
  switch (season) {
    case "spring":
      return [
        { key: "s1", className: "seasonal-motif seasonal-motif--tl seasonal-motif--drift-a", node: <Leaf /> },
        { key: "s2", className: "seasonal-motif seasonal-motif--tr seasonal-motif--drift-b", node: <Blossom /> },
        { key: "s3", className: "seasonal-motif seasonal-motif--bl seasonal-motif--drift-c", node: <Leaf /> },
        { key: "s4", className: "seasonal-motif seasonal-motif--br seasonal-motif--drift-a", node: <Blossom /> },
        { key: "s5", className: "seasonal-motif seasonal-motif--ml seasonal-motif--drift-b", node: <Leaf /> },
      ];
    case "summer":
      return [
        { key: "u1", className: "seasonal-motif seasonal-motif--tl seasonal-motif--drift-a", node: <Leaf /> },
        { key: "u2", className: "seasonal-motif seasonal-motif--tr seasonal-motif--drift-b", node: <Cup /> },
        { key: "u3", className: "seasonal-motif seasonal-motif--bl seasonal-motif--drift-c", node: <Book /> },
        { key: "u4", className: "seasonal-motif seasonal-motif--br seasonal-motif--drift-a", node: <Leaf /> },
        { key: "u5", className: "seasonal-motif seasonal-motif--mr seasonal-motif--drift-b", node: <Cup /> },
      ];
    case "autumn":
      return [
        { key: "a1", className: "seasonal-motif seasonal-motif--tl seasonal-motif--drift-a", node: <Leaf /> },
        { key: "a2", className: "seasonal-motif seasonal-motif--tr seasonal-motif--drift-b", node: <Leaf /> },
        { key: "a3", className: "seasonal-motif seasonal-motif--bl seasonal-motif--drift-c", node: <Book /> },
        { key: "a4", className: "seasonal-motif seasonal-motif--br seasonal-motif--drift-a", node: <Cup /> },
        { key: "a5", className: "seasonal-motif seasonal-motif--ml seasonal-motif--drift-b", node: <Leaf /> },
      ];
    case "winter":
      return [
        { key: "w1", className: "seasonal-motif seasonal-motif--tl seasonal-motif--drift-a", node: <Snowflake /> },
        { key: "w2", className: "seasonal-motif seasonal-motif--tr seasonal-motif--drift-b", node: <Snowflake /> },
        { key: "w3", className: "seasonal-motif seasonal-motif--bl seasonal-motif--drift-c", node: <Cup /> },
        { key: "w4", className: "seasonal-motif seasonal-motif--br seasonal-motif--drift-a", node: <Snowflake /> },
        { key: "w5", className: "seasonal-motif seasonal-motif--mr seasonal-motif--drift-b", node: <Book /> },
      ];
  }
}

export function SeasonalDecor({ season }: SeasonalDecorProps) {
  const motifs = motifsFor(season);

  return (
    <div className="seasonal-decor" aria-hidden="true">
      {motifs.map((motif) => (
        <span key={motif.key} className={motif.className}>
          {motif.node}
        </span>
      ))}
    </div>
  );
}
