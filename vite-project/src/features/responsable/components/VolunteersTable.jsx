import React, { useState } from 'react';

function VolunteersTable({ volunteers, onAssign }) {
  return (
    <div style={{ marginTop: '20px' }}>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ backgroundColor: '#f3f4f6', textAlign: 'left' }}>
            {/* 5 TITRES ICI */}
            <th style={styles.th}>Volontaire</th>
            <th style={styles.th}>Tâche Actuelle</th>
            <th style={styles.th}>Nouvelle Mission</th>
            <th style={styles.th}>Heure</th>
            <th style={styles.th}>Action</th>
          </tr>
        </thead>
        <tbody>
          {volunteers.map((v) => (
            <VolunteerRow key={v.id} volunteer={v} onAssign={onAssign} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

function VolunteerRow({ volunteer, onAssign }) {
  const [selectedTask, setSelectedTask] = useState("");
  const [selectedTime, setSelectedTime] = useState("08:00");

  return (
    <tr style={{ borderBottom: '1px solid #eee' }}>
      {/* COLONNE 1 : NOM */}
      <td style={styles.td}>{volunteer.username}</td>

      {/* COLONNE 2 : STATUT ACTUEL (Badge) */}
      <td style={styles.td}>
        <span style={{
          padding: '4px 8px',
          borderRadius: '4px',
          fontSize: '0.8rem',
          backgroundColor: volunteer.assignment ? '#dcfce7' : '#f3f4f6',
          color: volunteer.assignment ? '#166534' : '#6b7280'
        }}>
          {volunteer.assignment || "Non assigné"}
        </span>
      </td>

      {/* COLONNE 3 : SELECT MISSION */}
      <td style={styles.td}>
        <select 
          value={selectedTask} 
          onChange={(e) => setSelectedTask(e.target.value)}
          style={styles.input}
        >
          <option value="">-- Choisir --</option>
          <option value="Sécurité">Sécurité</option>
          <option value="Accueil">Accueil</option>
          <option value="Logistique">Logistique</option>
        </select>
      </td>

      {/* COLONNE 4 : INPUT HEURE */}
      <td style={styles.td}>
        <input 
          type="time" 
          value={selectedTime}
          onChange={(e) => setSelectedTime(e.target.value)}
          style={styles.input}
        />
      </td>

      {/* COLONNE 5 : BOUTON */}
      <td style={styles.td}>
        <button 
          onClick={() => onAssign(volunteer, selectedTask, selectedTime)}
          disabled={!selectedTask}
          style={{
            ...styles.btn,
            backgroundColor: !selectedTask ? '#ccc' : '#2563eb'
          }}
        >
          {volunteer.assignment ? "Modifier" : "Assigner"}
        </button>
      </td>
    </tr>
  );
}

// Petits styles pour garder le code propre
const styles = {
  th: { padding: '12px', borderBottom: '2px solid #ddd' },
  td: { padding: '12px' },
  input: { padding: '6px', borderRadius: '4px', border: '1px solid #ccc', width: '100%' },
  btn: { color: 'white', border: 'none', padding: '8px 12px', borderRadius: '4px', cursor: 'pointer' }
};

export default VolunteersTable;