import { useNavigate } from 'react-router-dom'
import { useSocket } from '../useSocket';
import { useEffect } from 'react';

function Lobby() {
    const isAdmin = true
    //logic for this later
    const sessionId = localStorage.getItem('sessionId')
    const navigate = useNavigate()
    const {sessionData, isConnected, startSession} = useSocket()

    useEffect(() => {
        console.log('sessionData changed:', sessionData);
        if (sessionData?.completed) {
          console.log('Session completed, navigating to end screen');
          navigate(`/end/${sessionId}`);
        }
      }, [sessionData, navigate, sessionId]);

    function handleClick() {
        console.log('start session')
        //emit an event that sets the session started to true
        navigate(`/session/${sessionId}`)
        //this navigation will probably happen in the socket.io event
        
    }

return(
    <div className="font-serif flex flex-col gap-10">
      <h1> Lobby </h1>
      <p> Welcome! Waiting for the creator to start the game. </p>
      <p> There are 1 players here. </p>

      <div> Invite Link:  </div>
      <div> localhost:3000/session/{sessionData.sessionId} </div>

      {isAdmin && <button onClick={handleClick}> Start Session </button>}
      
    </div>
  )
}

export default Lobby