import React, { useEffect, useState } from 'react';
import { useSocket } from '../useSocket';
import { useParams, useNavigate } from 'react-router-dom';
import { Player } from '../../../sharedTypes';
import {Link } from 'lucide-react'


function Lobby({ sessionData, error, loading, connectSocket, socket, startSession, startSessionFlag }) {
    const playerId = sessionStorage.getItem('playerId');
    const isAdmin = sessionData?.admin?.id === playerId;
    const [showCopied, setShowCopied] = useState(false);
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

    if (!socket){
        console.log('no socket connection, calling connectSocket')
        connectSocket(sessionId)
    }

    if (startSessionFlag){
        navigate(`/session/${sessionId}`)
    }
    
    useEffect(() => {
        if (sessionData) {
            setLocalLoading(false);
        }
    }, [sessionData]);

    if (loading || localLoading) return <div>Loading...</div>;
    if (error) return <div>Error: {error}</div>;
    if (!sessionData) return <div>No session data available. Please try rejoining the session.</div>;


    function handleClick() {
        console.log('starting session from lobby')
        startSession(sessionId)
        }    

    function handleCopy() {
        navigator.clipboard.writeText(sessionData.sessionId)
        setShowCopied(true)
        setTimeout(() => {
            setShowCopied(false)
        }, 1000)
    }

    return (
        <div className="font-serif flex flex-col gap-10">
            <h1>Lobby</h1>
            <a href="/"> home </a>
            <p>Welcome! Waiting for the creator to start the game.</p>
            <p>There are {sessionData.players?.length} players here.</p>
            <p> they are {sessionData.players?.map((player: Player) => player.name).join(', ')} </p>

            <div className="flex flex-col gap-3">
                <div> Invite Code: </div> 
                <div className="flex gap-2 items-center ">
                    <div> {sessionData.sessionId} </div>
                    <button className="bg-white flex gap-2 justify-center relative" onClick={handleCopy}>
                        <Link />
                        {showCopied && (
                            <div className="absolute top-0 left-24 right-0 bottom-0 flex items-center justify-center">
                                <div className="px-2 py-1 rounded transition-opacity duration-300 fade-in-out">
                                    Copied!
                                </div>
                            </div>
                        )}
                    </button>
                </div>
            </div> 

            {isAdmin && <button onClick={handleClick}>Start Session</button>}
        </div>
    );
}

export default Lobby;