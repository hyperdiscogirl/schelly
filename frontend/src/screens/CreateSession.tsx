import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid';


function CreateSession() {
  const [groupName, setGroupName] = useState('')
  const navigate = useNavigate()

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    console.log('submit')
    const playerId = uuidv4()
    //create session where the current guest is the admin
    //replace sessionID with gen on the backend later
    const sessionId = uuidv4()
    localStorage.setItem('sessionId', sessionId)
    navigate(`/lobby/${sessionId}`)
    
  }

  return( 
    <div className="font-serif flex flex-col gap-10">
        <h1> Create Session </h1>
        <div className="flex gap-4 items-center">
            <form onSubmit={handleSubmit}>
                <div className="flex mb-4 gap-2"> 
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