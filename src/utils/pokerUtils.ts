
import { PlayingCard } from "@/components/PokerCard";

export const createDeck = (): PlayingCard[] => {
  const suits: PlayingCard['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
  const ranks: PlayingCard['rank'][] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
  const deck: PlayingCard[] = [];

  suits.forEach(suit => {
    ranks.forEach(rank => {
      deck.push({ suit, rank });
    });
  });

  return shuffleDeck(deck);
};

export const shuffleDeck = (deck: PlayingCard[]): PlayingCard[] => {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
};

export const getRankValue = (rank: string): number => {
  switch (rank) {
    case 'A': return 14;
    case 'K': return 13;
    case 'Q': return 12;
    case 'J': return 11;
    default: return parseInt(rank);
  }
};

export const evaluateHand = (cards: PlayingCard[]): { 
  strength: number; 
  description: string; 
  winningCards: PlayingCard[];
  highCard?: string;
} => {
  if (cards.length < 5) return { strength: 0, description: 'Incomplete hand', winningCards: [] };

  const sortedCards = [...cards].sort((a, b) => getRankValue(b.rank) - getRankValue(a.rank));
  const ranks = sortedCards.map(card => getRankValue(card.rank));
  const suits = sortedCards.map(card => card.suit);

  // Count rank occurrences
  const rankCounts = ranks.reduce((acc, rank) => {
    acc[rank] = (acc[rank] || 0) + 1;
    return acc;
  }, {} as Record<number, number>);

  const counts = Object.values(rankCounts).sort((a, b) => b - a);
  const isFlush = suits.every(suit => suit === suits[0]);
  const isStraight = ranks.every((rank, i) => i === 0 || ranks[i - 1] - rank === 1) ||
    (ranks[0] === 14 && ranks[1] === 5 && ranks[2] === 4 && ranks[3] === 3 && ranks[4] === 2); // A-2-3-4-5 straight

  // Find the winning cards for each hand type
  const getCardsOfRank = (targetRank: number) => 
    sortedCards.filter(card => getRankValue(card.rank) === targetRank);

  const getRankName = (rank: number): string => {
    switch (rank) {
      case 14: return 'Ases';
      case 13: return 'Reyes';
      case 12: return 'Reinas';
      case 11: return 'Jotas';
      default: return rank.toString();
    }
  };

  // Hand rankings (higher is better)
  if (isStraight && isFlush) {
    if (ranks[0] === 14 && ranks[1] === 13) {
      return { 
        strength: 10, 
        description: 'Escalera Real', 
        winningCards: sortedCards,
        highCard: 'As'
      };
    }
    return { 
      strength: 9, 
      description: 'Escalera de Color', 
      winningCards: sortedCards,
      highCard: getRankName(ranks[0])
    };
  }
  
  if (counts[0] === 4) {
    const fourOfAKindRank = Object.entries(rankCounts).find(([_, count]) => count === 4)![0];
    return { 
      strength: 8, 
      description: 'Póker', 
      winningCards: getCardsOfRank(parseInt(fourOfAKindRank)),
      highCard: getRankName(parseInt(fourOfAKindRank))
    };
  }
  
  if (counts[0] === 3 && counts[1] === 2) {
    const threeOfAKindRank = Object.entries(rankCounts).find(([_, count]) => count === 3)![0];
    const pairRank = Object.entries(rankCounts).find(([_, count]) => count === 2)![0];
    return { 
      strength: 7, 
      description: 'Full House', 
      winningCards: [...getCardsOfRank(parseInt(threeOfAKindRank)), ...getCardsOfRank(parseInt(pairRank))],
      highCard: `${getRankName(parseInt(threeOfAKindRank))} sobre ${getRankName(parseInt(pairRank))}`
    };
  }
  
  if (isFlush) {
    return { 
      strength: 6, 
      description: 'Color', 
      winningCards: sortedCards,
      highCard: getRankName(ranks[0])
    };
  }
  
  if (isStraight) {
    return { 
      strength: 5, 
      description: 'Escalera', 
      winningCards: sortedCards,
      highCard: getRankName(ranks[0])
    };
  }
  
  if (counts[0] === 3) {
    const threeOfAKindRank = Object.entries(rankCounts).find(([_, count]) => count === 3)![0];
    return { 
      strength: 4, 
      description: 'Trío', 
      winningCards: getCardsOfRank(parseInt(threeOfAKindRank)),
      highCard: getRankName(parseInt(threeOfAKindRank))
    };
  }
  
  if (counts[0] === 2 && counts[1] === 2) {
    const pairs = Object.entries(rankCounts)
      .filter(([_, count]) => count === 2)
      .map(([rank, _]) => parseInt(rank))
      .sort((a, b) => b - a);
    return { 
      strength: 3, 
      description: 'Doble Pareja', 
      winningCards: [...getCardsOfRank(pairs[0]), ...getCardsOfRank(pairs[1])],
      highCard: `${getRankName(pairs[0])} y ${getRankName(pairs[1])}`
    };
  }
  
  if (counts[0] === 2) {
    const pairRank = Object.entries(rankCounts).find(([_, count]) => count === 2)![0];
    return { 
      strength: 2, 
      description: 'Pareja', 
      winningCards: getCardsOfRank(parseInt(pairRank)),
      highCard: getRankName(parseInt(pairRank))
    };
  }
  
  return { 
    strength: 1, 
    description: 'Carta Alta', 
    winningCards: [sortedCards[0]],
    highCard: getRankName(ranks[0])
  };
};

export const getBestHand = (playerCards: PlayingCard[], communityCards: PlayingCard[]) => {
  const allCards = [...playerCards, ...communityCards];
  if (allCards.length < 5) return { strength: 0, description: 'Not enough cards', winningCards: [], highCard: '' };

  // Generate all possible 5-card combinations
  const combinations: PlayingCard[][] = [];
  
  const generateCombinations = (start: number, currentCombo: PlayingCard[]) => {
    if (currentCombo.length === 5) {
      combinations.push([...currentCombo]);
      return;
    }
    
    for (let i = start; i < allCards.length; i++) {
      currentCombo.push(allCards[i]);
      generateCombinations(i + 1, currentCombo);
      currentCombo.pop();
    }
  };

  generateCombinations(0, []);

  // Find the best hand
  let bestHand = { strength: 0, description: 'No hand', winningCards: [], highCard: '' };
  combinations.forEach(combo => {
    const handValue = evaluateHand(combo);
    if (handValue.strength > bestHand.strength) {
      bestHand = handValue;
    }
  });

  return bestHand;
};

// Improved bot AI with more sophisticated decision making
export const getBotAction = (
  hand: PlayingCard[], 
  communityCards: PlayingCard[], 
  currentBet: number, 
  botChips: number,
  pot: number,
  gamePhase: 'preflop' | 'flop' | 'turn' | 'river' | 'showdown',
  botPersonality: 'aggressive' | 'conservative' | 'balanced' = 'balanced'
): { action: 'check' | 'call' | 'raise' | 'fold'; amount?: number } => {
  const handStrength = getBestHand(hand, communityCards).strength;
  const potOdds = currentBet > 0 ? currentBet / (pot + currentBet) : 0;
  const stackRatio = currentBet / botChips;
  
  // Calculate outs and potential
  const calculatePotential = () => {
    if (gamePhase === 'preflop') {
      // Pre-flop hand strength evaluation
      const handRanks = hand.map(card => getRankValue(card.rank)).sort((a, b) => b - a);
      const isPair = handRanks[0] === handRanks[1];
      const isHighCards = handRanks[0] >= 10 && handRanks[1] >= 10;
      const isSuited = hand[0].suit === hand[1].suit;
      
      if (isPair && handRanks[0] >= 10) return 0.8; // High pair
      if (isPair) return 0.6; // Any pair
      if (isHighCards && isSuited) return 0.7; // High suited
      if (isHighCards) return 0.5; // High unsuited
      if (isSuited) return 0.4; // Suited connectors
      return 0.2; // Weak hand
    }
    
    // Post-flop: actual hand strength
    return handStrength / 10;
  };

  const potential = calculatePotential();
  const aggression = botPersonality === 'aggressive' ? 1.3 : botPersonality === 'conservative' ? 0.7 : 1.0;
  const adjustedPotential = potential * aggression;

  console.log(`Bot evaluating: hand strength ${handStrength}, potential ${potential.toFixed(2)}, pot odds ${potOdds.toFixed(2)}, phase ${gamePhase}, personality ${botPersonality}`);

  // Bluffing logic
  const shouldBluff = () => {
    if (botPersonality === 'conservative') return false;
    const bluffChance = botPersonality === 'aggressive' ? 0.15 : 0.08;
    return Math.random() < bluffChance && gamePhase !== 'preflop';
  };

  // Decision tree based on hand strength and situation
  if (adjustedPotential >= 0.8 || handStrength >= 7) {
    // Very strong hand - be aggressive
    if (currentBet === 0) {
      const raiseSize = Math.min(botChips, Math.max(pot * 0.5, 50));
      return { action: 'raise', amount: raiseSize };
    }
    if (stackRatio < 0.3) {
      const raiseSize = Math.min(botChips, currentBet * 2);
      return { action: 'raise', amount: raiseSize };
    }
    return { action: 'call' };
  }
  
  if (adjustedPotential >= 0.6 || handStrength >= 4) {
    // Good hand - play cautiously aggressive
    if (currentBet === 0) return { action: 'check' };
    if (stackRatio < 0.15) return { action: 'call' };
    if (stackRatio < 0.25 && Math.random() < 0.3) {
      const raiseSize = Math.min(botChips, currentBet * 1.5);
      return { action: 'raise', amount: raiseSize };
    }
    return { action: 'call' };
  }
  
  if (adjustedPotential >= 0.4 || handStrength >= 2) {
    // Mediocre hand - play carefully
    if (currentBet === 0) return { action: 'check' };
    if (stackRatio < 0.1 && potOdds < 0.3) return { action: 'call' };
    if (shouldBluff() && currentBet > 0) {
      const bluffSize = Math.min(botChips, pot * 0.4);
      return { action: 'raise', amount: bluffSize };
    }
    return { action: 'fold' };
  }
  
  // Weak hand
  if (currentBet === 0) return { action: 'check' };
  if (shouldBluff() && stackRatio < 0.05) {
    const bluffSize = Math.min(botChips, pot * 0.6);
    return { action: 'raise', amount: bluffSize };
  }
  if (stackRatio < 0.05 && Math.random() < 0.1) return { action: 'call' }; // Desperate call
  return { action: 'fold' };
};
