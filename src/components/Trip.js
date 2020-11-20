import { Row, Col, Image } from 'react-bootstrap';
import { Star, GeoFill, Cash, AlignTop, AlignBottom } from 'react-bootstrap-icons';

function Trip() {

    return (
        <>
            <Row style={{ marginTop: '55px' }}><Col><h4> Trip Information </h4></Col></Row>
            <Row className='mb-4'>
                <Col xs={12} sm={6} md={4} lg={4} className={'my-2'} >
                    <Row className="align-items-center" noGutters={true}>
                        <Col xs={4} className="d-flex justify-content-center"  >
                            <Image height={40} width={40} src={'https://scontent.flhe5-1.fna.fbcdn.net/v/t1.0-9/18952690_10158883336135066_2371335870660754228_n.jpg?_nc_cat=106&ccb=2&_nc_sid=a4a2d7&_nc_eui2=AeHajk9cM4z6ZLVy_EJsoXzlHNW_FmQ5_vcc1b8WZDn-92GBNmjBKlIKrfmAJVjqz0BO5Yp9JT1licES20opuLzK&_nc_ohc=btBJTdUHfUoAX-YOunC&_nc_ht=scontent.flhe5-1.fna&oh=7175f618fc8a9e76a440daa46906942f&oe=5FDB1208'} roundedCircle />
                            <Image height={40} width={40} src={'https://i.pinimg.com/originals/a5/dd/dc/a5dddcd57650ff323b969a3cdf16e9ff.png'} roundedCircle />
                        </Col>
                        <Col xs={8}>
                            <Row style={{ fontSize: '14px' }} noGutters={true}><b>Haris Taufiq</b> <Star style={{ margin: '3px 3px' }} color="gray" size={14} /> <p style={{ color: "gray", fontSize: '14px', margin: '0px 0px' }}>4.8</p> </Row>
                            <Row style={{ fontSize: '12px', fontWeight: '500' }} noGutters={true}>Toyota Hiace - LE 202</Row>
                        </Col>
                    </Row>
                </Col>
                <Col xs={12} sm={6} md={4} lg={4} className={'px-5 my-2'}>
                    <Row>
                        <AlignTop style={{ margin: '3px 3px' }} size={16} />
                        <p style={{ fontSize: '13px', margin: '0px 0px', fontWeight: '500' }}>6th of October</p>
                    </Row>
                    <Row>
                        <AlignBottom style={{ margin: '3px 3px' }} size={16} />
                        <p style={{ fontSize: '13px', margin: '0px 0px', fontWeight: '500' }}>Mohandessin (Sphinx Square)</p>
                    </Row>
                </Col>
                <Col xs={12} sm={6} md={4} lg={4} className={'px-5 my-2'} >
                    <Row>
                        <GeoFill style={{ margin: '3px 3px' }} size={16} />
                        <p style={{ fontSize: '13px', margin: '0px 0px', fontWeight: '500' }}>Trip Distance: 47 km</p>
                    </Row>
                    <Row>
                        <Cash style={{ margin: '3px 3px' }} size={16} />
                        <p style={{ fontSize: '13px', margin: '0px 0px', fontWeight: '500' }}>Trip Base Fare: 50 PKR</p>
                    </Row>
                </Col>
            </Row>
        </>
    )
}

export default Trip