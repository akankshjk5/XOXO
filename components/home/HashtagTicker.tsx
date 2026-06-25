export function HashtagTicker() {
  const items = Array(20).fill("#SooperHitHolidays");

  return (
    <div className="ticker-wrap">
      <div className="ticker-content">
        {[...items, ...items].map((tag, i) => (
          <span key={i}>
            {tag} &nbsp;&bull;&nbsp;
          </span>
        ))}
      </div>
    </div>
  );
}
