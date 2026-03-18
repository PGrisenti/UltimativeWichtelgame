export default function MyAssignmentCard({
  visible,
  recipientName,
}: {
  visible: boolean;
  recipientName: string | null;
}) {
  return (
    <div className="card">
      <h2>Mein Wichtel</h2>
      {visible ? (
        <p><strong>Du wichtelst für: {recipientName ?? '—'}</strong></p>
      ) : (
        <p>Deine Zuteilung wird sichtbar, sobald der Host die Auslosung startet.</p>
      )}
    </div>
  );
}
