import { useCallback, useEffect, useState } from 'react';
import { listUsers, updateUserRole } from '../../../services/adminService';

export function useUsersAdmin(token) {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState(null);

  function mapUsersError(err) {
    if (err?.status === 401) return 'Session expirée. Reconnectez-vous.';
    if (err?.status === 403) return 'Accès interdit: rôle RESPONSABLE requis.';
    if (err?.status >= 500) return "Erreur serveur lors du chargement des utilisateurs.";
    return err?.message || 'Erreur inattendue.';
  }

  const loadUsers = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      const data = await listUsers(token);
      setUsers(data);
    } catch (e) {
      setUsers([]);
      setError(mapUsersError(e));
    }
  }, [token]);

  const changeRole = useCallback(
    async (userId, newRole) => {
      try {
        setError(null);
        await updateUserRole(token, userId, newRole);
        await loadUsers();
      } catch (e) {
        setError(mapUsersError(e));
      }
    },
    [loadUsers, token]
  );

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return { users, error, loadUsers, changeRole };
}
