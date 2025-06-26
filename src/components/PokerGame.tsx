
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
    <div className="max-w-7xl mx-auto">
      {/* Mesa de Póker */}
      <div className="relative">
        {/* Mesa ovalada principal */}
        <div className="mx-auto w-[800px] h-[500px] bg-gradient-to-br from-green-800 via-green-700 to-green-900 rounded-full border-8 border-amber-800 shadow-2xl relative overflow-hidden">
          {/* Borde interior de la mesa */}
          <div className="absolute inset-4 bg-gradient-to-br from-green-700 to-green-800 rounded-full border-4 border-amber-700">
            {/* Área central para cartas comunitarias */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-32 bg-green-600 rounded-lg border-2 border-green-500 flex items-center justify-center gap-2 shadow-inner">
              {communityCards.length > 0 ? (
                communityCards.map((card, index) => (
                  <PokerCard key={index} card={card} />
                ))
              ) : (
                <div className="text-green-300 text-sm font-semibold">Mesa de Cartas</div>
              )}
            </div>

            {/* Pot en el centro */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-20">
              <div className="bg-amber-600 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-bold">
                <Coins className="w-5 h-5 text-yellow-300" />
                <span>Pot: {pot}</span>
              </div>
            </div>

            {/* Posición del Bot (arriba) */}
            <div className="absolute top-8 left-1/2 transform -translate-x-1/2 text-center">
              <div className="flex items-center justify-center gap-2 mb-2 text-white bg-green-600 px-3 py-1 rounded-full">
                <Bot className="w-4 h-4" />
                <span className="text-sm font-semibold">Bot: {botChips} fichas</span>
              </div>
              <div className="flex gap-2 justify-center">
                {botHand.map((card, index) => (
                  <PokerCard 
                    key={index} 
                    card={showdown ? card : null} 
                    faceDown={!showdown}
                  />
                ))}
              </div>
            </div>

            {/* Posición del Player (abajo) */}
            <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 text-center">
              <div className="flex gap-2 justify-center mb-2">
                {playerHand.map((card, index) => (
                  <PokerCard key={index} card={card} />
                ))}
              </div>
              <div className="flex items-center justify-center gap-2 text-white bg-blue-600 px-3 py-1 rounded-full">
                <User className="w-4 h-4" />
                <span className="text-sm font-semibold">Tú: {playerChips} fichas</span>
              </div>
            </div>

            {/* Indicador de fase del juego */}
            <div className="absolute top-4 right-4">
              <div className="bg-amber-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
                {gamePhase === 'preflop' && 'Pre-Flop'}
                {gamePhase === 'flop' && 'Flop'}
                {gamePhase === 'turn' && 'Turn'}
                {gamePhase === 'river' && 'River'}
                {gamePhase === 'showdown' && 'Showdown'}
              </div>
            </div>

            {/* Indicador de turno */}
            {gameState === 'playing' && !showdown && (
              <div className="absolute top-4 left-4">
                <div className={`px-3 py-1 rounded-full text-sm font-semibold ${
                  playerTurn ? 'bg-blue-600 text-white' : 'bg-red-600 text-white'
                }`}>
                  {playerTurn ? 'Tu turno' : 'Turno del bot'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Área de controles debajo de la mesa */}
        <div className="mt-8 text-center space-y-4">
          {/* Resultado del juego */}
          {winner && (
            <div className={`text-2xl font-bold p-4 rounded-lg inline-block ${
              winner === 'player' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}>
              {winner === 'player' ? '¡Ganaste!' : 'El bot ganó'}
            </div>
          )}

          {/* Botones de acción */}
          {gameState === 'playing' && playerTurn && !showdown && (
            <div className="flex flex-wrap justify-center gap-4">
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

          {/* Botones de control del juego */}
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
        </div>
      </div>
    </div>
  );
};

export default PokerGame;
