import React from 'react';

function ParticipantsResultTable({ participants, label, onResultChange, onToggleStatus }) {
  return (
    <table style={{marginBottom:'1.5rem', width:'100%'}}>
      <thead>
        <tr style={{background:'#e2e8f0', textAlign:'left'}}>
          <th style={{padding:'12px'}}>Couloir</th>
          <th style={{padding:'12px'}}>Athlète</th>
          <th style={{padding:'12px'}}>{label}</th>
          <th style={{padding:'12px', textAlign:'center'}}>Statut</th>
        </tr>
      </thead>
      <tbody>
        {participants.map((p) => (
          <tr key={p.id} style={{borderBottom:'1px solid #e2e8f0', background: p.statut==='DQ'?'#fee2e2':'white'}}>
            <td style={{padding:'12px', fontWeight:'bold'}}>{p.couloir}</td>
            <td style={{padding:'12px', textDecoration: p.statut==='DQ'?'line-through':''}}>{p.nom}</td>
            <td style={{padding:'12px'}}>
              <input
                type="text"
                value={p.resultat}
                onChange={(e) => onResultChange(p.id, e.target.value)}
                placeholder="0.00"
                style={{padding:'8px', width:'120px', fontWeight:'bold', borderRadius:'4px', border:'1px solid #cbd5e1'}}
                disabled={p.statut==='DQ'}
              />
            </td>
            <td style={{padding:'12px', textAlign:'center'}}>
              <button
                onClick={() => onToggleStatus(p.id)}
                style={{
                  padding:'6px 12px',
                  borderRadius:'6px',
                  cursor:'pointer',
                  fontWeight:'bold',
                  background: p.statut==='OK'?'#fff':'#ef4444',
                  color: p.statut==='OK'?'#334155':'white',
                  border: p.statut==='OK'?'1px solid #cbd5e1':'none',
                }}
              >
                {p.statut === 'OK' ? 'Disqualifier' : 'DQ (Disqualifié)'}
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default ParticipantsResultTable;
