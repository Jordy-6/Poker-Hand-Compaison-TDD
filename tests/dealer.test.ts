import { describe, it, expect, beforeEach } from "@jest/globals";
import Dealer from "../src/dealer";
import Deck from "../src/deck";

describe("Dealer", () => {
  let dealer: Dealer;
  let deck: Deck;

  beforeEach(() => {
    deck = new Deck();
    dealer = new Dealer();
  });

  describe("Board distribution", () => {
    it("should deal exactly 5 community cards to the board", () => {
      dealer.dealBoard(deck);
      expect(dealer.board.length).toBe(5);
    });

    it("should remove 5 cards from deck after dealing board", () => {
      const initialDeckSize = deck.cards.length;
      dealer.dealBoard(deck);
      expect(deck.cards.length).toBe(initialDeckSize - 5);
    });
  });

  describe("Player hole cards distribution", () => {
    it("should deal exactly 2 hole cards per player", () => {
      const playerIds = ["player1", "player2"];
      dealer.dealHoleCards(playerIds, deck);

      playerIds.forEach((playerId) => {
        expect(dealer.playersHands.get(playerId)!.length).toBe(2);
      });
    });

    it("should remove correct number of cards from deck after dealing hole cards", () => {
      const playerIds = ["player1", "player2"];
      const initialDeckSize = deck.cards.length;
      dealer.dealHoleCards(playerIds, deck);

      const cardsDealt = playerIds.length * 2;
      expect(deck.cards.length).toBe(initialDeckSize - cardsDealt);
    });
  });

  describe("Complete game distribution (2 players)", () => {
    it("should deal board and hole cards correctly in sequence for 2 players", () => {
      const playerIds = ["player1", "player2"];
      dealer.dealBoard(deck);
      dealer.dealHoleCards(playerIds, deck);

      expect(dealer.board.length).toBe(5);
      playerIds.forEach((playerId) => {
        expect(dealer.playersHands.get(playerId)!.length).toBe(2);
      });
    });

    it("should have correct remaining deck size (43 cards left after dealing 9)", () => {
      const playerIds = ["player1", "player2"];
      dealer.dealBoard(deck);
      dealer.dealHoleCards(playerIds, deck);

      const cardsDealt = 5 + playerIds.length * 2;
      expect(deck.cards.length).toBe(52 - cardsDealt);
    });
  });
});
