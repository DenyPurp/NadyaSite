/** Reserved panel for 10th/20th AssignmentIssue выдачи — placeholder only. */
export function AssignmentReserve() {
  return (
    <section
      className="dash-panel dash-reserve"
      aria-labelledby="reserve-heading"
    >
      <h2 id="reserve-heading" className="dash-panel-title">
        Выдача 10 / 20
      </h2>
      <p className="dash-empty">
        Здесь появятся задания, которые выдаются 10-го и 20-го числа. Пока
        панель зарезервирована.
      </p>
    </section>
  );
}
