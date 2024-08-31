import express from 'express';
import { Server as SocketIOServer } from 'socket.io';
import http from 'http';
import admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import cors from 'cors';
import fs from 'fs';