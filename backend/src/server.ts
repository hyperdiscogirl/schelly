import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import cors from 'cors';
import fs from 'fs';
import { SessionState } from '../../sharedTypes';

console.log('Starting server initialization...');

const app = express();
const server = http.createServer(app);

console.log('Express app and HTTP server created');

// CORS configuration
const allowedOrigins = ['http://localhost:5173'];
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
    const id = uuidv4();
    const {teamName, playerId, playerName} = data
    const sessionRef = db.ref(`sessions/${id}`);

    const sessionState: SessionState = {
      players: [{id: playerId, name: playerName}],
      admin: {id: playerId, name: playerName},
      settings: {
        maxTrys: 15,
        numSacrifices: 5,
        roundTimeLimit: 30
      },
      sessionId: id,
      teamName: teamName,
      sessionStarted: false
    }

    await sessionRef.set(sessionState, (error) => {})
    callback(sessionState)
  })
  socket.on('joinSession', (data) => {})
  socket.on('startSession', (data) => {})
})

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

