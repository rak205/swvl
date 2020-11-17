/* global google */
import React, { useState, useEffect } from 'react';
import { GoogleMap, withScriptjs, withGoogleMap, DirectionsRenderer } from 'react-google-maps';
import * as stations from '../data/routes.json';

const GMap = () => {
    const [directions, setDirections] = useState(null);

    useEffect(() => {

        const directionsService = new google.maps.DirectionsService();
        const origin = {
            lat: stations.data[0].station_latitude,
            lng: stations.data[0].station_longitude
        };
        const destination = {
            lat: stations.data[stations.data.length - 1].station_latitude,
            lng: stations.data[stations.data.length - 1].station_longitude
        };

        const waypoints = stations.data.map((station) => {
            return {
                location: new window.google.maps.LatLng(station.station_latitude, station.station_longitude),
                stopover: true,
            }
        }) //.slice(1, stations.data.length - 2) // skipping first and last station through 'slice'

        directionsService.route(
            {
                origin: origin,
                destination: destination,
                waypoints: waypoints,
                travelMode: window.google.maps.TravelMode.DRIVING
            },
            (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    setDirections(result);
                    console.log(result, 'success')
                } else {
                    console.log(result, 'error')
                    console.error(`error fetching directions ${result}`);
                }
            }
        );

    }, []);

    const Icon = () => {
        return <img src={process.env.PUBLIC_URL + '/swvl-icon.png'} />
    }

    const Map = () => {
       // console.log(directions.routes[0].legs[0], "billa")
        return (
            <GoogleMap
                defaultZoom={10}
                defaultCenter={{ lat: 30.0409879, lng: 31.34613896 }}
            >
                <DirectionsRenderer
                    directions={directions}
                    options={{
                        polylineOptions: {
                          stokeColor: "#FF0000",
                          strokeOpacity: 0.5,
                          strokeWeight: 4
                        },
                        markerOptions: { icon: '' },
                        icon: { scale: 1 }
                      }}
                />
            </GoogleMap>
        )
    }

    const WrappedMap = withScriptjs(withGoogleMap(Map))

    return (
        <div style={{ width: '100%', height: '600px' }}>
            <WrappedMap
                googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=${process.env.REACT_APP_GOOGLE_KEY}`}
                loadingElement={<div style={{ height: `100%` }} />}
                containerElement={<div style={{ height: `100%` }} />}
                mapElement={<div style={{ height: `100%` }} />}
            />
        </div>
    )
}

export default GMap