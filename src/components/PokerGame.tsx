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
  const [animatingBets, setAnimatingBets] = useState<{[key: number]: boolean}>({});

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
  const handleCall = () => {
    setAnimatingBets({...animatingBets, 0: true});
    setTimeout(() => setAnimatingBets({...animatingBets, 0: false}), 1000);
    playerAction('call');
  };
  const handleRaise = () => {
    setAnimatingBets({...animatingBets, 0: true});
    setTimeout(() => setAnimatingBets({...animatingBets, 0: false}), 1000);
    playerAction('raise', betAmount);
  };
  const handleFold = () => playerAction('fold');
  const handleAllIn = () => {
    setAnimatingBets({...animatingBets, 0: true});
    setTimeout(() => setAnimatingBets({...animatingBets, 0: false}), 1000);
    playerAction('raise', players[0]?.chips || 0);
  };

  const canCheck = currentBet === (players[0]?.currentBet || 0);
  const canCall = currentBet > (players[0]?.currentBet || 0);
  const canRaise = (players[0]?.chips || 0) >= betAmount;
  const canAllIn = (players[0]?.chips || 0) > 0;

  // Calculate player positions much further outside the table
  const getPlayerPosition = (index: number, total: number) => {
    if (index === 0) {
      // Human player at bottom, much further from table
      return { x: 50, y: 98, angle: 0 };
    }
    
    const botIndex = index - 1;
    const totalBots = total - 1;
    
    const positions = [];
    
    if (totalBots === 1) {
      positions.push({ x: 50, y: 2, angle: 180 }); // Top, much further out
    } else if (totalBots === 2) {
      positions.push(
        { x: 10, y: 10, angle: 135 }, // Top left, much further out
        { x: 90, y: 10, angle: 45 }   // Top right, much further out
      );
    } else if (totalBots === 3) {
      positions.push(
        { x: 50, y: 2, angle: 180 },  // Top center, much further out
        { x: 5, y: 20, angle: 135 }, // Left, much further out
        { x: 95, y: 20, angle: 45 }   // Right, much further out
      );
    } else if (totalBots === 4) {
      positions.push(
        { x: 20, y: 5, angle: 160 }, // Top left, much further out
        { x: 80, y: 5, angle: 20 },  // Top right, much further out
        { x: 2, y: 25, angle: 120 },  // Mid left, much further out
        { x: 98, y: 25, angle: 60 }   // Mid right, much further out
      );
    } else if (totalBots === 5) {
      positions.push(
        { x: 50, y: 2, angle: 180 },  // Top center, much further out
        { x: 15, y: 6, angle: 135 }, // Top left, much further out
        { x: 85, y: 6, angle: 45 },  // Top right, much further out
        { x: 2, y: 30, angle: 120 }, // Mid left, much further out
        { x: 98, y: 30, angle: 60 }   // Mid right, much further out
      );
    }
    
    return positions[botIndex] || { x: 50, y: 2, angle: 180 };
  };

  // Get card position with more space from player names
  const getCardPosition = (index: number, total: number) => {
    if (index === 0) {
      // Human player cards - much more space above chips
      return { x: 50, y: 82, angle: 0 };
    }
    
    const botIndex = index - 1;
    const totalBots = total - 1;
    
    const positions = [];
    
    if (totalBots === 1) {
      positions.push({ x: 50, y: 18, angle: 180 });
    } else if (totalBots === 2) {
      positions.push(
        { x: 10, y: 30, angle: 135 },
        { x: 90, y: 30, angle: 45 }
      );
    } else if (totalBots === 3) {
      positions.push(
        { x: 50, y: 18, angle: 180 },
        { x: 5, y: 40, angle: 135 },
        { x: 95, y: 40, angle: 45 }
      );
    } else if (totalBots === 4) {
      positions.push(
        { x: 20, y: 25, angle: 160 },
        { x: 80, y: 25, angle: 20 },
        { x: 2, y: 45, angle: 120 },
        { x: 98, y: 45, angle: 60 }
      );
    } else if (totalBots === 5) {
      positions.push(
        { x: 50, y: 18, angle: 180 },
        { x: 15, y: 26, angle: 135 },
        { x: 85, y: 26, angle: 45 },
        { x: 2, y: 50, angle: 120 },
        { x: 98, y: 50, angle: 60 }
      );
    }
    
    return positions[botIndex] || { x: 50, y: 18, angle: 180 };
  };

  // Get chip position between player name and cards with more spacing
  const getChipPosition = (index: number, total: number) => {
    if (index === 0) {
      // Human player chips - between player name and cards with more space
      return { x: 50, y: 88, angle: 0 };
    }
    
    const botIndex = index - 1;
    const totalBots = total - 1;
    
    const positions = [];
    
    if (totalBots === 1) {
      positions.push({ x: 50, y: 12, angle: 180 });
    } else if (totalBots === 2) {
      positions.push(
        { x: 10, y: 22, angle: 135 },
        { x: 90, y: 22, angle: 45 }
      );
    } else if (totalBots === 3) {
      positions.push(
        { x: 50, y: 12, angle: 180 },
        { x: 5, y: 32, angle: 135 },
        { x: 95, y: 32, angle: 45 }
      );
    } else if (totalBots === 4) {
      positions.push(
        { x: 20, y: 17, angle: 160 },
        { x: 80, y: 17, angle: 20 },
        { x: 2, y: 37, angle: 120 },
        { x: 98, y: 37, angle: 60 }
      );
    } else if (totalBots === 5) {
      positions.push(
        { x: 50, y: 12, angle: 180 },
        { x: 15, y: 18, angle: 135 },
        { x: 85, y: 18, angle: 45 },
        { x: 2, y: 42, angle: 120 },
        { x: 98, y: 42, angle: 60 }
      );
    }
    
    return positions[botIndex] || { x: 50, y: 12, angle: 180 };
  };

  const getPlayerAvatar = (index: number) => {
    const avatars = ['👤', '🧑‍💼', '👩‍💻', '🧑‍🎨', '👩‍🔬', '🧑‍🍳'];
    return avatars[index] || '🤖';
  };

  const adjustBetAmount = (delta: number) => {
    const newAmount = Math.max(gameConfig.bigBlind, Math.min(players[0]?.chips || 0, betAmount + delta));
    setBetAmount(newAmount);
  };

  // Get pot chip representation
  const getPotChips = () => {
    if (pot === 0) return [];
    const chipValues = [1000, 500, 100, 50, 25, 10, 5];
    const chips = [];
    let remaining = pot;
    
    for (const value of chipValues) {
      const count = Math.floor(remaining / value);
      if (count > 0) {
        chips.push({ value, count: Math.min(count, 8) }); // Max 8 chips per stack
        remaining -= count * value;
      }
      if (chips.length >= 6) break; // Max 6 different chip types
    }
    
    return chips;
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
              <div className="w-[700px] h-[350px] bg-gradient-to-br from-slate-700 via-slate-800 to-slate-700 rounded-full relative shadow-2xl border-4 border-slate-600">
                {/* Table felt */}
                <div className="absolute inset-4 bg-gradient-to-br from-emerald-800 via-emerald-900 to-emerald-800 rounded-full shadow-inner">
                  
                  {/* Community Cards Area */}
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex gap-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                      <div key={index} className="w-20 h-28 bg-slate-700/50 rounded-lg border border-slate-600 flex items-center justify-center">
                        {communityCards[index] ? (
                          <PokerCard card={communityCards[index]} />
                        ) : (
                          <div className="text-slate-500 text-sm">?</div>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Game Phase */}
                  <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-slate-900/80 backdrop-blur-sm px-3 py-1 rounded-full border border-slate-600">
                      <div className="text-blue-400 font-semibold text-xs uppercase">
                        {gamePhase}
                      </div>
                    </div>
                  </div>

                  {/* Pot Display */}
                  <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
                    <div className="bg-slate-900/80 backdrop-blur-sm px-4 py-2 rounded-full border border-slate-600">
                      <div className="text-yellow-400 font-bold text-sm">Pot ${pot.toLocaleString()}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Central Pot Chips */}
            {pot > 0 && (
              <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-12">
                <div className="flex items-center justify-center gap-1">
                  {getPotChips().map((chip, index) => (
                    <div key={chip.value} className="relative animate-fade-in" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="flex flex-col items-center">
                        {Array.from({ length: Math.min(chip.count, 5) }).map((_, stackIndex) => (
                          <div 
                            key={stackIndex}
                            className="absolute"
                            style={{ 
                              top: `-${stackIndex * 2}px`,
                              zIndex: stackIndex + 1
                            }}
                          >
                            <CasinoChip value={chip.value} size="sm" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Players around the table - now much further outside with proper spacing */}
            {players.map((player, index) => {
              const playerPosition = getPlayerPosition(index, players.length);
              const cardPosition = getCardPosition(index, players.length);
              const chipPosition = getChipPosition(index, players.length);
              const isCurrentPlayer = currentPlayerIndex === index;
              const isWinner = winners.includes(player.id);
              const isHuman = index === 0;
              
              return (
                <div key={player.id}>
                  {/* Player Avatar and Info - Much further outside table */}
                  <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${playerPosition.x}%`,
                      top: `${playerPosition.y}%`
                    }}
                  >
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
                      
                      {/* Player Name */}
                      <div className="text-center">
                        <div className="text-white text-sm font-semibold">{player.name}</div>
                        <div className="text-slate-400 text-xs">${player.chips.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>

                  {/* Player Chips - Between player name and cards with more space */}
                  <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${chipPosition.x}%`,
                      top: `${chipPosition.y}%`
                    }}
                  >
                    <ChipStack totalChips={player.chips} size="sm" showTotal={false} />
                  </div>

                  {/* Player Cards - Much further outside table with proper spacing */}
                  <div
                    className="absolute transform -translate-x-1/2 -translate-y-1/2"
                    style={{
                      left: `${cardPosition.x}%`,
                      top: `${cardPosition.y}%`
                    }}
                  >
                    <div className="flex gap-1 justify-center">
                      {player.hand.map((card, cardIndex) => (
                        <div key={cardIndex} className="w-12 h-16">
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

                  {/* Current Bet - Near the table edge */}
                  {player.currentBet > 0 && (
                    <div 
                      className={`absolute transform -translate-x-1/2 -translate-y-1/2 ${animatingBets[index] ? 'animate-pulse' : ''}`}
                      style={{
                        left: `${cardPosition.x + (isHuman ? 0 : (cardPosition.x > 50 ? -8 : 8))}%`,
                        top: `${cardPosition.y + (isHuman ? -8 : 8)}%`
                      }}
                    >
                      <div className="flex gap-1 mb-1 justify-center">
                        {player.currentBet >= 100 && <CasinoChip value={100} size="sm" />}
                        {player.currentBet >= 50 && player.currentBet % 100 >= 50 && <CasinoChip value={50} size="sm" />}
                        {player.currentBet >= 25 && player.currentBet % 50 >= 25 && <CasinoChip value={25} size="sm" />}
                      </div>
                      <div className="bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold text-center">
                        ${player.currentBet.toLocaleString()}
                      </div>
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
