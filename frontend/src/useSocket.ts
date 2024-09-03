import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { SessionState, Player } from '../../sharedTypes';
import { useNavigate } from 'react-router-dom';

const SOCKET_URL = 'http://localhost:3000';

export function useSocket() {
    const [sessionData, setSessionData] = useState<SessionState | null>(null);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const socketRef = useRef<Socket | null>(null);
    const navigate = useNavigate();

    
    const updateSessionData = useCallback((newData: Partial<SessionState>) => {
      console.log('updateSessionData called with newData:', newData);
      setSessionData(prevData => {
        const updatedData = prevData ? {...prevData, ...newData} : newData as SessionState;
        console.log('Updating sessionData, new state should be:', updatedData);
        return updatedData;
    });
    console.log('new state now is (within hook):', sessionData);
    }, [setSessionData]);

    useEffect(() => {
        console.log('sessionData updated:', sessionData);
      }, [sessionData]);

    const connectSocket = useCallback((sessionId: string) => {
      console.log('connectSocket called with sessionId:', sessionId);
      if (!sessionId) {
        console.error('Attempted to connect with undefined sessionId');
        setError('Invalid session ID');
        return;
      }
  
      console.log(`Connecting to session: ${sessionId}`);
      setLoading(true);
      socketRef.current = io(SOCKET_URL, {
        query: { sessionId },
        transports: ['websocket']
      });
  
      socketRef.current.on('connect', () => {
        console.log(`Connected to session: ${sessionId}`);
        socketRef.current!.emit('getSessionData', { sessionId }, (response: SessionState) => {
          console.log('Received response from backend:', response);
          updateSessionData(response);
          setLoading(false);
        });
      });
  
      socketRef.current.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setError('Failed to connect to the server. Please try again.');
        setLoading(false);
      });

      socketRef.current.on('sessionUpdate', updateSessionData);
  
      socketRef.current.on('playerJoined', (player: Player) => {
        console.log('Player joined:', player);
        updateSessionData({
            players: [...(sessionData?.players || []), player]
          });
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from session');
        setSessionData(null);
        setLoading(false);
      });
    }, [updateSessionData]);

  
    const createSession = useCallback((sessionDetails: any) => {
      setLoading(true);
      setError('');
      
      const tempSocket = io(SOCKET_URL, { transports: ['websocket'] });

      tempSocket.emit('createSession', sessionDetails, (response: any) => {
        console.log('Create session response:', response);
        if (response && response.sessionId) {
          const newSessionId = response.sessionId;
          console.log('New session created with ID:', newSessionId);
          updateSessionData(response);
          connectSocket(newSessionId);
          navigate(`/lobby/${newSessionId}`);
        } else {
          console.error('Failed to create session:', response);
          setError('Failed to create session. Please try again.');
        }
        setLoading(false);
        tempSocket.disconnect();
      });
    }, [connectSocket, navigate, updateSessionData]);
  
    const joinSession = useCallback((sessionDetails: { sessionId: string, playerId: string, playerName: string }) => {
        setLoading(true);
        setError('');
    
        console.log('Joining session with details:', sessionDetails);

        if (!socketRef.current) {
            connectSocket(sessionDetails.sessionId);
          }
    
        socketRef.current!.emit('joinSession', sessionDetails, (response: any) => {
          console.log('Join session response:', response);
          if (response && response.success && response.sessionState) {
            console.log('Join session successful:', response.sessionState);
            updateSessionData(response.sessionState);
            console.log('about to nav to lobby');
            navigate(`/lobby/${sessionDetails.sessionId}`);
          } else {
            console.error('Failed to join session:', response.error || 'Unknown error');
            setError('Failed to join session. Please try again.');
          }
          setLoading(false);
        });
      }, [connectSocket, navigate, updateSessionData]);
  
    const emitAction = useCallback(async (action: string, data: any): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (socketRef.current) {
          socketRef.current.emit(action, data, (response: any) => {
            console.log(`Received response for ${action}:`, response);
            if (response.success) {
              updateSessionData(response.sessionData);
              resolve();
            } else {
              setError(response.error || 'An error occurred');
              reject(new Error(response.error || 'An error occurred'));
            }
          });
        } else {
          const errorMsg = 'Not connected to a session.';
          setError(errorMsg);
          reject(new Error(errorMsg));
        }
      });
    }, [updateSessionData]);
  
    return { sessionData, error, loading, createSession, joinSession, emitAction, connectSocket, socket: socketRef.current };
}