import { useCallback, useState } from "react";

export function useGeolocation() {

    const [location, setLocation] = useState(null)
    const [loading, setLoading] = useState(null)
    const [error, setError] = useState(null)

    const getLocation = useCallback(async () => {
        if(!navigator.geolocation) {
            setError("Geolocalization n'est pas supporté")
            return
        }
        setLoading(true)
        navigator.geolocation.getCurrentPosition((pos) => {
            setLocation({
                latitude: pos.coords.latitude,
                longitude: pos.coords.longitude,
                altitude: pos.coords.altitude
            })
            setLoading(false)
        }, (err) => {
            setError(err.message)
            setLoading(false)
        })
    }, [])

    return {
        location,
        loading,
        error,
        getLocation
    }
}