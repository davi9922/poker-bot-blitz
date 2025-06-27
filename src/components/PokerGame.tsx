
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import PokerCard from "./PokerCard";
import GameSettings, { GameConfig } from "./GameSettings";
import ChipStack from "./ChipStack";
import CasinoChip from "./CasinoChip";
import { usePokerGame } from "@/hooks/usePokerGame";
import { Coins, Bot, User, Crown } from "lucide-react";

const PokerGame = () => {
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    playerCount: 2,
    startingChips: 1000,
    smallBlind: 5,
    bigBlind: 10,
    autoRaise: false,
    gameSpeed: 1.5,
    playerNames: ['Tú', 'Bot']
  });

  const {
    gameState,
    players,
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
    winners,
    currentPlayerIndex,
    playerAction,
    dealNewHand,
    resetGame
  } = usePokerGame(gameConfig);

  const [betAmount, setBetAmount] = useState(gameConfig.bigBlind);

  const handleConfigChange = (newConfig: GameConfig) => {
    setGameConfig(newConfig);
    setBetAmount(newConfig.bigBlind);
  };

  const handleCheck = () => playerAction('check');
  const handleCall = () => playerAction('call');
  const handleRaise = () => playerAction('raise', betAmount);
  const handleFold = () => playerAction('fold');

  const canCheck = currentBet === (players[0]?.currentBet || 0);
  const canCall = currentBet > (players[0]?.currentBet || 0);
  const canRaise = playerChips >= betAmount;

  // Calculate player positions around the table - human player always at bottom
  const getPlayerPosition = (index: number, total: number) => {
    let angle;
    if (index === 0) {
      // Human player always at bottom (180 degrees)
      angle = 180;
    } else {
      // Distribute other players around the rest of the table
      const botIndex = index - 1;
      const totalBots = total - 1;
      if (totalBots === 1) {
        angle = 0; // Single bot at top
      } else {
        // Distribute bots from 45 to 315 degrees (avoiding bottom area)
        const startAngle = 45;
        const endAngle = 315;
        const angleRange = endAngle - startAngle;
        angle = startAngle + (botIndex * angleRange) / (totalBots - 1);
      }
    }
    
    const radius = 35; // percentage from center
    const x = 50 + radius * Math.cos((angle - 90) * Math.PI / 180);
    const y = 50 + radius * Math.sin((angle - 90) * Math.PI / 180);
    return { x, y, angle };
  };

  return (
    <div className="max-w-7xl mx-auto">
      {/* Enhanced Poker Table */}
      <div className="relative">
        {/* Outer table ring with premium look */}
        <div className="mx-auto w-[900px] h-[600px] bg-gradient-to-br from-amber-900 via-amber-800 to-amber-700 rounded-full border-8 border-amber-900 shadow-2xl relative">
          {/* Table texture overlay */}
          <div className="absolute inset-0 bg-gradient-to-br from-transparent via-amber-700/20 to-amber-900/40 rounded-full"></div>
          
          {/* Inner playing surface */}
          <div className="absolute inset-6 bg-gradient-to-br from-green-700 via-green-800 to-green-900 rounded-full border-4 border-green-600 shadow-inner">
            {/* Felt texture */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-green-900/30 rounded-full"></div>
            
            {/* Central community cards area with premium styling */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-36 bg-gradient-to-br from-green-600 to-green-700 rounded-xl border-2 border-green-500 shadow-inner">
              {/* Inner border for cards */}
              <div className="absolute inset-2 border border-green-400 rounded-lg bg-green-600/50">
                <div className="flex items-center justify-center h-full gap-2">
                  {communityCards.length > 0 ? (
                    communityCards.map((card, index) => (
                      <div key={index} className="transform hover:scale-105 transition-transform">
                        <PokerCard card={card} />
                      </div>
                    ))
                  ) : (
                    <div className="text-green-300 text-sm font-semibold tracking-wide">
                      COMMUNITY CARDS
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Enhanced Pot display with casino chips */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-24">
              <div className="flex flex-col items-center gap-2">
                {pot > 0 && <ChipStack totalChips={pot} size="sm" showTotal={false} />}
                <div className="bg-gradient-to-r from-amber-600 to-amber-500 text-white px-6 py-3 rounded-full shadow-xl border-2 border-amber-400 flex items-center gap-3 font-bold text-lg">
                  <Coins className="w-6 h-6 text-yellow-200 animate-pulse" />
                  <span>POT: {pot.toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* Dynamic player positions */}
            {players.map((player, index) => {
              const position = getPlayerPosition(index, players.length);
              const isCurrentPlayer = currentPlayerIndex === index;
              const isWinner = winners.includes(player.id);
              const isHuman = index === 0;
              
              return (
                <div
                  key={player.id}
                  className="absolute transform -translate-x-1/2 -translate-y-1/2"
                  style={{
                    left: `${position.x}%`,
                    top: `${position.y}%`
                  }}
                >
                  {/* Player info with enhanced styling */}
                  <div className={`mb-3 text-center ${isHuman ? 'mb-20' : 'mt-20'}`}>
                    <div className={`flex items-center justify-center gap-2 px-4 py-2 rounded-full shadow-lg border-2 ${
                      isCurrentPlayer 
                        ? 'bg-yellow-500 text-black border-yellow-400 animate-pulse' 
                        : player.isBot 
                        ? 'bg-red-600 text-white border-red-500' 
                        : 'bg-blue-600 text-white border-blue-500'
                    }`}>
                      {isWinner && <Crown className="w-4 h-4 text-yellow-300" />}
                      {player.isBot ? <Bot className="w-4 h-4" /> : <User className="w-4 h-4" />}
                      <span className="text-sm font-bold">{player.name}</span>
                    </div>
                    
                    {/* Player chip stack */}
                    <div className="mt-2 flex flex-col items-center gap-1">
                      <ChipStack totalChips={player.chips} size="sm" />
                      {player.currentBet > 0 && (
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-green-200">Apostó:</span>
                          <CasinoChip value={player.currentBet} size="sm" />
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Player cards */}
                  <div className="flex gap-2 justify-center">
                    {player.hand.map((card, cardIndex) => (
                      <div key={cardIndex} className="transform hover:scale-105 transition-transform">
                        <PokerCard 
                          card={showdown || !player.isBot ? card : null} 
                          faceDown={!showdown && player.isBot} 
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Folded indicator */}
                  {player.isFolded && (
                    <div className="absolute inset-0 bg-black/50 rounded-lg flex items-center justify-center">
                      <span className="text-red-500 font-bold text-sm">FOLD</span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Game phase indicator with enhanced styling */}
            <div className="absolute top-6 right-6">
              <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg border border-purple-400">
                {gamePhase === 'preflop' && '🃏 PRE-FLOP'}
                {gamePhase === 'flop' && '🎰 FLOP'}
                {gamePhase === 'turn' && '🎲 TURN'}
                {gamePhase === 'river' && '🌊 RIVER'}
                {gamePhase === 'showdown' && '👑 SHOWDOWN'}
              </div>
            </div>

            {/* Turn indicator */}
            {gameState === 'playing' && !showdown && (
              <div className="absolute top-6 left-6">
                <div className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg ${
                  playerTurn 
                    ? 'bg-blue-600 text-white animate-pulse' 
                    : 'bg-gray-600 text-white'
                }`}>
                  {playerTurn ? '🎯 TU TURNO' : '⏳ ESPERANDO...'}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Control area below table */}
        <div className="mt-8 text-center space-y-4">
          {/* Game result */}
          {winners.length > 0 && (
            <div className={`text-2xl font-bold p-4 rounded-lg inline-block shadow-lg ${
              winners.includes(0) ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
            }`}>
              {winners.includes(0) ? '🎉 ¡GANASTE!' : '😔 PERDISTE'}
              {winners.length > 1 && ' (EMPATE)'}
            </div>
          )}

          {/* Action buttons with enhanced styling */}
          {gameState === 'playing' && playerTurn && !showdown && (
            <div className="flex flex-wrap justify-center gap-4">
              {canCheck && (
                <Button 
                  onClick={handleCheck} 
                  variant="outline" 
                  className="bg-green-600 text-white border-green-500 hover:bg-green-500 shadow-lg"
                >
                  ✅ Check
                </Button>
              )}
              {canCall && (
                <Button 
                  onClick={handleCall} 
                  className="bg-blue-600 hover:bg-blue-500 shadow-lg"
                >
                  📞 Call ({currentBet - (players[0]?.currentBet || 0)})
                </Button>
              )}
              <div className="flex items-center gap-3 bg-white rounded-lg p-2 shadow-lg">
                <input
                  type="number"
                  value={betAmount}
                  onChange={(e) => setBetAmount(Math.max(gameConfig.bigBlind, parseInt(e.target.value) || gameConfig.bigBlind))}
                  min={gameConfig.bigBlind}
                  max={playerChips}
                  className="w-24 px-3 py-2 rounded border text-center font-semibold"
                />
                <Button 
                  onClick={handleRaise} 
                  disabled={!canRaise} 
                  className="bg-red-600 hover:bg-red-500 shadow-lg"
                >
                  🚀 Raise
                </Button>
              </div>
              <Button 
                onClick={handleFold} 
                variant="destructive" 
                className="shadow-lg"
              >
                💔 Fold
              </Button>
            </div>
          )}

          {/* Game control buttons */}
          <div className="flex justify-center gap-4">
            {gameState === 'waiting' && (
              <Button 
                onClick={dealNewHand} 
                size="lg" 
                className="bg-green-600 hover:bg-green-500 shadow-lg"
              >
                🎯 Repartir Cartas
              </Button>
            )}
            {(gameState === 'finished' || showdown) && (
              <Button 
                onClick={dealNewHand} 
                size="lg" 
                className="bg-green-600 hover:bg-green-500 shadow-lg"
              >
                🔄 Nueva Mano
              </Button>
            )}
            <GameSettings 
              config={gameConfig} 
              onConfigChange={handleConfigChange} 
              onResetGame={resetGame} 
            />
            <Button 
              onClick={resetGame} 
              variant="outline" 
              size="lg" 
              className="border-white text-white hover:bg-white hover:text-green-800 shadow-lg"
            >
              🎮 Reiniciar Juego
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokerGame;
