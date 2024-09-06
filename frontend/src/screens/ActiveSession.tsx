import { useParams } from "react-router-dom";
import {useEffect, useState} from 'react'
import { Socket } from "socket.io-client";
import { SessionState, Option } from "../../../sharedTypes";

function ActiveSession({sessionData, connectSocket, makeChoice, socket}: {sessionData: SessionState | null, connectSocket: (sessionId: string | undefined) => void, socket: Socket | null}) {
    const { sessionId } = useParams<{ sessionId: string }>();
    const playerId = localStorage.getItem('playerId');
    const playerName = localStorage.getItem('playerName');
    const [clicked, setClicked] = useState("");

    if (!socket){
        console.log('no socket connection, calling connectSocket')
        connectSocket(sessionId)
    } 

    useEffect(() => { 
        console.log('sessiondata changed in ActiveSession:', sessionData)
    }, [sessionData])

    const options = sessionData?.sacrifices?.[0]?.rounds?.[0]?.options || [];

    const handleClick = (option: Option) => {
        console.log('clicked option:', option)
        makeChoice({playerId: playerId, playerName: playerName, option: option})
        setClicked(option.str)
    }

    return(
      <div className="flex flex-col gap-4"> 
        <div>This is Where the Magic Happens</div>
        {options.map((option, index) => (
            <button className={`${clicked === option.str ? 'bg-slate-600 text-white rounded-md' : 'bg-slate-200 text-slate-600 rounded-md'}`} key={index} onClick={() => handleClick(option)}>{option.emoji} {option.str}</button>
            ))}

        Players here: {sessionData?.players?.map(player => player.name).join(', ')}
      </div>
    )
  }

export default ActiveSession