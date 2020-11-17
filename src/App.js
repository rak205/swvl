import React from 'react';
import Header from './components/Header';
import GMap from './components/Map'

function App() {
  return (
    <div className='app'>
      <Header />
      <div className='app__body' >
        <GMap />
      </div>
     
    </div>
  )
}

export default App;