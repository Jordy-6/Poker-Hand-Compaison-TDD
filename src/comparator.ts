import { Card, Player, Hand, ComparisonResult } from './types';

export interface HandEvaluation {
  playerId: string;
  category: string;
  bestCards: Card[];
  rank: number; // Plus élevé = meilleure main
  kickers: Card[]; // Cartes de départage
}

const CARD_VALUES: Record<string, number> = {
  'A': 14, 'K': 13, 'Q': 12, 'J': 11, '10': 10,
  '9': 9, '8': 8, '7': 7, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2
};

const HAND_RANKS = {
  'Straight flush': 8,
  'Four of a kind': 7,
  'Full house': 6,
  'Flush': 5,
  'Straight': 4,
  'Three of a kind': 3,
  'Two pair': 2,
  'One pair': 1,
  'High card': 0
};

function getCardValue(card: Card): number {
  return CARD_VALUES[card.value] || 0;
}

function sortCards(cards: Card[]): Card[] {
  return cards.sort((a, b) => getCardValue(b) - getCardValue(a));
}

function evaluateHand(boardCards: Card[], playerCards: Card[]): HandEvaluation {
  const allCards = [...boardCards, ...playerCards];
  const sortedCards = sortCards(allCards);

  // Compter les cartes par valeur
  const valueCounts = new Map<string, Card[]>();
  sortedCards.forEach(card => {
    if (!valueCounts.has(card.value)) valueCounts.set(card.value, []);
    valueCounts.get(card.value)!.push(card);
  });

  // Compter les cartes par couleur
  const suitCounts = new Map<string, Card[]>();
  sortedCards.forEach(card => {
    if (!suitCounts.has(card.symbol)) suitCounts.set(card.symbol, []);
    suitCounts.get(card.symbol)!.push(card);
  });

  // Fonction utilitaire locale pour vérifier une suite dans un tableau de cartes
  const checkStraight = (cardsToCheck: Card[]) => {
    const uniqueVals = Array.from(new Set(cardsToCheck.map(c => getCardValue(c)))).sort((a, b) => b - a);
    for (let i = 0; i <= uniqueVals.length - 5; i++) {
      if (uniqueVals[i] - uniqueVals[i + 4] === 4) return uniqueVals[i];
    }
    // Cas spécial: A-2-3-4-5 (wheel)
    if (uniqueVals.includes(14) && uniqueVals.includes(5) &&
      uniqueVals.includes(4) && uniqueVals.includes(3) && uniqueVals.includes(2)) {
      return 5;
    }
    return 0; // 0 signifie pas de suite
  };

  // Vérifier flush
  const flushSuitEntry = Array.from(suitCounts.entries()).find(([_, cards]) => cards.length >= 5);
  const isFlush = !!flushSuitEntry;
  const flushCards = isFlush ? flushSuitEntry[1] : [];

  // Vérifier straight standard
  const straightHigh = checkStraight(sortedCards);
  const isStraight = straightHigh > 0;

  // Vérifier straight flush (suite dans les cartes de la couleur)
  const straightFlushHigh = isFlush ? checkStraight(flushCards) : 0;
  const isStraightFlush = straightFlushHigh > 0;

  const counts = Array.from(valueCounts.values()).map(cards => cards.length).sort((a, b) => b - a);

  let category = 'High card';
  let rank = HAND_RANKS['High card'];
  let bestCards: Card[] = [];

  if (isStraightFlush) {
    category = 'Straight flush';
    rank = HAND_RANKS['Straight flush'];
    if (straightFlushHigh === 5) {
      ['5', '4', '3', '2', 'A'].forEach(val => {
        bestCards.push(flushCards.find(c => c.value === val)!);
      });
    } else {
      for (let i = 0; i < 5; i++) {
        const valNum = straightFlushHigh - i;
        const valStr = Object.keys(CARD_VALUES).find(v => CARD_VALUES[v] === valNum);
        bestCards.push(flushCards.find(c => c.value === valStr)!);
      }
    }
  } else if (counts[0] === 4) {
    category = 'Four of a kind';
    rank = HAND_RANKS['Four of a kind'];
    const quadValue = Array.from(valueCounts.entries()).find(([_, cards]) => cards.length === 4)![0];
    const quadCards = valueCounts.get(quadValue)!;
    const kicker = sortedCards.find(card => card.value !== quadValue)!;
    bestCards = [...quadCards, kicker];
  } else if (counts[0] >= 3 && counts[1] >= 2) {
    category = 'Full house';
    rank = HAND_RANKS['Full house'];
    const threes = Array.from(valueCounts.entries()).filter(([_, cards]) => cards.length >= 3);
    // Prendre le meilleur brelan
    threes.sort((a, b) => getCardValue(b[1][0]) - getCardValue(a[1][0]));
    const bestThree = threes[0];

    // Pour la paire du full, chercher la meilleure paire ou le 2ème brelan
    const pairs = Array.from(valueCounts.entries())
      .filter(([val, cards]) => cards.length >= 2 && val !== bestThree[0])
      .sort((a, b) => getCardValue(b[1][0]) - getCardValue(a[1][0]));

    bestCards = [...bestThree[1].slice(0, 3), ...pairs[0][1].slice(0, 2)];
  } else if (isFlush) {
    category = 'Flush';
    rank = HAND_RANKS['Flush'];
    bestCards = flushCards.slice(0, 5);
  } else if (isStraight) {
    category = 'Straight';
    rank = HAND_RANKS['Straight'];
    if (straightHigh === 5) {
      ['5', '4', '3', '2', 'A'].forEach(val => {
        bestCards.push(sortedCards.find(c => c.value === val)!);
      });
    } else {
      for (let i = 0; i < 5; i++) {
        const valNum = straightHigh - i;
        const valStr = Object.keys(CARD_VALUES).find(v => CARD_VALUES[v] === valNum);
        bestCards.push(sortedCards.find(c => c.value === valStr)!);
      }
    }
  } else if (counts[0] === 3) {
    category = 'Three of a kind';
    rank = HAND_RANKS['Three of a kind'];
    const threeValue = Array.from(valueCounts.entries()).find(([_, cards]) => cards.length === 3)![0];
    const threeCards = valueCounts.get(threeValue)!;
    const kickers = sortedCards.filter(card => card.value !== threeValue).slice(0, 2);
    bestCards = [...threeCards, ...kickers];
  } else if (counts[0] === 2 && counts[1] === 2) {
    category = 'Two pair';
    rank = HAND_RANKS['Two pair'];
    const pairs = Array.from(valueCounts.entries()).filter(([_, cards]) => cards.length === 2);
    pairs.sort((a, b) => getCardValue(b[1][0]) - getCardValue(a[1][0]));
    // CORRIGÉ : Le kicker peut être une autre paire mineure ! On exclut seulement le top 2 pairs.
    const kicker = sortedCards.find(card => card.value !== pairs[0][0] && card.value !== pairs[1][0])!;
    bestCards = [...pairs[0][1], ...pairs[1][1], kicker];
  } else if (counts[0] === 2) {
    category = 'One pair';
    rank = HAND_RANKS['One pair'];
    const pairValue = Array.from(valueCounts.entries()).find(([_, cards]) => cards.length === 2)![0];
    const pairCards = valueCounts.get(pairValue)!;
    const kickers = sortedCards.filter(card => card.value !== pairValue).slice(0, 3);
    bestCards = [...pairCards, ...kickers];
  } else {
    category = 'High card';
    rank = HAND_RANKS['High card'];
    bestCards = sortedCards.slice(0, 5);
  }

  return {
    playerId: '',
    category,
    bestCards,
    rank,
    kickers: []
  };
}

export function compareHands(board: Card[], players: Player[]): ComparisonResult {
  const evaluations: HandEvaluation[] = players.map(player => {
    const evaluation = evaluateHand(board, player.holeCards);
    evaluation.playerId = player.id;
    return evaluation;
  });

  // Trier par rang de main, puis par valeur des cartes
  evaluations.sort((a, b) => {
    if (a.rank !== b.rank) {
      return b.rank - a.rank; // Rang plus élevé d'abord
    }

    // Même rang, comparer carte par carte
    for (let i = 0; i < Math.min(a.bestCards.length, b.bestCards.length); i++) {
      const valueA = getCardValue(a.bestCards[i]);
      const valueB = getCardValue(b.bestCards[i]);
      if (valueA !== valueB) {
        return valueB - valueA; // Valeur plus élevée d'abord
      }
    }

    return 0; // Égalité
  });

  // Déterminer les gagnants
  const bestRank = evaluations[0].rank;
  const bestCards = evaluations[0].bestCards;
  const winners: string[] = [];

  for (const evaluation of evaluations) {
    if (evaluation.rank === bestRank) {
      // Vérifier si toutes les cartes sont identiques en valeur
      let isEqual = true;
      for (let i = 0; i < bestCards.length; i++) {
        if (getCardValue(evaluation.bestCards[i]) !== getCardValue(bestCards[i])) {
          isEqual = false;
          break;
        }
      }
      if (isEqual) {
        winners.push(evaluation.playerId);
      } else {
        break; // Plus de gagnants possibles
      }
    } else {
      break; // Plus de gagnants possibles
    }
  }

  const hands: Hand[] = evaluations.map(evaluation => ({
    playerId: evaluation.playerId,
    category: evaluation.category,
    bestCards: evaluation.bestCards
  }));

  return {
    winners,
    evaluations: hands
  };
}