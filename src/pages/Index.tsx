
import PokerGame from "@/components/PokerGame";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-800 via-green-700 to-green-900">
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Poker Practice</h1>
          <p className="text-green-200">Practica tu juego contra un bot inteligente</p>
        </div>
        <PokerGame />
      </div>
    </div>
  );
};

export default Index;
