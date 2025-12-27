import React, { useMemo, useCallback, useState, useEffect } from 'react';
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from '@react-google-maps/api';

const containerStyle = {
    width: '100%',
    height: '24rem', // h-96 equivalent
    borderRadius: '0.5rem'
};

const defaultCenter = {
    lat: 40.7128,
    lng: -74.0060
};

const MapComponent = ({ shops, userLocation }) => {
    const { isLoaded } = useJsApiLoader({
        id: 'google-map-script',
        googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY
    });

    const [map, setMap] = useState(null);
    const [selectedShop, setSelectedShop] = useState(null);

    const center = useMemo(() => {
        return userLocation
            ? { lat: userLocation.latitude, lng: userLocation.longitude }
            : defaultCenter;
    }, [userLocation]);

    const onLoad = useCallback(function callback(map) {
        setMap(map);
    }, []);

    const onUnmount = useCallback(function callback(map) {
        setMap(null);
    }, []);

    useEffect(() => {
        if (map && center) {
            map.panTo(center);
        }
    }, [map, center]);

    if (!isLoaded) {
        return <div className="h-96 w-full rounded-lg bg-gray-200 animate-pulse flex items-center justify-center">Loading Map...</div>;
    }

    return (
        <div className="h-96 w-full rounded-lg shadow-md z-0 overflow-hidden">
            <GoogleMap
                mapContainerStyle={containerStyle}
                center={center}
                zoom={13}
                onLoad={onLoad}
                onUnmount={onUnmount}
                options={{
                    scrollwheel: false,
                    streetViewControl: false,
                    mapTypeControl: false,
                }}
            >
                {/* User Location Marker */}
                {userLocation && (
                    <Marker
                        position={{ lat: userLocation.latitude, lng: userLocation.longitude }}
                        title="You are here"
                        icon={{
                            url: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png"
                        }}
                    />
                )}

                {/* Shop Markers */}
                {shops.map((shop) => (
                    <Marker
                        key={shop.id}
                        position={{ lat: shop.latitude, lng: shop.longitude }}
                        onClick={() => setSelectedShop(shop)}
                        title={shop.name}
                    />
                ))}

                {selectedShop && (
                    <InfoWindow
                        position={{ lat: selectedShop.latitude, lng: selectedShop.longitude }}
                        onCloseClick={() => setSelectedShop(null)}
                    >
                        <div className="text-center p-2">
                            <h3 className="font-bold text-gray-900">{selectedShop.name}</h3>
                            <p className="text-sm text-gray-600 mb-2">{selectedShop.category?.name}</p>
                            <a href={`/shops/${selectedShop.id}`} className="text-indigo-600 text-xs font-semibold hover:underline">
                                View Details
                            </a>
                        </div>
                    </InfoWindow>
                )}
            </GoogleMap>
        </div>
    );
};

export default React.memo(MapComponent);
