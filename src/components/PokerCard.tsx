import { Card as UICard } from "@/components/ui/card";
export interface PlayingCard {
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  rank: 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';
}
interface PokerCardProps {
  card: PlayingCard | null;
  faceDown?: boolean;
}
const PokerCard = ({
  card,
  faceDown = false
}: PokerCardProps) => {
  const getSuitSymbol = (suit: string) => {
    switch (suit) {
      case 'hearts':
        return '♥';
      case 'diamonds':
        return '♦';
      case 'clubs':
        return '♣';
      case 'spades':
        return '♠';
      default:
        return '';
    }
  };
  const getSuitColor = (suit: string) => {
    return suit === 'hearts' || suit === 'diamonds' ? 'text-red-500' : 'text-slate-800';
  };
  if (faceDown || !card) {
    return <UICard className="w-full h-full bg-gradient-to-br from-slate-600 to-slate-700 border-slate-500 flex items-center justify-center shadow-lg rounded-lg">
        <div className="w-6 h-6 bg-slate-400 rounded-full opacity-50"></div>
      </UICard>;
  }
  return <UICard className="w-full h-full bg-white border-gray-200 flex flex-col items-center justify-between p-2 shadow-lg hover:shadow-xl transition-shadow rounded-lg">
      <div className={`text-xs font-bold ${getSuitColor(card.suit)} self-start leading-none`}>
        <div className="text-center">{card.rank}</div>
        <div className="text-center text-[10px]">{getSuitSymbol(card.suit)}</div>
      </div>
      <div className={`text-lg ${getSuitColor(card.suit)}`}>
        {getSuitSymbol(card.suit)}
      </div>
      <div className={`text-xs font-bold ${getSuitColor(card.suit)} self-end transform rotate-180 leading-none`}>
        <div className="text-center">{card.rank}</div>
        <div className="text-center text-[10px]">{getSuitSymbol(card.suit)}</div>
      </div>
    </UICard>;
};
export default PokerCard;