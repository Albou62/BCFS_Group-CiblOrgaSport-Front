function EpreuveTable({ epreuves = [], onSelectEpreuve }) {
  if (!epreuves.length) return <p style={{ padding: '20px', textAlign: 'center' }}>Aucune épreuve.</p>;

  return (
    <div style={{ overflowX: 'auto', background: 'white', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <th style={{ padding: '12px', textAlign: 'left', width: '40%' }}>Nom de l'épreuve</th>
            <th style={{ padding: '12px', textAlign: 'left', width: '35%' }}>Date & Heure</th>
            <th style={{ padding: '12px', textAlign: 'right', width: '25%' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {epreuves.map((ep) => (
            <tr key={ep.id} onClick={() => onSelectEpreuve(ep)}>
              <td style={{ padding: '12px', fontWeight: '500' }}>
                {ep.name || "⚠️ Nom manquant"}
              </td>

              <td style={{ padding: '12px', color: '#64748b' }}>
                {ep.horairePublic
                  ? new Date(ep.horairePublic).toLocaleString('fr-FR')
                  : "❌ Date non reçue"}
              </td>

              <td style={{ padding: '12px', textAlign: 'right' }}>
                <button className="btn-small">Détails</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default EpreuveTable;