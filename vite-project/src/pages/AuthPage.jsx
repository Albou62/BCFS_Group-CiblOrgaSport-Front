import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Login from '../components/Login.jsx';
import Register from '../components/Register.jsx';

function AuthPage({ setToken, setUsername }) {
const [showRegister, setShowRegister] = useState(false);
const [prefilledUsername, setPrefilledUsername] = useState('');
const navigate = useNavigate();

const handleLogin = (newToken, usernameFromForm) => {
setToken(newToken);
setUsername(usernameFromForm);
navigate('/spectateur');
};

const handleRegistered = (username) => {
setPrefilledUsername(username);
setShowRegister(false);
};

return (
<div className="app-container">
<div style={{ width: '100%', maxWidth: '480px' }}>
<div className="hero" style={{ marginBottom: '1.5rem' }}>



</div>

    <div className="card">
      <div className="tabs">
        <button
          className={!showRegister ? 'tab active' : 'tab'}
          type="button"
          onClick={() => setShowRegister(false)}
        >
          Connexion
        </button>
        <button
          className={showRegister ? 'tab active' : 'tab'}
          type="button"
          onClick={() => setShowRegister(true)}
        >
          Inscription
        </button>
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