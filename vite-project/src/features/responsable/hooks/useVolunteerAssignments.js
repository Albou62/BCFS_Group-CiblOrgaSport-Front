import { useEffect, useState, useCallback } from 'react';

export function useVolunteerAssignments(token) {
  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchVolunteers = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const resAuth = await fetch('http://localhost:8080/api/admin/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const authUsers = await resAuth.json();
      const onlyVols = authUsers.filter(u => u.role === 'VOLONTAIRE');

      const resTask = await fetch('http://localhost:8080/api/admin/volontaires', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const profiles = resTask.ok ? await resTask.json() : [];

      const merged = onlyVols.map(user => {
        const foundProfile = profiles.find(p => p.username === user.username);
        return {
          ...user,
          tasks: foundProfile ? foundProfile.tasks : [],
          id: user.id 
        };
      });

      setVolunteers(merged);
    } catch (err) {
      setError("Erreur de communication avec le serveur 8080");
    } finally {
      setLoading(false);
    }
  }, [token]);

  async function assignVolunteer(volunteerId, username, taskName, timeSlot) {
  try {
    const res = await fetch('http://localhost:8080/api/admin/tasks/assign', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ 
        volunteerId: volunteerId, 
        username: username, 
        taskName: taskName,       
        timeSlot: timeSlot 
      }),
    });

    if (!res.ok) {
      const errorData = await res.json();
      throw new Error(errorData.message || `Erreur ${res.status}`);
    }
    
    
      
      const newTask = await res.json();
      await fetchVolunteers(); 
      return { success: true, task: newTask };
    } catch (err) {
      alert(err.message);
      return { success: false };
    }
  }

  useEffect(() => { fetchVolunteers(); }, [fetchVolunteers]);

  return { volunteers, assignVolunteer, loading, error, refresh: fetchVolunteers };
}