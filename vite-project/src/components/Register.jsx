import React, { useState } from 'react';
import { register } from '../services/authService';

function Register({ onRegistered }) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    try {
      await register(username, password);
      setMessage('Compte créé, vous pouvez vous connecter.');
      if (onRegistered) {
        onRegistered(username);
      }
    } catch (err) {
      setError(err.message || 'Erreur lors de la création du compte');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2 style={{ marginBottom: '1.2rem' }}>Créer un compte</h2>
      {error && <p className="text-error">{error}</p>}
      {message && <p className="text-success">{message}</p>}

      <div className="form-group">
        <label>Nom d&apos;utilisateur</label>
        <input
          type="text"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          placeholder="Choisissez un identifiant"
        />
      </div>

      <div className="form-group">
        <label>Mot de passe</label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Choisissez un mot de passe"
        />
      </div>

      <button type="submit" className="btn-primary">
        S&apos;inscrire
      </button>
    </form>
  );
}

export default Register;
