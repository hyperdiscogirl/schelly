import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import { useSocket } from '../useSocket';

function CreateSession() {
  const [groupName, setGroupName] = useState('');
  const [playerName, setPlayerName] = useState('');
  const navigate = useNavigate();
  const { createSession, error, loading } = useSocket();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupName.trim() && playerName.trim()) {
      const playerId = uuidv4();
      createSession({
        teamName: groupName,
        playerId: playerId,
        playerName: playerName
      });
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