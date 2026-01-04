// src/pages/SpectateurPage.jsx
import React, { useState } from 'react';
import { Navigate } from 'react-router-dom';

const API_URL = 'http://localhost:1001';

function SpectateurPage({ token, username, onLogout }) {
const [hello, setHello] = useState('');
const [ticketEvent, setTicketEvent] = useState('');
const [ticketCode, setTicketCode] = useState('');
const [ticketFileName, setTicketFileName] = useState('');
const [tickets, setTickets] = useState([]);
const [notifResults, setNotifResults] = useState(true);
const [notifSecurity, setNotifSecurity] = useState(true);
const [notifEvents, setNotifEvents] = useState(false);
const [showNotifPanel, setShowNotifPanel] = useState(false);

if (!token) {
return <Navigate to="/auth" replace />;
}

const events = [
{
id: 1,
name: 'Finale 200m nage libre',
venue: 'Centre Aquatique Olympique',
time: '12 août 2026 — 18:00',
mapsQuery: 'Centre+Aquatique+Olympique+Paris',
},
{
id: 2,
name: 'Demi-finale plongeon 10m',
venue: 'Piscine Montreuil',
time: '13 août 2026 — 15:30',
mapsQuery: 'Piscine+Montreuil',
},
{
id: 3,
name: 'Cérémonie d’ouverture',
venue: 'Paris La Défense Arena',
time: '10 août 2026 — 20:00',
mapsQuery: 'Paris+La+Defense+Arena',
},
];

const fetchHello = async () => {
try {
const res = await fetch(`${API_URL}/api/hello`, {
headers: { Authorization: `Bearer ${token}` },
});
if (!res.ok) throw new Error('Non autorisé');
const text = await res.text();
setHello(text);
} catch (err) {
setHello(`Erreur: ${err.message}`);
}
};

const handleAddTicket = (e) => {
e.preventDefault();
if (!ticketEvent || !ticketCode) return;
setTickets((prev) => [
...prev,
{
id: Date.now(),
event: ticketEvent,
code: ticketCode,
fileName: ticketFileName || 'Aucun fichier associé',
},
]);
setTicketEvent('');
setTicketCode('');
setTicketFileName('');
};

const handleFileChange = (e) => {
  const file = e.target.files?.[0];
  if (file) {
    setTicketFileName(file.name);
  } else {
    setTicketFileName('');
  }
};

const notifList = [];
if (notifResults) notifList.push('résultats');
if (notifSecurity) notifList.push('sécurité');
if (notifEvents) notifList.push('événements festifs');

return (
<div className="app-container">
<div className="spectator-shell">
{/* Header */}
<div className="spectator-header">
<div className="spectator-header-left">
<h1>Espace spectateur</h1>
<p>
Suivez vos compétitions et gardez vos billets CiblOrgaSport sous la main.
</p>
</div>
<div className="spectator-header-right">
{username && (
<span>
{username} · <span style={{ opacity: 0.8 }}>Spectateur</span>
</span>
)}
<button
type="button"
className="icon-button"
title="Préférences de notifications"
onClick={() => setShowNotifPanel(true)}
>
🔔
</button>
<button type="button" className="btn-secondary" onClick={onLogout}>
Se déconnecter
</button>
</div>
</div>


    {/* Corps de page */}
    <div className="spectator-main">
      {/* Colonne gauche : événements */}
      <div className="panel">
        <h2 className="panel-title">Prochaines compétitions</h2>
        <p className="panel-subtitle">
          Quelques épreuves à venir des Championnats d’Europe de Natation 2026.
        </p>
        <ul className="event-list">
          {events.map((e) => (
            <li key={e.id} className="event-item">
              <div className="event-name">{e.name}</div>
              <div className="event-meta">{e.venue}</div>
              <div className="event-meta">{e.time}</div>
              <div className="event-links">
                <a
                  href={`https://www.google.com/maps/search/?api=1&query=${e.mapsQuery}`}
                  target="_blank"
                  rel="noreferrer"
                  className="event-link"
                >
                  Voir l’itinéraire
                </a>
              </div>
            </li>
          ))}
        </ul>
       
      </div>

      {/* Colonne droite : billets */}
      <div className="panel">
        <h2 className="panel-title">Vos billets</h2>
        <p className="panel-subtitle">
          Enregistrez ici les billets de vos sessions de compétition.
        </p>
        <form onSubmit={handleAddTicket}>
          <div className="form-group">
            <label>Événement</label>
            <input
              type="text"
              value={ticketEvent}
              onChange={(e) => setTicketEvent(e.target.value)}
              placeholder="Ex : Finale 200m nage libre"
            />
          </div>
          <div className="form-group">
            <label>Numéro de billet</label>
            <input
              type="text"
              value={ticketCode}
              onChange={(e) => setTicketCode(e.target.value)}
              placeholder="Ex : CEN-2026-000123"
            />
          </div>
          <div className="form-group">
            <label>Fichier du billet (PDF)</label>
            <input
              type="file"
              accept="application/pdf"
              onChange={handleFileChange}
            />
            {ticketFileName && (
              <p
                className="hero-text"
                style={{ fontSize: '0.85rem', marginTop: '0.3rem' }}
              >
                Fichier sélectionné : {ticketFileName}
              </p>
            )}
          </div>
          <button className="btn-primary" type="submit">
            Ajouter ce billet
          </button>
        </form>

        {tickets.length > 0 ? (
          <ul className="ticket-list">
            {tickets.map((t) => (
              <li key={t.id} className="ticket-item">
                <div className="ticket-item-title">{t.event}</div>
                <div style={{ fontSize: '0.85rem', color: '#374151' }}>
                  Billet : {t.code}
                </div>
                <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                  Fichier : {t.fileName}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p
            style={{
              marginTop: '0.8rem',
              fontSize: '0.9rem',
              color: '#6b7280',
              fontStyle: 'italic',
            }}
          >
            Aucun billet enregistré pour le moment.
          </p>
        )}
      </div>
    </div>
  </div>

  {/* Overlay notifications */}
  {showNotifPanel && (
    <div
      className="notifications-overlay-backdrop"
      onClick={() => setShowNotifPanel(false)}
    >
      <div
        className="notifications-overlay"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="panel-title">Notifications spectateur</h2>
        <p className="panel-subtitle">
          Préparez les types d’alertes que Suzanne souhaite recevoir.
        </p>
        <div className="notification-options">
          <label>
            <input
              type="checkbox"
              checked={notifResults}
              onChange={(e) => setNotifResults(e.target.checked)}
            />{' '}
            Résultats des compétitions suivies
          </label>
          <label>
            <input
              type="checkbox"
              checked={notifSecurity}
              onChange={(e) => setNotifSecurity(e.target.checked)}
            />{' '}
            Notifications de sécurité sur les sites
          </label>
          <label>
            <input
              type="checkbox"
              checked={notifEvents}
              onChange={(e) => setNotifEvents(e.target.checked)}
            />{' '}
            Événements festifs et fan zones
          </label>
        </div>
        <div className="notification-summary">
          Préférences actuelles :{' '}
          {notifList.length > 0 ? notifList.join(', ') : 'aucune notification.'}
        </div>
        <div style={{ marginTop: '1rem', textAlign: 'right' }}>
          <button
            className="btn-secondary"
            type="button"
            onClick={() => setShowNotifPanel(false)}
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  )}
</div>
);
}
export default SpectateurPage;