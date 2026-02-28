import React from 'react';

function CompetitionTable({ competitions, onSelectCompetition }) {
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{textAlign:'left', borderBottom:'2px solid #eee'}}>
          <th style={{padding:'0.5rem'}}>Nom</th>
          <th style={{padding:'0.5rem'}}>Dates</th>
          <th style={{padding:'0.5rem'}}>Actions</th>
        </tr>
      </thead>
      <tbody>
        {competitions.map((c) => (
          <tr key={c.id} style={{borderBottom:'1px solid #f3f4f6'}}>
            <td style={{padding:'0.8rem', fontWeight:'600'}}>{c.name}</td>
            <td>Du {new Date(c.dateDebut).toLocaleDateString()} au {new Date(c.dateFin).toLocaleDateString()}</td>
            <td><button className="btn-secondary" onClick={() => onSelectCompetition(c)}>Gérer Épreuves 👉</button></td>
          </tr>
        ))}
        {competitions.length === 0 && <tr><td colSpan="3" style={{padding:'1rem', textAlign:'center'}}>Aucune compétition.</td></tr>}
      </tbody>
    </table>
  );
}

export default CompetitionTable;
