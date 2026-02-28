import React, { useState } from 'react';

function CompetitionForm({ onSubmit }) {
  const [name, setName] = useState('');
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    await onSubmit({ name, dateDebut, dateFin });
    setName('');
    setDateDebut('');
    setDateFin('');
  };

  return (
    <div style={{ background: '#f9fafb', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', border:'1px solid #e5e7eb' }}>
      <h3 style={{ fontSize: '1rem', marginBottom: '0.5rem' }}>Nouvelle compétition</h3>
      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr auto', gap: '0.5rem', alignItems: 'end' }}>
        <div>
          <label style={{fontSize:'0.8rem'}}>Nom</label>
          <input type="text" value={name} onChange={(e)=>setName(e.target.value)} required placeholder="Ex: Natation 2026" style={{width:'100%', padding:'0.5rem'}} />
        </div>
        <div>
          <label style={{fontSize:'0.8rem'}}>Début</label>
          <input type="date" value={dateDebut} onChange={(e)=>setDateDebut(e.target.value)} required style={{width:'100%', padding:'0.5rem'}} />
        </div>
        <div>
          <label style={{fontSize:'0.8rem'}}>Fin</label>
          <input type="date" value={dateFin} onChange={(e)=>setDateFin(e.target.value)} required style={{width:'100%', padding:'0.5rem'}} />
        </div>
        <button className="btn-primary" type="submit">Créer</button>
      </form>
    </div>
  );
}

export default CompetitionForm;
