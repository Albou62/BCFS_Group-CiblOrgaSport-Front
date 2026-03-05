
import React, { useState } from 'react';

export default function VolunteersTable({ volunteers, onAssign, loading }) {
  const [taskInputs, setTaskInputs] = useState({});

  if (loading) return <p className="text-center py-4">Chargement...</p>;

  return (
    <>
      <div className="panel">
        
        {volunteers.length === 0 ? (
          <p className="text-center py-8 text-gray-500">Aucun volontaire disponible</p>
        ) : (
          <div className="table-responsive">
            <table className="table">
              <thead>
                <tr>
                  <th>Volontaire</th>
                  <th>Statut</th>
                  <th>Tâche</th>
                  <th>Créneau</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                {volunteers.map((vol) => (
                  <tr key={vol.id}>
                    <td>
                      <strong>{vol.username}</strong>
                      <br />
                    </td>
                    <td>
                      <span className="status-badge bg-green-100 text-green-800 px-2 py-1 rounded text-sm">
                         Disponible
                      </span>
                    </td>
                    <td>
                      <input
                        type="text"
                        className="form-input"
                        placeholder="Ex: Accueil participants"
                        value={taskInputs[vol.id]?.taskName || ''}
                        onChange={(e) =>
                          setTaskInputs(prev => ({
                            ...prev,
                            [vol.id]: { ...prev[vol.id], taskName: e.target.value }
                          }))
                        }
                      />
                    </td>
                    <td>
                      <input
                        type="time"
                        className="form-input"
                        value={taskInputs[vol.id]?.timeSlot || ''}
                        onChange={(e) =>
                          setTaskInputs(prev => ({
                            ...prev,
                            [vol.id]: { ...prev[vol.id], timeSlot: e.target.value }
                          }))
                        }
                      />
                    </td>
                    <td>
                      <button
                        className="btn-primary"
                        onClick={() => {
                          const taskName = taskInputs[vol.id]?.taskName || '';
                          if (!taskName.trim()) return alert('Nom de tâche requis');
                          onAssign(vol.id, vol.username, taskName, taskInputs[vol.id]?.timeSlot || '');
                        }}
                      >
                        Assigner
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}


