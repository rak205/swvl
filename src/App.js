import React from 'react';
import { Container } from 'react-bootstrap';
import Header from './components/Header';
import Map from './components/Map';
import Bookings from './components/Bookings';
import Trip from './components/Trip';

function App() {
  return (
    <Container fluid>
      <Header />
      <Map />
      <Trip />
      <Bookings />
    </Container>
  )
}

export default App;