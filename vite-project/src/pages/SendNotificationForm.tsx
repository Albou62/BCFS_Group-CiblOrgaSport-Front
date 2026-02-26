// pages/SendNotificationForm.tsx
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
      alert('Notification envoyée !');
    } catch (err: any) {
      alert(err.message);
    } finally {
      setSending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="panel" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <h3>Envoyer une notification</h3>
      <select 
        value={selectedGroup} 
        onChange={(e) => setSelectedGroup(e.target.value === '' ? '' : Number(e.target.value))} 
        required
      >
        <option value="">Choisir un groupe</option>
        {groups.map(g => (
          <option key={g.GroupID} value={g.GroupID}>{g.GroupName}</option>
        ))}
      </select>
      <input
        type="text"
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        placeholder="Message"
        required
      />
      <select value={impactLevel} onChange={(e) => setImpactLevel(e.target.value)}>
        <option value="low">Faible</option>
        <option value="medium">Moyen</option>
        <option value="high">Élevé</option>
      </select>
      <button type="submit" disabled={sending} className="btn-primary">
        {sending ? 'Envoi...' : 'Envoyer'}
      </button>
    </form>
  );
};