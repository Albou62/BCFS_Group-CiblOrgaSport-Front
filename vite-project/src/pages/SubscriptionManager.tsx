// components/SubscriptionManager.tsx
import React from 'react';
import { useGroups, useSubscriptions } from '../hooks/useNotifications';

interface SubscriptionManagerProps {
  token: string;
  userId: number;
}

export const SubscriptionManager: React.FC<SubscriptionManagerProps> = ({ token, userId }) => {
  const { groups } = useGroups(token);
  const { subscriptions, subscribe, unsubscribe } = useSubscriptions(token, userId);

  const isSubscribed = (groupId: number) => subscriptions.some(s => s.GroupID === groupId);

  return (
    <div className="panel">
      <h3>Mes abonnements</h3>
      {groups.map(group => (
        <div key={group.GroupID} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
          <span>{group.GroupName}</span>
          {isSubscribed(group.GroupID) ? (
            <button onClick={() => unsubscribe(group.GroupID)} className="btn-secondary">Se désabonner</button>
          ) : (
            <button onClick={() => subscribe(group.GroupID)} className="btn-primary">S'abonner</button>
          )}
        </div>
      ))}
    </div>
  );
};