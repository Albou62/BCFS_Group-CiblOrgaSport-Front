import React, { useState, useEffect } from 'react';
import { Navigate } from 'react-router-dom';

const API_URL = import.meta.env.VITE_API_URL;

function CommissairePage({ token, onLogout, username }) {
  const [view, setView] = useState('epreuves');
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedEvent, setSelectedEvent] = useState(null);
  const [currentResultType, setCurrentResultType] = useState('chrono'); 
  const [podium, setPodium] = useState([]); 

  // Données initiales (participants)
  const [participants, setParticipants] = useState([
    { id: 1, nom: 'DURAND Thomas', couloir: 4, resultat: '', statut: 'OK' }, 
    { id: 2, nom: 'MARTIN Lucas', couloir: 5, resultat: '', statut: 'OK' },
    { id: 3, nom: 'DUBOIS Julie', couloir: 3, resultat: '', statut: 'OK' },
    { id: 4, nom: 'PETIT Pierre', couloir: 6, resultat: '', statut: 'OK' },
  ]);

  // Documents factices
  const [pendingDocs, setPendingDocs] = useState([
    { id: 1, athlete: 'Thomas DURAND', type: 'Passeport', fileName: 'pass_thomas.pdf' },
    { id: 2, athlete: 'Julie DUBOIS', type: 'Certificat', fileName: 'certif.pdf' }
  ]);

  // --- API ---
  const fetchAllEvents = async () => {
    try {
      setLoading(true);
      const resComp = await fetch(`${API_URL}/api/competitions`, { headers: { Authorization: `Bearer ${token}` } });
      if(!resComp.ok) return;
      const comps = await resComp.json();

      let all = [];
      await Promise.all(comps.map(async (c) => {
          const r = await fetch(`${API_URL}/api/competitions/${c.id}/epreuves`, { headers: { Authorization: `Bearer ${token}` } });
          if(r.ok) {
              const eps = await r.json();
              all = [...all, ...eps.map(e => ({...e, competitionName: c.name}))];
          }
      }));
      setEvents(all);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { if(token) fetchAllEvents(); }, [token]);

  // --- ACTIONS DOCUMENT ---
  const handleValidateDoc = (id) => {
    setPendingDocs(pendingDocs.filter(d => d.id !== id));
    alert("✅ Document validé.");
  };

  const handleRejectDoc = (id) => {
    setPendingDocs(pendingDocs.filter(d => d.id !== id));
    alert("❌ Document refusé.");
  };

  // --- GESTION EPREUVE ---
  const handleSelectEvent = (event) => {
      setSelectedEvent(event);
      setCurrentResultType('chrono'); 
      setPodium([]); 
      setParticipants(participants.map(p => ({...p, resultat: '', statut: 'OK'})));
  };

  // Simulation Capteurs
  const handleImportSensors = () => {
      alert("📡 Connexion aux capteurs en cours...");
      setTimeout(() => {
          // Simulation de valeurs selon le type
          const isDistance = currentResultType === 'distance';
          // Distance = Grands chiffres, Chrono = Petits chiffres
          const randomResults = isDistance ? ['8.52', '8.95', '8.10', 'X'] : ['9.85', '9.92', '10.04', '9.58'];
          
          setParticipants(participants.map((p, i) => ({
              ...p,
              resultat: randomResults[i] || ''
          })));
          alert("✅ Données reçues !");
      }, 800);
  };

  // --- LOGIQUE DE CLASSEMENT (CORRIGÉE) ---
  const handlePublishResults = () => {
    // 1. Filtrer les valides
    let valid = participants.filter(p => p.statut === 'OK' && p.resultat && p.resultat.trim() !== '');
    
    // 2. Fonction de conversion
    const parseResult = (val) => {
        if(val === 'X' || val === '-' || val.toUpperCase() === 'DQ') return -9999; 
        return parseFloat(val.replace(',', '.'));
    };

    // 3. Tri
    valid.sort((a, b) => {
        const valA = parseResult(a.resultat);
        const valB = parseResult(b.resultat);

        if (currentResultType === 'chrono') {
            // Chrono : Croissant (Petit -> Grand)
            // ex: 9.58 gagne contre 9.92
            return valA - valB; 
        } else {
            // Distance/Points : Décroissant (Grand -> Petit)
            // ex: 8.95m gagne contre 8.52m
            return valB - valA; 
        }
    });

    setPodium(valid);
    alert("✅ Résultats publiés ! Le podium a été mis à jour.");
  };

  // --- GESTION INCIDENTS (Annulation) ---
  const handleSuspendEvent = () => {
      if(window.confirm("⚠️ Êtes-vous sûr de vouloir SUSPENDRE ou ANNULER cette épreuve ?\n\nCela enverra une notification immédiate.")) {
          alert("🚫 Épreuve suspendue. Le chronomètre est arrêté.");
          // Ici on pourrait appeler l'API pour changer le statut de l'épreuve
      }
  };

  const getLabel = () => currentResultType === 'distance' ? 'Distance (m)' : currentResultType === 'points' ? 'Points' : 'Temps';

  if (!token) return <Navigate to="/auth" replace />;

  return (
    <div className="app-container">
      <div className="spectator-shell">
        
        {/* HEADER */}
        <div className="spectator-header">
          <div className="spectator-header-left">
            <h1>Espace Commissaire</h1>
            <p>Administration & Arbitrage</p>
          </div>
          <div className="spectator-header-right">
            {username && <span>{username} (Officiel)</span>}
            <button className="btn-secondary" onClick={onLogout}>Déconnexion</button>
          </div>
        </div>

        {/* CONTENU PRINCIPAL */}
        <div className="spectator-main-full">
           
           {/* NAVIGATION */}
           <div className="panel" style={{marginBottom:'1rem', display:'flex', gap:'10px', padding:'1rem'}}>
              <button className={`btn-secondary ${view==='epreuves'?'btn-primary':''}`} onClick={()=>setView('epreuves')}>⏱️ Gestion Épreuves</button>
              <button className={`btn-secondary ${view==='admin'?'btn-primary':''}`} onClick={()=>setView('admin')}>🗂️ Administratif {pendingDocs.length > 0 && <span className="badge-warning" style={{marginLeft:'5px'}}>{pendingDocs.length}</span>}</button>
           </div>

           {/* --- VUE ADMINISTRATIF (DOCUMENTS) --- */}
           {view === 'admin' && (
               <div className="panel">
                   <h2 className="panel-title">Validation des documents</h2>
                   <p className="panel-subtitle">Cliquez sur le nom du fichier pour le visualiser.</p>
                   
                   {pendingDocs.length === 0 ? (
                       <div style={{textAlign:'center', padding:'2rem', color:'#666', fontStyle:'italic'}}>✅ Aucun document en attente.</div>
                   ) : (
                       <table style={{marginTop:'1rem', borderCollapse:'collapse'}}>
                           <thead>
                               <tr style={{textAlign:'left', background:'#f8fafc', borderBottom:'2px solid #e2e8f0'}}>
                                   <th style={{padding:'12px'}}>Athlète</th>
                                   <th style={{padding:'12px'}}>Type Document</th>
                                   <th style={{padding:'12px'}}>Fichier</th>
                                   <th style={{padding:'12px', textAlign:'right'}}>Action</th>
                               </tr>
                           </thead>
                           <tbody>
                               {pendingDocs.map(d=>(
                                   <tr key={d.id} style={{borderBottom:'1px solid #eee'}}>
                                       <td style={{padding:'12px', fontWeight:'bold'}}>{d.athlete}</td>
                                       <td style={{padding:'12px'}}><span className="badge-secondary">{d.type}</span></td>
                                       <td style={{padding:'12px'}}>
                                           <a 
                                                href={`${API_URL}/uploads/${d.fileName}`} 
                                                target="_blank" 
                                                rel="noopener noreferrer"
                                                style={{color:'#2563eb', textDecoration:'none', fontWeight:'500'}}
                                           >
                                               📄 {d.fileName}
                                           </a>
                                       </td>
                                       <td style={{padding:'12px', textAlign:'right'}}>
                                           <button onClick={()=>handleRejectDoc(d.id)} style={{marginRight:'8px', padding:'6px 12px', background:'#fee2e2', color:'#991b1b', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'600'}}>Refuser</button>
                                           <button onClick={()=>handleValidateDoc(d.id)} style={{padding:'6px 12px', background:'#dcfce7', color:'#166534', border:'none', borderRadius:'6px', cursor:'pointer', fontWeight:'600'}}>Valider</button>
                                       </td>
                                   </tr>
                               ))}
                           </tbody>
                       </table>
                   )}
               </div>
           )}

           {/* --- VUE SELECTION EPREUVES --- */}
           {view === 'epreuves' && !selectedEvent && (
               <div className="panel">
                   <h2 className="panel-title">Sélectionner une épreuve</h2>
                   <table style={{marginTop:'1rem'}}>
                       <thead><tr style={{textAlign:'left', background:'#f8fafc', borderBottom:'2px solid #e2e8f0'}}><th style={{padding:'12px'}}>Épreuve</th><th style={{padding:'12px'}}>Compétition</th><th style={{padding:'12px'}}>Action</th></tr></thead>
                       <tbody>
                           {events.map(e=>(
                               <tr key={e.id} style={{borderBottom:'1px solid #eee'}}>
                                   <td style={{padding:'12px'}}><strong>{e.name}</strong></td>
                                   <td style={{padding:'12px'}}>{e.competitionName}</td>
                                   <td style={{padding:'12px'}}><button className="btn-secondary" onClick={()=>handleSelectEvent(e)}>Gérer 👉</button></td>
                               </tr>
                           ))}
                           {events.length===0 && <tr><td colSpan="3" style={{padding:'20px', textAlign:'center'}}>Chargement des épreuves...</td></tr>}
                       </tbody>
                   </table>
               </div>
           )}

           {/* --- VUE ARBITRAGE (Détail) --- */}
           {view === 'epreuves' && selectedEvent && (
               <div className="panel">
                   <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'1.5rem'}}>
                       <button className="btn-secondary" onClick={()=>setSelectedEvent(null)}>⬅ Retour Liste</button>
                       <div style={{textAlign:'right'}}>
                           <h2 style={{margin:0, fontSize:'1.4rem'}}>{selectedEvent.name}</h2>
                           <span style={{color:'#666', fontSize:'0.9rem'}}>{selectedEvent.competitionName}</span>
                       </div>
                   </div>

                   {/* BARRE D'OUTILS ARBITRAGE */}
                   <div style={{display:'flex', flexWrap:'wrap', gap:'1rem', justifyContent:'space-between', alignItems:'center', background:'#f8fafc', padding:'1.5rem', borderRadius:'8px', marginBottom:'1.5rem', border:'1px solid #e2e8f0'}}>
                       <div style={{display:'flex', alignItems:'center', gap:'1rem'}}>
                           <label style={{fontWeight:'bold', color:'#334155'}}>Mode de Classement :</label>
                           <select 
                                value={currentResultType} 
                                onChange={e=>setCurrentResultType(e.target.value)} 
                                style={{padding:'8px', borderRadius:'6px', border:'1px solid #cbd5e1', fontSize:'1rem'}}
                           >
                               <option value="chrono">⏱️ Chrono </option>
                               <option value="distance">📏 Distance </option>
                               <option value="points">🏆 Points </option>
                           </select>
                       </div>
                       <button className="btn-primary" onClick={handleImportSensors} style={{background:'#0ea5e9', display:'flex', alignItems:'center', gap:'8px'}}>
                           📡 Importer données Capteurs
                       </button>
                   </div>

                   {/* TABLEAU DE SAISIE */}
                   <table style={{marginBottom:'1.5rem', width:'100%'}}>
                       <thead>
                           <tr style={{background:'#e2e8f0', textAlign:'left'}}>
                               <th style={{padding:'12px'}}>Couloir</th>
                               <th style={{padding:'12px'}}>Athlète</th>
                               <th style={{padding:'12px'}}>{getLabel()}</th>
                               <th style={{padding:'12px', textAlign:'center'}}>Statut</th>
                           </tr>
                       </thead>
                       <tbody>
                           {participants.map(p => (
                               <tr key={p.id} style={{borderBottom:'1px solid #e2e8f0', background: p.statut==='DQ'?'#fee2e2':'white'}}>
                                   <td style={{padding:'12px', fontWeight:'bold'}}>{p.couloir}</td>
                                   <td style={{padding:'12px', textDecoration: p.statut==='DQ'?'line-through':''}}>{p.nom}</td>
                                   <td style={{padding:'12px'}}>
                                       <input 
                                           type="text" 
                                           value={p.resultat} 
                                           onChange={e=>{
                                               const newP = [...participants];
                                               newP.find(x=>x.id===p.id).resultat = e.target.value;
                                               setParticipants(newP);
                                           }}
                                           placeholder="0.00"
                                           style={{padding:'8px', width:'120px', fontWeight:'bold', borderRadius:'4px', border:'1px solid #cbd5e1'}}
                                           disabled={p.statut==='DQ'}
                                       />
                                   </td>
                                   <td style={{padding:'12px', textAlign:'center'}}>
                                       <button 
                                           onClick={()=>{
                                               const newP = [...participants];
                                               const t = newP.find(x=>x.id===p.id);
                                               t.statut = t.statut==='OK'?'DQ':'OK';
                                               setParticipants(newP);
                                           }}
                                           style={{
                                               padding:'6px 12px', 
                                               borderRadius:'6px', 
                                               cursor:'pointer', 
                                               fontWeight:'bold',
                                               background: p.statut==='OK'?'#fff':'#ef4444',
                                               color: p.statut==='OK'?'#334155':'white',
                                               border: p.statut==='OK'?'1px solid #cbd5e1':'none'
                                           }}
                                       >
                                           {p.statut === 'OK' ? 'Disqualifier' : 'DQ (Disqualifié)'}
                                       </button>
                                   </td>
                               </tr>
                           ))}
                       </tbody>
                   </table>

                   <div style={{textAlign:'right', paddingBottom:'1rem', borderBottom:'1px solid #eee'}}>
                       <button className="btn-primary" onClick={handlePublishResults} style={{fontSize:'1.1rem', padding:'12px 24px'}}>✅ Valider & Publier</button>
                   </div>

                   {/* --- PODIUM COMPLET --- */}
                   {podium.length > 0 && (
                        <div style={{marginTop:'3rem', padding:'2rem', background:'linear-gradient(to bottom, #f0fdf4, #fff)', borderRadius:'16px', border:'1px solid #bbf7d0', boxShadow:'0 10px 25px -5px rgba(0, 0, 0, 0.1)'}}>
                            <h3 style={{textAlign:'center', color:'#15803d', fontSize:'1.5rem', marginBottom:'2rem', textTransform:'uppercase', letterSpacing:'1px'}}>🏆 Podium Officiel</h3>
                            
                            <div style={{display:'flex', justifyContent:'center', alignItems:'flex-end', gap:'20px'}}>
                                
                                {/* 2ème (Argent) */}
                                <div style={{textAlign:'center', width:'100px'}}>
                                    {podium.length >= 2 ? (
                                        <>
                                            <div style={{fontWeight:'bold', marginBottom:'5px', color:'#334155'}}>{podium[1].nom}</div>
                                            <div style={{fontSize:'0.9rem', color:'#64748b', marginBottom:'5px'}}>{podium[1].resultat}</div>
                                            <div style={{height:'80px', background:'linear-gradient(180deg, #94a3b8 0%, #cbd5e1 100%)', borderRadius:'8px 8px 0 0', display:'flex', justifyContent:'center', alignItems:'center', fontSize:'2rem', color:'white', boxShadow:'0 4px 6px rgba(0,0,0,0.1)'}}>2</div>
                                            <div style={{fontSize:'2rem'}}>🥈</div>
                                        </>
                                    ) : <div style={{width:'100px'}}></div>}
                                </div>

                                {/* 1er (Or) */}
                                <div style={{textAlign:'center', width:'120px'}}>
                                    {podium.length >= 1 ? (
                                        <>
                                            <div style={{fontSize:'2.5rem', marginBottom:'-10px'}}>👑</div>
                                            <div style={{fontWeight:'bold', color:'#b45309', fontSize:'1.1rem', marginBottom:'5px'}}>{podium[0].nom}</div>
                                            <div style={{fontSize:'1rem', fontWeight:'bold', marginBottom:'5px', color:'#b45309'}}>{podium[0].resultat}</div>
                                            <div style={{height:'120px', background:'linear-gradient(180deg, #eab308 0%, #facc15 100%)', borderRadius:'8px 8px 0 0', display:'flex', justifyContent:'center', alignItems:'center', fontSize:'3rem', color:'white', boxShadow:'0 10px 15px rgba(0,0,0,0.2)', border:'2px solid white'}}>1</div>
                                            <div style={{fontSize:'2.5rem'}}>🥇</div>
                                        </>
                                    ) : null}
                                </div>

                                {/* 3ème (Bronze) */}
                                <div style={{textAlign:'center', width:'100px'}}>
                                    {podium.length >= 3 ? (
                                        <>
                                            <div style={{fontWeight:'bold', marginBottom:'5px', color:'#7c2d12'}}>{podium[2].nom}</div>
                                            <div style={{fontSize:'0.9rem', color:'#9a3412', marginBottom:'5px'}}>{podium[2].resultat}</div>
                                            <div style={{height:'60px', background:'linear-gradient(180deg, #c2410c 0%, #fdba74 100%)', borderRadius:'8px 8px 0 0', display:'flex', justifyContent:'center', alignItems:'center', fontSize:'1.5rem', color:'white', boxShadow:'0 4px 6px rgba(0,0,0,0.1)'}}>3</div>
                                            <div style={{fontSize:'2rem'}}>🥉</div>
                                        </>
                                    ) : <div style={{width:'100px'}}></div>}
                                </div>

                            </div>
                        </div>
                   )}

                   {/* --- ZONE DANGER (SUSPENDRE/ANNULER) --- */}
                   <div style={{marginTop:'3rem', padding:'1.5rem', border:'2px solid #ef4444', borderRadius:'8px', background:'#fef2f2', display:'flex', justifyContent:'space-between', alignItems:'center'}}>
                       <div>
                           <h3 style={{color:'#991b1b', marginTop:0, marginBottom:'0.5rem'}}>⚠️ Gestion de Crise & Incidents</h3>
                           <p style={{fontSize:'0.9rem', color:'#7f1d1d', margin:0}}>En cas de force majeure (Météo, Incident technique, Sécurité).</p>
                       </div>
                       <div style={{display:'flex', gap:'10px'}}>
                           <button 
                               style={{background:'#fff', color:'#dc2626', padding:'10px 20px', border:'2px solid #dc2626', borderRadius:'6px', cursor:'pointer', fontWeight:'bold', fontSize:'1rem'}} 
                               onClick={handleSuspendEvent}
                           >
                               ⛔ SUSPENDRE / ANNULER L'ÉPREUVE
                           </button>
                       </div>
                   </div>

               </div>
           )}
        </div>
      </div>
    </div>
  );
}

export default CommissairePage;