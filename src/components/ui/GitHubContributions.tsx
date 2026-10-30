import type { ContributionData } from "@/lib/githubContributions";

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

/**
 * A GitHub-style contribution heatmap rendered from shared, deterministic
 * data. Theme-aware (CSS vars) and responsive (scrolls on small screens).
 */
export function GitHubContributions({
  data,
  username = "c0de-break3r",
}: {
  data: ContributionData;
  username?: string;
}) {
  const { weeks, total } = data;

  const monthLabels = weeks.map((col, i) => {
    const m = col[0].date.getMonth();
    const prev = i > 0 ? weeks[i - 1][0].date.getMonth() : -1;
    return m !== prev ? MONTHS[m] : "";
  });

  return (
    <div className="contrib">
      <p className="contrib__total">
        <strong>{total.toLocaleString()}</strong> contributions in the last year
      </p>

      <div className="contrib__scroll">
        <div className="contrib__months" aria-hidden>
          {monthLabels.map((label, i) => (
            <span key={i} className="contrib__month">
              {label}
            </span>
          ))}
        </div>
        <div className="contrib__body">
          <div className="contrib__days" aria-hidden>
            <span />
            <span>Mon</span>
            <span />
            <span>Wed</span>
            <span />
            <span>Fri</span>
            <span />
          </div>
          <div
            className="contrib__grid"
            role="img"
            aria-label={`${total} contributions in the last year for ${username}`}
          >
            {weeks.map((col, wi) =>
              col.map((day, di) => (
                <span
                  key={`${wi}-${di}`}
                  className="contrib__cell"
                  data-level={day.level}
                  title={
                    day.count > 0
                      ? `${day.count} contribution${day.count === 1 ? "" : "s"} on ${day.date.toDateString()}`
                      : `No contributions on ${day.date.toDateString()}`
                  }
                />
              )),
            )}
          </div>
        </div>
      </div>

      <div className="contrib__legend">
        <span>Less</span>
        <span className="contrib__cell" data-level={0} />
        <span className="contrib__cell" data-level={1} />
        <span className="contrib__cell" data-level={2} />
        <span className="contrib__cell" data-level={3} />
        <span className="contrib__cell" data-level={4} />
        <span>More</span>
      </div>
    </div>
  );
}
