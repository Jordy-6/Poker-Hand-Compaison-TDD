import Deck from "./deck";
import { Card } from "./types";

export default class Dealer {
  public board: Card[] = [];
  public playersHands: Map<string, Card[]> = new Map();

  /**
   * Deals exactly 5 community cards to the board
   */
  public dealBoard(deck: Deck): void {
    this.board = deck.cards.splice(0, 5);
  }

  /**
   * Deals exactly 2 hole cards to each player
   */
  public dealHoleCards(playerIds: string[], deck: Deck): void {
    playerIds.forEach((playerId) => {
      const holeCards = deck.cards.splice(0, 2);
      this.playersHands.set(playerId, holeCards);
    });
  }
}
