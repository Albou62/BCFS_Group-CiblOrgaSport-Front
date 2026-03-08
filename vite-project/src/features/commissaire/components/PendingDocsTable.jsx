import React from 'react';

function PendingDocsTable({ pendingDocs, onValidate, onReject }) {
  if (!pendingDocs || pendingDocs.length === 0) {
    return (
      <div style={{ padding: '20px', textAlign: 'center', color: '#666' }}>
        Aucun document en attente de validation.
      </div>
    );
  }

  return (
    <div style={{ width: '100%', overflowX: 'auto' }}>
      <table style={{ 
        width: '100%', 
        borderCollapse: 'collapse', 
        marginTop: '10px',
        fontSize: '0.9rem'
      }}>
        <thead>
          <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
            <th style={headerStyle}>Sportif</th>
            <th style={headerStyle}>Type</th>
            <th style={headerStyle}>Fichier</th>
            <th style={headerStyle}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {pendingDocs.map((doc) => (
            <tr key={doc.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
              <td style={cellStyle}>
                {doc.athleteName || doc.uploaderUsername}
              </td>
              <td style={cellStyle}>{doc.type}</td>
              <td style={cellStyle}>{doc.fileName}</td>
              <td style={cellStyle}>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <button 
                    onClick={() => onValidate(doc.id)} 
                    style={{ ...btnBase, backgroundColor: '#16a34a', color: 'white' }}
                  >
                    Valider
                  </button>
                  <button 
                    onClick={() => onReject(doc.id)} 
                    style={{ ...btnBase, backgroundColor: '#dc2626', color: 'white' }}
                  >
                    Refuser
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

const headerStyle = {
  textAlign: 'left',
  padding: '12px 15px',
  fontWeight: '600',
  color: '#475569'
};

const cellStyle = {
  padding: '12px 15px',
  textAlign: 'left',
  verticalAlign: 'middle'
};

const btnBase = {
  border: 'none',
  padding: '6px 12px',
  borderRadius: '4px',
  cursor: 'pointer',
  fontSize: '0.85rem',
  fontWeight: '500'
};

export default PendingDocsTable;