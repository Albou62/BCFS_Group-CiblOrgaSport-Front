import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from '../components/Login.jsx';
import Register from '../components/Register.jsx';

const API_URL = import.meta.env.VITE_API_URL;

function AuthPage({ setToken, setUsername }) {
  const [showRegister, setShowRegister] = useState(false);
  const [prefilledUsername, setPrefilledUsername] = useState('');
  const navigate = useNavigate();

  const fetchMeAndRedirect = async (token) => {
    try {
        const res = await fetch(`${API_URL}/api/auth/me`, {
            headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) { navigate('/spectateur'); return; }
        const me = await res.json();
        setUsername(me.username);

        switch (me.role) {
            case 'RESPONSABLE': navigate('/responsable'); break;
            case 'SPORTIF': navigate('/sportif'); break;
            case 'COMMISSAIRE': navigate('/commissaire'); break;
            case 'VOLONTAIRE': navigate('/volontaire'); break;
            default: navigate('/spectateur');
        }
    } catch(e) { navigate('/spectateur'); }
  };

  const handleLogin = async (newToken) => {
    setToken(newToken);
    localStorage.setItem('token', newToken);
    await fetchMeAndRedirect(newToken);
  };

  const handleRegistered = (username) => {
    setPrefilledUsername(username);
    setShowRegister(false);
  };

  return (
    <div className="app-container" style={{alignItems:'center'}}>
      <div style={{ width: '100%', maxWidth: '400px' }}>
        <div className="panel" style={{textAlign:'center'}}>
          <h2 style={{marginBottom:'1.5rem'}}>Bienvenue</h2>
          <div style={{display:'flex', gap:'1rem', justifyContent:'center', marginBottom:'1.5rem'}}>
             <button onClick={()=>setShowRegister(false)} style={{background:'none', border:'none', borderBottom: !showRegister?'2px solid #2563eb':'2px solid transparent', fontWeight:!showRegister?'bold':'normal', cursor:'pointer'}}>Connexion</button>
             <button onClick={()=>setShowRegister(true)} style={{background:'none', border:'none', borderBottom: showRegister?'2px solid #2563eb':'2px solid transparent', fontWeight:showRegister?'bold':'normal', cursor:'pointer'}}>Inscription</button>
          </div>

          {showRegister ? (
            <Register onRegistered={handleRegistered} />
          ) : (
            <Login onLogin={handleLogin} prefilledUsername={prefilledUsername} />
          )}
        </div>
      </div>
    </div>
  );
}

export default AuthPage;