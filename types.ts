export interface Card {
  id: number
  cardId: number
  image: string
  isOpened: boolean
  isFound: boolean
}

export interface Player {
  name: string,
  score: number,
  isTurn: boolean
}

export interface TopPlayer {
  name: string,
  score: number,
  date: Date
}
