import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { cn, getTeamLogoUrl } from '@/lib/utils'
import { useBoxscore } from '../hooks/useBoxscore'
import type {
  Game,
  BoxscoreTeam,
  BoxscorePlayer,
  DecisionPitcher,
  LinescoreResponse,
} from '../types/mlb'

interface GameModalProps {
  game: Game
  open: boolean
  onClose: () => void
}

// ── Helpers ────────────────────────────────────────────────────────────────────

const findPlayer = (
  players: Record<string, BoxscorePlayer>,
  id: number
): BoxscorePlayer | undefined => players[`ID${id}`]

const getTopBatters = (team: BoxscoreTeam): BoxscorePlayer[] =>
  team.battingOrder
    .map((id) => findPlayer(team.players, id))
    .filter((p): p is BoxscorePlayer => p !== undefined && (p.stats.batting?.hits ?? 0) > 0)
    .sort((a, b) => {
      const hitDiff = (b.stats.batting?.hits ?? 0) - (a.stats.batting?.hits ?? 0)
      if (hitDiff !== 0) return hitDiff
      const rbiDiff = (b.stats.batting?.rbi ?? 0) - (a.stats.batting?.rbi ?? 0)
      if (rbiDiff !== 0) return rbiDiff
      return (b.stats.batting?.homeRuns ?? 0) - (a.stats.batting?.homeRuns ?? 0)
    })
    .slice(0, 3)

const getPitcherStats = (
  pitcher: DecisionPitcher,
  away: BoxscoreTeam,
  home: BoxscoreTeam
): BoxscorePlayer | undefined =>
  findPlayer(away.players, pitcher.id) ?? findPlayer(home.players, pitcher.id)

const formatTime = (gameDate: string) =>
  new Date(gameDate).toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    timeZoneName: 'short',
  })

// ── Section header ─────────────────────────────────────────────────────────────

const SectionHeader = ({ label }: { label: string }) => (
  <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-2">{label}</h3>
)

// ── Score header ───────────────────────────────────────────────────────────────

const ScoreHeader = ({ game }: { game: Game }) => {
  const { away, home } = game.teams
  const state = game.status.abstractGameState
  const showScore = state === 'Live' || state === 'Final'

  return (
    <div className="flex items-center justify-between gap-4 pb-4 border-b border-zinc-800">
      <div className="flex flex-col items-center gap-1.5 flex-1">
        <img src={getTeamLogoUrl(away.team.id)} alt={away.team.name} className="w-16 h-16 drop-shadow-md" />
        <span className="text-sm font-semibold text-zinc-300 text-center leading-tight">{away.team.name}</span>
        {showScore && (
          <span className={cn('text-5xl font-bold tabular-nums mt-1', away.isWinner ? 'text-white' : 'text-zinc-500')}>
            {away.score ?? 0}
          </span>
        )}
      </div>

      <div className="text-center flex-shrink-0">
        {showScore ? (
          <span className={cn(
            'text-xs font-semibold px-2 py-0.5 rounded',
            state === 'Live' ? 'bg-green-500/20 text-green-400 animate-pulse' : 'bg-zinc-800 text-zinc-400'
          )}>
            {state === 'Live' ? game.status.detailedState : 'Final'}
          </span>
        ) : (
          <div>
            <p className="text-lg font-semibold text-zinc-200">{formatTime(game.gameDate)}</p>
            <p className="text-xs text-zinc-500 mt-0.5">Scheduled</p>
          </div>
        )}
        <p className="text-xs text-zinc-600 mt-2">{game.venue.name}</p>
      </div>

      <div className="flex flex-col items-center gap-1.5 flex-1">
        <img src={getTeamLogoUrl(home.team.id)} alt={home.team.name} className="w-16 h-16 drop-shadow-md" />
        <span className="text-sm font-semibold text-zinc-300 text-center leading-tight">{home.team.name}</span>
        {showScore && (
          <span className={cn('text-5xl font-bold tabular-nums mt-1', home.isWinner ? 'text-white' : 'text-zinc-500')}>
            {home.score ?? 0}
          </span>
        )}
      </div>
    </div>
  )
}

// ── Summary content ────────────────────────────────────────────────────────────

const LineScoreTable = ({ game, linescore }: { game: Game; linescore: LinescoreResponse }) => {
  if (linescore.innings.length === 0) return null

  const { away, home } = game.teams
  const lastIdx = linescore.innings.length - 1

  const cellValue = (side: 'away' | 'home', inning: LinescoreResponse['innings'][number], idx: number) => {
    const runs = inning[side].runs
    if (side === 'home' && idx === lastIdx && game.status.abstractGameState === 'Final' && home.isWinner && runs == null)
      return 'X'
    return runs ?? '-'
  }

  return (
    <div>
      <SectionHeader label="Line Score" />
      <div className="overflow-x-auto rounded-md border border-zinc-800">
        <table className="w-full text-xs text-center">
          <thead>
            <tr className="bg-zinc-800/60 text-zinc-500">
              <th className="text-left py-2 px-3 font-medium w-20">Team</th>
              {linescore.innings.map((inn) => (
                <th key={inn.num} className="w-7 py-2 font-medium">{inn.num}</th>
              ))}
              <th className="w-9 py-2 font-semibold text-zinc-300 border-l border-zinc-700">R</th>
              <th className="w-9 py-2 font-semibold text-zinc-300">H</th>
              <th className="w-9 py-2 font-semibold text-zinc-300">E</th>
            </tr>
          </thead>
          <tbody>
            {([
              { label: away.team.name.split(' ').pop()!, side: 'away' as const },
              { label: home.team.name.split(' ').pop()!, side: 'home' as const },
            ]).map(({ label, side }) => (
              <tr key={side} className="border-t border-zinc-800">
                <td className="text-left py-2 px-3 font-semibold text-zinc-300">{label}</td>
                {linescore.innings.map((inn, i) => {
                  const val = cellValue(side, inn, i)
                  return (
                    <td key={inn.num} className={cn('py-2', typeof val === 'number' && val > 0 ? 'text-white font-semibold' : 'text-zinc-600')}>
                      {val}
                    </td>
                  )
                })}
                <td className="py-2 font-bold text-white border-l border-zinc-700">{linescore.teams[side].runs}</td>
                <td className="py-2 text-zinc-300">{linescore.teams[side].hits}</td>
                <td className="py-2 text-zinc-400">{linescore.teams[side].errors}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

const PitchingDecisions = ({
  linescore,
  away,
  home,
}: {
  linescore: LinescoreResponse
  away: BoxscoreTeam
  home: BoxscoreTeam
}) => {
  const decisions = linescore.decisions
  if (!decisions) return null

  const entries = [
    { label: 'Win', icon: 'W', pitcher: decisions.winner, color: 'text-green-400 bg-green-500/15' },
    { label: 'Loss', icon: 'L', pitcher: decisions.loser, color: 'text-red-400 bg-red-500/15' },
    { label: 'Save', icon: 'S', pitcher: decisions.save, color: 'text-blue-400 bg-blue-500/15' },
  ].filter((e): e is typeof e & { pitcher: DecisionPitcher } => e.pitcher !== undefined)

  if (entries.length === 0) return null

  return (
    <div>
      <SectionHeader label="Pitching Decisions" />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        {entries.map(({ label, icon, pitcher, color }) => {
          const ps = getPitcherStats(pitcher, away, home)?.stats.pitching
          return (
            <div key={label} className="flex items-start gap-3 bg-zinc-800/50 rounded-lg p-3">
              <div className={cn('flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold', color)}>
                {icon}
              </div>
              <div className="min-w-0">
                <p className="text-[10px] text-zinc-500 uppercase tracking-wide">{label}</p>
                <p className="text-sm font-semibold text-white truncate">{pitcher.fullName}</p>
                {ps?.inningsPitched && (
                  <p className="text-xs text-zinc-400 mt-0.5">
                    {ps.inningsPitched} IP · {ps.strikeOuts ?? 0} K · {ps.earnedRuns ?? 0} ER
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const TopPerformers = ({ game, away, home }: { game: Game; away: BoxscoreTeam; home: BoxscoreTeam }) => {
  const awayBatters = getTopBatters(away)
  const homeBatters = getTopBatters(home)
  if (awayBatters.length === 0 && homeBatters.length === 0) return null

  return (
    <div>
      <SectionHeader label="Top Performers" />
      <div className="grid grid-cols-2 gap-4">
        {([
          { teamData: game.teams.away, batters: awayBatters },
          { teamData: game.teams.home, batters: homeBatters },
        ]).map(({ teamData, batters }) => (
          <div key={teamData.team.id}>
            <div className="flex items-center gap-1.5 mb-2">
              <img src={getTeamLogoUrl(teamData.team.id)} alt="" className="w-4 h-4" />
              <span className="text-xs font-semibold text-zinc-400">{teamData.team.name}</span>
            </div>
            {batters.length === 0 ? (
              <p className="text-xs text-zinc-600">No data available</p>
            ) : (
              <div className="space-y-2">
                {batters.map((p) => (
                  <div key={p.person.id} className="flex items-center justify-between gap-2">
                    <span className="text-sm text-zinc-200 truncate">{p.person.fullName}</span>
                    <span className="text-xs text-zinc-400 font-medium whitespace-nowrap">{p.stats.batting?.summary ?? ''}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}

// ── Main component ─────────────────────────────────────────────────────────────

export const GameModal = ({ game, open, onClose }: GameModalProps) => {
  const navigate = useNavigate()
  const { boxscore, linescore, loading, error } = useBoxscore(open ? game.gamePk : null)
  const state = game.status.abstractGameState
  const hasStarted = state === 'Live' || state === 'Final'

  useEffect(() => {
    if (!open) return
  }, [open])

  const handleViewFullBoxscore = () => {
    onClose()
    navigate(`/game/${game.gamePk}`, { state: { game } })
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl bg-zinc-900 border-zinc-700 text-foreground p-6 max-h-[88vh] overflow-y-auto">
        <DialogTitle className="sr-only">
          {game.teams.away.team.name} vs {game.teams.home.team.name}
        </DialogTitle>

        <ScoreHeader game={game} />

        {!hasStarted && (
          <p className="text-center text-sm text-zinc-500 py-6">
            Game details will be available once the game begins.
          </p>
        )}

        {hasStarted && loading && (
          <div className="flex flex-col items-center justify-center py-12 gap-3 text-zinc-500">
            <div className="w-5 h-5 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
            <span className="text-sm">Loading game details…</span>
          </div>
        )}

        {hasStarted && error && (
          <div className="text-center text-red-400 py-10">{error}</div>
        )}

        {hasStarted && !loading && !error && linescore && boxscore && (
          <div className="space-y-6 mt-4">
            <LineScoreTable game={game} linescore={linescore} />
            <PitchingDecisions
              linescore={linescore}
              away={boxscore.teams.away}
              home={boxscore.teams.home}
            />
            <TopPerformers game={game} away={boxscore.teams.away} home={boxscore.teams.home} />
          </div>
        )}

        {hasStarted && (
          <div className="mt-6 pt-4 border-t border-zinc-800">
            <Button
              onClick={handleViewFullBoxscore}
              className="w-full bg-zinc-800 hover:bg-zinc-700 text-zinc-200 border border-zinc-700"
              variant="outline"
            >
              Full Boxscore →
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
