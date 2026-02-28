import React, { useState } from 'react';

function EpreuveForm({ onSubmit }) {
  const [epreuveName, setEpreuveName] = useState('');
  const [horairePublic, setHorairePublic] = useState('');
  const [horaireAthletes, setHoraireAthletes] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({ name: epreuveName, horairePublic, horaireAthletes });
    setEpreuveName('');
    setHorairePublic('');
    setHoraireAthletes('');
  };

  return (
    <div style={{ background: '#eff6ff', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border:'1px solid #bfdbfe' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem', color:'#1e40af' }}>Ajouter une épreuve</h3>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'end' }}>
        <div>
          <label style={{fontSize:'0.8rem'}}>Nom Épreuve</label>
          <input type="text" value={epreuveName} onChange={(e)=>setEpreuveName(e.target.value)} required placeholder="Ex: Finale 100m NL" style={{width:'100%', padding:'0.5rem'}} />
        </div>
        <div>
          <label style={{fontSize:'0.8rem'}}>Horaire Public</label>
          <input type="datetime-local" value={horairePublic} onChange={(e)=>setHorairePublic(e.target.value)} required style={{width:'100%', padding:'0.5rem'}} />
        </div>
        <div>
          <label style={{fontSize:'0.8rem'}}>Horaire Athlètes</label>
          <input type="datetime-local" value={horaireAthletes} onChange={(e)=>setHoraireAthletes(e.target.value)} required style={{width:'100%', padding:'0.5rem'}} />
        </div>
        <button className="btn-primary" type="submit">Ajouter</button>
      </form>
    </div>
  );
}

export default EpreuveForm;
