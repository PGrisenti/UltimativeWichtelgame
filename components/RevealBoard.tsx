type RevealRow = {
  gifter: string;
  receiver: string;
};

type PodiumRow = {
  username: string;
  score: number;
};

type Props = {
  results: RevealRow[];
  podium: PodiumRow[];
};

export default function RevealBoard({ results, podium }: Props) {
  const topThree = podium.slice(0, 3);
  const rest = podium.slice(3);

  const first = topThree[0];
  const second = topThree[1];
  const third = topThree[2];

  return (
    <>
      <div className="card">
        <h2>Auflösung</h2>
        <table className="table">
          <thead>
            <tr>
              <th>Wichtel</th>
              <th>Beschenkte Person</th>
            </tr>
          </thead>
          <tbody>
            {results.length ? (
              results.map((row, index) => (
                <tr key={index}>
                  <td>{row.gifter}</td>
                  <td>{row.receiver}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={2}>Keine Auflösungsdaten vorhanden.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="card">
        <h2>Podest</h2>

        {podium.length ? (
          <>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr 1fr',
                gap: '16px',
                alignItems: 'end',
                marginTop: '20px',
              }}
            >
              <div
                style={{
                  textAlign: 'center',
                  background: '#f5f5f5',
                  borderRadius: '16px',
                  padding: '16px',
                  minHeight: '140px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                }}
              >
                {second ? (
                  <>
                    <div style={{ fontSize: '2rem' }}>🥈</div>
                    <div style={{ fontWeight: 700, marginTop: '8px' }}>{second.username}</div>
                    <div>{second.score} Punkte</div>
                    <div style={{ marginTop: '8px', fontSize: '0.95rem', opacity: 0.7 }}>2. Platz</div>
                  </>
                ) : (
                  <div style={{ opacity: 0.5 }}>—</div>
                )}
              </div>

              <div
                style={{
                  textAlign: 'center',
                  background: '#fff7d6',
                  borderRadius: '16px',
                  padding: '20px',
                  minHeight: '190px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  border: '2px solid #f2d15b',
                }}
              >
                {first ? (
                  <>
                    <div style={{ fontSize: '2.4rem' }}>🥇</div>
                    <div style={{ fontWeight: 800, marginTop: '10px', fontSize: '1.1rem' }}>{first.username}</div>
                    <div>{first.score} Punkte</div>
                    <div style={{ marginTop: '8px', fontSize: '0.95rem', opacity: 0.7 }}>1. Platz</div>
                  </>
                ) : (
                  <div style={{ opacity: 0.5 }}>—</div>
                )}
              </div>

              <div
                style={{
                  textAlign: 'center',
                  background: '#f7efe7',
                  borderRadius: '16px',
                  padding: '16px',
                  minHeight: '120px',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                }}
              >
                {third ? (
                  <>
                    <div style={{ fontSize: '2rem' }}>🥉</div>
                    <div style={{ fontWeight: 700, marginTop: '8px' }}>{third.username}</div>
                    <div>{third.score} Punkte</div>
                    <div style={{ marginTop: '8px', fontSize: '0.95rem', opacity: 0.7 }}>3. Platz</div>
                  </>
                ) : (
                  <div style={{ opacity: 0.5 }}>—</div>
                )}
              </div>
            </div>

            <div style={{ marginTop: '28px' }}>
              <h3>Gesamtrangliste</h3>
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
                    <tr key={`${row.username}-${index}`}>
                      <td>{index + 1}</td>
                      <td>{row.username}</td>
                      <td>{row.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Rang</th>
                <th>Spieler</th>
                <th>Punkte</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td colSpan={3}>Noch keine Ergebnisse vorhanden.</td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}