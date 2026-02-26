// src/components/NotificationBell.tsx
import React, { useState } from 'react';
import { useNotifications } from '../hooks/useNotifications';

interface NotificationBellProps {
  token: string;
  userId: number;
}

export const NotificationBell: React.FC<NotificationBellProps> = ({ token, userId }) => {
  const [open, setOpen] = useState(false);
  const { notifications, loading, reload } = useNotifications(token, userId);

  const unreadCount = notifications.filter(n => !n.read).length;


  const getImpactColor = (impact: string) => {
    switch(impact) {
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      default: return '#3b82f6';
    }
  };

  return (
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button 
        className="icon-button" 
        onClick={() => setOpen(!open)}
        style={{
          background: 'none',
          border: 'none',
          fontSize: '1.2rem',
          cursor: 'pointer',
          position: 'relative',
          padding: '8px'
        }}
      >
        🔔
        {unreadCount > 0 && (
          <span style={{
            position: 'absolute',
            top: '0',
            right: '0',
            background: '#ef4444',
            color: 'white',
            borderRadius: '50%',
            padding: '2px 6px',
            fontSize: '0.7rem',
            minWidth: '18px',
            textAlign: 'center'
          }}>
            {unreadCount}
          </span>
        )}
      </button>
      
      {open && (
        <>
          {/* Overlay pour fermer en cliquant à l'extérieur */}
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              zIndex: 999
            }}
            onClick={() => setOpen(false)}
          />
          
          {/* Panneau de notifications */}
          <div style={{
            position: 'absolute',
            right: 0,
            top: '100%',
            width: '350px',
            background: 'white',
            border: '1px solid #e2e8f0',
            borderRadius: '8px',
            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
            zIndex: 1000,
            maxHeight: '500px',
            overflowY: 'auto',
            marginTop: '8px'
          }}>
            <div style={{ 
              padding: '1rem', 
              borderBottom: '1px solid #e2e8f0',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              background: '#f8fafc',
              borderRadius: '8px 8px 0 0'
            }}>
              <strong>Notifications</strong>
              <button 
                onClick={reload} 
                style={{ 
                  background: 'none', 
                  border: 'none', 
                  cursor: 'pointer',
                  fontSize: '1rem'
                }}
              >
                ↻
              </button>
            </div>
            
            {loading ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                Chargement...
              </div>
            ) : notifications.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>
                Aucune notification
              </div>
            ) : (
              notifications.map(n => (
                <div 
                  key={n.ID}
                  style={{ 
                    padding: '1rem', 
                    borderBottom: '1px solid #f0f0f0',
                    cursor: 'pointer',
                    backgroundColor: n.read ? 'white' : '#f0f9ff',
                    transition: 'background-color 0.2s'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8fafc'}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = n.read ? 'white' : '#f0f9ff'}
                >
                  <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>{n.Label}</div>
                  <div style={{ fontSize: '0.8rem', color: '#666', marginBottom: '8px' }}>
                    {new Date(n.Date).toLocaleString()} • {n.Group}
                  </div>
                  <span style={{
                    background: getImpactColor(n.ImpactLevel),
                    color: 'white',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.7rem',
                    fontWeight: 'bold',
                    display: 'inline-block'
                  }}>
                    {n.ImpactLevel === 'high' ? 'Élevé' : n.ImpactLevel === 'medium' ? 'Moyen' : 'Faible'}
                  </span>
                </div>
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};