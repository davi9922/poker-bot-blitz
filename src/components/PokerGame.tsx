
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import PokerCard from "./PokerCard";
import { usePokerGame } from "@/hooks/usePokerGame";
import { Coins, Bot, User } from "lucide-react";

const PokerGame = () => {
  const {
    gameState,
    playerHand,
    botHand,
    communityCards,
    currentBet,
    playerChips,
    botChips,
    pot,
    gamePhase,
    playerTurn,
    showdown,
    winner,
    playerAction,
    dealNewHand,
    resetGame
  } = usePokerGame();

  const [betAmount, setBetAmount] = useState(10);

  const handleCheck = () => playerAction('check');
  const handleCall = () => playerAction('call');
  const handleRaise = () => playerAction('raise', betAmount);
  const handleFold = () => playerAction('fold');

  const canCheck = currentBet === 0;
  const canCall = currentBet > 0;
  const canRaise = playerChips >= betAmount;

  return (
    <div className="max-w-6xl mx-auto">
      <Card className="bg-green-800 border-green-600 shadow-2xl">
        <div className="p-8">
          {/* Game Status */}
          <div className="flex justify-between items-center mb-6 bg-green-700 rounded-lg p-4">
            <div className="flex items-center gap-4 text-white">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5" />
                <span>Bot: {botChips} fichas</span>
              </div>
              <div className="flex items-center gap-2">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span>Pot: {pot}</span>
              </div>
              <div className="flex items-center gap-2">
                <User className="w-5 h-5" />
                <span>Tú: {playerChips} fichas</span>
              </div>
            </div>
            <div className="text-white">
              <span className="text-sm bg-green-600 px-3 py-1 rounded-full">
                {gamePhase === 'preflop' && 'Pre-Flop'}
                {gamePhase === 'flop' && 'Flop'}
                {gamePhase === 'turn' && 'Turn'}
                {gamePhase === 'river' && 'River'}
                {gamePhase === 'showdown' && 'Showdown'}
              </span>
            </div>
          </div>

          {/* Bot Hand */}
          <div className="text-center mb-8">
            <h3 className="text-white mb-4 flex items-center justify-center gap-2">
              <Bot className="w-5 h-5" />
              Bot
            </h3>
            <div className="flex justify-center gap-2">
              {botHand.map((card, index) => (
                <PokerCard 
                  key={index} 
                  card={showdown ? card : null} 
                  faceDown={!showdown}
                />
              ))}
            </div>
          </div>

          {/* Community Cards */}
          <div className="text-center mb-8">
            <h3 className="text-white mb-4">Mesa</h3>
            <div className="flex justify-center gap-2 bg-green-700 p-4 rounded-lg min-h-[120px] items-center">
              {communityCards.length > 0 ? (
                communityCards.map((card, index) => (
                  <PokerCard key={index} card={card} />
                ))
              ) : (
                <div className="text-green-300 text-lg">Esperando cartas...</div>
              )}
            </div>
          </div>

          {/* Player Hand */}
          <div className="text-center mb-8">
            <h3 className="text-white mb-4 flex items-center justify-center gap-2">
              <User className="w-5 h-5" />
              Tu mano
            </h3>
            <div className="flex justify-center gap-2">
              {playerHand.map((card, index) => (
                <PokerCard key={index} card={card} />
              ))}
            </div>
          </div>

          {/* Game Result */}
          {winner && (
            <div className="text-center mb-6">
              <div className={`text-2xl font-bold p-4 rounded-lg ${
                winner === 'player' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
              }`}>
                {winner === 'player' ? '¡Ganaste!' : 'El bot ganó'}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          {gameState === 'playing' && playerTurn && !showdown && (
            <div className="flex flex-wrap justify-center gap-4 mb-6">
              {canCheck && (
                <Button onClick={handleCheck} variant="outline" className="bg-green-600 text-white border-green-500 hover:bg-green-500">
                  Check
                </Button>
              )}
              {canCall && (
                <Button onClick={handleCall} className="bg-blue-600 hover:bg-blue-500">
                  Call ({currentBet})
                </Button>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Math.max(10, parseInt(e.target.value) || 10))}
                  min="10"
                  max={playerChips}
                  className="w-20 px-2 py-1 rounded border text-center bg-white"
                />
                <Button 
                  onClick={handleRaise} 
                  disabled={!canRaise}
                  className="bg-red-600 hover:bg-red-500"
                >
                  Raise
                </Button>
              </div>
              <Button onClick={handleFold} variant="destructive">
                Fold
              </Button>
            </div>
          )}

          {/* Control Buttons */}
          <div className="flex justify-center gap-4">
            {gameState === 'waiting' && (
              <Button onClick={dealNewHand} size="lg" className="bg-green-600 hover:bg-green-500">
                Repartir Cartas
              </Button>
            )}
            {(gameState === 'finished' || showdown) && (
              <Button onClick={dealNewHand} size="lg" className="bg-green-600 hover:bg-green-500">
                Nueva Mano
              </Button>
            )}
            <Button onClick={resetGame} variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-green-800">
              Reiniciar Juego
            </Button>
          </div>

          {/* Turn Indicator */}
          {gameState === 'playing' && !showdown && (
            <div className="text-center mt-4">
              <div className="text-white">
                {playerTurn ? 'Tu turno' : 'Turno del bot...'}
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default PokerGame;
