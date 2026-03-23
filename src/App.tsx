import { useState } from 'react'
import { GameCard } from './components/GameCard'
import { StandingsTable } from './components/StandingsTable'
import { useSchedule } from './hooks/useSchedule'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

const todayStr = (() => {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
})()

const formatDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const shiftDate = (dateStr: string, days: number) => {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day + days)
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${dd}`
}

function App() {
  const [activeTab, setActiveTab] = useState<'scores' | 'standings'>('scores')
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const { games, loading, error, totalGamesInProgress } = useSchedule(selectedDate)

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-blue-400">⚾ MLB Dashboard</h1>
            {activeTab === 'scores' ? (
              <div className="flex items-center gap-2 mt-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={() => setSelectedDate((d) => shiftDate(d, -1))}
                >
                  ‹
                </Button>
                <p className="text-sm text-muted-foreground">{formatDate(selectedDate)}</p>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-muted-foreground hover:text-foreground"
                  onClick={() => setSelectedDate((d) => shiftDate(d, 1))}
                >
                  ›
                </Button>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground mt-1">2026 Season Standings</p>
            )}
          </div>
          {totalGamesInProgress > 0 && (
            <Badge className="bg-green-500 text-white animate-pulse">
              {totalGamesInProgress} Games Live
            </Badge>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'scores' | 'standings')}>
          <TabsList className="mb-6">
            <TabsTrigger value="scores">Scores</TabsTrigger>
            <TabsTrigger value="standings">Standings</TabsTrigger>
          </TabsList>

          <TabsContent value="scores">
            {loading && (
              <div className="text-center text-muted-foreground py-20">Loading games...</div>
            )}
            {error && (
              <div className="text-center text-red-400 py-20">{error}</div>
            )}
            {!loading && !error && (
              <>
                <h2 className="text-lg font-semibold mb-4">
                  Games
                  <span className="text-muted-foreground font-normal ml-2 text-sm">
                    {games.length} games
                  </span>
                </h2>
                {games.length === 0 ? (
                  <div className="text-center text-muted-foreground py-20">
                    No games scheduled for this date.
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {games.map((game) => (
                      <GameCard key={game.gamePk} game={game} />
                    ))}
                  </div>
                )}
              </>
            )}
          </TabsContent>

          <TabsContent value="standings">
            <StandingsTable />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default App
