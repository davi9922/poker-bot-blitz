
import { useState, useCallback, useEffect } from "react";
import { PlayingCard } from "@/components/PokerCard";
import { createDeck, getBestHand, getBotAction } from "@/utils/pokerUtils";
import { useToast } from "@/hooks/use-toast";

export type GameState = 'waiting' | 'playing' | 'finished';
export type GamePhase = 'preflop' | 'flop' | 'turn' | 'river' | 'showdown';
export type PlayerAction = 'check' | 'call' | 'raise' | 'fold';

export const usePokerGame = () => {
  const { toast } = useToast();
  
  const [gameState, setGameState] = useState<GameState>('waiting');
  const [gamePhase, setGamePhase] = useState<GamePhase>('preflop');
  const [deck, setDeck] = useState<PlayingCard[]>([]);
  const [playerHand, setPlayerHand] = useState<PlayingCard[]>([]);
  const [botHand, setBotHand] = useState<PlayingCard[]>([]);
  const [communityCards, setCommunityCards] = useState<PlayingCard[]>([]);
  const [playerChips, setPlayerChips] = useState(1000);
  const [botChips, setBotChips] = useState(1000);
  const [pot, setPot] = useState(0);
  const [currentBet, setCurrentBet] = useState(0);
  const [playerTurn, setPlayerTurn] = useState(true);
  const [showdown, setShowdown] = useState(false);
  const [winner, setWinner] = useState<'player' | 'bot' | null>(null);
  const [playerBet, setPlayerBet] = useState(0);
  const [botBet, setBotBet] = useState(0);

  const resetGame = useCallback(() => {
    console.log('Resetting game');
    setGameState('waiting');
    setGamePhase('preflop');
    setPlayerHand([]);
    setBotHand([]);
    setCommunityCards([]);
    setPlayerChips(1000);
    setBotChips(1000);
    setPot(0);
    setCurrentBet(0);
    setPlayerTurn(true);
    setShowdown(false);
    setWinner(null);
    setPlayerBet(0);
    setBotBet(0);
  }, []);

  const dealNewHand = useCallback(() => {
    console.log('Dealing new hand');
    const newDeck = createDeck();
    const newPlayerHand = [newDeck[0], newDeck[1]];
    const newBotHand = [newDeck[2], newDeck[3]];
    
    setDeck(newDeck.slice(4));
    setPlayerHand(newPlayerHand);
    setBotHand(newBotHand);
    setCommunityCards([]);
    setGameState('playing');
    setGamePhase('preflop');
    setCurrentBet(0);
    setPlayerTurn(true);
    setShowdown(false);
    setWinner(null);
    setPlayerBet(0);
    setBotBet(0);
    
    // Blinds
    const smallBlind = 5;
    const bigBlind = 10;
    setPlayerChips(prev => prev - smallBlind);
    setBotChips(prev => prev - bigBlind);
    setPot(smallBlind + bigBlind);
    setCurrentBet(bigBlind);
    
    toast({
      title: "Nueva mano",
      description: "Las cartas han sido repartidas",
    });
  }, [toast]);

  const nextPhase = useCallback(() => {
    console.log('Moving to next phase, current:', gamePhase);
    let newDeck = [...deck];
    let newCommunityCards = [...communityCards];
    
    if (gamePhase === 'preflop') {
      // Deal flop (3 cards)
      newCommunityCards = [...communityCards, newDeck[0], newDeck[1], newDeck[2]];
      newDeck = newDeck.slice(3);
      setGamePhase('flop');
    } else if (gamePhase === 'flop') {
      // Deal turn (1 card)
      newCommunityCards = [...communityCards, newDeck[0]];
      newDeck = newDeck.slice(1);
      setGamePhase('turn');
    } else if (gamePhase === 'turn') {
      // Deal river (1 card)
      newCommunityCards = [...communityCards, newDeck[0]];
      newDeck = newDeck.slice(1);
      setGamePhase('river');
    } else if (gamePhase === 'river') {
      setGamePhase('showdown');
      setShowdown(true);
      
      // Determine winner
      const playerBest = getBestHand(playerHand, communityCards);
      const botBest = getBestHand(botHand, communityCards);
      
      console.log('Player hand:', playerBest);
      console.log('Bot hand:', botBest);
      
      if (playerBest.strength > botBest.strength) {
        setWinner('player');
        setPlayerChips(prev => prev + pot);
        toast({
          title: "¡Ganaste!",
          description: `Tu ${playerBest.description} venció ${botBest.description}`,
        });
      } else if (botBest.strength > playerBest.strength) {
        setWinner('bot');
        setBotChips(prev => prev + pot);
        toast({
          title: "El bot ganó",
          description: `${botBest.description} venció tu ${playerBest.description}`,
        });
      } else {
        // Tie - split pot
        const halfPot = Math.floor(pot / 2);
        setPlayerChips(prev => prev + halfPot);
        setBotChips(prev => prev + (pot - halfPot));
        toast({
          title: "Empate",
          description: "El pot se divide",
        });
      }
      
      setPot(0);
      setGameState('finished');
      return;
    }
    
    setCommunityCards(newCommunityCards);
    setDeck(newDeck);
    setCurrentBet(0);
    setPlayerBet(0);
    setBotBet(0);
    setPlayerTurn(true);
  }, [gamePhase, deck, communityCards, playerHand, botHand, pot, toast]);

  const processBotAction = useCallback(() => {
    if (!playerTurn || showdown) return;
    
    setTimeout(() => {
      const botActionResult = getBotAction(botHand, communityCards, currentBet - botBet, botChips, pot);
      console.log('Bot action:', botActionResult);
      
      if (botActionResult.action === 'fold') {
        setWinner('player');
        setPlayerChips(prev => prev + pot);
        setPot(0);
        setGameState('finished');
        toast({
          title: "El bot se retiró",
          description: "¡Ganaste el pot!",
        });
      } else if (botActionResult.action === 'check') {
        if (playerBet === botBet) {
          nextPhase();
        } else {
          setPlayerTurn(true);
        }
      } else if (botActionResult.action === 'call') {
        const callAmount = currentBet - botBet;
        setBotChips(prev => prev - callAmount);
        setBotBet(currentBet);
        setPot(prev => prev + callAmount);
        
        if (playerBet === currentBet) {
          nextPhase();
        } else {
          setPlayerTurn(true);
        }
      } else if (botActionResult.action === 'raise') {
        const raiseAmount = botActionResult.amount || 20;
        const totalBet = botBet + raiseAmount;
        setBotChips(prev => prev - raiseAmount);
        setBotBet(totalBet);
        setCurrentBet(totalBet);
        setPot(prev => prev + raiseAmount);
        setPlayerTurn(true);
        
        toast({
          title: "El bot subió la apuesta",
          description: `Apostó ${raiseAmount} fichas`,
        });
      }
    }, 1500);
  }, [playerTurn, showdown, botHand, communityCards, currentBet, botBet, botChips, pot, playerBet, nextPhase, toast]);

  const playerAction = useCallback((action: PlayerAction, amount?: number) => {
    if (!playerTurn || showdown) return;
    
    console.log('Player action:', action, amount);
    
    if (action === 'fold') {
      setWinner('bot');
      setBotChips(prev => prev + pot);
      setPot(0);
      setGameState('finished');
      toast({
        title: "Te retiraste",
        description: "El bot ganó el pot",
      });
    } else if (action === 'check') {
      if (currentBet === playerBet) {
        setPlayerTurn(false);
        if (botBet === playerBet) {
          nextPhase();
        } else {
          processBotAction();
        }
      }
    } else if (action === 'call') {
      const callAmount = currentBet - playerBet;
      setPlayerChips(prev => prev - callAmount);
      setPlayerBet(currentBet);
      setPot(prev => prev + callAmount);
      setPlayerTurn(false);
      
      if (botBet === currentBet) {
        nextPhase();
      } else {
        processBotAction();
      }
    } else if (action === 'raise') {
      const raiseAmount = amount || 20;
      const totalBet = playerBet + raiseAmount;
      setPlayerChips(prev => prev - raiseAmount);
      setPlayerBet(totalBet);
      setCurrentBet(totalBet);
      setPot(prev => prev + raiseAmount);
      setPlayerTurn(false);
      processBotAction();
    }
  }, [playerTurn, showdown, currentBet, playerBet, botBet, pot, nextPhase, processBotAction, toast]);

  // Auto-process bot action when it's bot's turn
  useEffect(() => {
    if (!playerTurn && gameState === 'playing' && !showdown) {
      processBotAction();
    }
  }, [playerTurn, gameState, showdown, processBotAction]);

  return {
    gameState,
    gamePhase,
    playerHand,
    botHand,
    communityCards,
    currentBet,
    playerChips,
    botChips,
    pot,
    playerTurn,
    showdown,
    winner,
    playerAction,
    dealNewHand,
    resetGame
  };
};
