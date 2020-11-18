import React from 'react';
import Header from './components/Header';
import Map from './components/Map'

function App() {
  return (
    <div className='app'>
      <Header />
      <div className='app__body' >
        <Map />
      </div>
     
    </div>
  )
}

export default App;