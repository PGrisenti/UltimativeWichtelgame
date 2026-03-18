export default function RevealBoard({
  results,
  podium,
}: {
  results: Array<{ gifter: string; receiver: string }>;
  podium: Array<{ username: string; score: number }>;
}) {
  return (
    <div className="grid grid-2">
      <div className="card">
        <h2>Auflösung der Wichtel</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Wichtel</th>
              <th>Beschenkte Person</th>
            </tr>
          </thead>
          <tbody>
            {results.map((row, index) => (
              <tr key={index}>
                <td>{row.gifter}</td>
                <td>{row.receiver}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="card">
        <h2>Podest</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Rang</th>
              <th>Spieler</th>
              <th>Punkte</th>
            </tr>
          </thead>
          <tbody>
            {podium.map((row, index) => (
              <tr key={row.username}>
                <td>{index + 1}</td>
                <td>{row.username}</td>
                <td>{row.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
