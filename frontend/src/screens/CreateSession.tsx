import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';

function CreateSession({createSession, error, loading, sessionData}: any) {
  const [groupName, setGroupName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [sessionId, setSessionId] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (sessionData && sessionId) {
      navigate(`/lobby/${sessionId}`);
    }
  }, [sessionData, sessionId, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (groupName.trim() && playerName.trim()) {
      const playerId = uuidv4();
      const newSessionId = uuidv4();
      try {
        await createSession({
          teamName: groupName,
          playerId: playerId,
          playerName: playerName,
          sessionId: newSessionId
        });

        sessionStorage.setItem('playerId', playerId);
        sessionStorage.setItem('playerName', playerName);
        setSessionId(newSessionId);

      } catch (error) {
        console.error('Error creating session:', error);
      }
    }
  };

  if (loading) return <div>Creating session...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="font-serif flex flex-col gap-10">
      <h1>Create Session</h1>
      <div className="flex gap-4 items-center">
        <form onSubmit={handleSubmit}>
          <div className="flex mb-4 gap-2">
            <p>Player Name</p>
            <input
              value={playerName}
              onChange={(e) => setPlayerName(e.target.value)}
              className="border-2 border-slate-600 rounded-md px-2"
              type="text"
              placeholder="Enter your Name"
              required
            />
            <p>Group Name</p>
            <input
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="border-2 border-slate-600 rounded-md px-2"
              type="text"
              placeholder="Enter Group Name"
              required
            />
          </div>
          <button className="bg-slate-600 text-white rounded-md" type="submit">Create</button>
        </form>
      </div>
    </div>
  );
}

export default CreateSession;