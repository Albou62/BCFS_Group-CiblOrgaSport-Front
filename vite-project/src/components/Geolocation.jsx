import React from 'react';
import { useGeolocation } from '../hooks/useGeolocation';

const Geolocation = () => {
    const { location, loading, error, getLocation } = useGeolocation();
    // TODO: FAIRE QUELQUE CHOSE QUE IMPORTE LES DONNÉES D'UTILISATEUR

    return (
        <div style={{ position: 'fixed', bottom: '10px', right: '10px', zIndex: 1000 }}>
            <button onClick={getLocation} disabled={loading}>
                {loading ? 'Recherche...' : 'Obtenir la géolocalisation'}
            </button>
            {error && <p style={{ color: 'red' }}>Erreur: {error}</p>}
            {location && (
                <div>
                    <p>Latitude: {location.latitude}</p>
                    <p>Longitude: {location.longitude}</p>
                    {location.altitude && <p>Altitude: {location.altitude}</p>}
                </div>
            )}
        </div>
    );
};

export default Geolocation;
