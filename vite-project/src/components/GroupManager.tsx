// src/components/GroupManager.tsx
import React, { useState } from 'react';
import { useGroups } from '../hooks/useNotifications';
import { createGroup } from '../services/notificationService';

interface GroupManagerProps {
  token: string;
}

export const GroupManager: React.FC<GroupManagerProps> = ({ token }) => {
  const { groups, loading, error, reload } = useGroups(token);
  const [newGroupName, setNewGroupName] = useState('');
  const [creating, setCreating] = useState(false);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGroupName.trim()) return;
    
    setCreating(true);
    try {
      await createGroup(token, newGroupName);
      setNewGroupName('');
      reload();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="panel">
      <h3>📋 Gestion des groupes de notification</h3>
      
      {error && (
        <div style={{ 
          background: '#fee2e2', 
          color: '#991b1b', 
          padding: '0.75rem', 
          borderRadius: '4px',
          marginBottom: '1rem'
        }}>
          {error}
        </div>
      )}
      
      <form onSubmit={handleCreate} style={{ 
        display: 'flex', 
        gap: '0.5rem', 
        marginBottom: '1.5rem' 
      }}>
        <input
          type="text"
          value={newGroupName}
          onChange={(e) => setNewGroupName(e.target.value)}
          placeholder="Nom du nouveau groupe"
          disabled={creating}
          style={{
            flex: 1,
            padding: '0.5rem',
            border: '1px solid #cbd5e1',
            borderRadius: '4px'
          }}
        />
        <button 
          type="submit" 
          disabled={creating || !newGroupName.trim()}
          className="btn-primary"
          style={{
            padding: '0.5rem 1rem',
            opacity: creating || !newGroupName.trim() ? 0.5 : 1
          }}
        >
          {creating ? 'Création...' : 'Créer'}
        </button>
      </form>
      
      {loading ? (
        <p>Chargement des groupes...</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {groups.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>
              Aucun groupe de notification créé
            </p>
          ) : (
            groups.map(g => (
              <div 
                key={g.GroupID}
                style={{
                  padding: '0.75rem',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '4px'
                }}
              >
                <strong>{g.GroupName}</strong>
                <span style={{ 
                  marginLeft: '0.5rem',
                  color: '#64748b',
                  fontSize: '0.8rem'
                }}>
                  (ID: {g.GroupID})
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};