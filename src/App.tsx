import { GameCard } from './components/GameCard'
import { useSchedule } from './hooks/useSchedule'
import { Badge } from '@/components/ui/badge'

function App() {
  const { games, loading, error, totalGamesInProgress } = useSchedule()

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-400">⚾ MLB Dashboard</h1>
            <p className="text-sm text-muted-foreground">{today}</p>
          </div>
          {totalGamesInProgress > 0 && (
            <Badge className="bg-green-500 text-white animate-pulse">
              {totalGamesInProgress} Games Live
            </Badge>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {loading && (
          <div className="text-center text-muted-foreground py-20">
            Loading today's games...
          </div>
        )}

        {error && (
          <div className="text-center text-red-400 py-20">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            <h2 className="text-lg font-semibold mb-4">
              Today's Games
              <span className="text-muted-foreground font-normal ml-2 text-sm">
                {games.length} games
              </span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {games.map((game) => (
                <GameCard key={game.gamePk} game={game} />
              ))}
            </div>
          </>
        )}
      </main>
    </div>
  )
}

export default App