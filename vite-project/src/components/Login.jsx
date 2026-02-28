import React, { useState, useEffect } from 'react';

function Login({ onLogin, prefilledUsername = '' }) {
  const [username, setUsername] = useState(prefilledUsername);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setUsername(prefilledUsername);
  }, [prefilledUsername]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      if (onLogin) {
        await onLogin(username, password);
      }
    } catch (err) {
      setError(err.message || 'Erreur de connexion');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{ marginBottom: '1.2rem' }}>Connexion CiblOrgaSport</h2>
      {error && <p className="text-error">{error}</p>}

      <div className="form-group">
        <label>Nom d&apos;utilisateur</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Ex : suzanne, leon, arthur..."
        />
      </div>

      <div className="form-group">
        <label>Mot de passe</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Votre mot de passe"
        />
      </div>

      <button type="submit" className="btn-primary">
        Se connecter
      </button>
    </form>
  );
}

export default Login;
