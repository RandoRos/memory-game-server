import { TopPlayer } from "../types";

const topPlayers: TopPlayer[] = [
  { name: 'Leet', score: 100, date: new Date('2000-01-05') },
  { name: 'Player', score: 80, date: new Date('2022-06-06') },
  { name: 'Marco', score: 60, date: new Date('2022-07-10') },
  { name: 'John', score: 50, date: new Date('2021-11-20') },
  { name: 'Kate', score: 45, date: new Date() },
  { name: 'MrX', score: 30, date: new Date() },
  { name: 'Test', score: 10, date: new Date() },
]

export const getTopPlayers = (): TopPlayer[] => topPlayers;
