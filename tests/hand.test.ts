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

    describe('Two Pair comparison', () => {
        it('should declare Player 1 as winner when they have higher two pair', () => {
            const board: Card[] = [
                c('A', 'Clubs'), c('K', 'Spades'), c('7', 'Hearts'),
                c('2', 'Diamonds'), c('3', 'Clubs')
            ];

            const player1: Player = { id: 'p1', holeCards: [c('A', 'Hearts'), c('K', 'Diamonds')] };
            const player2: Player = { id: 'p2', holeCards: [c('Q', 'Hearts'), c('J', 'Spades')] };

            const result = compareHands(board, [player1, player2]);

            expect(result.winners).toEqual(['p1']);

            const p1Eval = result.evaluations.find(e => e.playerId === 'p1');
            expect(p1Eval?.category).toBe('Two pair');
            expect(p1Eval?.bestCards.map(card => card.value)).toEqual(['A', 'A', 'K', 'K', '7']);
        });

        it('should compare kickers when two pairs are equal', () => {
            const board: Card[] = [
                c('9', 'Clubs'), c('5', 'Spades'), c('3', 'Hearts'),
                c('2', 'Diamonds'), c('A', 'Clubs')
            ];

            const player1: Player = { id: 'p1', holeCards: [c('9', 'Hearts'), c('5', 'Diamonds')] };
            const player2: Player = { id: 'p2', holeCards: [c('9', 'Spades'), c('5', 'Hearts')] };

            const result = compareHands(board, [player1, player2]);

            expect(result.winners).toEqual(['p1', 'p2']); // Tie (same A kicker)
        });
    });

    describe('Straight comparison', () => {
        it('should declare Player 1 as winner when they have ace-high straight', () => {
            const board: Card[] = [
                c('A', 'Clubs'), c('K', 'Spades'), c('Q', 'Hearts'),
                c('J', 'Diamonds'), c('2', 'Clubs')
            ];

            const player1: Player = { id: 'p1', holeCards: [c('10', 'Hearts'), c('3', 'Diamonds')] };
            const player2: Player = { id: 'p2', holeCards: [c('9', 'Hearts'), c('8', 'Spades')] };

            const result = compareHands(board, [player1, player2]);

            expect(result.winners).toEqual(['p1']);

            const p1Eval = result.evaluations.find(e => e.playerId === 'p1');
            expect(p1Eval?.category).toBe('Straight');
        });

        it('should detect wheel (5-4-3-2-A) straight with value 5', () => {
            const board: Card[] = [
                c('5', 'Clubs'), c('4', 'Spades'), c('3', 'Hearts'),
                c('2', 'Diamonds'), c('K', 'Clubs')
            ];

            const player1: Player = { id: 'p1', holeCards: [c('A', 'Hearts'), c('Q', 'Diamonds')] };
            const player2: Player = { id: 'p2', holeCards: [c('10', 'Hearts'), c('J', 'Spades')] };

            const result = compareHands(board, [player1, player2]);

            expect(result.winners).toEqual(['p1']);

            const p1Eval = result.evaluations.find(e => e.playerId === 'p1');
            expect(p1Eval?.category).toBe('Straight');
        });
    });

    describe('Full House comparison', () => {
        it('should declare Player 1 as winner when they have higher full house', () => {
            const board: Card[] = [
                c('A', 'Clubs'), c('A', 'Spades'), c('K', 'Hearts'),
                c('Q', 'Diamonds'), c('2', 'Clubs')
            ];

            const player1: Player = { id: 'p1', holeCards: [c('A', 'Hearts'), c('K', 'Diamonds')] };
            const player2: Player = { id: 'p2', holeCards: [c('9', 'Hearts'), c('8', 'Spades')] };

            const result = compareHands(board, [player1, player2]);

            expect(result.winners).toEqual(['p1']);

            const p1Eval = result.evaluations.find(e => e.playerId === 'p1');
            expect(p1Eval?.category).toBe('Full house');
            expect(p1Eval?.bestCards.map(card => card.value)).toEqual(['A', 'A', 'A', 'K', 'K']);
        });
    });

    describe('Four of a Kind comparison', () => {
        it('should declare Player 1 as winner when they have four of a kind', () => {
            const board: Card[] = [
                c('8', 'Clubs'), c('8', 'Spades'), c('8', 'Hearts'),
                c('5', 'Diamonds'), c('2', 'Clubs')
            ];

            const player1: Player = { id: 'p1', holeCards: [c('8', 'Hearts'), c('A', 'Diamonds')] };
            const player2: Player = { id: 'p2', holeCards: [c('Q', 'Hearts'), c('J', 'Spades')] };

            const result = compareHands(board, [player1, player2]);

            expect(result.winners).toEqual(['p1']);

            const p1Eval = result.evaluations.find(e => e.playerId === 'p1');
            expect(p1Eval?.category).toBe('Four of a kind');
        });
    });

    describe('Straight Flush comparison', () => {
        it('should declare Player 1 as winner when they have straight flush', () => {
            const board: Card[] = [
                c('5', 'Hearts'), c('6', 'Hearts'), c('7', 'Hearts'),
                c('8', 'Hearts'), c('K', 'Clubs')
            ];

            const player1: Player = { id: 'p1', holeCards: [c('9', 'Hearts'), c('2', 'Clubs')] };
            const player2: Player = { id: 'p2', holeCards: [c('3', 'Clubs'), c('4', 'Clubs')] };

            const result = compareHands(board, [player1, player2]);

            expect(result.winners).toEqual(['p1']);

            const p1Eval = result.evaluations.find(e => e.playerId === 'p1');
            expect(p1Eval?.category).toBe('Straight flush');
        });
    });

    describe('Split pot (Tie scenarios)', () => {
        it('should declare both players as winners when they have identical best hand', () => {
            const board: Card[] = [
                c('A', 'Clubs'), c('K', 'Spades'), c('Q', 'Hearts'),
                c('J', 'Diamonds'), c('10', 'Clubs')
            ];

            const player1: Player = { id: 'p1', holeCards: [c('2', 'Hearts'), c('3', 'Diamonds')] };
            const player2: Player = { id: 'p2', holeCards: [c('4', 'Hearts'), c('5', 'Spades')] };

            const result = compareHands(board, [player1, player2]);

            expect(result.winners).toEqual(['p1', 'p2']);
        });
    });

    describe('Board plays (best hand is the board)', () => {
        it('should use board when it forms a royal flush', () => {
            const board: Card[] = [
                c('A', 'Hearts'), c('K', 'Hearts'), c('Q', 'Hearts'),
                c('J', 'Hearts'), c('10', 'Hearts')
            ];

            const player1: Player = { id: 'p1', holeCards: [c('2', 'Clubs'), c('3', 'Diamonds')] };
            const player2: Player = { id: 'p2', holeCards: [c('4', 'Clubs'), c('5', 'Diamonds')] };

            const result = compareHands(board, [player1, player2]);

            expect(result.winners).toEqual(['p1', 'p2']); // Both get the same royal flush from board
        });
    });

});