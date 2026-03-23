import React, { useState } from 'react';

function EpreuveForm({ onSubmit }) {
  const [epreuveName, setEpreuveName] = useState('');
  const [horairePublic, setHorairePublic] = useState('');
  const [horaireAthletes, setHoraireAthletes] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();


    await onSubmit({
      name: epreuveName,
      horairePublic: horairePublic,
      horaireAthletes: horairePublic
    });

    // Reset du formulaire
    setEpreuveName('');
    setHorairePublic('');
  };

  return (
    <form onSubmit={handleSubmit} style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '12px',
      padding: '15px',
      background: '#fff',
      borderRadius: '8px',
      border: '1px solid #e2e8f0'
    }}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Nom de l'épreuve</label>
        <input
          type="text"
          placeholder="Ex: Demi-finale 100m"
          value={epreuveName}
          onChange={(e) => setEpreuveName(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          required
        />
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <label style={{ fontSize: '0.85rem', fontWeight: '600' }}>Date et Heure</label>
        <input
          type="datetime-local"
          value={horairePublic}
          onChange={(e) => setHorairePublic(e.target.value)}
          style={{ padding: '8px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
          required
        />
      </div>

      <button type="submit" className="btn-primary" style={{ marginTop: '8px' }}>
        ➕ Créer l'épreuve
      </button>
    </form>
  );
}

export default EpreuveForm;