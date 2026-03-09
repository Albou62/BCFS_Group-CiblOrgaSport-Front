import { useCallback, useState } from 'react';
import { listGroups, publishNotification } from '../../../services/notificationService.js';

export function useNotifications(token) {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const loadGroups = useCallback(async () => {
    if (!token) return;
    try {
      setLoading(true);
      setError('');
      const data = await listGroups({ token });
      setGroups(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(err.message || 'Erreur lors du chargement des groupes');
    } finally {
      setLoading(false);
    }
  }, [token]);

  const sendNotification = useCallback(
    async (payload) => {
      if (!token) return { success: false, error: 'Token manquant' };
      try {
        setError('');
        await publishNotification(payload, { token });
        return { success: true };
      } catch (err) {
        const msg = err.message || 'Erreur lors de l’envoi';
        setError(msg);
        return { success: false, error: msg };
      }
    },
    [token]
  );

  return {
    groups,
    loading,
    error,
    loadGroups,
    sendNotification,
  };
}
