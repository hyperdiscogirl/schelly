import { useState, useEffect, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { SessionState, Player, GameSettings, Sacrifice } from '../../sharedTypes';

const SOCKET_SERVER_URL = 'http://localhost:3000';

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [sessionData, setSessionData] = useState<any>(null);

  useEffect(() => {
    const newSocket = io(SOCKET_SERVER_URL, {
      withCredentials: true,
    });

    newSocket.on('connect', () => {
      setIsConnected(true);
    });

    newSocket.on('disconnect', () => {
      setIsConnected(false);
    });

    newSocket.on('sessionUpdate', (updatedData: any) => {
      setSessionData(prevData => ({...prevData, ...updatedData}));
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  const createSession = useCallback((data: { teamName: string; playerId: string; playerName: string }) => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('No socket connection'));
        return;
      }

      socket.emit('createSession', data, (response: any) => {
        setSessionData(response);
        resolve(response);
      });
    });
  }, [socket]);

  const joinSession = useCallback((data: { sessionId: string; playerId: string; playerName: string }) => {
    return new Promise((resolve, reject) => {
      if (!socket) {
        reject(new Error('No socket connection'));
        return;
      }

      socket.emit('joinSession', data, (response: any) => {
        setSessionData(response);
        resolve(response);
      });
    });
  }, [socket]);


  //leavnig this in case we need to use it to update manually, but updates should now be handled automaticaaly
  const updateSessionData = useCallback((newData: any, sessionId: string) => {
    setSessionData(prevData => {
      const updatedData = {...prevData, ...newData};
      console.log('Updating session data:', updatedData);
      localStorage.setItem(`sessionData_${sessionId}`, JSON.stringify(updatedData));
      return updatedData;
    });
  }, []);

  return {
    socket,
    isConnected,
    createSession,
    joinSession,
    sessionData,
    updateSessionData
  };
};