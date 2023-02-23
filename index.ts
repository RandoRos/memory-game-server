import express, { type Request, type Response } from 'express';
import dotenv from 'dotenv';
import http from 'http';
import cors from 'cors';
import { Server, type Socket } from 'socket.io';

import { getTopPlayers } from './db/db';

import { Card, Player } from './types';
import { createPlayer, getPlayersArray } from './utils';

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

const players: Map<string, Player> = new Map();

let turns: string[] = [];
let gameCards: Card[] = [];

io.on('connection', (socket: Socket) => {
  console.log('a user connected', socket.id);

  socket.on('newPlayer', (name) => {
    players.set(socket.id, createPlayer(name, players));
    io.emit('update', getPlayersArray(players));
    if (gameCards.length > 0) io.emit('updateClientCards', gameCards);
  });
  
  socket.on('createServer', (data) => {
    gameCards = data;
    io.emit('updateClientCards', gameCards);
  });

  socket.on('disconnect', () => {
    console.log('a user disconnected', socket.id);
    players.delete(socket.id);
    io.emit('update', getPlayersArray(players));
    if (players.size === 0) {
      gameCards = [];
    }
  });

  socket.on('updateServerCards', (data) => {
    gameCards = data;
    io.emit('updateClientCards', gameCards);
  })

  socket.on('updateScore', () => {
    const player = players.get(socket.id);
    if (player) {
      player.score += 1;
      players.set(socket.id, player);
    }
    io.emit('update', getPlayersArray(players));
  })

  socket.on('changeTurn', () => {
    turns.push(socket.id);
    if (turns.length === players.size )  {
      turns = [];
    }

    const currentPlayer = players.get(socket.id);
    const nextPlayerId = Array.from(players.keys()).find((id: string) => !turns.includes(id)) || '';
    const nextPlayer = players.get(nextPlayerId);

    if (nextPlayer) {
      nextPlayer.isTurn = true;
      players.set(nextPlayerId, nextPlayer);
    }

    if (currentPlayer) {
      currentPlayer.isTurn = false;
      players.set(socket.id, currentPlayer);
    }

    io.emit('update', getPlayersArray(players));
  })
});

app.get('/api/topPlayers', (req: Request, res: Response) => {
  res.send(getTopPlayers())
})

server.listen(port, () => {
  console.log(`[server]: Server is running at http://localhost:${port}`);
});
