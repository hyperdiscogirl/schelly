import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import cors from 'cors';
import fs from 'fs';
import { Player, SessionState, Round } from '../../sharedTypes';
import { MakeChoice, GenerateNewSacrifice, FillMissingChoices, JudgeRound, GenerateNewRound } from './gamelogic';

console.log('Starting server initialization...');

const app = express();
const server = http.createServer(app);

console.log('Express app and HTTP server created');

// CORS configuration
const allowedOrigins = ['http://localhost:5174', 'http://localhost:5173'];
app.use(cors({
  origin: function(origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

console.log('CORS configuration applied');

const io = new SocketIOServer(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
}); 

console.log('Socket.IO server initialized');

// Firebase setup
let serviceAccount: admin.ServiceAccount;

console.log('Current working directory:', process.cwd());

if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
  console.log('Using Firebase service account from environment variable');
  serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
} else {
  console.log('Attempting to load Firebase service account from file');
  serviceAccount = require('./../serviceAccountKey.json');
}

try {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://schelly-30003-default-rtdb.firebaseio.com/"
  });
  console.log('Firebase initialized successfully');
} catch (error) {
  console.error('Error initializing Firebase:', error);
  process.exit(1);
}

const db = admin.database();
console.log('Firebase database reference created');




///////////////////////////////////////

io.on('connection', (socket) => {

  socket.on('createSession', async (data, callback) => {
    
    const {teamName, playerId, playerName, sessionId} = data
    const sessionRef = db.ref(`sessions/${sessionId}`);

    const sessionState: SessionState = {
      players: [{id: playerId, name: playerName}],
      admin: {id: playerId, name: playerName},
      settings: {
        maxTrys: 15,
        numSacrifices: 5,
        roundTimeLimit: 30,
        numOptions: 6
      },
      sessionId: sessionId,
      teamName: teamName,
      sessionStarted: false
    }
    socket.join(sessionId)
    await sessionRef.set(sessionState, (error) => {})
    callback(sessionState)
  })
  socket.on('joinSession', async (data, callback) => {
    const {playerId, playerName, sessionId} = data
    const sessionRef = db.ref(`sessions/${sessionId}`);
    const player: Player = {id: playerId, name: playerName}
    
    try {
      // First, check if the session exists
      const sessionSnapshot = await sessionRef.once('value');
      if (!sessionSnapshot.exists()) {
        callback({ error: 'Session does not exist' });
        return;
      }

      // Join the socket room
      socket.join(sessionId);

      // Update the players array
      await sessionRef.child('players').transaction((players) => {
        if (players === null) {
          // If players doesn't exist, create a new array with the new player
          return [player];
        } else {
          // If players exists, add the new player to the array
          players.push(player);
          return players;
        }
      });

      // Get the updated session state
      const updatedSessionSnapshot = await sessionRef.once('value');
      const sessionState = updatedSessionSnapshot.val();

      // Emit to all clients in the room that a new player joined
      io.to(sessionId).emit('playerJoined', player);

      // Send the updated session state back to the client
      callback({ success: true, sessionState });
    } catch (error) {
      console.error("Error in joinSession:", error);
      callback({ error: 'Failed to join session' });
    }
  })
  socket.on('startSession', async (data, callback) => {
    console.log('startSession event received with sessionId:', data);
    const sessionId = data
    const sessionRef = db.ref(`sessions/${sessionId}`);
    try {
      const result = await sessionRef.transaction((sessionState) => {
        if (sessionState === null) {
          console.error('Session state is null, which should not happen');
          return null; // will abort the transaction
        }
        return {
          ...sessionState,
          sessionStarted: true,
          sacrifices: [GenerateNewSacrifice()]
        };
      });

      if (result.committed) {
        const sessionSnapshot = await sessionRef.once('value');
        const sessionState = sessionSnapshot.val();
        io.to(sessionId).emit('startRound', sessionState);
        console.log('Emitting startRound');
        console.log('Session state after startRound:', sessionState);
        const roundTimeLimit = sessionState.settings.roundTimeLimit || 30; // Default to 30 if not set
        setTimeout(() => {
          // roundTimerCallback(sessionId);
          console.log('timer started')
        }, (roundTimeLimit + 5) * 1000);
        
        callback({ success: true, sessionState: sessionState });
      } else {
        throw new Error('Transaction failed');
      }
    } catch (error) {
      console.error('Error starting session:', error);
      callback({ success: false, error: 'Failed to start session' });
    }
  })

  socket.on('getSessionData', async (data, callback) => {
    const { sessionId } = data;
    const sessionRef = db.ref(`sessions/${sessionId}`);
    
    try {
      const snapshot = await sessionRef.once('value');
      const sessionData = snapshot.val();
      if (sessionData) {
        callback(sessionData);
      } else {
        callback({ error: 'Session not found' });
      }
    } catch (error) {
      console.error("Error fetching session data:", error);
      callback({ error: 'Failed to fetch session data' });
    }
  });

  socket.on('makeChoice', (data) => {
    const {choice, sessionId} = data
    //TODO(jecneps): only allow if it's for the right round
    MakeChoice(db, sessionId, choice)
  })

  
})


////////////////////////////////////////

async function roundTimerCallback(sessionId) {
  const sessionRef = db.ref(`sessions/${sessionId}`);
  console.log('Round timer callback for session:', sessionId);
  await sessionRef.transaction((sessionState) => {
    if (sessionState === null) {
      return null; // will abort the transaction
    }
    const round = FillMissingChoices(sessionId, sessionState)
    const lastSac = sessionState.sacrifices![sessionState.sacrifices!.length - 1]
    lastSac.rounds[lastSac.rounds.length - 1] = round
    return sessionState
  })
  console.log(`Round timer callback for session ${sessionId} Transaction completed`);
  const sessionState = ((await sessionRef.once('value'))).val()
  const lastSac = sessionState.sacrifices![sessionState.sacrifices!.length - 1]
  const roundToJudge = lastSac.rounds[lastSac.rounds.length - 1]

  const res = JudgeRound(roundToJudge, sessionState)
  io.to(sessionId).emit('roundFinished', {...res, sessionState})
  console.log(`Round timer callback for session ${sessionId} Emitting roundFinished`);

  if (!res.wasWin) {
    console.log('Was not a win, setting timeout')
    setTimeout(() => {
      console.log('Not a win, timeout firing')
      const nextRound = GenerateNewRound(roundToJudge)
			sessionState.sacrifices[sessionState.sacrifices.length - 1].rounds.push(nextRound)
      sessionRef.set(sessionState)
      io.to(sessionId).emit('startRound', sessionState)
      setTimeout(() => {
        roundTimerCallback(sessionId)
      }, (sessionState.settings.roundTimeLimit + 5) * 1000)
    }, 5000)
  }

  if (res.wasWin && res.moreSacrifices) {
    console.log('Was a win, more sacrifices')
    setTimeout(()=> {
      const sacrifice = GenerateNewSacrifice()
      sessionState.sacrifices.push(sacrifice)
      sessionRef.set(sessionState)
      io.to(sessionId).emit('startRound', sessionState)
      setTimeout(() => {
        roundTimerCallback(sessionId)
      }, (sessionState.settings.roundTimeLimit + 5) * 1000)
    }, 5000)
  }  

  if (res.wasWin && !res.moreSacrifices) {
    console.log('Was a win, no more sacrifices, GAME COMPLETE')
  }

}

////////////////////////////////////////////////////

const port = process.env.PORT || 3000;

server.listen(port, () => {
    console.log(`Server running on port ${port}`);
    console.log('Server initialization complete');
});

// Global error handler
process.on('uncaughtException', (error) => {
    console.error('Uncaught Exception:', error);
    process.exit(1);
});

