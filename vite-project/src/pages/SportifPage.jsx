import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

let DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });
L.Marker.prototype.options.icon = DefaultIcon;

const API_URL = import.meta.env.VITE_API_URL;

function SportifPage({ token, onLogout, username }) {
  // On remplace les données statiques par un tableau vide au départ
  const [schedule, setSchedule] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Données de démo pour les résultats (Car pas encore géré en base pour l'athlète spécifique)
  const [results] = useState([{ id: 10, epreuve: '100m Papillon', temps: '51.20s' }]);
  const [docs, setDocs] = useState({ passeport: 'Manquant', certificat: 'Manquant' });

  // --- RECUPERATION DONNEES BACK-END ---
  useEffect(() => {
    if (token) {
        const fetchSchedule = async () => {
            try {
                // 1. On récupère les compétitions
                const resComp = await fetch(`${API_URL}/api/competitions`, { headers: { Authorization: `Bearer ${token}` } });
                const comps = await resComp.json();
                
                let mySchedule = [];
                // 2. On récupère toutes les épreuves
                await Promise.all(comps.map(async (c) => {
                    const r = await fetch(`${API_URL}/api/competitions/${c.id}/epreuves`, { headers: { Authorization: `Bearer ${token}` } });
                    if(r.ok) {
                        const eps = await r.json();
                        // Ici, on pourrait filtrer uniquement les épreuves de l'athlète si le back le permettait
                        // Pour l'instant on affiche tout comme "Programme prévisionnel"
                        mySchedule = [...mySchedule, ...eps.map(e => ({
                            id: e.id,
                            epreuve: e.name,
                            heure: new Date(e.horaireAthletes).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
                            lieu: c.name // On utilise le nom de la compet comme lieu
                        }))];
                    }
                }));
                setSchedule(mySchedule);
            } catch (error) {
                console.error("Erreur chargement planning", error);
            } finally {
                setLoading(false);
            }
        };
        fetchSchedule();
    }
  }, [token]);

  if (!token) return <Navigate to="/auth" replace />;

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
          <div className="spectator-header-right">{username} <button className="btn-secondary" onClick={onLogout}>Déconnexion</button></div>
        </div>

        <div className="spectator-main-full">
            <div style={{display:'flex', gap:'1.5rem', flexWrap:'wrap'}}>
                
                {/* DOCS */}
                <div className="panel" style={{flex:1}}>
                    <h2 className="panel-title">🪪 Administratif</h2>
                    <div style={{marginBottom:'1rem', padding:'10px', border:'1px solid #eee', borderRadius:'6px'}}>
                        <div style={{display:'flex', justifyContent:'space-between'}}><strong>Passeport</strong> <span className="badge-warning">{docs.passeport}</span></div>
                        <input type="file" onChange={()=>setDocs({...docs, passeport:'En attente'})} />
                    </div>
                    <div style={{padding:'10px', border:'1px solid #eee', borderRadius:'6px'}}>
                        <div style={{display:'flex', justifyContent:'space-between'}}><strong>Certificat</strong> <span className="badge-warning">{docs.certificat}</span></div>
                        <input type="file" onChange={()=>setDocs({...docs, certificat:'En attente'})} />
                    </div>
                </div>

                {/* PLANNING & CARTE */}
                <div className="panel" style={{flex:2}}>
                    <h2 className="panel-title">📅 Planning & Zones</h2>
                    
                    {loading ? <p>Chargement du planning...</p> : (
                        schedule.length > 0 ? schedule.map(s => (
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
                    <table style={{fontSize:'0.9rem'}}><tbody>{results.map(r=><tr key={r.id}><td>{r.epreuve}</td><td><b>{r.temps}</b></td></tr>)}</tbody></table>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}
export default SportifPage;