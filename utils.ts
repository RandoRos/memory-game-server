import { Player } from "./types";

export const createPlayer = (name: string, players: Map<string, Player>) => {
  return { 
    score: 0,
    name: name || `Player ${players.size + 1}`,
    isTurn: players.size ? false : true,
  };
}

export const getPlayersArray = (players: Map<string, Player>) => {
  return Array.from(players.keys()).map(key => ({ id: key, ...players.get(key) }));
}
