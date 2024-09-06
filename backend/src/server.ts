import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import cors from 'cors';
import fs from 'fs';
import { Player, SessionState, Round } from '../../sharedTypes';
import { MakeChoice, GenerateNewSacrifice, RoundTimerCallback, FillMissingChoices, JudgeRound } from './gamelogic';


const app = express();
const port = 8080;

app.get('/', (req, res) => {
  console.log('GET /');
  res.send('Hello, World!');
});

const requestLogger = (request, response, next) => {
  console.log(`${request.method} url:: ${request.url}`);
  next()
}

app.use(requestLogger);

app.listen(port, '0.0.0.0', (err?: any) => {
  console.log(`Server running at http://localhost:${port}`);
  if (err) {
    console.error('Error starting server:', err);
  }
  console.log(`Node.js version: ${process.version}`);
  recursiveTimer()
});

function recursiveTimer() {
  console.log('Recursive timer');
  setTimeout(() => {
    recursiveTimer();
  }, 1000);
}

// console.log('Starting server initialization...');

// const app = express();
// const server = http.createServer(app);

// console.log('Express app and HTTP server created');

// // CORS configuration
// const allowedOrigins = ['http://localhost:5174', 'http://localhost:5173'];
// app.use(cors({
//   origin: function(origin, callback) {
//     if (!origin) return callback(null, true);
//     if (allowedOrigins.indexOf(origin) === -1) {
//       var msg = 'The CORS policy for this site does not allow access from the specified Origin.';
//       return callback(new Error(msg), false);
//     }
//     return callback(null, true);
//   },
//   credentials: false
// }));

// console.log('CORS configuration applied');

// const io = new SocketIOServer(server, {
//     cors: {
//         origin: allowedOrigins,
//         methods: ["GET", "POST"],
//         credentials: false
//     }
// }); 

// console.log('Socket.IO server initialized');

// // Firebase setup
// let serviceAccount: admin.ServiceAccount;

// console.log('Current working directory:', process.cwd());

// if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
//   console.log('Using Firebase service account from environment variable');
//   serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
// } else {
//   console.log('Attempting to load Firebase service account from file');
//   serviceAccount = require('./../serviceAccountKey.json');
// }

// try {
//   admin.initializeApp({
//     credential: admin.credential.cert(serviceAccount),
//     databaseURL: "https://schelly-30003-default-rtdb.firebaseio.com/"
//   });
//   console.log('Firebase initialized successfully');
// } catch (error) {
//   console.error('Error initializing Firebase:', error);
//   process.exit(1);
// }

// const db = admin.database();
// console.log('Firebase database reference created');




// /////////////////////////////////////

// io.on('connection', (socket) => {
//   console.log('New connection:', socket.id);
//   socket.on('createSession', async (data, callback) => {
    
//     const {teamName, playerId, playerName, sessionId} = data
//     const sessionRef = db.ref(`sessions/${sessionId}`);

//     const sessionState: SessionState = {
//       players: [{id: playerId, name: playerName}],
//       admin: {id: playerId, name: playerName},
//       settings: {
//         maxTrys: 15,
//         numSacrifices: 5,
//         roundTimeLimit: 30,
//         numOptions: 6
//       },
//       sessionId: sessionId,
//       teamName: teamName,
//       sessionStarted: false
//     }
//     socket.join(sessionId)
//     await sessionRef.set(sessionState, (error) => {})
//     callback(sessionState)
//   })
//   socket.on('joinSession', async (data, callback) => {
//     const {playerId, playerName, sessionId} = data
//     const sessionRef = db.ref(`sessions/${sessionId}`);
//     const player: Player = {id: playerId, name: playerName}
    
//     try {
//       // First, check if the session exists
//       const sessionSnapshot = await sessionRef.once('value');
//       if (!sessionSnapshot.exists()) {
//         callback({ error: 'Session does not exist' });
//         return;
//       }

//       // Join the socket room
//       socket.join(sessionId);

//       // Update the players array
//       await sessionRef.child('players').transaction((players) => {
//         if (players === null) {
//           // If players doesn't exist, create a new array with the new player
//           return [player];
//         } else {
//           // If players exists, add the new player to the array
//           players.push(player);
//           return players;
//         }
//       });

//       // Get the updated session state
//       const updatedSessionSnapshot = await sessionRef.once('value');
//       const sessionState = updatedSessionSnapshot.val();

//       // Emit to all clients in the room that a new player joined
//       io.to(sessionId).emit('playerJoined', player);

//       // Send the updated session state back to the client
//       callback({ success: true, sessionState });
//     } catch (error) {
//       console.error("Error in joinSession:", error);
//       callback({ error: 'Failed to join session' });
//     }
//   })
//   socket.on('startSession', async (data, callback) => {
//     const {sessionId} = data
//     const sessionRef = db.ref(`sessions/${sessionId}`);
//     await sessionRef.transaction((sessionState) => {
//       sessionState.sessionStarted = true
//       sessionState.sacrifices = [GenerateNewSacrifice()]
//       return sessionState
//     })

//     const sessionSnapshot = await sessionRef.once('value');
//     const sessionState = sessionSnapshot.val();

//     io.to(sessionId).emit('startRound', {sessionState, firstRound: true})
//     setTimeout(() => {
//       RoundTimerCallback(sessionId, db)
//     }, (sessionState.settings.roundTimeLimit + 5) * 1000)
//   })

//   socket.on('getSessionData', async (data, callback) => {
//     const { sessionId } = data;
//     const sessionRef = db.ref(`sessions/${sessionId}`);
    
//     try {
//       const snapshot = await sessionRef.once('value');
//       const sessionData = snapshot.val();
//       if (sessionData) {
//         callback(sessionData);
//       } else {
//         callback({ error: 'Session not found' });
//       }
//     } catch (error) {
//       console.error("Error fetching session data:", error);
//       callback({ error: 'Failed to fetch session data' });
//     }
//   });

//   socket.on('makeChoice', (data) => {
//     const {choice, sessionId} = data
//     //TODO(jecneps): only allow if it's for the right round
//     MakeChoice(db, sessionId, choice)
//   })

  
// })


// //////////////////////////////////////

// async function roundTimerCallback(sessionId: any) {
//   const sessionRef = db.ref(`sessions/${sessionId}`);
//   console.log('Round timer callback for session:', sessionId);
//   await sessionRef.transaction((sessionState) => {
//     const round = FillMissingChoices(sessionId, sessionState)
//     const lastSac = sessionState.sacrifices![sessionState.sacrifices!.length - 1]
//     lastSac.rounds[lastSac.rounds.length - 1] = round
//     return sessionState
//   })
//   console.log(`Round timer callback for session ${sessionId} Transaction completed`);
//   const sessionState = ((await sessionRef.once('value'))).val()
//   const lastSac = sessionState.sacrifices![sessionState.sacrifices!.length - 1]
//   const roundToJudge = lastSac.rounds[lastSac.rounds.length - 1]

//   // const = JudgeRound(roundToJudge, sessionState)
//   io.to(sessionId).emit('roundFinished', )
//   console.log(`Round timer callback for session ${sessionId} Emitting roundFinished`);
//   setTimeout(() => {
//     console.log('StartRound Timer triggered')
//     io.to(sessionId).emit('startRound', {firstRound: false})
//   }, 5000)
// }

// //////////////////////////////////////////////////

// const port = process.env.PORT || 3000 ;

// server.listen(port, () => {
//     console.log(`Server running on port ${port}`);
//     console.log('Server initialization complete');
// });

// // Global error handler
// process.on('uncaughtException', (error) => {
//     console.error('Uncaught Exception:', error);
//     process.exit(1);
// });

