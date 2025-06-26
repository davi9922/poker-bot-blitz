
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

export const evaluateHand = (cards: PlayingCard[]): { strength: number; description: string } => {
  if (cards.length < 5) return { strength: 0, description: 'Incomplete hand' };

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

  // Hand rankings (higher is better)
  if (isStraight && isFlush) {
    if (ranks[0] === 14 && ranks[1] === 13) return { strength: 10, description: 'Royal Flush' };
    return { strength: 9, description: 'Straight Flush' };
  }
  if (counts[0] === 4) return { strength: 8, description: 'Four of a Kind' };
  if (counts[0] === 3 && counts[1] === 2) return { strength: 7, description: 'Full House' };
  if (isFlush) return { strength: 6, description: 'Flush' };
  if (isStraight) return { strength: 5, description: 'Straight' };
  if (counts[0] === 3) return { strength: 4, description: 'Three of a Kind' };
  if (counts[0] === 2 && counts[1] === 2) return { strength: 3, description: 'Two Pair' };
  if (counts[0] === 2) return { strength: 2, description: 'One Pair' };
  return { strength: 1, description: 'High Card' };
};

export const getBestHand = (playerCards: PlayingCard[], communityCards: PlayingCard[]): { strength: number; description: string } => {
  const allCards = [...playerCards, ...communityCards];
  if (allCards.length < 5) return { strength: 0, description: 'Not enough cards' };

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
  let bestHand = { strength: 0, description: 'No hand' };
  combinations.forEach(combo => {
    const handValue = evaluateHand(combo);
    if (handValue.strength > bestHand.strength) {
      bestHand = handValue;
    }
  });

  return bestHand;
};

export const getBotAction = (
  hand: PlayingCard[], 
  communityCards: PlayingCard[], 
  currentBet: number, 
  botChips: number,
  pot: number
): { action: 'check' | 'call' | 'raise' | 'fold'; amount?: number } => {
  const handStrength = getBestHand(hand, communityCards).strength;
  const potOdds = currentBet / (pot + currentBet);
  
  console.log(`Bot evaluating: hand strength ${handStrength}, pot odds ${potOdds}, current bet ${currentBet}`);

  // Simple AI logic
  if (handStrength >= 7) { // Full house or better
    if (currentBet === 0) return { action: 'raise', amount: Math.min(botChips, pot * 2) };
    return { action: 'raise', amount: Math.min(botChips, currentBet * 2) };
  }
  
  if (handStrength >= 4) { // Three of a kind or better
    if (currentBet === 0) return { action: 'check' };
    if (currentBet <= botChips * 0.2) return { action: 'call' };
    return { action: 'raise', amount: Math.min(botChips, currentBet * 1.5) };
  }
  
  if (handStrength >= 2) { // Pair or better
    if (currentBet === 0) return { action: 'check' };
    if (currentBet <= botChips * 0.1) return { action: 'call' };
    return { action: 'fold' };
  }
  
  // Weak hand
  if (currentBet === 0) return { action: 'check' };
  if (Math.random() < 0.2 && currentBet <= botChips * 0.05) return { action: 'call' }; // Occasional bluff
  return { action: 'fold' };
};
