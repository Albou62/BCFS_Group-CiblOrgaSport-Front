import { useCallback, useState, useEffect } from 'react';
import { listVolontaires, assignTask, listUsers } from '../../../services/userService'; 

export function useVolunteerAssignments(token) {
  const [volunteers, setVolunteers] = useState([]);

 const fetchVolunteers = useCallback(async () => {
  if (!token) return;
  try {
    const profiles = await listVolontaires(token); // Récupère les vrais profils avec tâches
    const allUsers = await listUsers(token);       // Récupère tous les comptes
    
    // On filtre les users pour n'avoir que les volontaires
    const volunteersOnly = allUsers.filter(u => u.role === 'VOLONTAIRE' || u.role === 'ROLE_VOLONTAIRE');

    // On fusionne : on prend le User, et si un profil existe, on ajoute ses tâches
    const merged = volunteersOnly.map(user => {
      const profile = profiles.find(p => p.authUserId === user.id || p.id === user.id);
      return {
        ...user,
        // On récupère la tâche si elle existe dans le profil
        assignment: profile?.tasks?.[0]?.title || profile?.currentTask || "Aucune",
        timeSlot: profile?.tasks?.[0]?.timeSlot || ""
      };
    });

    setVolunteers(merged);
  } catch (error) {
    console.error("Erreur fusion :", error);
  }
}, [token]);

  useEffect(() => {
    fetchVolunteers();
  }, [fetchVolunteers]);

 const assignVolunteer = useCallback(async (volunteer, taskName, timeSlot) => {
  if (!token) return;

  try {
    const payload = { 
      // Vérifie bien que ces noms correspondent aux .get("...") de ton AdminController
      volunteerId: volunteer.id, 
      username: volunteer.username,
      taskName: taskName, // La mission choisie
      timeSlot: timeSlot  // L'heure choisie via le nouveau champ
    };

    console.log("🚀 Envoi au serveur :", payload);
    await assignTask(token, payload);
    
    setVolunteers(prev => prev.map(v => 
  v.id === volunteer.id 
    ? { ...v, assignment: taskName, timeSlot: timeSlot } // On met à jour le champ "assignment"
    : v
));
    
    alert("✅ Mission assignée avec succès !");
  } catch (error) {
    console.error("❌ Erreur lors de l'assignation :", error);
    alert("Erreur serveur (500). Vérifie que tous les champs sont bien envoyés.");
  }
}, [token]);
  return { volunteers, assignVolunteer }; 
}