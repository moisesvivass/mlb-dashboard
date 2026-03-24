import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { cn, getTeamLogoUrl, formatGameTime, formatGameDate } from '@/lib/utils'
import { useTeamInfo } from '../hooks/useTeamInfo'
import { useTeamSchedule } from '../hooks/useTeamSchedule'
import { TeamHeader } from '../components/TeamHeader'
import { TeamStatsTable } from '../components/TeamStatsTable'
import { RosterTable } from '../components/RosterTable'
import type { Game } from '../types/mlb'

// ── Schedule tab ──────────────────────────────────────────────────────────────

interface ScheduleRowProps {
  game: Game
  teamId: number
  onGameClick: (gamePk: number) => void
}

const ScheduleRow = ({ game, teamId, onGameClick }: ScheduleRowProps) => {
  const isHome = game.teams.home.team.id === teamId
  const myTeam = isHome ? game.teams.home : game.teams.away
  const opponent = isHome ? game.teams.away : game.teams.home
  const state = game.status.abstractGameState
  const isCompleted = state === 'Final'
  const isLive = state === 'Live'
  const isWin = isCompleted && myTeam.isWinner

  return (
    <tr
      className="border-t border-zinc-800 hover:bg-zinc-800/30 cursor-pointer transition-colors"
      onClick={() => onGameClick(game.gamePk)}
    >
      {/* Date */}
      <td className="py-2 px-3 text-xs text-zinc-500 whitespace-nowrap tabular-nums">
        {formatGameDate(game.gameDate)}
      </td>

      {/* H/A */}
      <td className="py-2 px-2 text-center text-xs text-zinc-600 font-medium">
        {isHome ? 'vs' : '@'}
      </td>

      {/* Opponent */}
      <td className="py-2 px-2">
        <div className="flex items-center gap-2">
          <img src={getTeamLogoUrl(opponent.team.id)} alt="" className="w-5 h-5 flex-shrink-0" />
          <span className="text-xs text-zinc-300 whitespace-nowrap">{opponent.team.name}</span>
        </div>
      </td>

      {/* Result */}
      <td className="py-2 px-2 text-center">
        {isLive && (
          <span className="text-xs font-bold text-green-400 animate-pulse">LIVE</span>
        )}
        {isCompleted && (
          <span className={cn('text-xs font-bold', isWin ? 'text-green-400' : 'text-red-400')}>
            {isWin ? 'W' : 'L'}
          </span>
        )}
        {state === 'Preview' && (
          <span className="text-xs text-zinc-500">{formatGameTime(game.gameDate)}</span>
        )}
      </td>

      {/* Score */}
      <td className="py-2 px-2 text-center text-xs tabular-nums text-zinc-300 whitespace-nowrap">
        {(isCompleted || isLive) && myTeam.score !== undefined && opponent.score !== undefined
          ? `${myTeam.score}–${opponent.score}`
          : '—'}
      </td>

      {/* W-L record */}
      <td className="py-2 px-2 text-center text-xs tabular-nums text-zinc-500 whitespace-nowrap">
        {myTeam.leagueRecord.wins}–{myTeam.leagueRecord.losses}
      </td>

      {/* Decisions */}
      <td className="py-2 px-3 text-[11px] text-zinc-600 whitespace-nowrap">
        {isCompleted && game.decisions && (
          <>
            {game.decisions.winner && (
              <span>
                <span className="text-green-500 font-bold">W</span>{' '}
                {game.decisions.winner.fullName}
              </span>
            )}
            {game.decisions.loser && (
              <span className="ml-2">
                <span className="text-red-500 font-bold">L</span>{' '}
                {game.decisions.loser.fullName}
              </span>
            )}
            {game.decisions.save && (
              <span className="ml-2">
                <span className="text-blue-400 font-bold">S</span>{' '}
                {game.decisions.save.fullName}
              </span>
            )}
          </>
        )}
      </td>
    </tr>
  )
}

const TeamScheduleTab = ({
  teamId,
  onGameClick,
}: {
  teamId: number
  onGameClick: (pk: number) => void
}) => {
  const { games, loading, error } = useTeamSchedule(teamId)

  if (loading) {
    return (
      <div className="flex flex-col items-center py-16 gap-3 text-zinc-500">
        <div className="w-5 h-5 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
        <span className="text-sm">Loading schedule…</span>
      </div>
    )
  }

  if (error) return <div className="text-center text-red-400 py-10">{error}</div>

  if (games.length === 0) {
    return <p className="text-center text-zinc-500 py-10 text-sm">No schedule available.</p>
  }

  return (
    <div className="overflow-x-auto rounded-md border border-zinc-800">
      <table className="text-xs min-w-max w-full">
        <thead>
          <tr className="bg-zinc-800/60 text-zinc-500">
            <th className="text-left py-2 px-3 font-medium">Date</th>
            <th className="py-2 px-2 font-medium"></th>
            <th className="text-left py-2 px-2 font-medium">Opponent</th>
            <th className="py-2 px-2 font-medium">Result</th>
            <th className="py-2 px-2 font-medium">Score</th>
            <th className="py-2 px-2 font-medium">Record</th>
            <th className="text-left py-2 px-3 font-medium">Decision</th>
          </tr>
        </thead>
        <tbody>
          {games.map((game: Game) => (
            <ScheduleRow
              key={game.gamePk}
              game={game}
              teamId={teamId}
              onGameClick={onGameClick}
            />
          ))}
        </tbody>
      </table>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export const TeamPage = () => {
  const { teamId: teamIdStr } = useParams<{ teamId: string }>()
  const teamId = Number(teamIdStr)
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'stats' | 'schedule' | 'roster'>('stats')

  const { teamInfo, standingsTeam, loading: infoLoading } = useTeamInfo(teamId)

  return (
    <div className="min-h-screen bg-zinc-950 text-foreground">
      <header className="border-b border-zinc-800 bg-zinc-900 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:text-white gap-1.5 px-2"
            onClick={() => navigate(-1)}
          >
            ← Back
          </Button>
          <h1 className="text-sm font-semibold text-zinc-400">
            {teamInfo?.name ?? 'Team'}
          </h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-6">
        {infoLoading ? (
          <div className="flex justify-center py-8">
            <div className="w-6 h-6 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
          </div>
        ) : (
          <TeamHeader teamInfo={teamInfo} standingsTeam={standingsTeam} teamId={teamId} />
        )}

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
          <TabsList className="mb-6">
            <TabsTrigger value="stats">Stats</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="roster">Roster</TabsTrigger>
          </TabsList>

          <TabsContent value="stats">
            <TeamStatsTable teamId={teamId} />
          </TabsContent>

          <TabsContent value="schedule">
            <TeamScheduleTab
              teamId={teamId}
              onGameClick={(gamePk) => navigate(`/game/${gamePk}`)}
            />
          </TabsContent>

          <TabsContent value="roster">
            <RosterTable teamId={teamId} />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
