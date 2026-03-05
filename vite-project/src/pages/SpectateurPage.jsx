import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { useAuth } from '../context/AuthContext.jsx';
import {
  consumeNotifications,
  listGroups,
  listSubscriptionsByUser,
  subscribeToGroup,
  unsubscribeFromGroup,
} from '../services/notificationService';
import {
  getMyTickets,
  addTicket as addTicketApi,
} from '../services/userService';

const POLL_INTERVAL_MS = 45000;

const defaultIcon = L.icon({
  iconUrl: icon,
  shadowUrl: iconShadow,
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = defaultIcon;

function SpectateurPage() {
  const { token, user, logout } = useAuth();

  // États généraux
  const [hello, setHello] = useState('');
  const [tickets, setTickets] = useState([]);
  const [newTicketCode, setNewTicketCode] = useState('');
  const [newTicketFile, setNewTicketFile] = useState(null);

  // Notifications SIMPLIFIÉES
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState(new Set());
  const [notifMessages, setNotifMessages] = useState([]);
  const [notifError, setNotifError] = useState(null);
  const [notifLoading, setNotifLoading] = useState(false);

  // Programme
  const [epreuves, setEpreuves] = useState([]);
  const [programLoading, setProgramLoading] = useState(true);

  const userId = user?.id;

  // ============ BILLETS ============
  useEffect(() => {
    if (!token) return;
    getMyTickets(token)
      .then((data) => setTickets(Array.isArray(data) ? data : []))
      .catch((err) => console.error('Erreur billets:', err));
  }, [token]);

  // ============ PROGRAMME ============
  useEffect(() => {
    if (!token) {
      setProgramLoading(false);
      return;
    }
    setProgramLoading(true);
    fetch('http://localhost:8080/api/public/upcoming-epreuves?limit=10')
      .then((res) => res.json())
      .then((data) => {
        setEpreuves(Array.isArray(data) ? data : []);
        setProgramLoading(false);
      })
      .catch((err) => {
        console.error('Erreur épreuves:', err);
        setProgramLoading(false);
      });
  }, [token]);

  const events = useMemo(() => {
    return [...(epreuves || [])].sort((a, b) =>
      new Date(a.horairePublic) - new Date(b.horairePublic)
    );
  }, [epreuves]);

  // ============ NOTIFICATIONS SIMPLIFIÉES ✅ ============
  const refreshNotifications = useCallback(async () => {
  if (!token || !userId) return;
  
  try {
    const messages = await consumeNotifications(userId, { token });
    
    if (messages?.length > 0) {
      setNotifMessages(prev => {
        // Crée un Set des messages déjà vus
        const seen = new Set(prev.map(msg => 
          typeof msg === 'string' ? msg : JSON.stringify(msg)
        ));
        
        // Filtre UNIQUEMENT les nouveaux
        const newOnly = messages.filter(msg => {
          const msgStr = typeof msg === 'string' ? msg : JSON.stringify(msg);
          return !seen.has(msgStr);
        });
        
        // Ajoute seulement les nouveaux en haut
        if (newOnly.length > 0) {
          return [...newOnly, ...prev.slice(0, 19)];
        }
        return prev;
      });
    }
  } catch (error) {
    console.error('Notifications:', error);
  }
}, [token, userId]);


  const loadSubscriptions = useCallback(async () => {
    if (!token || !userId) return;
    setNotifLoading(true);
    setNotifError(null);
    try {
      const [groupsData, subscriptionsData] = await Promise.all([
        listGroups({ token }),
        listSubscriptionsByUser(userId, { token }),
      ]);
      setGroups(groupsData);
      setSelectedGroupIds(new Set(subscriptionsData.map((item) => item.groupId)));
    } catch (error) {
      setNotifError(error?.message || 'Erreur notifications.');
    } finally {
      setNotifLoading(false);
    }
  }, [token, userId]);

  // Polling notifications - Backend gère les doublons
  useEffect(() => {
    if (!token || !userId) return;
    
    refreshNotifications(); // Load initial
    const intervalId = setInterval(refreshNotifications, POLL_INTERVAL_MS);
    
    return () => clearInterval(intervalId);
  }, [token, userId, refreshNotifications]);

  // Hello
  useEffect(() => {
    setHello('Prêt pour l\'événement ?');
  }, []);

  // Load subscriptions on panel open
  useEffect(() => {
    if (showNotifPanel) loadSubscriptions();
  }, [showNotifPanel, loadSubscriptions]);

  const handleSubscriptionToggle = async (groupId, checked) => {
    if (!token || !userId) return;
    try {
      if (checked) {
        await subscribeToGroup(userId, groupId, { token });
      } else {
        await unsubscribeFromGroup(userId, groupId, { token });
      }
      setSelectedGroupIds((prev) => {
        const next = new Set(prev);
        if (checked) next.add(String(groupId));
        else next.delete(String(groupId));
        return next;
      });
    } catch (error) {
      setNotifError(error?.message || 'Erreur abonnement.');
    }
  };

  // ============ ACTIONS ============
  const handleFileChange = (e) => {
    if (e.target.files) setNewTicketFile(e.target.files[0]);
  };

  const addTicket = async (e) => {
    e.preventDefault();
    if (!newTicketCode) return;

    try {
      const ticketData = {
        code: newTicketCode,
        fileName: newTicketFile?.name || 'ticket.pdf',
      };
      const savedTicket = await addTicketApi(token, ticketData);
      setTickets((prev) => [...prev, savedTicket]);
      setNewTicketCode('');
      setNewTicketFile(null);
      e.target.reset();
      alert('✅ Billet ajouté !');
    } catch (err) {
      console.error('Erreur billet:', err);
      alert('❌ Erreur ajout billet');
    }
  };

  const handleItinerary = (site) => alert(`Itinéraire vers : ${site}`);

  return (
    <div className="app-container">
      <div className="spectator-shell">
        {/* Header */}
        <div className="spectator-header">
          <div className="spectator-header-left">
            <h1>🎟️ Espace Spectateur</h1>
            <p>{hello}</p>
          </div>
          <div className="spectator-header-right">
            {user?.username && <span>{user.username}</span>}
            <button className="icon-button" onClick={() => setShowNotifPanel(true)}>
              🔔
            </button>
            <button className="btn-secondary" onClick={logout}>
              Déconnexion
            </button>
          </div>
        </div>

        {/* Main content */}
        <div className="spectator-main">
          {/* Colonne gauche : Carte + Programme */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Carte */}
            <div className="panel" style={{ padding: 0, overflow: 'hidden' }}>
              <div style={{ padding: '1rem', display: 'flex', justifyContent: 'space-between' }}>
                <h2 className="panel-title">📍 Carte & Fan Zones</h2>
                <button className="btn-secondary" onClick={() => alert('Position partagée !')}>
                  📡 Partager position
                </button>
              </div>
              <div style={{ height: '350px' }}>
                <MapContainer center={[48.88, 2.34]} zoom={11} style={{ height: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[48.9244, 2.3600]}>
                    <Popup>
                      <b>Centre Aquatique</b>
                      <br />
                      <button onClick={() => handleItinerary('Piscine')}>Y aller</button>
                    </Popup>
                  </Marker>
                  <Marker position={[48.8584, 2.2945]}>
                    <Popup>
                      <b>Fan Zone Tour Eiffel</b>
                      <br />
                      <button onClick={() => handleItinerary('FanZone')}>Y aller</button>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>

            {/* Programme */}
            <div className="panel">
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <h2 className="panel-title">📅 Programme</h2>
                <button onClick={() => window.location.reload()}>🔄</button>
              </div>
              
              {programLoading ? (
                <p style={{ padding: '2rem', textAlign: 'center' }}>🔄 Chargement...</p>
              ) : events.length === 0 ? (
                <p style={{ padding: '2rem', textAlign: 'center', color: '#999' }}>
                  Aucune épreuve disponible
                </p>
              ) : (
                <ul style={{ listStyle: 'none', padding: 0 }}>
                  {events.map((e) => (
                    <li
                      key={e.id}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        padding: '12px 16px',
                        margin: '0 -16px',
                        borderBottom: '1px solid #f0f0f0',
                      }}
                    >
                      <div>
                        <div style={{ fontWeight: '600', marginBottom: '4px' }}>
                          🏊 {e.name || 'Épreuve'}
                        </div>
                        <div style={{ fontSize: '0.85rem', color: '#666' }}>
                          🏆 {e.competitionName || e.competition?.name || 'Compétition'}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontWeight: '600', fontSize: '1.1rem' }}>
                          {e.horairePublic
                            ? new Date(e.horairePublic).toLocaleTimeString('fr-FR', {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : '---'}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: '#999' }}>
                          {e.horairePublic
                            ? new Date(e.horairePublic).toLocaleDateString('fr-FR')
                            : ''}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Colonne droite : Billets */}
          <div className="panel">
            <h2 className="panel-title">🎟️ Mes Billets</h2>
            <form
              onSubmit={addTicket}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '0.5rem',
                marginBottom: '1rem',
              }}
            >
              <input
                type="text"
                placeholder="Référence du billet"
                value={newTicketCode}
                onChange={(e) => setNewTicketCode(e.target.value)}
                style={{
                  padding: '0.75rem',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  fontSize: '0.95rem',
                }}
                required
              />
              <input type="file" onChange={handleFileChange} accept=".pdf,.jpg,.png" />
              <button className="btn-primary" type="submit">
                ➕ Ajouter au compte
              </button>
            </form>

            {tickets.length === 0 ? (
              <p style={{ color: '#6b7280', fontStyle: 'italic', textAlign: 'center', padding: '2rem' }}>
                Aucun billet enregistré
              </p>
            ) : (
              tickets.map((t) => (
                <div
                  key={t.id}
                  style={{
                    background: '#f0fdf4',
                    padding: '0.75rem',
                    border: '1px solid #bbf7d0',
                    borderRadius: '8px',
                    marginBottom: '0.5rem',
                  }}
                >
                  <strong>🎟️ {t.code}</strong>
                  <br />
                  <small style={{ color: '#666' }}>{t.fileName}</small>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Panneau Notifications SIMPLIFIÉ */}
        {showNotifPanel && (
          <div
            className="notifications-overlay-backdrop"
            onClick={() => setShowNotifPanel(false)}
          >
            <div
              className="notifications-overlay"
              onClick={(e) => e.stopPropagation()}
            >
              <h2>🔔 Préférences Notifications</h2>
              {notifLoading && <p>Chargement...</p>}
              {notifError && <p className="text-error">{notifError}</p>}

              <div style={{ margin: '1rem 0' }}>
                {groups.map((group) => (
                  <label style={{ display: 'block', marginBottom: '0.5rem' }} key={group.groupId}>
                    <input
                      type="checkbox"
                      checked={selectedGroupIds.has(group.groupId)}
                      onChange={(e) => handleSubscriptionToggle(group.groupId, e.target.checked)}
                      style={{ marginRight: '0.5rem' }}
                    />
                    {group.groupName}
                  </label>
                ))}
                {!notifLoading && groups.length === 0 && <p>Aucun groupe disponible</p>}
              </div>

              <h3 style={{ marginTop: '1.5rem' }}>📨 Dernières notifications</h3>
              {notifMessages.length === 0 ? (
                <p>Aucune notification reçue</p>
              ) : (
                <ul style={{ paddingLeft: '1.2rem', maxHeight: '200px', overflowY: 'auto' }}>
                  {notifMessages.slice(0, 8).map((message, index) => (
                    <li key={index}>
                      {typeof message === 'string' ? message : JSON.stringify(message)}
                    </li>
                  ))}
                </ul>
              )}

              <button
                className="btn-primary"
                style={{ marginTop: '1rem', width: '100%' }}
                onClick={() => setShowNotifPanel(false)}
              >
                Fermer
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SpectateurPage;
