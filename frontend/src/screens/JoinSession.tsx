import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { v4 as uuidv4 } from 'uuid';

function JoinSession() {
    const [input , setInput] = useState('')

    const navigate = useNavigate()

    function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        console.log('submit')
        //create session where the current guest is the admin
        navigate(`/lobby/${input}`)
        
    }

    return( 
        <div className="font-serif flex flex-col gap-10">
            <h1> Join Session </h1>
            <div className="flex gap-4 items-center">
                <form onSubmit={handleSubmit}>
                    <div className="flex mb-4 gap-2"> 
                        <input value={input} onChange={(e) => setInput(e.target.value)} className="border-2 border-slate-600 rounded-md px-2" type="text" placeholder="Session ID" />
                    </div>
                    <button className="bg-slate-600 text-white rounded-md"> Join </button>
                </form> 
            </div>
    
        </div>
    
      )
}

export default JoinSession