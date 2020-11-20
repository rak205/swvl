import React from 'react';
import Header from './components/Header';
import Map from './components/Map';
import Bookings from './components/Bookings';
import { Container } from 'react-bootstrap';

function App() {
  return (
    <Container fluid >
      <div className='app'>
        <Header />
        <div className='app__body' >
          <Map />
          <Bookings />
        </div>
      </div>
    </Container>
  )
}

export default App;