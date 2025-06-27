
import PokerGame from "@/components/PokerGame";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 relative overflow-hidden">
      {/* Casino atmosphere background */}
      <div className="absolute inset-0">
        {/* Animated background elements */}
        <div className="absolute top-20 left-20 w-64 h-64 bg-yellow-400/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-40 right-32 w-48 h-48 bg-red-500/5 rounded-full blur-2xl animate-pulse delay-1000"></div>
        <div className="absolute bottom-32 left-64 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-48 right-48 w-56 h-56 bg-purple-500/5 rounded-full blur-2xl animate-pulse delay-3000"></div>
        
        {/* Subtle grid pattern */}
        <div className="absolute inset-0 opacity-5">
          <div className="h-full w-full" style={{
            backgroundImage: `
              linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
              linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
            `,
            backgroundSize: '50px 50px'
          }}></div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10">
        <PokerGame />
      </div>

      {/* Casino floor ambient lighting effect */}
      <div className="fixed bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-amber-900/20 to-transparent pointer-events-none"></div>
    </div>
  );
};

export default Index;
