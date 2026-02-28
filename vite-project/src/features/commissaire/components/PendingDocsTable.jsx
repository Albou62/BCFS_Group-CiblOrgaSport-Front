import React from 'react';

function PendingDocsTable({ pendingDocs, onReject, onValidate, apiUrl }) {
  return (
    <div className="panel">
      <h2 className="panel-title">Validation des documents</h2>
      <p className="panel-subtitle">Cliquez sur le nom du fichier pour le visualiser.</p>

      {pendingDocs.length === 0 ? (
        <div style={{textAlign:'center', padding:'2rem', color:'#666', fontStyle:'italic'}}>✅ Aucun document en attente.</div>
      ) : (
        <table style={{marginTop:'1rem', borderCollapse:'collapse'}}>
          <thead>
            <tr style={{textAlign:'left', background:'#f8fafc', borderBottom:'2px solid #e2e8f0'}}>
              <th style={{padding:'12px'}}>Athlète</th>
              <th style={{padding:'12px'}}>Type Document</th>
              <th style={{padding:'12px'}}>Fichier</th>
              <th style={{padding:'12px', textAlign:'right'}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {pendingDocs.map((d) => (
              <tr key={d.id} style={{borderBottom:'1px solid #eee'}}>
                <td style={{padding:'12px', fontWeight:'bold'}}>{d.athlete}</td>
                <td style={{padding:'12px'}}><span className="badge-secondary">{d.type}</span></td>
                <td style={{padding:'12px'}}>
                  <a href={`${apiUrl}/uploads/${d.fileName}`} target="_blank" rel="noopener noreferrer" style={{color:'#2563eb', textDecoration:'none', fontWeight:'500'}}>
                    📄 {d.fileName}
                  </a>
                </td>
                <td style={{padding:'12px', textAlign:'right'}}>
                  <button onClick={() => onReject(d.id)} style={{marginRight:'8px', padding:'6px 12px', background:'#fee2e2', color:'#991b1b', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'600'}}>Refuser</button>
                  <button onClick={() => onValidate(d.id)} style={{padding:'6px 12px', background:'#dcfce7', color:'#166534', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'600'}}>Valider</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default PendingDocsTable;
