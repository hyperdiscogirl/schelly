import { Routes, Route, BrowserRouter as Router } from 'react-router-dom'
import HomeScreen from './screens/HomeScreen'
import JoinSession from './screens/JoinSession'
import CreateSession from './screens/CreateSession'
import Lobby from './screens/Lobby'
import ActiveSession from './screens/ActiveSession'
import EndScreen from './screens/EndScreen'

import './App.css'

function App() {

  return (
    <Router> 
      <Routes>
        <Route path="/" element={<HomeScreen />} />
        <Route path="/join" element={<JoinSession />} />
        <Route path="/session/:sessionId" element={<ActiveSession />} />
        <Route path="/create" element={<CreateSession />} />
        <Route path="/lobby/:sessionId" element={<Lobby />} />
        <Route path="/end" element={<EndScreen />} />
      </Routes>
    </Router>
  )
}

export default App
