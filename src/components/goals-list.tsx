import type { GoalDTO } from "@/lib/dashboard";

type GoalsListProps = {
  goals: GoalDTO[];
};

export function GoalsList({ goals }: GoalsListProps) {
  return (
    <section className="dash-panel dash-goals" aria-labelledby="goals-heading">
      <h2 id="goals-heading" className="dash-panel-title">
        Цели
      </h2>
      {goals.length === 0 ? (
        <p className="dash-empty">Пока нет целей — учитель добавит их в кабинете.</p>
      ) : (
        <ul className="goals-list">
          {goals.map((goal) => (
            <li key={goal.id} className="goal-item">
              <div className="goal-head">
                <span className="goal-title">{goal.title}</span>
                <span className="goal-pct">{goal.progress}%</span>
              </div>
              <div
                className="goal-bar"
                role="progressbar"
                aria-valuenow={goal.progress}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={goal.title}
              >
                <span
                  className="goal-bar-fill"
                  style={{ width: `${goal.progress}%` }}
                />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
