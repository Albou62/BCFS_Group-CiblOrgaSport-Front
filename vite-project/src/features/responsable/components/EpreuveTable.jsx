import React from 'react';

const formatDate = (dateString) => {
  if (!dateString) return '-';
  return new Date(dateString).toLocaleString('fr-FR', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  });
};

function EpreuveTable({ epreuves }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{textAlign:'left', borderBottom:'2px solid #eee'}}>
          <th style={{padding:'0.5rem'}}>Épreuve</th>
          <th style={{padding:'0.5rem'}}>Horaire Public</th>
          <th style={{padding:'0.5rem'}}>Horaire Athlètes</th>
        </tr>
      </thead>
      <tbody>
        {epreuves.length > 0 ? epreuves.map((e) => (
          <tr key={e.id} style={{borderBottom:'1px solid #f3f4f6'}}>
            <td style={{padding:'0.8rem', fontWeight:'bold'}}>{e.name}</td>
            <td>{formatDate(e.horairePublic)}</td>
            <td style={{color:'#666'}}>{formatDate(e.horaireAthletes)}</td>
          </tr>
        )) : (
          <tr><td colSpan="3" style={{padding:'1rem', textAlign:'center', fontStyle:'italic'}}>Aucune épreuve créée.</td></tr>
        )}
      </tbody>
    </table>
  );
}

export default EpreuveTable;
