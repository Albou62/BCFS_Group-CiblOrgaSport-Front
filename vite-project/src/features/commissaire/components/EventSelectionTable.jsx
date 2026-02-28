import React from 'react';

function EventSelectionTable({ events, onSelect }) {
  return (
    <div className="panel">
      <h2 className="panel-title">Sélectionner une épreuve</h2>
      <table style={{marginTop:'1rem'}}>
        <thead>
          <tr style={{textAlign:'left', background:'#f8fafc', borderBottom:'2px solid #e2e8f0'}}>
            <th style={{padding:'12px'}}>Épreuve</th>
            <th style={{padding:'12px'}}>Compétition</th>
            <th style={{padding:'12px'}}>Action</th>
          </tr>
        </thead>
        <tbody>
          {events.map((e) => (
            <tr key={e.id} style={{borderBottom:'1px solid #eee'}}>
              <td style={{padding:'12px'}}><strong>{e.name}</strong></td>
              <td style={{padding:'12px'}}>{e.competitionName}</td>
              <td style={{padding:'12px'}}><button className="btn-secondary" onClick={() => onSelect(e)}>Gérer 👉</button></td>
            </tr>
          ))}
          {events.length===0 && <tr><td colSpan="3" style={{padding:'20px', textAlign:'center'}}>Chargement des épreuves...</td></tr>}
        </tbody>
      </table>
    </div>
  );
}

export default EventSelectionTable;
