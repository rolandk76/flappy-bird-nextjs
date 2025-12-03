import FlappyBird from '@/components/FlappyBird';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-indigo-900 via-purple-900 to-pink-800 flex flex-col items-center justify-center p-4">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse" />
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse delay-1000" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-500" />
      </div>
      
      {/* Content */}
      <div className="relative z-10 flex flex-col items-center">
        <h1 className="text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-orange-400 to-red-500 mb-2 drop-shadow-lg">
          Flappy Bird
        </h1>
        <p className="text-white/70 mb-8 text-lg">
          Ein Next.js Spiel
        </p>
        
        <FlappyBird />
        
        <div className="mt-8 flex flex-col items-center gap-4">
          <div className="flex gap-6 text-white/60 text-sm">
            <div className="flex items-center gap-2">
              <kbd className="px-2 py-1 bg-white/10 rounded border border-white/20 font-mono">Space</kbd>
              <span>oder Klick zum Springen</span>
            </div>
          </div>
          
          <p className="text-white/40 text-xs mt-4">
            Erstellt mit Next.js, TypeScript & Tailwind CSS
          </p>
        </div>
      </div>
    </main>
  );
}
