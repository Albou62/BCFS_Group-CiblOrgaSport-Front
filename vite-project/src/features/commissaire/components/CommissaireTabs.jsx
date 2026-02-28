import React from 'react';

function CommissaireTabs({ view, onChange, pendingDocsCount }) {
  return (
    <div className="panel" style={{marginBottom:'1rem', display:'flex', gap:'10px', padding:'1rem'}}>
      <button className={`btn-secondary ${view==='epreuves'?'btn-primary':''}`} onClick={() => onChange('epreuves')}>⏱️ Gestion Épreuves</button>
      <button className={`btn-secondary ${view==='admin'?'btn-primary':''}`} onClick={() => onChange('admin')}>
        🗂️ Administratif
        {pendingDocsCount > 0 && <span className="badge-warning" style={{marginLeft:'5px'}}>{pendingDocsCount}</span>}
      </button>
    </div>
  );
}

export default CommissaireTabs;
