import { describe, it, expect } from '@jest/globals';
import Deck from '../src/deck';

describe('Deck', () => {

    it('should contain 52 different cards', () => {
        const deck = new Deck();
        expect(deck.cards.length).toBe(52);
    });

    it('Each symbol should have 13 cards', () => {
        const deck = new Deck();
        const symbols = ['Hearts', 'Diamonds', 'Clubs', 'Spades'];

        symbols.forEach(symbol => {
            const cards = deck.cards.filter(card => card.symbol === symbol);
            expect(cards.length).toBe(13);
        });
    });
});