import React from 'react';

function ArbitrageToolbar({ currentResultType, onResultTypeChange, onImportSensors }) {
  return (
    <div style={{display:'flex', flexWrap:'wrap', gap:'1rem', justifyContent:'space-between', alignItems:'center', background:'#f8fafc', padding:'1.5rem', borderRadius:'8px', marginBottom:'1.5rem', border:'1px solid #e2e8f0'}}>
      <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
        <label style={{fontWeight:'bold', color:'#334155'}}>Mode de Classement :</label>
        <select value={currentResultType} onChange={(e) => onResultTypeChange(e.target.value)} style={{padding:'8px', borderRadius:'6px', border:'1px solid #cbd5e1', fontSize:'1rem'}}>
          <option value="chrono">⏱️ Chrono </option>
          <option value="distance">📏 Distance </option>
          <option value="points">🏆 Points </option>
        </select>
      </div>
      <button className="btn-primary" onClick={onImportSensors} style={{background:'#0ea5e9', display:'flex', alignItems:'center', gap:'8px'}}>
        📡 Importer données Capteurs
      </button>
    </div>
  );
}

export default ArbitrageToolbar;
