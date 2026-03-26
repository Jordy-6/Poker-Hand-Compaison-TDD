import { describe, it, expect } from '@jest/globals';
import { Card, Player } from '../src/types';
import { compareHands } from '../src/comparator';

const c = (value: string, symbol: string): Card => ({ value, symbol });

describe('Hand Comparator', () => {

    describe('High Card comparison', () => {
        it('should declare Player 1 as winner when they have a higher High Card (Ace vs King)', () => {

            const board: Card[] = [
                c('2', 'Clubs'), c('4', 'Spades'), c('7', 'Hearts'),
                c('9', 'Diamonds'), c('10', 'Clubs')
            ];

            const player1: Player = { id: 'p1', holeCards: [c('A', 'Hearts'), c('3', 'Spades')] };
            const player2: Player = { id: 'p2', holeCards: [c('K', 'Hearts'), c('5', 'Diamonds')] };

            const result = compareHands(board, [player1, player2]);

            expect(result.winners).toEqual(['p1']);

            const p1Eval = result.evaluations.find(e => e.playerId === 'p1');
            expect(p1Eval?.category).toBe('High card');
            expect(p1Eval?.bestCards.map(card => card.value)).toEqual(['A', '10', '9', '7', '4']);
        });
    });

    describe('One Pair comparison', () => {
        it('should declare Player 1 as winner when they have a higher pair (Aces vs Kings)', () => {
            const board: Card[] = [
                c('2', 'Clubs'), c('4', 'Spades'), c('7', 'Hearts'),
                c('9', 'Diamonds'), c('J', 'Clubs')
            ];

            const player1: Player = { id: 'p1', holeCards: [c('A', 'Hearts'), c('A', 'Spades')] };
            const player2: Player = { id: 'p2', holeCards: [c('K', 'Hearts'), c('K', 'Diamonds')] };

            const result = compareHands(board, [player1, player2]);

            expect(result.winners).toEqual(['p1']);

            const p1Eval = result.evaluations.find(e => e.playerId === 'p1');
            expect(p1Eval?.category).toBe('One pair');
            expect(p1Eval?.bestCards.map(card => card.value)).toEqual(['A', 'A', 'J', '9', '7']);

            const p2Eval = result.evaluations.find(e => e.playerId === 'p2');
            expect(p2Eval?.category).toBe('One pair');
            expect(p2Eval?.bestCards.map(card => card.value)).toEqual(['K', 'K', 'J', '9', '7']);
        });

        it('should compare kickers when both players have the same pair', () => {
            const board: Card[] = [
                c('A', 'Clubs'), c('A', 'Spades'), c('7', 'Hearts'),
                c('9', 'Diamonds'), c('2', 'Clubs')
            ];

            const player1: Player = { id: 'p1', holeCards: [c('K', 'Hearts'), c('3', 'Spades')] };
            const player2: Player = { id: 'p2', holeCards: [c('Q', 'Hearts'), c('4', 'Diamonds')] };

            const result = compareHands(board, [player1, player2]);

            expect(result.winners).toEqual(['p1']);

            const p1Eval = result.evaluations.find(e => e.playerId === 'p1');
            expect(p1Eval?.category).toBe('One pair');
            expect(p1Eval?.bestCards.map(card => card.value)).toEqual(['A', 'A', 'K', '9', '7']);
        });
    });

    describe('Three of a Kind vs High Card', () => {
        it('should declare Player 1 as winner when they have three of a kind against high card', () => {
            const board: Card[] = [
                c('8', 'Clubs'), c('J', 'Spades'), c('5', 'Hearts'),
                c('9', 'Diamonds'), c('2', 'Clubs')
            ];

            const player1: Player = { id: 'p1', holeCards: [c('8', 'Hearts'), c('8', 'Spades')] };
            const player2: Player = { id: 'p2', holeCards: [c('A', 'Hearts'), c('K', 'Diamonds')] };

            const result = compareHands(board, [player1, player2]);

            expect(result.winners).toEqual(['p1']);

            const p1Eval = result.evaluations.find(e => e.playerId === 'p1');
            expect(p1Eval?.category).toBe('Three of a kind');
            expect(p1Eval?.bestCards.map(card => card.value)).toEqual(['8', '8', '8', 'J', '9']);

            const p2Eval = result.evaluations.find(e => e.playerId === 'p2');
            expect(p2Eval?.category).toBe('High card');
            expect(p2Eval?.bestCards.map(card => card.value)).toEqual(['A', 'K', 'J', '9', '8']);
        });
    });

    describe('Flush vs Straight', () => {
        it('should declare Player 1 as winner when they have a flush against a straight', () => {
            const board: Card[] = [
                c('5', 'Hearts'), c('6', 'Hearts'), c('7', 'Hearts'),
                c('8', 'Spades'), c('K', 'Clubs')
            ];

            const player1: Player = { id: 'p1', holeCards: [c('2', 'Hearts'), c('J', 'Hearts')] };
            const player2: Player = { id: 'p2', holeCards: [c('4', 'Spades'), c('9', 'Diamonds')] };

            const result = compareHands(board, [player1, player2]);

            expect(result.winners).toEqual(['p1']);

            const p1Eval = result.evaluations.find(e => e.playerId === 'p1');
            expect(p1Eval?.category).toBe('Flush');
            expect(p1Eval?.bestCards.map(card => card.value)).toEqual(['J', '7', '6', '5', '2']);

            const p2Eval = result.evaluations.find(e => e.playerId === 'p2');
            expect(p2Eval?.category).toBe('Straight');
            expect(p2Eval?.bestCards.map(card => card.value)).toEqual(['9', '8', '7', '6', '5']);
        });
    });

});