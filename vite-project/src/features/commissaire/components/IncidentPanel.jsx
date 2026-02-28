import React from 'react';

function IncidentPanel({ onSuspend }) {
  return (
    <div style={{marginTop:'3rem', padding:'1.5rem', border:'2px solid #ef4444', borderRadius:'8px', background:'#fef2f2', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
      <div>
        <h3 style={{color:'#991b1b', marginTop:0, marginBottom:'0.5rem'}}>⚠️ Gestion de Crise & Incidents</h3>
        <p style={{fontSize:'0.9rem', color:'#7f1d1d', margin:0}}>En cas de force majeure (Météo, Incident technique, Sécurité).</p>
      </div>
      <div style={{display:'flex', gap:'10px'}}>
        <button style={{background:'#fff', color:'#dc2626', padding:'10px 20px', border:'2px solid #dc2626', borderRadius:'6px', cursor:'pointer', fontWeight:'bold', fontSize:'1rem'}} onClick={onSuspend}>
          ⛔ SUSPENDRE / ANNULER L'ÉPREUVE
        </button>
      </div>
    </div>
  );
}

export default IncidentPanel;
