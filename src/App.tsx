import { useState, useMemo } from 'react'
import { Routes, Route, useNavigate } from 'react-router-dom'
import { ScoreboardTicker, type LeagueFilter } from './components/ScoreboardTicker'
import { ScoreRow } from './components/ScoreRow'
import { StandingsTable } from './components/StandingsTable'
import { GamePage } from './pages/GamePage'
import { TeamPage } from './pages/TeamPage'
import { PlayerPage } from './pages/PlayerPage'
import { useSchedule } from './hooks/useSchedule'
import { getTeamLeague } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { Game } from './types/mlb'

const todayStr = (() => {
  const d = new Date()
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
})()

const formatFullDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

const applyLeagueFilter = (games: Game[], filter: LeagueFilter) => {
  if (filter === 'All') return games
  return games.filter(
    (g) =>
      getTeamLeague(g.teams.away.team.id) === filter &&
      getTeamLeague(g.teams.home.team.id) === filter
  )
}

const GroupDivider = ({ label, count }: { label: string; count: number }) => (
  <div className="flex items-center gap-3 px-4 py-2 bg-zinc-900/80 border-b border-zinc-800">
    <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{label}</span>
    <span className="text-[10px] text-zinc-700 font-medium">{count}</span>
    <div className="flex-1 h-px bg-zinc-800" />
  </div>
)

function MainDashboard() {
  const [activeTab, setActiveTab] = useState<'scores' | 'standings'>('scores')
  const [selectedDate, setSelectedDate] = useState(todayStr)
  const [leagueFilter, setLeagueFilter] = useState<LeagueFilter>('All')
  const { games, loading, error, totalGamesInProgress } = useSchedule(selectedDate)
  const navigate = useNavigate()

  const filteredGames = useMemo(() => applyLeagueFilter(games, leagueFilter), [games, leagueFilter])
  const liveGames = useMemo(() => filteredGames.filter((g) => g.status.abstractGameState === 'Live'), [filteredGames])
  const finalGames = useMemo(() => filteredGames.filter((g) => g.status.abstractGameState === 'Final'), [filteredGames])
  const scheduledGames = useMemo(() => filteredGames.filter((g) => g.status.abstractGameState === 'Preview'), [filteredGames])

  const handleGameClick = (gamePk: number) => {
    navigate(`/game/${gamePk}`)
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-foreground">
      <ScoreboardTicker
        games={games}
        selectedDate={selectedDate}
        onDateChange={setSelectedDate}
        leagueFilter={leagueFilter}
        onLeagueChange={setLeagueFilter}
        onGameClick={handleGameClick}
      />

      <header className="border-b border-zinc-800 px-6 py-4 bg-zinc-900">
        <div className="max-w-5xl mx-auto flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-400 tracking-tight">⚾ MLB Dashboard</h1>
          {totalGamesInProgress > 0 && (
            <Badge className="bg-green-500 text-white animate-pulse shadow-md shadow-green-500/30">
              {totalGamesInProgress} Live
            </Badge>
          )}
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'scores' | 'standings')}>
          <TabsList className="mb-6">
            <TabsTrigger value="scores">Scores</TabsTrigger>
            <TabsTrigger value="standings">Standings</TabsTrigger>
          </TabsList>

          <TabsContent value="scores">
            {loading && (
              <div className="text-center text-zinc-500 py-20">Loading games...</div>
            )}
            {error && (
              <div className="text-center text-red-400 py-20">{error}</div>
            )}
            {!loading && !error && (
              <>
                <div className="flex items-baseline justify-between mb-4">
                  <h2 className="text-base font-semibold text-zinc-300">
                    {formatFullDate(selectedDate)}
                  </h2>
                  <span className="text-sm text-zinc-500">
                    {filteredGames.length} {filteredGames.length === 1 ? 'game' : 'games'}
                  </span>
                </div>

                {filteredGames.length === 0 ? (
                  <div className="text-center text-zinc-500 py-20">
                    No games scheduled for this date.
                  </div>
                ) : (
                  <div className="rounded-lg border border-zinc-800 overflow-hidden">
                    {liveGames.length > 0 && (
                      <>
                        <GroupDivider label="Live" count={liveGames.length} />
                        {liveGames.map((g) => (
                          <ScoreRow key={g.gamePk} game={g} />
                        ))}
                      </>
                    )}
                    {finalGames.length > 0 && (
                      <>
                        <GroupDivider label="Final" count={finalGames.length} />
                        {finalGames.map((g) => (
                          <ScoreRow key={g.gamePk} game={g} />
                        ))}
                      </>
                    )}
                    {scheduledGames.length > 0 && (
                      <>
                        <GroupDivider label="Upcoming" count={scheduledGames.length} />
                        {scheduledGames.map((g) => (
                          <ScoreRow key={g.gamePk} game={g} />
                        ))}
                      </>
                    )}
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

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainDashboard />} />
      <Route path="/game/:gamePk" element={<GamePage />} />
      <Route path="/team/:teamId" element={<TeamPage />} />
      <Route path="/player/:playerId" element={<PlayerPage />} />
    </Routes>
  )
}

export default App
