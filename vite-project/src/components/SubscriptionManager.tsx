// src/components/SubscriptionManager.tsx
import React from 'react';
import { useGroups, useSubscriptions } from '../hooks/useNotifications';

interface SubscriptionManagerProps {
  token: string;
  userId: number;
}

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ token, userId }) => {
  const { groups, loading: groupsLoading } = useGroups(token);
  const { subscriptions, subscribe, unsubscribe, loading: subsLoading } = useSubscriptions(token, userId);

  const isSubscribed = (groupId: number) => {
    return subscriptions.some(s => s.GroupID === groupId);
  };

  if (groupsLoading || subsLoading) {
    return <div>Chargement des abonnements...</div>;
  }

  return (
    <div className="subscription-manager">
      <h3>🔔 Mes abonnements aux notifications</h3>
      <p style={{ fontSize: '0.9rem', color: '#666', marginBottom: '1rem' }}>
        Abonnez-vous aux groupes pour recevoir des notifications
      </p>
      
      {groups.length === 0 ? (
        <p>Aucun groupe de notification disponible</p>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {groups.map(group => (
            <div 
              key={group.GroupID} 
              style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                padding: '0.75rem',
                background: '#f8fafc',
                borderRadius: '8px',
                border: '1px solid #e2e8f0'
              }}
            >
              <div>
                <strong>{group.GroupName}</strong>
                {isSubscribed(group.GroupID) && (
                  <span style={{ 
                    marginLeft: '0.5rem',
                    background: '#dcfce7',
                    color: '#166534',
                    padding: '2px 8px',
                    borderRadius: '12px',
                    fontSize: '0.75rem',
                    fontWeight: 'bold'
                  }}>
                    Abonné
                  </span>
                )}
              </div>
              
              {isSubscribed(group.GroupID) ? (
                <button 
                  onClick={() => unsubscribe(group.GroupID)}
                  className="btn-secondary"
                  style={{ padding: '4px 12px' }}
                >
                  Se désabonner
                </button>
              ) : (
                <button 
                  onClick={() => subscribe(group.GroupID)}
                  className="btn-primary"
                  style={{ padding: '4px 12px' }}
                >
                  S'abonner
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};