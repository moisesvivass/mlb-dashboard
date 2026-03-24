import { useMemo } from 'react'
import { cn, getTeamLeague, formatGameTime, getTeamAbbreviation, formatInningDisplay } from '@/lib/utils'
import type { Game } from '../types/mlb'

const STATE_ORDER: Record<'Live' | 'Final' | 'Preview', number> = { Live: 0, Final: 1, Preview: 2 }

export type LeagueFilter = 'All' | 'AL' | 'NL'

interface ScoreboardTickerProps {
  games: Game[]
  selectedDate: string
  onDateChange: (date: string) => void
  leagueFilter: LeagueFilter
  onLeagueChange: (f: LeagueFilter) => void
  onGameClick: (gamePk: number) => void
}

const shiftDate = (dateStr: string, days: number) => {
  const [year, month, day] = dateStr.split('-').map(Number)
  const d = new Date(year, month - 1, day + days)
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-')
}

const formatTickerDate = (dateStr: string) => {
  const [year, month, day] = dateStr.split('-').map(Number)
  return new Date(year, month - 1, day).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export const ScoreboardTicker = ({
  games,
  selectedDate,
  onDateChange,
  leagueFilter,
  onLeagueChange,
  onGameClick,
}: ScoreboardTickerProps) => {
  const filteredGames = useMemo(() => {
    const base =
      leagueFilter === 'All'
        ? games
        : games.filter(
            (g) =>
              getTeamLeague(g.teams.away.team.id) === leagueFilter &&
              getTeamLeague(g.teams.home.team.id) === leagueFilter
          )
    return [...base].sort(
      (a, b) => STATE_ORDER[a.status.abstractGameState] - STATE_ORDER[b.status.abstractGameState]
    )
  }, [games, leagueFilter])

  return (
    <div className="sticky top-0 z-50 bg-zinc-900 border-b border-zinc-800 flex h-[68px] items-stretch">
      <div className="flex items-center gap-1 px-2 border-r border-zinc-800 flex-shrink-0">
        <button
          onClick={() => onDateChange(shiftDate(selectedDate, -1))}
          className="w-5 h-5 flex items-center justify-center rounded text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors text-base leading-none"
        >
          ‹
        </button>
        <span className="text-xs font-medium text-zinc-200 whitespace-nowrap px-1 min-w-[90px] text-center">
          {formatTickerDate(selectedDate)}
        </span>
        <button
          onClick={() => onDateChange(shiftDate(selectedDate, 1))}
          className="w-5 h-5 flex items-center justify-center rounded text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors text-base leading-none"
        >
          ›
        </button>

        <div className="w-px h-5 bg-zinc-700 mx-1 flex-shrink-0" />

        {(['All', 'AL', 'NL'] as const).map((f) => (
          <button
            key={f}
            onClick={() => onLeagueChange(f)}
            className={cn(
              'text-[10px] font-bold px-1.5 py-0.5 rounded transition-colors',
              leagueFilter === f
                ? 'bg-blue-600 text-white'
                : 'text-zinc-400 hover:text-white hover:bg-zinc-700'
            )}
          >
            {f}
          </button>
        ))}
      </div>

      <div
        className="flex items-stretch overflow-x-auto flex-1 [&::-webkit-scrollbar]:hidden"
        style={{ scrollbarWidth: 'none' }}
      >
        {filteredGames.length === 0 ? (
          <span className="flex items-center px-4 text-xs text-zinc-600 italic">
            No games
          </span>
        ) : (
          filteredGames.map((game, i) => {
            const { away, home } = game.teams
            const state = game.status.abstractGameState
            const isLive = state === 'Live'
            const isFinal = state === 'Final'
            const showScore = isLive || isFinal

            return (
              <button
                key={game.gamePk}
                onClick={() => onGameClick(game.gamePk)}
                className={cn(
                  'flex flex-col justify-center gap-0.5 px-3 h-full min-w-[84px]',
                  'hover:bg-zinc-800 transition-colors',
                  i !== 0 && 'border-l border-zinc-800'
                )}
              >
                <div className="flex items-center gap-1">
                  {isLive && (
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
                  )}
                  <span className={cn(
                    'text-[10px] font-medium truncate max-w-[72px]',
                    isLive ? 'text-green-400' : 'text-zinc-500'
                  )}>
                    {isLive
                      ? formatInningDisplay(game.linescore?.inningState, game.linescore?.currentInningOrdinal) || 'Live'
                      : isFinal
                      ? 'Final'
                      : formatGameTime(game.gameDate)}
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className={cn(
                    'text-xs font-bold',
                    showScore ? (away.isWinner ? 'text-white' : 'text-zinc-400') : 'text-zinc-300'
                  )}>
                    {getTeamAbbreviation(away.team)}
                  </span>
                  {showScore && (
                    <span className={cn(
                      'text-xs font-bold tabular-nums',
                      away.isWinner ? 'text-white' : 'text-zinc-500'
                    )}>
                      {away.score ?? 0}
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <span className={cn(
                    'text-xs font-bold',
                    showScore ? (home.isWinner ? 'text-white' : 'text-zinc-400') : 'text-zinc-300'
                  )}>
                    {getTeamAbbreviation(home.team)}
                  </span>
                  {showScore && (
                    <span className={cn(
                      'text-xs font-bold tabular-nums',
                      home.isWinner ? 'text-white' : 'text-zinc-500'
                    )}>
                      {home.score ?? 0}
                    </span>
                  )}
                </div>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
