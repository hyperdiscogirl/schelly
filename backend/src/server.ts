import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import cors from 'cors';
import fs from 'fs';

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

let ref = db.ref('sessions/0')

try {
  const setPromise = ref.set({test: "aha", nah: "totot", ye: [1, 2, 3]});
  const timeoutPromise = new Promise((_, reject) => 
    setTimeout(() => reject(new Error('Operation timed out')), 10000)
  );
  
  await Promise.race([setPromise, timeoutPromise]);
  console.log('Data written successfully');
} catch (error) {
  console.error('Error writing data:', error);
}

console.log('Firebase database reference set???');

