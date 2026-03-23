import { cn, getTeamLogoUrl, getTeamLeague } from '@/lib/utils'
import type { Game } from '../types/mlb'

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

const formatTime = (gameDate: string) =>
  new Date(gameDate).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })

export const ScoreboardTicker = ({
  games,
  selectedDate,
  onDateChange,
  leagueFilter,
  onLeagueChange,
  onGameClick,
}: ScoreboardTickerProps) => {
  const filteredGames =
    leagueFilter === 'All'
      ? games
      : games.filter(
          (g) =>
            getTeamLeague(g.teams.away.team.id) === leagueFilter &&
            getTeamLeague(g.teams.home.team.id) === leagueFilter
        )

  return (
    <div className="sticky top-0 z-50 bg-zinc-900 border-b border-zinc-800 flex h-11 items-stretch">
      {/* Date nav + league filter — fixed left section */}
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

      {/* Scrollable game chips */}
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
            const showScore = state === 'Live' || state === 'Final'

            return (
              <button
                key={game.gamePk}
                onClick={() => onGameClick(game.gamePk)}
                className={cn(
                  'flex items-center gap-1.5 px-3 h-full text-xs whitespace-nowrap',
                  'hover:bg-zinc-800 transition-colors',
                  i !== 0 && 'border-l border-zinc-800'
                )}
              >
                <span
                  className={cn(
                    'w-1.5 h-1.5 rounded-full flex-shrink-0',
                    state === 'Live'
                      ? 'bg-green-400 animate-pulse'
                      : state === 'Final'
                      ? 'bg-zinc-600'
                      : 'bg-zinc-400'
                  )}
                />

                <img src={getTeamLogoUrl(away.team.id)} alt="" className="w-4 h-4 flex-shrink-0" />
                <span className={cn('font-semibold', away.isWinner ? 'text-white' : 'text-zinc-400')}>
                  {away.team.abbreviation ?? away.team.name.split(' ').pop()}
                </span>

                {showScore ? (
                  <>
                    <span className={cn('font-bold tabular-nums', away.isWinner ? 'text-white' : 'text-zinc-500')}>
                      {away.score ?? 0}
                    </span>
                    <span className="text-zinc-600">–</span>
                    <span className={cn('font-bold tabular-nums', home.isWinner ? 'text-white' : 'text-zinc-500')}>
                      {home.score ?? 0}
                    </span>
                  </>
                ) : (
                  <span className="text-zinc-500 text-[10px]">{formatTime(game.gameDate)}</span>
                )}

                <img src={getTeamLogoUrl(home.team.id)} alt="" className="w-4 h-4 flex-shrink-0" />
                <span className={cn('font-semibold', home.isWinner ? 'text-white' : 'text-zinc-400')}>
                  {home.team.abbreviation ?? home.team.name.split(' ').pop()}
                </span>
              </button>
            )
          })
        )}
      </div>
    </div>
  )
}
