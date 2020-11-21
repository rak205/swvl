/*global google*/
import React from 'react';
import { withGoogleMap, withScriptjs, GoogleMap, DirectionsRenderer, Marker } from 'react-google-maps';
import * as stations from '../data/routes.json';
import * as user from '../data/user.json';
import { Row, Button, Col, Modal, Form } from 'react-bootstrap';
import Context from '../store/context';
import { RIDE_STATUS } from '../utils/constants';

class Map extends React.Component {
    static contextType = Context;
    constructor(props) {
        super(props);
        this.state = {
            user: user.default,
            busPosition: {
                lat: stations.data[0].station_latitude,
                lng: stations.data[0].station_longitude
            },
            count: 0,
            districtCount: 0,
            interval: null,
            start_button: false,
            book_button: false,
            path: [],
            busStops: stations.data.slice(1, -1).map((station) => {
                return {
                    lat: station.station_latitude,
                    lng: station.station_longitude
                }
            }),
            nextBusStop: 2,
            directions: null,
            bookRideModal: false,
            statsModal: false,
            formOriginStation: this.formOriginStation,
            formDestinationStation: this.formDestinationStation,
            payment: 'cash',
            warning: false,
            card: ''
        }
    }

    formOriginStation = [1, 2, 3, 4, 5, 6, 7, 8, 9];
    formDestinationStation = [2, 3, 4, 5, 6, 7, 8, 9, 10];

    bookRide = (e) => {
        e.preventDefault();
        if (this.validate()) {
            this.setState({
                ...this.state, modal: false, warning: false,
                payment: 'cash', book_button: true,
            });
            this.context.globalDispatch({
                type: "USER",
                user: this.state.user,
            });
        }
    };

    cardNumberChange = (event) => {
        this.setState({ ...this.state, card: event.target.value });
    }

    validate = () => {
        if ((this.state.payment === 'card')) {
            let pattern = new RegExp("[0-9]{16}|[0-9]{4}[- ][0-9]{4}[- ][0-9]{4}[- ][0-9]{4}");
            if (pattern.test(this.state.card)) {
                this.setState({ ...this.state, warning: false });
                return true;
            } else {
                this.setState({ ...this.state, warning: true });
                return false;
            }
        }
        return true;
    }

    paymentMethodChange = (e) => {
        this.setState({
            ...this.state,
            payment: e.target.value
        });
    };

    formOriginChange = (e) => {
        let number = parseInt(e.target.value);
        this.setState({
            ...this.state,
            user: {
                ...this.state.user,
                origin: number,
                status: (number > 1) ? RIDE_STATUS.BOOKED : RIDE_STATUS.CHECKED_IN
            },
            formDestinationStation: this.formDestinationStation.filter((data) => data > e.target.value)
        });
    };

    formDestinationChange = (e) => {
        let number = parseInt(e.target.value);
        this.setState({
            ...this.state,
            user: {
                ...this.state.user,
                destination: number
            },
            formOriginStation: this.formOriginStation.filter((data) => data < number)
        });
    }

    showModal = () => { this.setState({ ...this.state, modal: true }) };

    hideModal = () => { this.setState({ ...this.state, modal: false }) };

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
    };

    startBus = () => {
        this.setState({
            ...this.state,
            start_button: true,
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

    bookRideModal = () => {
        return (
            <Modal show={this.state.modal} onHide={this.hideModal} backdrop="static"
                keyboard={false} >
                <Form onSubmit={this.bookRide}>
                    <Modal.Header>
                        <Modal.Title>Book Ride</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Row>
                            <Form.Group as={Col} controlId="formOrigin" >
                                <Form.Label>Origin</Form.Label>
                                <Form.Control as="select" defaultValue={1} onChange={this.formOriginChange}>
                                    {this.state.formOriginStation.map((station) => {
                                        return <option key={station} value={station} >{station}</option>
                                    })}
                                </Form.Control>
                            </Form.Group>
                            <Form.Group as={Col} controlId="formDestination">
                                <Form.Label>Destination</Form.Label>
                                <Form.Control as="select" defaultValue={10} onChange={this.formDestinationChange}>
                                    {this.state.formDestinationStation.map((station) => {
                                        return <option key={station} value={station} >{station}</option>
                                    })}
                                </Form.Control>
                            </Form.Group>
                        </Form.Row>
                        <Form.Row>
                            <Form.Group as={Col} controlId="paymentMethod">
                                <Form.Label>Payment Method</Form.Label>
                                <Form.Control as="select" defaultValue={'cash'} onChange={this.paymentMethodChange}>
                                    <option value={'cash'}>Cash</option>
                                    <option value={'card'}>Card</option>
                                </Form.Control>
                            </Form.Group>
                        </Form.Row>
                        {(this.state.payment === 'card') && <Form.Row>
                            <Form.Group as={Col} controlId="formCard">
                                <Form.Label>Card</Form.Label>
                                <Form.Control required={true}
                                    placeholder="xxxx-xxxx-xxxx-xxxx"
                                    isInvalid={this.state.warning}
                                    isValid={this.state.success}
                                    maxLength="19"
                                    onChange={this.cardNumberChange}
                                />
                                <Form.Control.Feedback type="invalid">Card Number is not correct!</Form.Control.Feedback>
                            </Form.Group>
                        </Form.Row>}
                    </Modal.Body>
                    <Modal.Footer>
                        <Button onClick={this.hideModal} variant="secondary">Cancel</Button>
                        <Button type='submit' variant="primary">Book</Button>
                    </Modal.Footer>
                </Form>
            </Modal>
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
                <Row noGutters={true} className={'justify-content-center'}>
                    <Col xs={'auto'}>
                        <Button
                            style={{ margin: '10px 5px' }}
                            onClick={this.startBus}
                            disabled={(localStorage.getItem('location')) ? true : this.state.start_button}
                            variant="success"
                        >
                            Start Ride
                        </Button>
                        <Button
                            onClick={this.showModal}
                            style={{ margin: '10px 5px' }}
                            variant="primary"
                            disabled={this.state.book_button}
                        >
                            Book Ride
                    </Button>
                    </Col>
                </Row>
                <this.bookRideModal></this.bookRideModal>
            </>
        )
    }
};

const WrappedMap = withScriptjs(withGoogleMap(Map));

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