export interface Card {
  symbol: string;
  value: string;
}

export interface Player {
  id: string;
  holeCards: Card[];
}

export interface Hand {
  playerId: string;
  category: string;
  bestCards: Card[];
}

export interface ComparisonResult {
  winners: string[];
  evaluations: Hand[];
}