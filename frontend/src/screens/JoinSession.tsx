import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid';
import { useSocket } from '../useSocket';

function JoinSession({joinSession}) {
    const [playerName, setPlayerName] = useState('')
    const [sessionId, setSessionId] = useState('')

    const navigate = useNavigate()

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        console.log('attempting to join session')
        
      
          const playerId = uuidv4();
          sessionStorage.setItem('playerId', playerId);
          sessionStorage.setItem('playerName', playerName);
          
          try {
            const sessionState = await joinSession({
              sessionId: sessionId,
              playerId: playerId,
              playerName: playerName
          });
            console.log('joined session:', sessionState);
            navigate(`/lobby/${sessionId}`);
          } catch (error) {
            console.error('Error joining session:', error);
          }
        
    }

    return( 
        <div className="font-serif flex flex-col gap-10">
            <h1> Join Session </h1>
            <div className="flex gap-4 items-center">
                <form onSubmit={handleSubmit}>
                    <div className="flex mb-4 gap-2"> 
                        <input value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="border-2 border-slate-600 rounded-md px-2 " type="text" placeholder="Player Name" />
                        <input value={sessionId} onChange={(e) => setSessionId(e.target.value)} className="border-2 border-slate-600 rounded-md px-2" type="text" placeholder="Session ID" />
                    </div>
                    <button className="bg-slate-600 text-white rounded-md"> Join </button>
                </form> 
            </div>
    
        </div>
    
      )
}

export default JoinSession