import { useCallback, useState } from "react";

export function useGeolocation() {

    const [location, setLocation] = useState(null)
    const [loading, setLoading] = useState(null)
    const [error, setError] = useState(null)

    const getLocation = useCallback(async () => {
        setLoading(true);
        setError(null);
        try {
            if (!navigator.geolocation) {
                setError("Geolocalization n'est pas supporté");
                setLocation({
                    latitude: 0.0,
                    longitude: 0.0,
                    altitude: 0.0
                });
                setLoading(false);
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    setLocation({
                        latitude: pos.coords.latitude,
                        longitude: pos.coords.longitude,
                        altitude: pos.coords.altitude
                    });
                    setLoading(false);
                },
                (err) => {
                    setError(err.message);
                    setLocation({
                        latitude: 0.0,
                        longitude: 0.0,
                        altitude: 0.0
                    });
                    setLoading(false);
                }
            );
        } catch (e) {
            setError(e.message);
            setLocation({
                latitude: 0.0,
                longitude: 0.0,
                altitude: 0.0
            });
            setLoading(false);
        }
    }, []);

    return {
        location,
        loading,
        error,
        getLocation
    }
}