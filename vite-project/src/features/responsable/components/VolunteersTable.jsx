import React from 'react';

function VolunteersTable({ volunteers, onAssign }) {
  return (
    <table style={{width:'100%', marginTop:'1rem', borderCollapse:'collapse'}}>
      <thead>
        <tr style={{textAlign:'left', borderBottom:'1px solid #ddd'}}>
          <th style={{padding:'0.5rem'}}>Volontaire</th>
          <th style={{padding:'0.5rem'}}>Tâche Actuelle</th>
          <th style={{padding:'0.5rem'}}>Nouvelle Assignation</th>
        </tr>
      </thead>
      <tbody>
        {volunteers.map((v) => (
          <tr key={v.id} style={{borderBottom:'1px solid #f9f9f9'}}>
            <td style={{padding:'0.8rem', fontWeight:'bold'}}>{v.name}</td>
            <td style={{color: v.assignment === 'Non assigné' ? '#999' : '#16a34a', fontWeight:'500'}}>{v.assignment}</td>
            <td>
              <select onChange={(e) => onAssign(v.id, e.target.value)} style={{padding:'0.4rem', width:'100%', maxWidth:'200px', border:'1px solid #ccc', borderRadius:'4px'}}>
                <option value="Non assigné">-- Choisir --</option>
                <option value="Accueil Public - Zone A">Accueil Public - Zone A</option>
                <option value="Contrôle Billets - Entrée Sud">Contrôle Billets - Entrée Sud</option>
                <option value="Sécurité - Bassin">Sécurité - Bassin</option>
                <option value="Logistique - Matériel">Logistique - Matériel</option>
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default VolunteersTable;
