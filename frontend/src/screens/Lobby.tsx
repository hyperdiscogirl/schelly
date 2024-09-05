import React, { useEffect, useState } from 'react';
import { useSocket } from '../useSocket';
import { useParams, useNavigate } from 'react-router-dom';


function Lobby({ sessionData, error, loading, connectSocket }) {
    const isAdmin = true; // TODO: Implement logic to determine if user is admin
    const { sessionId } = useParams<{ sessionId: string }>();
    const navigate = useNavigate();
    const [localLoading, setLocalLoading] = useState(true);

    useEffect(() => {
        console.log('Lobby: sessionData updated', sessionData);
      }, [sessionData]);

    // useEffect(() => {
    //     if (sessionId) {
    //         console.log(`Lobby: Connecting to session ${sessionId}`);
    //         const playerId = localStorage.getItem('playerId');
    //         const playerName = localStorage.getItem('playerName');
    //         connectSocket(sessionId, );
    //     } else {
    //         console.error('Lobby: No sessionId available');
    //         navigate('/'); // Redirect to home or create session page
    //     }
    // }, [sessionId, connectSocket, navigate]);

    useEffect(() => {
        if (sessionData) {
            setLocalLoading(false);
        }
    }, [sessionData]);

    if (loading || localLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!sessionData) return <div>No session data available. Please try rejoining the session.</div>;


    function handleClick() {
        console.log('start session')
        }
    

    return (
        <div className="font-serif flex flex-col gap-10">
            <h1>Lobby</h1>
            <p>Welcome! Waiting for the creator to start the game.</p>
            <p>There are {sessionData.players?.length} players here.</p>
            <p> they are {sessionData.players?.map(player => player.name).join(', ')} </p>

            <div>Invite Link:</div>
            <div>localhost:3000/session/{sessionData.sessionId}</div>

            {isAdmin && <button onClick={handleClick}>Start Session</button>}
        </div>
    );
}

export default Lobby;