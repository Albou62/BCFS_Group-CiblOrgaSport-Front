import React from 'react';

function UsersTable({ users, onChangeRole }) {
  return (
    <table style={{ width: '100%', fontSize: '0.9rem', borderCollapse: 'collapse', marginTop:'1rem' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid #e5e7eb', textAlign: 'left' }}>
          <th style={{padding:'0.5rem'}}>Login</th>
          <th style={{padding:'0.5rem'}}>Rôle Actuel</th>
          <th style={{padding:'0.5rem'}}>Modifier Rôle</th>
        </tr>
      </thead>
      <tbody>
        {users.map((u) => (
          <tr key={u.id} style={{borderBottom:'1px solid #f3f4f6'}}>
            <td style={{padding:'0.8rem', fontWeight:'bold'}}>{u.username}</td>
            <td><span className="badge-secondary">{u.role}</span></td>
            <td>
              <select value={u.role} onChange={(e) => onChangeRole(u.id, e.target.value)} style={{padding:'0.3rem', borderRadius:'4px', border:'1px solid #ddd'}}>
                <option value="SPECTATEUR">SPECTATEUR</option>
                <option value="SPORTIF">SPORTIF</option>
                <option value="COMMISSAIRE">COMMISSAIRE</option>
                <option value="RESPONSABLE">RESPONSABLE</option>
                <option value="VOLONTAIRE">VOLONTAIRE</option>
              </select>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

export default UsersTable;
