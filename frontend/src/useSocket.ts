import { useState, useEffect, useCallback, useRef } from 'react';
import { io, Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import { SessionState, Player } from '../../sharedTypes';

const SOCKET_URL = 'http://localhost:3000';

export function useSocket() {
    const [sessionData, setSessionData] = useState<SessionState | null>(null);
    const [startSessionFlag, setStartSessionFlag] = useState<boolean>(false);
    const [error, setError] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const socketRef = useRef<Socket | null>(null);

    
    // const updateSessionData = useCallback((newData: Partial<SessionState>) => {
    //   console.log('updateSessionData called with newData:', newData);
    //   setSessionData(prevData => {
    //     const updatedData = prevData ? {...prevData, ...newData} : newData as SessionState;
    //     console.log('Updating sessionData, new state should be:', updatedData);
    //     return updatedData;
    // });
    // console.log('new state now is (within hook):', sessionData);
    // }, [setSessionData]);

    // useEffect(() => {
    //     console.log('sessionData updated:', sessionData);
    //   }, [sessionData]);

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
          setSessionData(response);
          setLoading(false);
        });
      });
  
      socketRef.current.on('connect_error', (error) => {
        console.error('Connection error:', error);
        setError('Failed to connect to the server. Please try again.');
        setLoading(false);
      });
  
      socketRef.current.on('playerJoined', (player: Player) => {
        console.log('Player joined:', player);
        console.log('sessionData before updateuhuhuhuh:', sessionData);
        
        setSessionData((prevData: SessionState | null) => {
            console.log('INSIDE the setter for session data:', prevData);
            console.log('players before update:', prevData?.players);
            console.log('Player:', player);
            if (!prevData) {
                console.log('sessionData is null, inside Player Join');
                return prevData
            }
            prevData.players = [...(prevData?.players || []), player]
            console.log('players after update:', prevData?.players);
            return {...prevData}
        })
      });

      socketRef.current.on('startRound', (data) => {
        console.log('startRound event received:', data);
        //data will be the session state and firstRound flag
        setSessionData(data)
        setStartSessionFlag(true);
      });

      socketRef.current.on('disconnect', () => {
        console.log('Disconnected from session');
        setSessionData(null);
        setLoading(false);
      });
    }, [setSessionData])
    

  
    const createSession = useCallback((sessionDetails: any) => {
      setLoading(true);
      setError('');
      
      connectSocket(sessionDetails.sessionId);
      socketRef.current!.emit('createSession', sessionDetails, (response: any) => {
        console.log('Create session response:', response);
        if (response && response.sessionId) {
          const newSessionId = response.sessionId;
          console.log('New session created with ID:', newSessionId);
          setSessionData(response);
          connectSocket(newSessionId);
        } else {
          console.error('Failed to create session:', response);
          setError('Failed to create session. Please try again.');
        }
        setLoading(false);
      });
     
    }, [connectSocket, setSessionData]);
  
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
            setSessionData(response.sessionState);
            console.log('about to nav to lobby');
          } else {
            console.error('Failed to join session:', response.error || 'Unknown error');
            setError('Failed to join session. Please try again.');
          }
          setLoading(false);
        });
      }, [connectSocket, setSessionData]);  

    const startSession = useCallback((sessionId: string) => {
        socketRef.current!.emit('startSession', sessionId, (response: any) => {
            console.log('Start session response:', response);
            if (response && response.success) {
                console.log('Start session successful');
            } else {
                console.error('Failed to start session:', response.error || 'Unknown error');
                setError('Failed to start session. Please try again.');
            }
            //response will be the session state, handle
        });
    }, [])
  
    const emitAction = useCallback(async (action: string, data: any): Promise<void> => {
      return new Promise((resolve, reject) => {
        if (socketRef.current) {
          socketRef.current.emit(action, data, (response: any) => {
            console.log(`Received response for ${action}:`, response);
            if (response.success) {
              setSessionData(response.sessionData);
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
    }, [setSessionData]);
  
    return { sessionData, error, loading, createSession, joinSession, startSession, startSessionFlag, emitAction, connectSocket, socket: socketRef.current };
}