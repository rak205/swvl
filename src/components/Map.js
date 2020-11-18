/*global google*/
import React from 'react';
import { withGoogleMap, withScriptjs, GoogleMap, DirectionsRenderer, Marker } from 'react-google-maps';
import * as stations from '../data/routes.json';
import { Button } from '@material-ui/core';

class Map extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            busPosition: {
                lat: stations.data[0].station_latitude,
                lng: stations.data[0].station_longitude
            },
            count: 1,
            interval: null,
            disabled: false,
            route: [],
            directions: null
        }
    }

    startBus = () => {
        this.setState({ ...this.state, disabled: true })
        this.interval = setInterval(this.animateBus, 500);
    };

    stopBus = () => {
        window.clearInterval(this.interval);
    };

    animateBus = () => {
        if (this.state.count >= this.state.route.length) {
            window.clearInterval(this.interval)
            return;
        }
        this.state.route.length && this.setState({
            ...this.state,
            busPosition: this.state.route[this.state.count],
            count: this.state.count + 1
        })
    };

    componentDidMount = () => {

        const directionsService = new window.google.maps.DirectionsService();

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
        });

        directionsService.route(
            {
                origin: origin,
                destination: destination,
                waypoints: waypoints,
                travelMode: window.google.maps.TravelMode.DRIVING
            },
            (result, status) => {
                if (status === window.google.maps.DirectionsStatus.OK) {
                    this.setState({
                        ...this.state,
                        directions: result,
                        route: result.routes[0].overview_path
                    });
                } else {
                    console.error(`error fetching directions ${result}`);
                }
            }
        );
    };

    render = () => {
        return (<>
            <GoogleMap
                defaultZoom={12}
                defaultCenter={{ lat: 30.0409879, lng: 31.34613896 }}
            >
                <DirectionsRenderer
                    directions={this.state.directions}
                    options={{
                        polylineOptions: {
                            strokeColor: '#ef0420',
                            strokeOpacity: 0.7,
                            strokeWeight: 3
                        },
                        markerOptions: {
                            icon: {
                                path: google.maps.SymbolPath.CIRCLE,
                                strokeColor: '#011740',
                                scale: 3,
                                strokeWeight: 6,

                            }
                        },
                    }}
                />
                <Marker
                    position={this.state.busPosition}
                    icon={new google.maps.MarkerImage('https://maps.gstatic.com/mapfiles/transit/iw2/6/bus.png')}
                />

            </GoogleMap>

            <Button
                style={{ display: 'block', margin: '5px auto' }}
                onClick={this.startBus}
                disabled={this.state.disabled}
                color="primary" variant="contained" size='small'
            >
                Start Ride
            </Button>
        </>
        )
    }
}

const WrappedMap = withScriptjs(withGoogleMap(Map))

export default () => (
    <div style={{ width: '100%', height: '500px' }}>
        <WrappedMap
            googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=${process.env.REACT_APP_GOOGLE_KEY}`}
            loadingElement={<div style={{ height: `100%` }} />}
            containerElement={<div style={{ height: `100%` }} />}
            mapElement={<div style={{ height: `100%` }} />}
        />
    </div>
)