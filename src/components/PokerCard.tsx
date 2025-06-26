
import { Card as UICard } from "@/components/ui/card";

export interface PlayingCard {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
}

interface PokerCardProps {
  card: PlayingCard | null;
  faceDown?: boolean;
}

const PokerCard = ({ card, faceDown = false }: PokerCardProps) => {
  const getSuitSymbol = (suit: string) => {
    switch (suit) {
      case 'hearts': return '♥';
      case 'diamonds': return '♦';
      case 'clubs': return '♣';
      case 'spades': return '♠';
      default: return '';
    }
  };

  const getSuitColor = (suit: string) => {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-600' : 'text-black';
  };

  if (faceDown || !card) {
    return (
      <UICard className="w-16 h-24 bg-gradient-to-br from-blue-800 to-blue-900 border-blue-700 flex items-center justify-center shadow-lg">
        <div className="text-blue-300 text-xs font-bold transform rotate-45">POKER</div>
      </UICard>
    );
  }

  return (
    <UICard className="w-16 h-24 bg-white border-gray-300 flex flex-col items-center justify-between p-1 shadow-lg hover:shadow-xl transition-shadow">
      <div className={`text-xs font-bold ${getSuitColor(card.suit)} self-start`}>
        <div>{card.rank}</div>
        <div>{getSuitSymbol(card.suit)}</div>
      </div>
      <div className={`text-2xl ${getSuitColor(card.suit)}`}>
        {getSuitSymbol(card.suit)}
      </div>
      <div className={`text-xs font-bold ${getSuitColor(card.suit)} self-end transform rotate-180`}>
        <div>{card.rank}</div>
        <div>{getSuitSymbol(card.suit)}</div>
      </div>
    </UICard>
  );
};

export default PokerCard;
