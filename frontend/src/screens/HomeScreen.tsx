import { useNavigate } from 'react-router-dom'

function HomeScreen() {
    const navigate = useNavigate();

    return (
        <div className="flex flex-col gap-10 font-serif"> 
            <h1>Schelling Quest</h1>
            <p> Welcome!</p>
            <div className="flex flex-row gap-4"> 
                <button onClick={() => navigate('/create')}> Create a Session </button>
                <button onClick={() => navigate('/join')} > Join a Session </button>
            </div>
        </div> 
    )
}

export default HomeScreen