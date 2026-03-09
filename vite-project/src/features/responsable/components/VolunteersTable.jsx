import React, { useState } from 'react';

/**
 * Composant VolunteersTable
 * Affiche la liste des volontaires (Persona: Hector) et permet au 
 * responsable (Persona: Marius) d'assigner ou réassigner des tâches.
 */
export default function VolunteersTable({ volunteers, onAssign, loading }) {
  // État local pour gérer les saisies de texte par volontaire (ID comme clé)
  const [taskInputs, setTaskInputs] = useState({});

  if (loading) return <p className="text-center py-4">Chargement des équipes terrain...</p>;

  return (
    <div className="table-responsive">
      <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead>
          <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
            <th style={{ padding: '12px' }}>Volontaire</th>
            <th style={{ padding: '12px' }}>Statut</th>
            <th style={{ padding: '12px' }}>Mission Actuelle / Nouvelle</th>
            <th style={{ padding: '12px' }}>Créneau Horaire</th>
            <th style={{ padding: '12px' }}>Action</th>
          </tr>
        </thead>
        <tbody>
          {volunteers.map((vol) => {
            // Récupération de la dernière tâche pour déterminer l'état
            const tasks = vol.tasks || [];
            const hasTask = tasks.length > 0;
            const currentTask = hasTask ? tasks[tasks.length - 1] : null;

            // Définition visuelle du badge selon le cycle de vie de la tâche
            const getStatusBadge = () => {
              if (!currentTask) {
                return { label: 'Disponible', bg: '#dcfce7', color: '#166534', border: '#bbf7d0' };
              }
              switch (currentTask.status) {
                case 'Terminé':
                  return { label: 'Terminé', bg: '#f3f4f6', color: '#374151', border: '#e5e7eb' };
                case 'En cours':
                  return { label: 'En cours', bg: '#dbeafe', color: '#1e40af', border: '#bfdbfe' };
                default: // 'À venir' ou par défaut
                  return { label: 'À venir', bg: '#ffedd5', color: '#9a3412', border: '#fed7aa' };
              }
            };

            const badge = getStatusBadge();

            return (
              <tr key={vol.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                {/* 1. Identité du volontaire */}
                <td style={{ padding: '12px' }}>
                  <strong>{vol.username}</strong>
                  <div style={{ fontSize: '10px', color: '#94a3b8' }}>ID: {vol.id}</div>
                </td>

                {/* 2. Badge de statut dynamique */}
                <td style={{ padding: '12px' }}>
                  <span style={{
                    backgroundColor: badge.bg,
                    color: badge.color,
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: 'bold',
                    border: `1px solid ${badge.border}`,
                    whiteSpace: 'nowrap'
                  }}>
                    ● {badge.label}
                  </span>
                </td>

                {/* 3. Gestion de la mission (Affichage du "En cours" + Input) */}
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {hasTask && currentTask.status !== 'Terminé' && (
                      <div style={{ 
                        fontSize: '11px', 
                        color: '#475569', 
                        backgroundColor: '#f8fafc', 
                        padding: '6px', 
                        borderRadius: '4px',
                        borderLeft: '3px solid #3b82f6',
                        lineHeight: '1.2'
                      }}>
                        Actuel : <strong>{currentTask.title}</strong>
                      </div>
                    )}
                    <input
                      type="text"
                      className="form-input"
                      placeholder={hasTask ? "Modifier la mission..." : "Titre (ex: Accueil)"}
                      style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                      value={taskInputs[vol.id]?.taskName || ''}
                      onChange={(e) => setTaskInputs(prev => ({
                        ...prev,
                        [vol.id]: { ...prev[vol.id], taskName: e.target.value }
                      }))}
                    />
                  </div>
                </td>

                {/* 4. Créneau horaire (Visualisation + Saisie) */}
                <td style={{ padding: '12px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {hasTask && (
                      <span style={{ fontSize: '11px', color: '#64748b' }}>
                        Prévu : {currentTask.timeSlot || 'Non défini'}
                      </span>
                    )}
                    <input
                      type="text"
                      className="form-input"
                      placeholder="ex: 08h-12h"
                      style={{ width: '100%', padding: '6px', borderRadius: '4px', border: '1px solid #cbd5e1' }}
                      value={taskInputs[vol.id]?.timeSlot || ''}
                      onChange={(e) => setTaskInputs(prev => ({
                        ...prev,
                        [vol.id]: { ...prev[vol.id], timeSlot: e.target.value }
                      }))}
                    />
                  </div>
                </td>

                {/* 5. Bouton d'action pour le responsable */}
                <td style={{ padding: '12px' }}>
                  <button
                    className={hasTask && currentTask.status !== 'Terminé' ? "btn-secondary" : "btn-primary"}
                    style={{ 
                      width: '110px', 
                      padding: '8px', 
                      cursor: 'pointer',
                      borderRadius: '6px',
                      fontWeight: '600',
                      transition: 'all 0.2s'
                    }}
                    onClick={async () => {
                      const tName = taskInputs[vol.id]?.taskName || '';
                      const tSlot = taskInputs[vol.id]?.timeSlot || '';
                      
                      if (!tName.trim()) return alert('Veuillez saisir un intitulé de mission.');
                      
                      const result = await onAssign(vol.id, vol.username, tName, tSlot);
                      
                      if(result?.success) {
                        // Reset de l'input local après succès
                        setTaskInputs(prev => ({ 
                          ...prev, 
                          [vol.id]: { taskName: '', timeSlot: '' } 
                        }));
                      }
                    }}
                  >
                    {hasTask && currentTask.status !== 'Terminé' ? 'Réassigner' : 'Assigner'}
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}