import { useCallback, useState } from 'react';

const DEFAULT_VOLUNTEERS = [
  { id: 1, name: 'Hector', role: 'VOLONTAIRE', assignment: 'Non assigné' },
  { id: 2, name: 'Jean', role: 'VOLONTAIRE', assignment: 'Non assigné' },
  { id: 3, name: 'Sophie', role: 'VOLONTAIRE', assignment: 'Non assigné' },
];

export function useVolunteerAssignments() {
  const [volunteers, setVolunteers] = useState(DEFAULT_VOLUNTEERS);

  const assignVolunteer = useCallback((id, task) => {
    setVolunteers((prev) => prev.map((v) => (v.id === id ? { ...v, assignment: task } : v)));
  }, []);

  return { volunteers, assignVolunteer };
}
