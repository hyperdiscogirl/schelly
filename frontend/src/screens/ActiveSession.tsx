import { useParams } from "react-router-dom";
import {useEffect, useState} from 'react'
import { Socket } from "socket.io-client";
import { SessionState, Option } from "../../../sharedTypes";

function EmojiOptions({options, areClickable, handleClick, clicked}: {options: Option[], areClickable: boolean | undefined, handleClick: (option: Option) => void, clicked: string}) {
    return (
        <div>
        {options.map((option, index) => (
            <button 
                className={`${clicked === option.str ? 'bg-slate-600 text-white rounded-md' : 'bg-slate-200 text-slate-600 rounded-md'}`} 
                key={index} 
                onClick={areClickable ? () => handleClick(option) : () => {}}>
                    {option.emoji} {option.str}
            </button>
            ))}
            </div>

    )
}


function ActiveSession({sessionData, connectSocket, makeChoice, socket}:
    {sessionData: SessionState | null, 
        makeChoice: (data: {playerId: string, playerName: string, option: Option, sessionId: string}) => void, 
        connectSocket: (sessionId: string | undefined) => void, socket: Socket | null}) {
    const { sessionId } = useParams<{sessionId: string }>();
    const playerId = sessionStorage.getItem('playerId') as string;
    const playerName = sessionStorage.getItem('playerName') as string;
    const [clicked, setClicked] = useState("");

    if (!socket){
        console.log('no socket connection, calling connectSocket')
        connectSocket(sessionId)
    } 

    useEffect(() => { 
        console.log('sessiondata changed in ActiveSession:', sessionData)
    }, [sessionData])

    const latestSacrifice = sessionData?.sacrifices?.slice(-1)[0];
    const latestRound = latestSacrifice?.rounds?.slice(-1)[0];
    const options = latestRound?.options || [];
    console.log('options:', options)
    const displayOptions = sessionData?.roundStatus?.isOngoing ? options : Array.from(new Set(latestRound?.choices?.map(choice => choice.option)))

    const handleClick = (option: Option) => {
        console.log('clicked option:', option)
        makeChoice({playerId: playerId, playerName: playerName, option: option, sessionId: sessionId as string})
        setClicked(option.str)
    }

    if (!sessionData) return <div>Loading...</div>

    return(
      <div className="flex flex-col gap-4"> 
        <div>This is Where the Magic Happens</div>
        {sessionData.roundStatus?.isOngoing && <div> ROUND ONGOING! </div>}
        {!sessionData.roundStatus?.isOngoing && sessionData.roundStatus?.wasWin && <div> WE WON THIS ROUND!  </div>}
        {!sessionData.roundStatus?.isOngoing && !sessionData.roundStatus?.wasWin && <div> WE LOST! TRYING AGAIN </div>}
        <div> GO {(sessionData.teamName).toUpperCase()} </div>
        <EmojiOptions 
            options={displayOptions}
            areClickable={sessionData.roundStatus?.isOngoing} 
            handleClick={handleClick} clicked={clicked} />
        
        

        Players here: {sessionData?.players?.map(player => player.name).join(', ')}
      </div>
    )
  }

export default ActiveSession