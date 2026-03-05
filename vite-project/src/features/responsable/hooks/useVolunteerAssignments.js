// src/features/responsable/hooks/useVolunteerAssignments.js
import { useEffect, useState } from 'react';

export function useVolunteerAssignments(token) {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function fetchVolunteers() {
    if (!token) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('http://localhost:8080/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!res.ok) throw new Error('Erreur users');

      const allUsers = await res.json();
      const vols = (allUsers || []).filter((user) => user.role === 'VOLONTAIRE');
      setVolunteers(vols);
    } catch (err) {
      setError(err.message || 'Erreur de récupération des volontaires');
    } finally {
      setLoading(false);
    }
  }

  async function assignVolunteer(volunteerId, username, taskName, timeSlot) {
    if (!token) return;
    try {
      const res = await fetch('http://localhost:8080/api/admin/tasks/assign', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ volunteerId, username, taskName, timeSlot }),
      });
      if (!res.ok) throw new Error("Erreur lors de l'assignation");
      const task = await res.json();
      alert(`Tâche "${taskName}" assignée à ${username}`);
      await fetchVolunteers();
      return task;
    } catch (err) {
      alert(err.message || "Erreur assignation");
    }
  }

  useEffect(() => {
    fetchVolunteers();
  }, [token]);

  return { volunteers, assignVolunteer, loading, error };
}
