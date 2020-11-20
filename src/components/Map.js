/*global google*/
import React from 'react';
import { withGoogleMap, withScriptjs, GoogleMap, DirectionsRenderer, Marker } from 'react-google-maps';
import * as stations from '../data/routes.json';
import { Row, Button } from 'react-bootstrap';
import Context from '../store/context';

class Map extends React.Component {
    static contextType = Context;
    constructor(props) {
        super(props);
        this.state = {
            busPosition: {
                lat: stations.data[0].station_latitude,
                lng: stations.data[0].station_longitude
            },
            count: 0,
            districtCount: 0,
            interval: null,
            disabled: false,
            path: [],
            busStops: stations.data.slice(1, -1).map((station) => {
                return {
                    lat: station.station_latitude,
                    lng: station.station_longitude
                }
            }),
            nextBusStop: 2,
            directions: null
        }
    }

    findandSetBusStops = () => {
        this.context.globalDispatch({
            type: "DISTRICT",
            start_district: this.state.districts[0],
            end_district: this.state.districts[1],
        });
        const busStopIds = this.state.busStops.map((busStop) => {
            return this.state.path.map((pathCoordinates) => {
                return {
                    id: pathCoordinates.id,
                    lat: pathCoordinates.lat,
                    lng: pathCoordinates.lng,
                    distance: this.getDistance(pathCoordinates, busStop)
                }
            }).reduce((p, c) => p.distance < c.distance ? p : c);
        }).map((busStop) => {
            return busStop.id
        });
        const pathWithBusStops = this.state.path.map((pathCoordinates) => {
            return {
                id: pathCoordinates.id,
                lat: pathCoordinates.lat,
                lng: pathCoordinates.lng,
                stop: (busStopIds.includes(pathCoordinates.id)) ? true : false
            }
        });
        this.setState({ ...this.state, path: pathWithBusStops });
    };

    getDistance = (pointA, pointB) => {
        const distance = this.state.busStops.length && window.google.maps.geometry.spherical.computeDistanceBetween(
            new window.google.maps.LatLng(pointA.lat, pointA.lng),
            new window.google.maps.LatLng(pointB.lat, pointB.lng)
        )
        return distance;
    }

    startBus = () => {
        this.setState({
            ...this.state,
            disabled: true,
            count: this.state.count + 1,
            districtCount: this.state.districtCount + 1
        });
        this.interval = setInterval(this.animateBus, 200);
    };

    stopBus = () => {
        window.clearInterval(this.interval);
        setTimeout(this.startBus, 5000); // start the bus after 5 seconds
        this.context.globalDispatch({ type: "UPDATE_PASSENGERS", busStop: this.state.nextBusStop })
        this.setState({ ...this.state, nextBusStop: this.state.nextBusStop + 1 });
        this.context.globalDispatch({
            type: "DISTRICT",
            start_district: this.state.districts[this.state.districtCount],
            end_district: this.state.districts[this.state.districtCount + 1],
        });
    };

    animateBus = () => {
        if (this.state.count >= this.state.path.length) {
            localStorage.setItem('location', JSON.stringify(this.state.path[this.state.count - 1]));
            window.clearInterval(this.interval);
            this.context.globalDispatch({ type: "UPDATE_PASSENGERS", busStop: this.state.nextBusStop });
            return;
        }

        if (this.state.path[this.state.count].stop) {
            this.stopBus();
        }

        this.state.path.length && this.setState({
            ...this.state,
            busPosition: this.state.path[this.state.count],
            count: this.state.count + 1
        })
    };

    calculateTotalDistance = (result) => {
        const totalDistance = result.routes[0].legs.map((leg) => {
            return leg.distance.value
        }).reduce((a, b) => a + b);
        return totalDistance / 1000;
    }

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
                this.context.globalDispatch({ type: "DISTANCE", value: this.calculateTotalDistance(result) });
                if (status === window.google.maps.DirectionsStatus.OK) {
                    this.setState({
                        ...this.state,
                        directions: result,
                        path: result.routes[0].overview_path.map((station, index) => {
                            return {
                                id: index,
                                lat: station.lat(),
                                lng: station.lng()
                            }
                        }),
                        districts: result.routes[0].legs.map((leg) => {
                            return leg.end_address
                        })
                    }, this.findandSetBusStops);
                } else {
                    console.error(`error fetching directions ${result}`);
                }
            }
        );
    };

    render = () => {
        return (
            <>
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
                                    scale: 2,
                                    strokeWeight: 4,

                                }
                            },
                        }}
                    />
                    <Marker
                        position={(localStorage.getItem('location')) ? JSON.parse(localStorage.getItem('location')) : this.state.busPosition}
                        icon={new google.maps.MarkerImage('https://maps.gstatic.com/mapfiles/transit/iw2/6/bus.png')}
                    />
                </GoogleMap>
                <Button
                    style={{ display: 'block', margin: '10px auto' }}
                    onClick={this.startBus}
                    disabled={(localStorage.getItem('location')) ? true : this.state.disabled}
                    variant="primary"
                >
                    Start Ride
                </Button>
            </>
        )
    }
}

const WrappedMap = withScriptjs(withGoogleMap(Map))

export default () => (
    <Row>
        <div style={{ width: '100%', height: '350px' }}>
            <WrappedMap
                googleMapURL={`https://maps.googleapis.com/maps/api/js?v=3.exp&libraries=geometry,drawing,places&key=${process.env.REACT_APP_GOOGLE_KEY}`}
                loadingElement={<div style={{ height: `100%` }} />}
                containerElement={<div style={{ height: `100%` }} />}
                mapElement={<div style={{ height: `100%` }} />}
            />
        </div>
    </Row>
)