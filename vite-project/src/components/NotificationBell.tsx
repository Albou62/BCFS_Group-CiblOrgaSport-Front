// components/NotificationBell.tsx
import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';

interface NotificationBellProps {
  token: string;
  userId: number;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ token, userId }) => {
  const [open, setOpen] = useState(false);
  const { notifications, loading, reload } = useNotifications(token, userId);

  const unreadCount = notifications.length; // Supposons qu'on ajoute un champ "read"

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button className="icon-button" onClick={() => setOpen(!open)}>
        🔔 {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
      </button>
      {open && (
        <div style={{
          position: 'absolute',
          right: 0,
          top: '100%',
          width: '300px',
          background: 'white',
          border: '1px solid #ccc',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
          zIndex: 1000,
          maxHeight: '400px',
          overflowY: 'auto'
        }}>
          <div style={{ padding: '1rem', borderBottom: '1px solid #eee' }}>
            <strong>Notifications</strong>
            <button onClick={reload} style={{ float: 'right' }}>↻</button>
          </div>
          {loading ? (
            <div style={{ padding: '1rem' }}>Chargement...</div>
          ) : notifications.length === 0 ? (
            <div style={{ padding: '1rem', color: '#666' }}>Aucune notification</div>
          ) : (
            notifications.map(n => (
              <div key={n.ID} style={{ padding: '0.75rem', borderBottom: '1px solid #f0f0f0' }}>
                <div style={{ fontWeight: 'bold' }}>{n.Label}</div>
                <div style={{ fontSize: '0.85rem', color: '#666' }}>
                  {new Date(n.Date).toLocaleString()} - {n.Group}
                </div>
                <span style={{
                  background: n.ImpactLevel === 'high' ? '#ef4444' : n.ImpactLevel === 'medium' ? '#f59e0b' : '#3b82f6',
                  color: 'white',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '0.75rem'
                }}>
                  {n.ImpactLevel}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};