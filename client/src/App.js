import React, { useState, useEffect } from 'react';
import './App.css';
import Settings from './components/Settings';
import { socket } from './socket';

function App() {
  const [connection, setConnection] = useState(false)
  const [ports, setPorts] = useState([])

  useEffect(() => {
    socket.on('connect', () => {
      setConnection(true)
    })

    return () => {
      socket.off('connect')
    }
  }, [connection])

  useEffect(() => {
    socket.on('portPaths', (p) => {
      const updatePorts = p
      setPorts(updatePorts)
    })

    return () => {
      socket.off('portPaths')
    }
  }, [])

  return (
    <div className="App">
      <div className='status-indicator'>Socket Connection: {connection ? "connected" : "disconnected"}</div>
      <Settings
        portOptions={ports}
        ></Settings>
    </div>
  );
}

export default App;
