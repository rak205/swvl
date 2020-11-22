import React, { useContext } from 'react';
import { Row, Col, Image } from 'react-bootstrap';
import Context from '../store/context';

function Bookings() {

    const { globalState } = useContext(Context);
    return (
        <>
            <Row ><Col><h4> Bookings </h4></Col></Row>
            <Row className='mb-4'>
                {globalState.users.map((user) => {
                    return (
                        <Col key={user.id} xs={12} sm={6} md={4} lg={3} className='my-2'>
                            <Row className="align-items-center" noGutters={true}>
                                <Col xs={3} className="d-flex justify-content-center"  >
                                    <Image height={40} width={40} src={user.pic} roundedCircle />
                                </Col>
                                <Col xs={9}>
                                    <Row style={{ fontSize: '14px' }} noGutters={true}><b>{user.name}</b></Row>
                                    <Row style={{ fontSize: '12px' }} noGutters={true}><b>Status:</b>{user.status}</Row>
                                    <Row style={{ fontSize: '12px' }} noGutters={true}><b>Origin:</b>{user.origin}</Row>
                                    <Row style={{ fontSize: '12px' }} noGutters={true}><b>Destination:</b>{user.destination}</Row>
                                </Col>
                            </Row>
                        </Col>
                    )
                })}
            </Row>
        </>
    )
}

export default Bookings;