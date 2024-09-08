import { Routes, Route, BrowserRouter as Router } from 'react-router-dom'
import HomeScreen from './screens/HomeScreen'
import JoinSession from './screens/JoinSession'
import CreateSession from './screens/CreateSession'
import Lobby from './screens/Lobby'
import ActiveSession from './screens/ActiveSession'
import EndScreen from './screens/EndScreen'
import { useSocket } from './useSocket'

import './App.css'

function App() {
  const { sessionData, error, loading, connectSocket, joinSession, createSession, startSession, startSessionFlag, socket, makeChoice } = useSocket()

  return (
    <Router> 
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/join" element={<JoinSession joinSession={joinSession} />} />
        <Route path="/session/:sessionId" element={<ActiveSession sessionData={sessionData} socket={socket} connectSocket={connectSocket} makeChoice={makeChoice} />} />
        <Route path="/create" element={<CreateSession createSession={createSession} error={error} loading={loading} sessionData={sessionData} />} />
        <Route path="/lobby/:sessionId" element={<Lobby sessionData={sessionData} error={error} loading={loading} connectSocket={connectSocket} socket={socket} startSession={startSession} startSessionFlag={startSessionFlag} />} />
        <Route path="/end" element={<EndScreen />} />
      </Routes>
    </Router>
  )
}

export default App
