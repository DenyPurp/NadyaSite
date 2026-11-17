"use client";

import { useId, useMemo, useState } from "react";
import type { StudentLessonDTO } from "@/lib/lessons";
import {
  formatLongDay,
  formatMonthTitle,
  monthEndKey,
  monthStartKey,
  partsFromDayKey,
} from "@/lib/moscow-time";

const WEEKDAYS = ["пн", "вт", "ср", "чт", "пт", "сб", "вс"] as const;

type StudentCalendarProps = {
  lessons: StudentLessonDTO[];
  /** Initial “today” from the server (Europe/Moscow) to avoid hydration drift. */
  todayKey: string;
  /** Compact mode for student dashboard top-left slot. */
  compact?: boolean;
};

type MonthCursor = { year: number; month: number };

function monthFromDayKey(dayKey: string): MonthCursor {
  const { year, month } = partsFromDayKey(dayKey);
  return { year, month };
}

function compareMonth(a: MonthCursor, b: MonthCursor): number {
  return a.year * 12 + a.month - (b.year * 12 + b.month);
}

function shiftMonth(cursor: MonthCursor, delta: number): MonthCursor {
  const index = cursor.year * 12 + (cursor.month - 1) + delta;
  return { year: Math.floor(index / 12), month: (index % 12) + 1 };
}

function buildCells(year: number, month: number): (string | null)[] {
  const start = monthStartKey(year, month);
  const end = monthEndKey(year, month);
  const { day: startDay } = partsFromDayKey(start);
  const { day: endDay } = partsFromDayKey(end);
  // JS: Sunday=0 … Saturday=6 → Monday-first index
  const weekday = new Date(Date.UTC(year, month - 1, startDay)).getUTCDay();
  const mondayOffset = (weekday + 6) % 7;
  const cells: (string | null)[] = Array.from({ length: mondayOffset }, () => null);
  for (let d = 1; d <= endDay; d += 1) {
    cells.push(
      `${year}-${String(month).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
    );
  }
  while (cells.length % 7 !== 0) {
    cells.push(null);
  }
  return cells;
}

export function StudentCalendar({
  lessons,
  todayKey,
  compact = false,
}: StudentCalendarProps) {
  const titleId = useId();
  const currentMonth = useMemo(() => monthFromDayKey(todayKey), [todayKey]);
  const [cursor, setCursor] = useState<MonthCursor>(currentMonth);
  const [selectedKey, setSelectedKey] = useState<string | null>(null);
  const [motionNonce, setMotionNonce] = useState(0);

  const lessonsByDay = useMemo(() => {
    const map = new Map<string, StudentLessonDTO[]>();
    for (const lesson of lessons) {
      const list = map.get(lesson.dateKey) ?? [];
      list.push(lesson);
      map.set(lesson.dateKey, list);
    }
    return map;
  }, [lessons]);

  const cells = useMemo(
    () => buildCells(cursor.year, cursor.month),
    [cursor.year, cursor.month],
  );

  const canGoForward = compareMonth(cursor, currentMonth) < 0;
  const selectedLessons = selectedKey ? (lessonsByDay.get(selectedKey) ?? []) : [];

  function goMonth(delta: number) {
    setCursor((m) => shiftMonth(m, delta));
    setMotionNonce((n) => n + 1);
    setSelectedKey(null);
  }

  function selectDay(dayKey: string) {
    const dayLessons = lessonsByDay.get(dayKey);
    if (!dayLessons?.length) {
      setSelectedKey(null);
      return;
    }
    // Plan: past (and today) lesson days open the detail panel.
    if (dayKey > todayKey) {
      setSelectedKey(null);
      return;
    }
    setSelectedKey(dayKey);
  }

  return (
    <section
      className={`calendar${compact ? " calendar--compact" : ""}`}
      aria-labelledby={titleId}
    >
      <div className="calendar-head">
        <h2 id={titleId} className="calendar-title">
          Календарь
        </h2>
        {!compact ? (
          <p className="calendar-today">Сегодня · {formatLongDay(todayKey)}</p>
        ) : (
          <p className="calendar-today calendar-today--short">
            {formatLongDay(todayKey)}
          </p>
        )}
      </div>

      <div className="calendar-nav">
        <button
          type="button"
          className="calendar-nav-btn"
          onClick={() => goMonth(-1)}
          aria-label="Предыдущий месяц"
        >
          ‹
        </button>
        <p className="calendar-month" aria-live="polite">
          {formatMonthTitle(cursor.year, cursor.month)}
        </p>
        <button
          type="button"
          className="calendar-nav-btn"
          onClick={() => goMonth(1)}
          disabled={!canGoForward}
          aria-label="Следующий месяц"
        >
          ›
        </button>
      </div>

      <div
        key={`${cursor.year}-${cursor.month}-${motionNonce}`}
        className="calendar-grid calendar-grid--motion"
        role="grid"
        aria-label={formatMonthTitle(cursor.year, cursor.month)}
      >
        {WEEKDAYS.map((label) => (
          <div key={label} className="calendar-weekday" role="columnheader">
            {label}
          </div>
        ))}
        {cells.map((dayKey, index) => {
          if (!dayKey) {
            return <div key={`empty-${index}`} className="calendar-cell calendar-cell--empty" />;
          }
          const hasLesson = (lessonsByDay.get(dayKey)?.length ?? 0) > 0;
          const isToday = dayKey === todayKey;
          const isSelected = dayKey === selectedKey;
          const isFuture = dayKey > todayKey;
          const clickable = hasLesson && !isFuture;

          return (
            <button
              key={dayKey}
              type="button"
              role="gridcell"
              className={[
                "calendar-cell",
                isToday ? "calendar-cell--today" : "",
                hasLesson ? "calendar-cell--lesson" : "",
                isSelected ? "calendar-cell--selected" : "",
                isFuture ? "calendar-cell--future" : "",
              ]
                .filter(Boolean)
                .join(" ")}
              onClick={() => selectDay(dayKey)}
              disabled={!clickable}
              aria-current={isSelected ? "date" : undefined}
              aria-label={
                hasLesson
                  ? `${formatLongDay(dayKey)}, есть занятие`
                  : formatLongDay(dayKey)
              }
            >
              <span className="calendar-day-num">{partsFromDayKey(dayKey).day}</span>
              {hasLesson ? <span className="calendar-dot" aria-hidden="true" /> : null}
            </button>
          );
        })}
      </div>

      <div
        className={`lesson-panel${selectedLessons.length ? " lesson-panel--open" : ""}`}
        aria-live="polite"
      >
        {selectedLessons.length && selectedKey ? (
          <>
            <p className="lesson-panel-date">{formatLongDay(selectedKey)}</p>
            {selectedLessons.map((lesson) => (
              <article key={lesson.id} className="lesson-entry">
                <h3 className="lesson-topic">{lesson.topic}</h3>
                {lesson.notes ? (
                  <p className="lesson-notes">{lesson.notes}</p>
                ) : (
                  <p className="lesson-notes lesson-notes--empty">Конспект пока не добавлен.</p>
                )}
              </article>
            ))}
          </>
        ) : (
          <p className="lesson-panel-hint">
            Нажмите день с точкой, чтобы открыть тему и конспект урока.
          </p>
        )}
      </div>
    </section>
  );
}
