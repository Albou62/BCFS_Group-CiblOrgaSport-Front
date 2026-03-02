import React, { useCallback, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { useAuth } from '../context/AuthContext.jsx';
import { getMyTickets, addTicket as addTicketApi } from '../services/userService';
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
  
  // États
  const [tickets, setTickets] = useState([]);
  const [programme, setProgramme] = useState([]);
  const [loadingProgramme, setLoadingProgramme] = useState(false);
  const [newTicketCode, setNewTicketCode] = useState('');
  const [newTicketFile, setNewTicketFile] = useState(null);
  const [showNotifPanel, setShowNotifPanel] = useState(false);
  const [groups, setGroups] = useState([]);
  const [selectedGroupIds, setSelectedGroupIds] = useState(new Set());
  const [notifMessages, setNotifMessages] = useState([]);

  // 1. Fetch du Programme (Direct)
  useEffect(() => {
    const fetchProg = async () => {
      setLoadingProgramme(true);
      try {
        const res = await fetch('http://localhost:8080/api/public/upcoming-epreuves?limit=10');
        if (res.ok) {
          const data = await res.json();
          // Tri par date pour être sûr de l'ordre chronologique
          const sorted = data.sort((a, b) => new Date(a.horairePublic) - new Date(b.horairePublic));
          setProgramme(sorted);
        }
      } catch (err) {
        console.error("Erreur programme spectateur:", err);
      } finally {
        setLoadingProgramme(false);
      }
    };
    if (token) fetchProg();
  }, [token]);

  // 2. Initialisation Billets et Notifications (Logique existante)
  useEffect(() => {
    if (token) {
      getMyTickets(token).then(setTickets).catch(console.error);
    }
  }, [token]);

  // ... (Garder tes fonctions handleSubscriptionToggle, handleAddTicket, etc. inchangées)
  const handleAddTicket = async (e) => {
    e.preventDefault();
    if (!newTicketCode) return;
    try {
      const ticketData = { code: newTicketCode, fileName: newTicketFile ? newTicketFile.name : 'ticket.pdf' };
      const savedTicket = await addTicketApi(token, ticketData);
      setTickets((prev) => [...prev, savedTicket]);
      setNewTicketCode('');
      setNewTicketFile(null);
      alert("✅ Billet ajouté !");
    } catch (err) { alert("❌ Erreur ajout billet"); }
  };

  return (
    <div className="app-container">
      <div className="spectator-shell">
        <div className="spectator-header">
          <div className="spectator-header-left"><h1>Espace Spectateur</h1><p>Prêt pour l'événement ?</p></div>
          <div className="spectator-header-right">
            {user?.username && <span>{user.username}</span>}
            <button className="icon-button" onClick={() => setShowNotifPanel(true)}>🔔</button>
            <button className="btn-secondary" onClick={logout}>Déconnexion</button>
          </div>
        </div>

        <div className="spectator-main">
          <div style={{display:'flex', flexDirection:'column', gap:'1.5rem'}}>
            {/* CARTE */}
            <div className="panel" style={{padding:0, overflow:'hidden'}}>
               <div style={{padding:'1rem'}}><h2 className="panel-title">📍 Carte & Fan Zones</h2></div>
               <div style={{height:'350px'}}>
                 <MapContainer center={[48.88, 2.34]} zoom={11} style={{height:'100%'}}>
                   <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                   <Marker position={[48.9244, 2.3600]}><Popup><b>Centre Aquatique</b></Popup></Marker>
                 </MapContainer>
               </div>
            </div>

            {/* PROGRAMME AVEC JOUR ET HEURE */}
            <div className="panel">
              <h2 className="panel-title">📅 Mon Programme</h2>
              {loadingProgramme ? <p>Chargement...</p> : programme.length === 0 ? <p>Aucune épreuve.</p> : (
                <ul className="event-list" style={{listStyle:'none', padding:0}}>
                  {programme.map((e) => (
                    <li key={e.id} style={{display:'flex', justifyContent:'space-between', padding:'12px 0', borderBottom:'1px solid #eee'}}>
                      <div>
                        <div style={{fontWeight:'bold', color:'#1e40af'}}>{e.name}</div>
                        <div style={{fontSize:'0.85rem', color:'#666'}}>🏆 {e.competitionName || "Compétition"}</div>
                      </div>
                      <div style={{textAlign:'right'}}>
                        <div style={{fontWeight:'bold'}}>
                          {new Date(e.horairePublic).toLocaleTimeString('fr-FR', {hour: '2-digit', minute:'2-digit'})}
                        </div>
                        <div style={{fontSize:'0.75rem', color:'#888'}}>
                          {new Date(e.horairePublic).toLocaleDateString('fr-FR', {day: '2-digit', month: 'short'})}
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* BILLETS */}
          <div className="panel">
            <h2 className="panel-title">🎟️ Mes Billets</h2>
            <form onSubmit={handleAddTicket} style={{display:'flex', flexDirection:'column', gap:'0.5rem', marginBottom:'1rem'}}>
              <input type="text" placeholder="Référence du billet" value={newTicketCode} onChange={(e)=>setNewTicketCode(e.target.value)} required/>
              <input type="file" onChange={(e) => e.target.files && setNewTicketFile(e.target.files[0])} />
              <button className="btn-primary">Ajouter au compte</button>
            </form>
            
            {tickets.map((t) => (
              <div key={t.id} style={{background:'#f0fdf4', padding:'1rem', border:'1px solid #bbf7d0', borderRadius:'6px', marginBottom:'0.5rem'}}>
                  <strong>🎟️ {t.code}</strong><br/>
                  <small style={{color:'#666'}}>{t.fileName}</small>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default SpectateurPage;