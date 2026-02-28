import React, { useCallback, useMemo, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import { useProgramme } from '../hooks/useProgramme';
import { useAuth } from '../context/AuthContext.jsx';

let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

function SportifPage() {
  const { token, user, logout } = useAuth();
  const [results] = useState([{ id: 10, epreuve: '100m Papillon', temps: '51.20s' }]);
  const [docs, setDocs] = useState({ passeport: 'Manquant', certificat: 'Manquant' });

  const mapSchedule = useCallback((e, competition) => ({
    id: e.id,
    epreuve: e.name,
    heure: e.horaireAthletes ? new Date(e.horaireAthletes).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) : '-',
    lieu: competition.name,
  }), []);

  const { data: schedule, loading } = useProgramme({ token, mapper: mapSchedule });
  const sortedSchedule = useMemo(() => schedule, [schedule]);

  return (
    <div className="app-container">
      <div className="spectator-shell">
        <div className="spectator-header">
          <div className="spectator-header-left">
            <h1>Espace Sportif</h1>
            <div style={{background:'#dcfce7', padding:'5px 10px', borderRadius:'20px', color:'#166534', fontSize:'0.85rem', display:'inline-block', marginTop:'5px'}}>
               📡 Traçage GPS Actif (Conformité Charte)
            </div>
          </div>
          <div className="spectator-header-right">{user?.username} <button className="btn-secondary" onClick={logout}>Déconnexion</button></div>
        </div>

        <div className="spectator-main-full">
          <div style={{display:'flex', gap:'1.5rem', flexWrap:'wrap'}}>
            <div className="panel" style={{flex:1}}>
              <h2 className="panel-title">🪪 Administratif</h2>
              <p className="text-error">Backend non connecté pour ce module (hors API fournie).</p>
              <div style={{marginBottom:'1rem', padding:'10px', border:'1px solid #eee', borderRadius:'6px'}}>
                <div style={{display:'flex', justifyContent:'space-between'}}><strong>Passeport</strong> <span className="badge-warning">{docs.passeport}</span></div>
                <input type="file" onChange={() => setDocs({...docs, passeport:'En attente'})} />
              </div>
              <div style={{padding:'10px', border:'1px solid #eee', borderRadius:'6px'}}>
                <div style={{display:'flex', justifyContent:'space-between'}}><strong>Certificat</strong> <span className="badge-warning">{docs.certificat}</span></div>
                <input type="file" onChange={() => setDocs({...docs, certificat:'En attente'})} />
              </div>
            </div>

            <div className="panel" style={{flex:2}}>
              <h2 className="panel-title">📅 Planning & Zones</h2>

              {loading ? <p>Chargement du planning...</p> : (
                sortedSchedule.length > 0 ? sortedSchedule.map((s) => (
                  <div key={s.id} style={{padding:'10px', borderLeft:'4px solid #2563eb', background:'#f8fafc', marginBottom:'1rem'}}>
                    <strong>{s.epreuve}</strong> - {s.heure} <br/> 📍 {s.lieu}
                  </div>
                )) : <p>Aucune épreuve planifiée.</p>
              )}

              <div style={{height:'250px', marginTop:'1rem', borderRadius:'8px', overflow:'hidden'}}>
                <MapContainer center={[48.9244, 2.3600]} zoom={15} style={{height:'100%'}}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                  <Marker position={[48.9250, 2.3610]}><Popup>Chambre d'appel</Popup></Marker>
                  <Marker position={[48.9240, 2.3590]}><Popup>Zone Échauffement</Popup></Marker>
                </MapContainer>
              </div>

              <h3 style={{marginTop:'1.5rem'}}>Performances</h3>
              <table style={{fontSize:'0.9rem'}}><tbody>{results.map((r) => <tr key={r.id}><td>{r.epreuve}</td><td><b>{r.temps}</b></td></tr>)}</tbody></table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SportifPage;
