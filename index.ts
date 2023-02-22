import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import http from 'http';
import cors from 'cors';
import { Server, type Socket } from 'socket.io';
import { Card } from './types';

dotenv.config();

const app = express();
app.use(cors());

const port = process.env.PORT;
const server = http.createServer(app);
const io = new Server(server, {
  serveClient: false,
  cors: {
    origin: '*',
    credentials: true
  }
});

const players = new Map();
const topPlayers = [
  { name: 'Leet', score: 100 },
  { name: 'Player', score: 80 },
  { name: 'Marco', score: 60 },
  { name: 'John', score: 50 },
  { name: 'Kate', score: 45 },
  { name: 'MrX', score: 30 },
  { name: 'Test', score: 10 },
]
let gameCards: Card[] = [];

io.on('connection', (socket: Socket) => {
  console.log('a user connected', socket.id);

  socket.on('newPlayer', (name) => {
    players.set(socket.id, { score: 0, name: name || `Player ${players.size + 1}`, isTurn: players.size ? false : true });
    io.emit('update', Array.from(players.keys()).map(key => ({ id: key, ...players.get(key) })));
  })
  
  if (gameCards.length > 0) {
      io.emit('updateClientCards', gameCards);
  }
  
  socket.on('createServer', (data) => {
    gameCards = data;
    io.emit('updateClientCards', gameCards);
  });

  socket.on('disconnect', () => {
    console.log('a user disconnected', socket.id);
    players.delete(socket.id);
    io.emit('update', Array.from(players.keys()).map(key => ({ id: key, ...players.get(key) })));
    if (Object.keys(players).length === 0) {
      gameCards = [];
    }
  });

  socket.on('updateServerCards', (data) => {
    gameCards = data;
    io.emit('updateClientCards', gameCards);
  })

  socket.on('updateScore', () => {
    const player = players.get(socket.id);
    player.score += 1;
    players.set(socket.id, player);
    io.emit('update', Array.from(players.keys()).map(key => ({ id: key, ...players.get(key) })));
  })

  socket.on('changeTurn', () => {
    const currentPlayer = players.get(socket.id);
    const newPlayerKey = Array.from(players.keys()).find(key => key !== socket.id);
    const newPlayer = players.get(newPlayerKey);

    newPlayer.isTurn = true;
    currentPlayer.isTurn = false;

    players.set(socket.id, currentPlayer);
    players.set(newPlayerKey, newPlayer);

    io.emit('update', Array.from(players.keys()).map(key => ({ id: key, ...players.get(key) })));
  })
});

app.get('/api/topPlayers', (req: Request, res: Response) => {
  res.send(topPlayers)
})

server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
