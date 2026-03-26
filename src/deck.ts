import { Card } from './types';

export default class Deck {
  public cards: Card[];

  public constructor() {
    this.cards = [];
    const symbols = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];
    const values = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

    symbols.forEach(symbol => {
      values.forEach(value => {
        this.cards.push({ symbol, value });
      });
    });
  }
}


