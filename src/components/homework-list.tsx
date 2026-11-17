import type { HomeworkDTO } from "@/lib/dashboard";

type HomeworkListProps = {
  items: HomeworkDTO[];
};

function formatShortDate(dayKey: string): string {
  const [, m, d] = dayKey.split("-");
  return `${d}.${m}`;
}

export function HomeworkList({ items }: HomeworkListProps) {
  return (
    <section
      className="dash-panel dash-homework"
      aria-labelledby="homework-heading"
    >
      <h2 id="homework-heading" className="dash-panel-title">
        Домашние задания
      </h2>
      {items.length === 0 ? (
        <p className="dash-empty">Пока нет заданий на ближайшие дни.</p>
      ) : (
        <ul className="homework-list">
          {items.map((item) => (
            <li key={item.id} className="homework-item">
              <span className="homework-date">{formatShortDate(item.dateKey)}</span>
              <span className="homework-sep" aria-hidden="true">
                :
              </span>
              <span className="homework-title">{item.title}</span>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
