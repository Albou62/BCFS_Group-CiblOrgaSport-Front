import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { useProgramme } from '../hooks/useProgramme';
import { useAuth } from '../context/AuthContext.jsx';
import {
  consumeNotifications,
  listGroups,
  listSubscriptionsByUser,
  subscribeToGroup,
  unsubscribeFromGroup,
} from '../services/notificationService';

const POLL_INTERVAL_MS = 20_000;

const defaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = defaultIcon;

function SpectateurPage() {
  const { token, user, logout } = useAuth();
  const [hello, setHello] = useState('');
  const [tickets, setTickets] = useState([]);
  const [newTicketCode, setNewTicketCode] = useState('');
  const [newTicketFile, setNewTicketFile] = useState(null);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState(new Set());
  const [notifMessages, setNotifMessages] = useState([]);
  const [notifError, setNotifError] = useState(null);
  const [notifLoading, setNotifLoading] = useState(false);

  const mapEvent = useCallback((event) => event, []);
  const { data: epreuves, loading, refetch } = useProgramme({ token, mapper: mapEvent });

  const events = useMemo(
    () => [...epreuves].sort((a, b) => new Date(a.horairePublic) - new Date(b.horairePublic)),
    [epreuves]
  );

  const userId = user?.id;

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
      setNotifError(error?.message || 'Erreur lors du chargement des notifications.');
    } finally {
      setNotifLoading(false);
    }
  }, [token, userId]);

  const refreshNotifications = useCallback(async () => {
    if (!token || !userId) return;
    try {
      const messages = await consumeNotifications(userId, { token });
      if (messages.length > 0) {
        setNotifMessages((prev) => [...messages, ...prev].slice(0, 50));
      }
    } catch {
      // Ignore polling errors to keep page usable.
    }
  }, [token, userId]);

  useEffect(() => {
    setHello("Prêt pour l'événement ?");
  }, []);

  useEffect(() => {
    if (!token || !userId) return undefined;
    refreshNotifications();
    const intervalId = window.setInterval(refreshNotifications, POLL_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [token, userId, refreshNotifications]);

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
      setNotifError(error?.message || 'Impossible de mettre à jour cet abonnement.');
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files) setNewTicketFile(e.target.files[0]);
  };

  const addTicket = (e) => {
    e.preventDefault();
    if (!newTicketCode && !newTicketFile) return;
    setTickets((prev) => [
      ...prev,
      { id: Date.now(), code: newTicketCode, fileName: newTicketFile ? newTicketFile.name : '' },
    ]);
    setNewTicketCode('');
    setNewTicketFile(null);
    e.target.reset();
  };

  const handleItinerary = (site) => alert(`Calcul itinéraire vers : ${site}`);

  return (
    <div className="app-container">
      <div className="spectator-shell">
        <div className="spectator-header">
          <div className="spectator-header-left"><h1>Espace Spectateur</h1><p>{hello}</p></div>
          <div className="spectator-header-right">
            {user?.username && <span>{user.username}</span>}
            <button className="icon-button" onClick={() => setShowNotifPanel(true)}>🔔</button>
            <button className="btn-secondary" onClick={logout}>Déconnexion</button>
          </div>
        </div>

        <div className="spectator-main">
          <div style={{display:'flex', flexDirection:'column', gap:'1.5rem'}}>
            <div className="panel" style={{padding:0, overflow:'hidden'}}>
              <div style={{padding:'1rem', display:'flex', justifyContent:'space-between'}}>
                <h2 className="panel-title">📍 Carte & Fan Zones</h2>
                <button className="btn-secondary" onClick={() => alert('Position partagée !')}>📡 Partager position</button>
              </div>
              <div style={{height:'350px'}}>
                <MapContainer center={[48.88, 2.34]} zoom={11} style={{height:'100%'}}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[48.9244, 2.3600]}><Popup><b>Centre Aquatique</b><br/><button onClick={() => handleItinerary('Piscine')}>Y aller</button></Popup></Marker>
                  <Marker position={[48.8584, 2.2945]}><Popup><b>Fan Zone Tour Eiffel</b><br/><button onClick={() => handleItinerary('FanZone')}>Y aller</button></Popup></Marker>
                </MapContainer>
              </div>
            </div>

            <div className="panel">
              <div style={{display:'flex', justifyContent:'space-between'}}><h2 className="panel-title">📅 Programme</h2><button onClick={() => refetch({ force: true })}>🔄</button></div>
              {loading ? <p>Chargement...</p> : (
                <ul className="event-list">
                  {events.map((e) => (
                    <li key={e.id} className="event-item" style={{display:'flex', justifyContent:'space-between'}}>
                      <div><div className="event-name">{e.name}</div><div className="event-meta">🏆 {e.competitionName}</div></div>
                      <div className="event-meta">{e.horairePublic ? new Date(e.horairePublic).toLocaleTimeString([],{hour:'2-digit', minute:'2-digit'}) : '-'}</div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          <div className="panel">
            <h2 className="panel-title">🎟️ Mes Billets</h2>
            <p className="text-error">Backend non connecté pour ce module (hors API fournie).</p>
            <form onSubmit={addTicket} style={{display:'flex', flexDirection:'column', gap:'0.5rem', marginBottom:'1rem'}}>
              <input type="text" placeholder="Référence" value={newTicketCode} onChange={(e)=>setNewTicketCode(e.target.value)} style={{padding:'0.5rem', border:'1px solid #ccc', borderRadius:'4px'}}/>
              <input type="file" onChange={handleFileChange} />
              <button className="btn-primary">Ajouter</button>
            </form>
            {tickets.map((t) => (
              <div key={t.id} style={{background:'#f0fdf4', padding:'0.5rem', border:'1px solid #bbf7d0', borderRadius:'6px', marginBottom:'0.5rem'}}>
                <strong>{t.code}</strong><br/><small>{t.fileName}</small>
              </div>
            ))}
          </div>
        </div>

        {showNotifPanel && (
          <div className="notifications-overlay-backdrop" onClick={() => setShowNotifPanel(false)}>
            <div className="notifications-overlay" onClick={(e)=>e.stopPropagation()}>
              <h2>Préférences de notification</h2>
              {notifLoading && <p>Chargement...</p>}
              {notifError && <p className="text-error">{notifError}</p>}

              {groups.map((group) => (
                <label style={{display:'block'}} key={group.groupId}>
                  <input
                    type="checkbox"
                    checked={selectedGroupIds.has(group.groupId)}
                    onChange={(e) => handleSubscriptionToggle(group.groupId, e.target.checked)}
                  />{' '}
                  {group.groupName}
                </label>
              ))}
              {!notifLoading && groups.length === 0 && <p>Aucun groupe disponible.</p>}

              <h3 style={{marginTop:'1rem'}}>Dernières notifications</h3>
              {notifMessages.length === 0 ? <p>Aucune notification reçue.</p> : (
                <ul style={{paddingLeft:'1.2rem'}}>
                  {notifMessages.slice(0, 8).map((message, index) => <li key={`${message}-${index}`}>{message}</li>)}
                </ul>
              )}

              <button className="btn-primary" style={{marginTop:'1rem'}} onClick={() => setShowNotifPanel(false)}>Fermer</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SpectateurPage;
