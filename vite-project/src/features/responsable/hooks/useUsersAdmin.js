import { useCallback, useEffect, useState } from 'react';
import { listUsers, updateUserRole } from '../../../services/adminService';

export function useUsersAdmin(token) {
  const [users, setUsers] = useState([]);

  const loadUsers = useCallback(async () => {
    if (!token) return;
    try {
      const data = await listUsers(token);
      setUsers(data);
    } catch (e) {
      console.error(e);
      setUsers([]);
    }
  }, [token]);

  const changeRole = useCallback(
    async (userId, newRole) => {
      try {
        await updateUserRole(token, userId, newRole);
        await loadUsers();
      } catch (e) {
        console.error(e);
      }
    },
    [loadUsers, token]
  );

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  return { users, loadUsers, changeRole };
}
