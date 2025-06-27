
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Settings, Users, DollarSign, Clock, Zap } from "lucide-react";

export interface GameConfig {
  playerCount: number;
  startingChips: number;
  smallBlind: number;
  bigBlind: number;
  autoRaise: boolean;
  gameSpeed: number;
  playerNames: string[];
}

interface GameSettingsProps {
  config: GameConfig;
  onConfigChange: (config: GameConfig) => void;
  onResetGame: () => void;
}

const GameSettings = ({ config, onConfigChange, onResetGame }: GameSettingsProps) => {
  const [tempConfig, setTempConfig] = useState<GameConfig>(config);
  const [isOpen, setIsOpen] = useState(false);

  const handleSave = () => {
    onConfigChange(tempConfig);
    onResetGame();
    setIsOpen(false);
  };

  const updatePlayerName = (index: number, name: string) => {
    const newNames = [...tempConfig.playerNames];
    newNames[index] = name || `Jugador ${index + 1}`;
    setTempConfig({ ...tempConfig, playerNames: newNames });
  };

  const updatePlayerCount = (count: number) => {
    const newNames = Array(count).fill(0).map((_, i) => 
      tempConfig.playerNames[i] || `${i === 0 ? 'Tú' : i === 1 ? 'Bot' : `Bot ${i}`}`
    );
    setTempConfig({ ...tempConfig, playerCount: count, playerNames: newNames });
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-green-800">
          <Settings className="w-5 h-5 mr-2" />
          Configuración
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="w-5 h-5" />
            Configuración del Juego
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Número de Jugadores */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <label className="text-sm font-semibold">Número de Jugadores</label>
            </div>
            <div className="space-y-2">
              <Slider
                value={[tempConfig.playerCount]}
                onValueChange={([value]) => updatePlayerCount(value)}
                min={2}
                max={8}
                step={1}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600">
                {tempConfig.playerCount} jugadores
              </div>
            </div>
            
            {/* Nombres de Jugadores */}
            <div className="grid grid-cols-2 gap-2">
              {Array(tempConfig.playerCount).fill(0).map((_, index) => (
                <div key={index}>
                  <Input
                    placeholder={`${index === 0 ? 'Tu nombre' : `Nombre Bot ${index}`}`}
                    value={tempConfig.playerNames[index] || ''}
                    onChange={(e) => updatePlayerName(index, e.target.value)}
                    className="text-sm"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Configuración de Fichas */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <DollarSign className="w-4 h-4 text-green-600" />
              <label className="text-sm font-semibold">Fichas Iniciales</label>
            </div>
            <div className="space-y-2">
              <Slider
                value={[tempConfig.startingChips]}
                onValueChange={([value]) => setTempConfig({ ...tempConfig, startingChips: value })}
                min={500}
                max={10000}
                step={250}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600">
                {tempConfig.startingChips} fichas
              </div>
            </div>
          </div>

          {/* Blinds */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-3">
              <label className="text-sm font-semibold">Small Blind</label>
              <div className="space-y-2">
                <Slider
                  value={[tempConfig.smallBlind]}
                  onValueChange={([value]) => setTempConfig({ ...tempConfig, smallBlind: value })}
                  min={5}
                  max={100}
                  step={5}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600">
                  {tempConfig.smallBlind}
                </div>
              </div>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-semibold">Big Blind</label>
              <div className="space-y-2">
                <Slider
                  value={[tempConfig.bigBlind]}
                  onValueChange={([value]) => setTempConfig({ ...tempConfig, bigBlind: value })}
                  min={tempConfig.smallBlind * 2}
                  max={200}
                  step={5}
                  className="w-full"
                />
                <div className="text-center text-sm text-gray-600">
                  {tempConfig.bigBlind}
                </div>
              </div>
            </div>
          </div>

          {/* Velocidad del Juego */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-purple-600" />
              <label className="text-sm font-semibold">Velocidad del Juego</label>
            </div>
            <div className="space-y-2">
              <Slider
                value={[tempConfig.gameSpeed]}
                onValueChange={([value]) => setTempConfig({ ...tempConfig, gameSpeed: value })}
                min={0.5}
                max={3}
                step={0.5}
                className="w-full"
              />
              <div className="text-center text-sm text-gray-600">
                {tempConfig.gameSpeed === 0.5 ? 'Muy Lento' : 
                 tempConfig.gameSpeed === 1 ? 'Lento' :
                 tempConfig.gameSpeed === 1.5 ? 'Normal' :
                 tempConfig.gameSpeed === 2 ? 'Rápido' : 
                 tempConfig.gameSpeed === 2.5 ? 'Muy Rápido' : 'Ultra Rápido'}
              </div>
            </div>
          </div>

          {/* Auto Raise */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-600" />
              <label className="text-sm font-semibold">Subida Automática de Blinds</label>
            </div>
            <Switch
              checked={tempConfig.autoRaise}
              onCheckedChange={(checked) => setTempConfig({ ...tempConfig, autoRaise: checked })}
            />
          </div>

          {/* Botones */}
          <div className="flex gap-3 pt-4">
            <Button onClick={handleSave} className="flex-1">
              Aplicar Configuración
            </Button>
            <Button 
              variant="outline" 
              onClick={() => setIsOpen(false)}
              className="flex-1"
            >
              Cancelar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default GameSettings;
