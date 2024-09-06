import { useParams } from "react-router-dom";
import {useEffect} from 'react'

function ActiveSession({sessionData, connectSocket, socket}) {
    const { sessionId } = useParams<{ sessionId: string }>();

    if (!socket){
        console.log('no socket connection, calling connectSocket')
        connectSocket(sessionId)
    } 

    useEffect(() => { 
        console.log('sessiondata changed in ActiveSession:', sessionData)
    }, [sessionData])

    const options = sessionData?.sacrifices?.[0]?.rounds?.[0]?.options || [];

    return(
      <div className="flex flex-col gap-4"> 
        <div>This is Where the Magic Happens</div>
        {options.map((option, index) => (
            <button key={index} onClick={() => console.log('clicked option:', option)}>{option.emoji} {option.str}</button>
            ))}

        Players here: {sessionData?.players?.map(player => player.name).join(', ')}
      </div>
    )
  }

export default ActiveSession