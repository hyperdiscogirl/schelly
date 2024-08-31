import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid';
import { useSocket } from '../useSocket';


function CreateSession() {
  const [groupName, setGroupName] = useState('')
  const [playerName, setPlayerName] = useState('')
  const navigate = useNavigate()
  const { createSession, isConnected} = useSocket()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!isConnected) {
      console.error('Socket is not connected');
      return;
    }

    const playerId = uuidv4();
    
    try {
      const sessionState = await createSession({
        teamName: groupName,
        playerId: playerId,
        playerName: playerName
      });
      console.log('Session created:', sessionState);
      localStorage.setItem('sessionId', sessionState.sessionId);
      navigate(`/lobby/${sessionState.sessionId}`);
    } catch (error) {
      console.error('Error creating session:', error);
    }
  } 

  return( 
    <div className="font-serif flex flex-col gap-10">
        <h1> Create Session </h1>
        <div className="flex gap-4 items-center">
            <form onSubmit={handleSubmit}>
                <div className="flex mb-4 gap-2"> 
                    <p> Player Name </p>
                    <input value={playerName} onChange={(e) => setPlayerName(e.target.value)} className="border-2 border-slate-600 rounded-md px-2" type="text" placeholder="Enter your Name" />
                    <p> Group Name </p>
                    <input value={groupName} onChange={(e) => setGroupName(e.target.value)} className="border-2 border-slate-600 rounded-md px-2" type="text" placeholder="Enter Group Name" />
                </div>
                <button className="bg-slate-600 text-white rounded-md"> Create </button>
            </form> 
        </div>

    </div>

  )

}

export default CreateSession