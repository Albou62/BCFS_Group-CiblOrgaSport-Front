// src/components/SendNotificationForm.tsx
import React, { useState } from 'react';
import { useGroups } from '../hooks/useNotifications';
import { sendNotification } from '../services/notificationService';

interface SendNotificationFormProps {
  token: string;
}

export const SendNotificationForm: React.FC<SendNotificationFormProps> = ({ token }) => {
  const { groups } = useGroups(token);
  const [selectedGroup, setSelectedGroup] = useState<number | ''>('');
  const [label, setLabel] = useState('');
  const [impactLevel, setImpactLevel] = useState('low');
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !label) return;
    
    setSending(true);
    try {
      await sendNotification(token, Number(selectedGroup), label, impactLevel);
      setLabel('');
      setSelectedGroup('');
      alert('✅ Notification envoyée avec succès !');
    } catch (err: any) {
      alert(`❌ Erreur: ${err.message}`);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="panel">
      <h3>📨 Envoyer une notification</h3>
      
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>
            Groupe destinataire *
          </label>
          <select 
            value={selectedGroup} 
            onChange={(e) => setSelectedGroup(e.target.value === '' ? '' : Number(e.target.value))} 
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #cbd5e1',
              borderRadius: '4px'
            }}
          >
            <option value="">Sélectionner un groupe</option>
            {groups.map(g => (
              <option key={g.GroupID} value={g.GroupID}>{g.GroupName}</option>
            ))}
          </select>
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>
            Message *
          </label>
          <input
            type="text"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            placeholder="Ex: Modification d'horaire, Incident, etc."
            required
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #cbd5e1',
              borderRadius: '4px'
            }}
          />
        </div>

        <div>
          <label style={{ display: 'block', marginBottom: '0.25rem', fontWeight: 500 }}>
            Niveau d'impact
          </label>
          <select 
            value={impactLevel} 
            onChange={(e) => setImpactLevel(e.target.value)}
            style={{
              width: '100%',
              padding: '0.5rem',
              border: '1px solid #cbd5e1',
              borderRadius: '4px'
            }}
          >
            <option value="low">🔵 Faible (Information)</option>
            <option value="medium">🟠 Moyen (Attention)</option>
            <option value="high">🔴 Élevé (Urgence)</option>
          </select>
        </div>

        <button 
          type="submit" 
          disabled={sending || !selectedGroup || !label}
          className="btn-primary"
          style={{
            padding: '0.75rem',
            fontSize: '1rem',
            opacity: sending || !selectedGroup || !label ? 0.5 : 1,
            marginTop: '0.5rem'
          }}
        >
          {sending ? 'Envoi en cours...' : 'Envoyer la notification'}
        </button>
      </form>

      <div style={{ 
        marginTop: '1rem', 
        padding: '0.75rem',
        background: '#f0f9ff',
        borderRadius: '4px',
        fontSize: '0.9rem',
        color: '#0369a1'
      }}>
        <strong>ℹ️ Info:</strong> Les notifications seront reçues par tous les utilisateurs abonnés à ce groupe.
      </div>
    </div>
  );
};