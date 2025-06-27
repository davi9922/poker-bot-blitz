
import { Card } from "@/components/ui/card";
import { Trophy, TrendingUp, Target, Clock } from "lucide-react";

interface GameStats {
  handsPlayed: number;
  handsWon: number;
  totalWinnings: number;
  biggestPot: number;
  playTime: number;
}

interface GameStatsPanelProps {
  stats: GameStats;
  isOpen: boolean;
  onClose: () => void;
}

const GameStatsPanel = ({ stats, isOpen, onClose }: GameStatsPanelProps) => {
  if (!isOpen) return null;

  const winRate = stats.handsPlayed > 0 ? (stats.handsWon / stats.handsPlayed * 100).toFixed(1) : 0;

  return (
    <div className="fixed top-20 right-4 z-50 w-80">
      <Card className="bg-gradient-to-br from-slate-800 to-slate-900 border-2 border-amber-600 shadow-2xl">
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-bold text-white flex items-center gap-2">
              <Trophy className="w-5 h-5 text-yellow-400" />
              Estadísticas
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white text-xl"
            >
              ×
            </button>
          </div>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-blue-400" />
                <span className="text-gray-300">Manos Jugadas</span>
              </div>
              <span className="text-white font-semibold">{stats.handsPlayed}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
              <div className="flex items-center gap-2">
                <Trophy className="w-4 h-4 text-green-400" />
                <span className="text-gray-300">Manos Ganadas</span>
              </div>
              <span className="text-white font-semibold">{stats.handsWon}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-yellow-400" />
                <span className="text-gray-300">% de Victoria</span>
              </div>
              <span className="text-white font-semibold">{winRate}%</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-2xl">💰</span>
                <span className="text-gray-300">Ganancias</span>
              </div>
              <span className={`font-semibold ${stats.totalWinnings >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                ${stats.totalWinnings.toLocaleString()}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏆</span>
                <span className="text-gray-300">Mayor Bote</span>
              </div>
              <span className="text-white font-semibold">${stats.biggestPot.toLocaleString()}</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-slate-700 rounded-lg">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-purple-400" />
                <span className="text-gray-300">Tiempo Jugado</span>
              </div>
              <span className="text-white font-semibold">{Math.floor(stats.playTime / 60)}m</span>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default GameStatsPanel;
