import { useState, useCallback, useEffect } from "react";
import { PlayingCard } from "@/components/PokerCard";
import { createDeck, getBestHand, getBotAction } from "@/utils/pokerUtils";
import { useToast } from "@/hooks/use-toast";
import { GameConfig } from "@/components/GameSettings";

export type GameState = 'waiting' | 'playing' | 'finished';
export type GamePhase = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
export type PlayerAction = 'check' | 'call' | 'raise' | 'fold';

export interface Player {
  id: number;
  name: string;
  chips: number;
  hand: PlayingCard[];
  currentBet: number;
  isBot: boolean;
  isFolded: boolean;
  isActive: boolean;
}

export const usePokerGame = (config: GameConfig) => {
  const { toast } = useToast();
  
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [gamePhase, setGamePhase] = useState<GamePhase>('preflop');
  const [deck, setDeck] = useState<PlayingCard[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [communityCards, setCommunityCards] = useState<PlayingCard[]>([]);
  const [pot, setPot] = useState(0);
  const [currentBet, setCurrentBet] = useState(0);
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [showdown, setShowdown] = useState(false);
  const [winners, setWinners] = useState<number[]>([]);

  // Bot personalities for more variety
  const botPersonalities: ('aggressive' | 'conservative' | 'balanced')[] = [
    'balanced', 'aggressive', 'conservative', 'balanced', 'aggressive', 'conservative'
  ];

  // Initialize players based on config
  const initializePlayers = useCallback(() => {
    const newPlayers: Player[] = Array(config.playerCount).fill(0).map((_, index) => ({
      id: index,
      name: config.playerNames[index] || (index === 0 ? 'Tú' : `Bot ${index}`),
      chips: config.startingChips,
      hand: [],
      currentBet: 0,
      isBot: index !== 0,
      isFolded: false,
      isActive: true
    }));
    setPlayers(newPlayers);
  }, [config]);

  const resetGame = useCallback(() => {
    console.log('Resetting game');
    setGameState('waiting');
    setGamePhase('preflop');
    setCommunityCards([]);
    setPot(0);
    setCurrentBet(0);
    setCurrentPlayerIndex(0);
    setShowdown(false);
    setWinners([]);
    initializePlayers();
  }, [initializePlayers]);

  const moveToNextPlayer = useCallback(() => {
    setCurrentPlayerIndex(prevIndex => {
      const nextIndex = (prevIndex + 1) % players.length;
      // Skip folded players
      let finalIndex = nextIndex;
      let attempts = 0;
      while (players[finalIndex]?.isFolded && attempts < players.length) {
        finalIndex = (finalIndex + 1) % players.length;
        attempts++;
      }
      return finalIndex;
    });
  }, [players.length]);

  const checkRoundComplete = useCallback(() => {
    const activePlayers = players.filter(p => !p.isFolded);
    if (activePlayers.length <= 1) return true;
    
    // Check if all active players have equal bets or if everyone has acted
    const maxBet = Math.max(...activePlayers.map(p => p.currentBet));
    const allBetsEqual = activePlayers.every(p => p.currentBet === maxBet);
    
    return allBetsEqual;
  }, [players]);

  // Enhanced bot AI logic with personalities
  const executeBotAction = useCallback(() => {
    const currentPlayer = players[currentPlayerIndex];
    if (!currentPlayer || !currentPlayer.isBot || showdown) return;

    console.log(`Bot ${currentPlayer.name} is thinking...`);
    
    const personality = botPersonalities[currentPlayerIndex - 1] || 'balanced';
    const botAction = getBotAction(
      currentPlayer.hand,
      communityCards,
      currentBet - currentPlayer.currentBet,
      currentPlayer.chips,
      pot,
      gamePhase,
      personality
    );

    console.log(`Bot ${currentPlayer.name} (${personality}) decides to:`, botAction);

    // Execute bot action after a delay to simulate thinking
    setTimeout(() => {
      const updatedPlayers = [...players];
      
      if (botAction.action === 'fold') {
        updatedPlayers[currentPlayerIndex].isFolded = true;
        toast({
          title: "Bot se retira",
          description: `${currentPlayer.name} se retira de la mano`,
        });
      } else if (botAction.action === 'check') {
        toast({
          title: "Bot hace check",
          description: `${currentPlayer.name} hace check`,
        });
      } else if (botAction.action === 'call') {
        const callAmount = currentBet - currentPlayer.currentBet;
        updatedPlayers[currentPlayerIndex].chips -= callAmount;
        updatedPlayers[currentPlayerIndex].currentBet = currentBet;
        setPot(prev => prev + callAmount);
        toast({
          title: "Bot iguala",
          description: `${currentPlayer.name} iguala con ${callAmount} fichas`,
        });
      } else if (botAction.action === 'raise') {
        const raiseAmount = botAction.amount || 20;
        const totalBet = Math.max(currentBet + raiseAmount, currentPlayer.currentBet + raiseAmount);
        const actualBet = totalBet - currentPlayer.currentBet;
        updatedPlayers[currentPlayerIndex].chips -= actualBet;
        updatedPlayers[currentPlayerIndex].currentBet = totalBet;
        setCurrentBet(totalBet);
        setPot(prev => prev + actualBet);
        toast({
          title: "Bot sube la apuesta",
          description: `${currentPlayer.name} sube a ${totalBet} fichas`,
        });
      }
      
      setPlayers(updatedPlayers);
      
      // Check if only one player remains
      const activePlayers = updatedPlayers.filter(p => !p.isFolded);
      if (activePlayers.length === 1) {
        setWinners([activePlayers[0].id]);
        updatedPlayers[activePlayers[0].id].chips += pot;
        setPot(0);
        setGameState('finished');
        toast({
          title: "Ganador por abandono",
          description: `${activePlayers[0].name} gana ${pot} fichas`,
        });
        return;
      }
      
      moveToNextPlayer();
    }, 1000 + Math.random() * 2000);
  }, [players, currentPlayerIndex, currentBet, pot, communityCards, showdown, toast, moveToNextPlayer, gamePhase]);

  // Check if round is complete and move to next phase
  useEffect(() => {
    if (gameState !== 'playing' || showdown) return;
    
    if (checkRoundComplete()) {
      setTimeout(() => {
        nextPhase();
      }, 1500);
    } else if (players[currentPlayerIndex]?.isBot && !players[currentPlayerIndex]?.isFolded) {
      executeBotAction();
    }
  }, [currentPlayerIndex, players, gameState, showdown, checkRoundComplete]);

  const dealNewHand = useCallback(() => {
    console.log('Dealing new hand');
    const newDeck = createDeck();
    let deckIndex = 0;
    
    // Deal 2 cards to each player
    const updatedPlayers = players.map(player => ({
      ...player,
      hand: [newDeck[deckIndex++], newDeck[deckIndex++]],
      currentBet: 0,
      isFolded: false,
      isActive: player.chips > 0
    }));
    
    setDeck(newDeck.slice(deckIndex));
    setPlayers(updatedPlayers);
    setCommunityCards([]);
    setGameState('playing');
    setGamePhase('preflop');
    setCurrentBet(config.bigBlind);
    setCurrentPlayerIndex(0);
    setShowdown(false);
    setWinners([]);
    
    // Apply blinds
    const playersWithBlinds = [...updatedPlayers];
    playersWithBlinds[0].chips -= config.smallBlind;
    playersWithBlinds[0].currentBet = config.smallBlind;
    if (playersWithBlinds.length > 1) {
      playersWithBlinds[1].chips -= config.bigBlind;
      playersWithBlinds[1].currentBet = config.bigBlind;
    }
    
    setPlayers(playersWithBlinds);
    setPot(config.smallBlind + config.bigBlind);
    
    toast({
      title: "Nueva mano",
      description: "Las cartas han sido repartidas",
    });
  }, [players, config, toast]);

  const nextPhase = useCallback(() => {
    console.log('Moving to next phase, current:', gamePhase);
    let newDeck = [...deck];
    let newCommunityCards = [...communityCards];
    
    if (gamePhase === 'preflop') {
      newCommunityCards = [...communityCards, newDeck[0], newDeck[1], newDeck[2]];
      newDeck = newDeck.slice(3);
      setGamePhase('flop');
    } else if (gamePhase === 'flop') {
      newCommunityCards = [...communityCards, newDeck[0]];
      newDeck = newDeck.slice(1);
      setGamePhase('turn');
    } else if (gamePhase === 'turn') {
      newCommunityCards = [...communityCards, newDeck[0]];
      newDeck = newDeck.slice(1);
      setGamePhase('river');
    } else if (gamePhase === 'river') {
      setGamePhase('showdown');
      setShowdown(true);
      
      // Determine winners with detailed hand information
      const activePlayers = players.filter(p => !p.isFolded);
      const playerHands = activePlayers.map(player => ({
        playerId: player.id,
        playerName: player.name,
        hand: getBestHand(player.hand, communityCards)
      }));
      
      const bestStrength = Math.max(...playerHands.map(ph => ph.hand.strength));
      const gameWinners = playerHands.filter(ph => ph.hand.strength === bestStrength);
      
      setWinners(gameWinners.map(w => w.playerId));
      
      // Distribute pot
      const winnerShare = Math.floor(pot / gameWinners.length);
      const updatedPlayers = players.map(player => {
        if (gameWinners.some(w => w.playerId === player.id)) {
          return { ...player, chips: player.chips + winnerShare };
        }
        return player;
      });
      
      setPlayers(updatedPlayers);
      setPot(0);
      setGameState('finished');
      
      // Enhanced winner announcement with hand details
      const winnerInfo = gameWinners[0];
      const winnerNames = gameWinners.map(w => w.playerName).join(', ');
      
      toast({
        title: gameWinners.length > 1 ? "¡Empate!" : "¡Tenemos ganador!",
        description: `${winnerNames} ${gameWinners.length > 1 ? 'se reparten' : 'gana'} el pot de ${pot} fichas con ${winnerInfo.hand.description}${winnerInfo.hand.highCard ? ` (${winnerInfo.hand.highCard})` : ''}`,
        duration: 8000,
      });
      
      return;
    }
    
    setCommunityCards(newCommunityCards);
    setDeck(newDeck);
    setCurrentBet(0);
    
    // Reset player bets for new phase
    const resetPlayers = players.map(player => ({ ...player, currentBet: 0 }));
    setPlayers(resetPlayers);
    setCurrentPlayerIndex(0);
  }, [gamePhase, deck, communityCards, players, pot, toast]);

  const playerAction = useCallback((action: PlayerAction, amount?: number) => {
    const currentPlayer = players[currentPlayerIndex];
    if (!currentPlayer || currentPlayer.isBot || showdown) return;
    
    console.log('Player action:', action, amount);
    
    const updatedPlayers = [...players];
    
    if (action === 'fold') {
      updatedPlayers[currentPlayerIndex].isFolded = true;
      
      const activePlayers = updatedPlayers.filter(p => !p.isFolded);
      if (activePlayers.length === 1) {
        // Only one player left
        setWinners([activePlayers[0].id]);
        updatedPlayers[activePlayers[0].id].chips += pot;
        setPot(0);
        setGameState('finished');
        toast({
          title: "Ganador por abandono",
          description: `${activePlayers[0].name} gana ${pot} fichas`,
        });
      }
    } else if (action === 'check' || action === 'call') {
      const callAmount = currentBet - currentPlayer.currentBet;
      updatedPlayers[currentPlayerIndex].chips -= callAmount;
      updatedPlayers[currentPlayerIndex].currentBet = currentBet;
      setPot(prev => prev + callAmount);
    } else if (action === 'raise') {
      const raiseAmount = amount || 20;
      const totalBet = currentPlayer.currentBet + raiseAmount;
      updatedPlayers[currentPlayerIndex].chips -= raiseAmount;
      updatedPlayers[currentPlayerIndex].currentBet = totalBet;
      setCurrentBet(totalBet);
      setPot(prev => prev + raiseAmount);
    }
    
    setPlayers(updatedPlayers);
    moveToNextPlayer();
  }, [players, currentPlayerIndex, currentBet, pot, showdown, toast, moveToNextPlayer]);

  // Initialize players when config changes
  useEffect(() => {
    initializePlayers();
  }, [initializePlayers]);

  // Get current player info for backward compatibility
  const playerHand = players[0]?.hand || [];
  const botHand = players[1]?.hand || [];
  const playerChips = players[0]?.chips || 0;
  const botChips = players[1]?.chips || 0;
  const playerTurn = currentPlayerIndex === 0;

  // Enhanced return with hand information
  const getDetailedWinners = () => {
    return winners.map(winnerId => {
      const player = players.find(p => p.id === winnerId);
      if (!player) return null;
      const hand = getBestHand(player.hand, communityCards);
      return {
        id: winnerId,
        name: player.name,
        hand: hand,
        isHuman: winnerId === 0
      };
    }).filter(Boolean);
  };

  return {
    gameState,
    gamePhase,
    players,
    playerHand,
    botHand,
    communityCards,
    currentBet,
    playerChips,
    botChips,
    pot,
    playerTurn,
    showdown,
    winner: winners.length === 1 ? (winners[0] === 0 ? 'player' : 'bot') : null,
    winners,
    detailedWinners: getDetailedWinners(),
    currentPlayerIndex,
    playerAction,
    dealNewHand,
    resetGame
  };
};
