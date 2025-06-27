
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import PokerCard from "./PokerCard";
import GameSettings, { GameConfig } from "./GameSettings";
import ChipStack from "./ChipStack";
import CasinoChip from "./CasinoChip";
import { usePokerGame } from "@/hooks/usePokerGame";
import { Coins, Bot, User, Crown, Settings, Volume2, VolumeX, Pause, Play, Trophy, Star } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

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

  const [soundEnabled, setSoundEnabled] = useState(true);
  const [gameStatsPanelOpen, setGameStatsPanelOpen] = useState(false);
  const [quickBetAmounts] = useState([50, 100, 200, 500, 1000]);

  const { toast } = useToast();

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
  const handleAllIn = () => playerAction('raise', playerChips);

  const canCheck = currentBet === (players[0]?.currentBet || 0);
  const canCall = currentBet > (players[0]?.currentBet || 0);
  const canRaise = playerChips >= betAmount;
  const canAllIn = playerChips > 0;

  // Calculate player positions around the table
  const getPlayerPosition = (index: number, total: number) => {
    let angle;
    if (index === 0) {
      angle = 180;
    } else {
      const botIndex = index - 1;
      const totalBots = total - 1;
      if (totalBots === 1) {
        angle = 0;
      } else {
        const startAngle = 45;
        const endAngle = 315;
        const angleRange = endAngle - startAngle;
        angle = startAngle + (botIndex * angleRange) / (totalBots - 1);
      }
    }
    
    const radius = 50;
    const x = 50 + radius * Math.cos((angle - 90) * Math.PI / 180);
    const y = 50 + radius * Math.sin((angle - 90) * Math.PI / 180);
    return { x, y, angle };
  };

  const quickBet = (amount: number) => {
    setBetAmount(Math.min(amount, playerChips));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Casino Background Elements */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-10 left-10 w-32 h-32 bg-yellow-400 rounded-full blur-3xl"></div>
        <div className="absolute top-32 right-20 w-24 h-24 bg-red-500 rounded-full blur-2xl"></div>
        <div className="absolute bottom-20 left-32 w-40 h-40 bg-blue-500 rounded-full blur-3xl"></div>
        <div className="absolute bottom-32 right-16 w-28 h-28 bg-purple-500 rounded-full blur-2xl"></div>
      </div>

      {/* Top Casino Header */}
      <div className="relative z-10 bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 border-b-4 border-amber-600 shadow-2xl">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            {/* Casino Logo/Title */}
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-full flex items-center justify-center shadow-lg">
                <Crown className="w-6 h-6 text-amber-900" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white tracking-wide">ROYAL POKER</h1>
                <p className="text-amber-200 text-sm">Premium Casino Experience</p>
              </div>
            </div>

            {/* Top Controls */}
            <div className="flex items-center gap-4">
              {/* Sound Toggle */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setSoundEnabled(!soundEnabled)}
                className="text-white hover:bg-amber-700"
              >
                {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
              </Button>

              {/* Game Stats */}
              <Button 
                variant="ghost" 
                size="sm"
                onClick={() => setGameStatsPanelOpen(!gameStatsPanelOpen)}
                className="text-white hover:bg-amber-700"
              >
                <Trophy className="w-5 h-5 mr-2" />
                Stats
              </Button>

              {/* Settings */}
              <GameSettings 
                config={gameConfig} 
                onConfigChange={handleConfigChange} 
                onResetGame={resetGame} 
              />
            </div>
          </div>
        </div>
      </div>

      {/* Main Game Area */}
      <div className="relative z-10 max-w-7xl mx-auto p-8">
        <div className="relative w-[1000px] h-[700px] mx-auto">
          
          {/* Enhanced Poker Table with casino lighting */}
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
            {/* Table Shadow */}
            <div className="absolute inset-0 bg-black/30 rounded-full blur-xl transform translate-y-4"></div>
            
            <div className="w-[700px] h-[450px] bg-gradient-to-br from-amber-900 via-amber-800 to-amber-700 rounded-full border-8 border-amber-900 shadow-2xl relative">
              {/* Table edge lighting */}
              <div className="absolute inset-0 bg-gradient-to-br from-amber-600/30 via-transparent to-amber-900/50 rounded-full"></div>
              <div className="absolute inset-2 border-2 border-amber-600/50 rounded-full"></div>
              
              {/* Inner playing surface */}
              <div className="absolute inset-6 bg-gradient-to-br from-green-700 via-green-800 to-green-900 rounded-full border-4 border-green-600 shadow-inner relative overflow-hidden">
                {/* Felt pattern */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.1)_0%,transparent_50%)] rounded-full"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-green-900/30 rounded-full"></div>
                
                {/* Casino table pattern */}
                <div className="absolute inset-0 opacity-5">
                  <div className="absolute top-4 left-4 right-4 bottom-4 border border-green-400 rounded-full"></div>
                  <div className="absolute top-8 left-8 right-8 bottom-8 border border-green-400 rounded-full"></div>
                </div>
                
                {/* Central community cards area */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-28">
                  <div className="w-full h-full bg-gradient-to-br from-green-600 to-green-700 rounded-xl border-2 border-green-500 shadow-inner relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-green-400/20 to-transparent rounded-xl"></div>
                    <div className="absolute inset-2 border border-green-400/50 rounded-lg bg-green-600/30">
                      <div className="flex items-center justify-center h-full gap-2">
                        {communityCards.length > 0 ? (
                          communityCards.map((card, index) => (
                            <div key={index} className="transform hover:scale-105 transition-all duration-300 hover:rotate-2">
                              <PokerCard card={card} />
                            </div>
                          ))
                        ) : (
                          <div className="text-green-300 text-sm font-bold tracking-wider flex items-center gap-2">
                            <Star className="w-4 h-4" />
                            COMMUNITY CARDS
                            <Star className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Pot display */}
                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 mt-20">
                  <div className="flex flex-col items-center gap-3">
                    {pot > 0 && (
                      <div className="relative">
                        <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-lg"></div>
                        <ChipStack totalChips={pot} size="md" showTotal={false} />
                      </div>
                    )}
                    <div className="bg-gradient-to-r from-amber-600 via-amber-500 to-amber-600 text-white px-6 py-3 rounded-full shadow-xl border-2 border-amber-400 flex items-center gap-3 font-bold relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent"></div>
                      <Coins className="w-6 h-6 text-yellow-200 animate-pulse" />
                      <span className="text-lg relative z-10">POT: ${pot.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                {/* Game phase indicator */}
                <div className="absolute top-4 right-4">
                  <div className="bg-gradient-to-r from-purple-600 to-purple-500 text-white px-4 py-2 rounded-full text-sm font-bold shadow-lg border border-purple-400 flex items-center gap-2">
                    {gamePhase === 'preflop' && <>🃏 PRE-FLOP</>}
                    {gamePhase === 'flop' && <>🎰 FLOP</>}
                    {gamePhase === 'turn' && <>🎲 TURN</>}
                    {gamePhase === 'river' && <>🌊 RIVER</>}
                    {gamePhase === 'showdown' && <>👑 SHOWDOWN</>}
                  </div>
                </div>

                {/* Turn indicator */}
                {gameState === 'playing' && !showdown && (
                  <div className="absolute top-4 left-4">
                    <div className={`px-4 py-2 rounded-full text-sm font-bold shadow-lg flex items-center gap-2 ${
                      playerTurn 
                        ? 'bg-blue-600 text-white animate-pulse border-2 border-blue-400' 
                        : 'bg-gray-600 text-white border-2 border-gray-500'
                    }`}>
                      {playerTurn ? (
                        <>🎯 TU TURNO</>
                      ) : (
                        <>⏳ ESPERANDO...</>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Player positions around the table */}
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
                {/* Player info */}
                <div className={`${isHuman ? 'mb-6' : 'mt-6'} text-center relative`}>
                  {/* Player glow effect */}
                  {isCurrentPlayer && (
                    <div className="absolute inset-0 bg-yellow-400/20 rounded-full blur-xl animate-pulse"></div>
                  )}
                  
                  <div className={`flex items-center justify-center gap-3 px-6 py-3 rounded-full shadow-xl border-2 relative z-10 ${
                    isCurrentPlayer 
                      ? 'bg-gradient-to-r from-yellow-500 to-yellow-400 text-black border-yellow-300 shadow-yellow-400/50' 
                      : player.isBot 
                      ? 'bg-gradient-to-r from-red-600 to-red-700 text-white border-red-500' 
                      : 'bg-gradient-to-r from-blue-600 to-blue-700 text-white border-blue-500'
                  }`}>
                    {isWinner && <Crown className="w-5 h-5 text-yellow-300 animate-bounce" />}
                    {player.isBot ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                    <span className="text-sm font-bold">{player.name}</span>
                    {isCurrentPlayer && <div className="w-2 h-2 bg-white rounded-full animate-pulse"></div>}
                  </div>
                  
                  {/* Player chip stack */}
                  <div className="mt-3 flex flex-col items-center gap-2">
                    <ChipStack totalChips={player.chips} size="sm" />
                    {player.currentBet > 0 && (
                      <div className="flex items-center gap-2 bg-black/60 px-3 py-1 rounded-full border border-green-400">
                        <span className="text-xs text-green-200 font-semibold">Apostó:</span>
                        <CasinoChip value={player.currentBet} size="sm" />
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Player cards */}
                <div className="flex gap-2 justify-center">
                  {player.hand.map((card, cardIndex) => (
                    <div key={cardIndex} className="transform hover:scale-105 transition-all duration-300 hover:-translate-y-2">
                      <PokerCard 
                        card={showdown || !player.isBot ? card : null} 
                        faceDown={!showdown && player.isBot} 
                      />
                    </div>
                  ))}
                </div>
                
                {/* Folded indicator */}
                {player.isFolded && (
                  <div className="absolute inset-0 bg-red-900/80 rounded-lg flex items-center justify-center backdrop-blur-sm border-2 border-red-600">
                    <span className="text-red-300 font-bold text-lg shadow-lg">FOLD</span>
                  </div>
                )}
              </div>
            );
          })}

          {/* Enhanced Control Panel */}
          <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-full">
            {/* Game result */}
            {winners.length > 0 && (
              <div className="text-center mb-6">
                <div className={`inline-block text-3xl font-bold p-6 rounded-2xl shadow-2xl border-4 ${
                  winners.includes(0) ? 'bg-gradient-to-r from-green-600 to-green-500 text-white border-green-400' : 'bg-gradient-to-r from-red-600 to-red-500 text-white border-red-400'
                }`}>
                  {winners.includes(0) ? '🎉 ¡VICTORIA!' : '💀 DERROTA'}
                  {winners.length > 1 && ' (EMPATE)'}
                </div>
              </div>
            )}

            {/* Action buttons panel */}
            {gameState === 'playing' && playerTurn && !showdown && (
              <div className="bg-gradient-to-r from-slate-800 via-slate-700 to-slate-800 rounded-2xl p-6 mb-6 border-2 border-slate-600 shadow-2xl">
                {/* Quick bet amounts */}
                <div className="mb-4">
                  <div className="text-white text-sm font-semibold mb-2 text-center">APUESTAS RÁPIDAS</div>
                  <div className="flex justify-center gap-2">
                    {quickBetAmounts.map(amount => (
                      <Button
                        key={amount}
                        variant="outline"
                        size="sm"
                        onClick={() => quickBet(amount)}
                        disabled={amount > playerChips}
                        className="bg-amber-600 text-white border-amber-500 hover:bg-amber-500 disabled:opacity-50"
                      >
                        ${amount}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Main action buttons */}
                <div className="flex flex-wrap justify-center gap-4">
                  {canCheck && (
                    <Button 
                      onClick={handleCheck} 
                      variant="outline" 
                      size="lg"
                      className="bg-green-600 text-white border-green-500 hover:bg-green-500 shadow-lg min-w-[100px]"
                    >
                      ✅ Check
                    </Button>
                  )}
                  {canCall && (
                    <Button 
                      onClick={handleCall} 
                      size="lg"
                      className="bg-blue-600 hover:bg-blue-500 shadow-lg min-w-[120px]"
                    >
                      📞 Call ${currentBet - (players[0]?.currentBet || 0)}
                    </Button>
                  )}
                  
                  {/* Bet/Raise controls */}
                  <div className="flex items-center gap-3 bg-slate-900 rounded-lg p-3 shadow-lg border border-slate-600">
                    <input
                      type="range"
                      min={gameConfig.bigBlind}
                      max={playerChips}
                      value={betAmount}
                      onChange={(e) => setBetAmount(parseInt(e.target.value))}
                      className="w-32"
                    />
                    <input
                      type="number"
                      value={betAmount}
                      onChange={(e) => setBetAmount(Math.max(gameConfig.bigBlind, parseInt(e.target.value) || gameConfig.bigBlind))}
                      min={gameConfig.bigBlind}
                      max={playerChips}
                      className="w-20 px-2 py-1 rounded border text-center font-semibold bg-white text-black"
                    />
                    <Button 
                      onClick={handleRaise} 
                      disabled={!canRaise} 
                      size="lg"
                      className="bg-red-600 hover:bg-red-500 shadow-lg min-w-[100px]"
                    >
                      🚀 Raise
                    </Button>
                  </div>

                  {canAllIn && (
                    <Button 
                      onClick={handleAllIn} 
                      size="lg"
                      className="bg-purple-600 hover:bg-purple-500 shadow-lg min-w-[100px] font-bold"
                    >
                      💎 ALL IN
                    </Button>
                  )}
                  
                  <Button 
                    onClick={handleFold} 
                    variant="destructive" 
                    size="lg"
                    className="shadow-lg min-w-[100px]"
                  >
                    💔 Fold
                  </Button>
                </div>
              </div>
            )}

            {/* Game control buttons */}
            <div className="flex justify-center gap-4 pb-8">
              {gameState === 'waiting' && (
                <Button 
                  onClick={dealNewHand} 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-500 shadow-lg px-8 py-4 text-lg"
                >
                  🎯 Repartir Cartas
                </Button>
              )}
              {(gameState === 'finished' || showdown) && (
                <Button 
                  onClick={dealNewHand} 
                  size="lg" 
                  className="bg-green-600 hover:bg-green-500 shadow-lg px-8 py-4 text-lg"
                >
                  🔄 Nueva Mano
                </Button>
              )}
              <Button 
                onClick={resetGame} 
                variant="outline" 
                size="lg" 
                className="border-white text-white hover:bg-white hover:text-slate-800 shadow-lg px-8 py-4"
              >
                🎮 Reiniciar Juego
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PokerGame;
