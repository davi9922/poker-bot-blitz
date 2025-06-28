
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import PokerCard from "./PokerCard";
import GameSettings, { GameConfig } from "./GameSettings";
import ChipStack from "./ChipStack";
import CasinoChip from "./CasinoChip";
import { usePokerGame } from "@/hooks/usePokerGame";
import { Coins, Bot, User, Crown, Settings, Volume2, VolumeX, Trophy, Star, Minus, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const PokerGame = () => {
  const [gameConfig, setGameConfig] = useState<GameConfig>({
    playerCount: 6,
    startingChips: 10000,
    smallBlind: 50,
    bigBlind: 100,
    autoRaise: false,
    gameSpeed: 1.5,
    playerNames: ['Tú', 'Alice', 'Bob', 'Charlie', 'Diana', 'Eve']
  });

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [betAmount, setBetAmount] = useState(gameConfig.bigBlind);

  const { toast } = useToast();

  const {
    gameState,
    players,
    communityCards,
    currentBet,
    pot,
    gamePhase,
    playerTurn,
    showdown,
    winners,
    currentPlayerIndex,
    playerAction,
    dealNewHand,
    resetGame
  } = usePokerGame(gameConfig);

  const handleConfigChange = (newConfig: GameConfig) => {
    setGameConfig(newConfig);
    setBetAmount(newConfig.bigBlind);
  };

  const handleCheck = () => playerAction('check');
  const handleCall = () => playerAction('call');
  const handleRaise = () => playerAction('raise', betAmount);
  const handleFold = () => playerAction('fold');
  const handleAllIn = () => playerAction('raise', players[0]?.chips || 0);

  const canCheck = currentBet === (players[0]?.currentBet || 0);
  const canCall = currentBet > (players[0]?.currentBet || 0);
  const canRaise = (players[0]?.chips || 0) >= betAmount;
  const canAllIn = (players[0]?.chips || 0) > 0;

  // Calculate player positions around the table (oval shape)
  const getPlayerPosition = (index: number, total: number) => {
    if (index === 0) {
      // Human player always at bottom
      return { x: 50, y: 85, angle: 0 };
    }
    
    const botIndex = index - 1;
    const totalBots = total - 1;
    let angle;
    
    if (totalBots === 1) {
      angle = 180; // Top center
    } else {
      // Distribute bots around the top and sides
      const angleStep = 180 / (totalBots - 1);
      angle = 180 - (botIndex * angleStep);
    }
    
    const radiusX = 42; // Horizontal radius
    const radiusY = 28; // Vertical radius
    const x = 50 + radiusX * Math.cos((angle - 90) * Math.PI / 180);
    const y = 50 + radiusY * Math.sin((angle - 90) * Math.PI / 180);
    
    return { x, y, angle };
  };

  const getPlayerAvatar = (index: number) => {
    const avatars = ['👤', '🧑‍💼', '👩‍💻', '🧑‍🎨', '👩‍🔬', '🧑‍🍳'];
    return avatars[index] || '🤖';
  };

  const adjustBetAmount = (delta: number) => {
    const newAmount = Math.max(gameConfig.bigBlind, Math.min(players[0]?.chips || 0, betAmount + delta));
    setBetAmount(newAmount);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-800 via-slate-900 to-slate-800 relative overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-64 h-64 bg-blue-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-64 h-64 bg-purple-500/20 rounded-full blur-3xl"></div>
      </div>

      {/* Top UI Bar */}
      <div className="relative z-10 bg-slate-900/80 backdrop-blur-sm border-b border-slate-700">
        <div className="container mx-auto px-6 py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="text-xl font-bold text-white">AION POKER</div>
              <div className="text-slate-400 text-sm">Premium Experience</div>
            </div>
            
            <div className="flex items-center gap-2">
              <div className="text-yellow-400 font-bold">Pot ${pot.toLocaleString()}</div>
              <Button variant="ghost" size="sm" onClick={() => setSoundEnabled(!soundEnabled)}>
                {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </Button>
              <GameSettings config={gameConfig} onConfigChange={handleConfigChange} onResetGame={resetGame} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="relative z-10 p-8">
        <div className="max-w-6xl mx-auto">
          <div className="relative w-full h-[600px]">
            
            {/* Modern Poker Table */}
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              <div className="w-[800px] h-[400px] bg-gradient-to-br from-slate-700 via-slate-800 to-slate-700 rounded-full relative shadow-2xl border-4 border-slate-600">
                {/* Table felt */}
                <div className="absolute inset-4 bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-800 rounded-full shadow-inner">
                  
                  {/* Community Cards Area */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-2">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="w-12 h-16 bg-slate-700/50 rounded-lg border border-slate-600 flex items-center justify-center">
                        {communityCards[index] ? (
                          <PokerCard card={communityCards[index]} />
                        ) : (
                          <div className="text-slate-500 text-xs">?</div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Pot indicator */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-16">
                    <div className="bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-600">
                      <div className="text-yellow-400 font-bold text-sm">Pot ${pot.toLocaleString()}</div>
                    </div>
                  </div>

                  {/* Game Phase */}
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-slate-900/80 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-600">
                      <div className="text-blue-400 font-semibold text-xs uppercase">
                        {gamePhase}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Players around the table */}
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
                  {/* Player Avatar and Info */}
                  <div className="flex flex-col items-center gap-2">
                    {/* Avatar */}
                    <div className={`relative w-16 h-16 rounded-full flex items-center justify-center text-2xl border-2 ${
                      isCurrentPlayer 
                        ? 'bg-blue-500 border-blue-400 shadow-lg shadow-blue-500/50' 
                        : 'bg-slate-700 border-slate-600'
                    }`}>
                      {isWinner && <Crown className="absolute -top-2 -right-2 w-6 h-6 text-yellow-400" />}
                      <span>{getPlayerAvatar(index)}</span>
                      {isCurrentPlayer && (
                        <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white animate-pulse"></div>
                      )}
                    </div>
                    
                    {/* Player Name and Chips */}
                    <div className="text-center">
                      <div className="text-white text-sm font-semibold">{player.name}</div>
                      <div className="text-slate-400 text-xs">${player.chips.toLocaleString()}</div>
                    </div>
                    
                    {/* Current Bet */}
                    {player.currentBet > 0 && (
                      <div className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">
                        ${player.currentBet.toLocaleString()}
                      </div>
                    )}
                  </div>
                  
                  {/* Player Cards */}
                  <div className={`flex gap-1 mt-2 justify-center ${isHuman ? 'mt-4' : ''}`}>
                    {player.hand.map((card, cardIndex) => (
                      <div key={cardIndex} className="w-8 h-12">
                        <PokerCard 
                          card={showdown || !player.isBot ? card : null} 
                          faceDown={!showdown && player.isBot} 
                        />
                      </div>
                    ))}
                  </div>
                  
                  {/* Folded overlay */}
                  {player.isFolded && (
                    <div className="absolute inset-0 bg-red-900/80 rounded-lg flex items-center justify-center">
                      <span className="text-red-300 font-bold text-sm">FOLD</span>
                    </div>
                  )}
                </div>
              );
            })}

            {/* Game Result */}
            {winners.length > 0 && (
              <div className="absolute top-8 left-1/2 transform -translate-x-1/2">
                <div className={`text-2xl font-bold p-4 rounded-xl shadow-lg ${
                  winners.includes(0) ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                }`}>
                  {winners.includes(0) ? '🎉 ¡VICTORIA!' : '💀 DERROTA'}
                </div>
              </div>
            )}
          </div>

          {/* Bottom Control Panel */}
          <div className="mt-8">
            {gameState === 'playing' && playerTurn && !showdown && (
              <div className="bg-slate-900/90 backdrop-blur-sm rounded-2xl p-6 border border-slate-700">
                <div className="flex items-center justify-center gap-4">
                  
                  {/* Fold Button */}
                  <Button 
                    onClick={handleFold} 
                    className="bg-red-600 hover:bg-red-500 text-white px-8 py-3 rounded-full font-bold"
                  >
                    FOLD
                  </Button>

                  {/* Check/Call Button */}
                  {canCheck ? (
                    <Button 
                      onClick={handleCheck} 
                      className="bg-gray-600 hover:bg-gray-500 text-white px-8 py-3 rounded-full font-bold"
                    >
                      CHECK
                    </Button>
                  ) : canCall ? (
                    <Button 
                      onClick={handleCall} 
                      className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-full font-bold"
                    >
                      CALL ${(currentBet - (players[0]?.currentBet || 0)).toLocaleString()}
                    </Button>
                  ) : null}

                  {/* Bet Controls */}
                  <div className="flex items-center gap-2 bg-slate-800 rounded-full p-2">
                    <Button
                      onClick={() => adjustBetAmount(-gameConfig.bigBlind)}
                      disabled={betAmount <= gameConfig.bigBlind}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-slate-700"
                    >
                      <Minus className="w-4 h-4" />
                    </Button>
                    
                    <div className="text-white font-bold px-4">
                      ${betAmount.toLocaleString()}
                    </div>
                    
                    <Button
                      onClick={() => adjustBetAmount(gameConfig.bigBlind)}
                      disabled={betAmount >= (players[0]?.chips || 0)}
                      variant="ghost"
                      size="sm"
                      className="text-white hover:bg-slate-700"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>

                  {/* Raise Button */}
                  <Button 
                    onClick={handleRaise} 
                    disabled={!canRaise}
                    className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-full font-bold"
                  >
                    RAISE
                  </Button>

                  {/* All In Button */}
                  {canAllIn && (
                    <Button 
                      onClick={handleAllIn} 
                      className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-full font-bold"
                    >
                      ALL IN
                    </Button>
                  )}
                </div>
              </div>
            )}

            {/* Game Control Buttons */}
            <div className="flex justify-center gap-4 mt-4">
              {gameState === 'waiting' && (
                <Button 
                  onClick={dealNewHand} 
                  className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-full font-bold"
                >
                  🎯 DEAL CARDS
                </Button>
              )}
              {(gameState === 'finished' || showdown) && (
                <Button 
                  onClick={dealNewHand} 
                  className="bg-green-600 hover:bg-green-500 text-white px-8 py-3 rounded-full font-bold"
                >
                  🔄 NEXT HAND
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokerGame;
