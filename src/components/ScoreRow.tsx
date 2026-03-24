import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { cn, getTeamLogoUrl, formatGameTime, getTeamAbbreviation } from '@/lib/utils'
import { GameModal } from './GameModal'
import type { Game, GameTeam } from '../types/mlb'


const TeamLine = ({
  team,
  showScore,
  onTeamClick,
}: {
  team: GameTeam
  showScore: boolean
  onTeamClick: (e: React.MouseEvent) => void
}) => (
  <div className="flex items-center gap-2 min-w-0">
    <img
      src={getTeamLogoUrl(team.team.id)}
      alt=""
      className="w-7 h-7 flex-shrink-0 cursor-pointer hover:opacity-75 transition-opacity"
      onClick={onTeamClick}
      onError={(e) => {
        e.currentTarget.style.visibility = 'hidden'
      }}
    />
    <span
      className={cn(
        'text-sm font-bold w-9 flex-shrink-0 sm:hidden cursor-pointer hover:text-blue-400 transition-colors',
        team.isWinner ? 'text-white' : 'text-zinc-400'
      )}
      onClick={onTeamClick}
    >
      {getTeamAbbreviation(team.team)}
    </span>
    <span
      className="text-sm text-zinc-500 truncate flex-1 hidden sm:block cursor-pointer hover:text-blue-400 transition-colors"
      onClick={onTeamClick}
    >
      {team.team.name}
    </span>
    <span className="text-xs text-zinc-600 flex-shrink-0 w-10 text-right hidden md:block">
      {team.leagueRecord.wins}–{team.leagueRecord.losses}
    </span>
    {showScore && (
      <span
        className={cn(
          'text-2xl font-bold tabular-nums ml-3 w-8 text-right flex-shrink-0',
          team.isWinner ? 'text-white' : 'text-zinc-500'
        )}
      >
        {team.score ?? 0}
      </span>
    )}
  </div>
)

export const ScoreRow = ({ game }: { game: Game }) => {
  const [modalOpen, setModalOpen] = useState(false)
  const navigate = useNavigate()
  const { away, home } = game.teams
  const state = game.status.abstractGameState
  const isLive = state === 'Live'
  const isFinal = state === 'Final'
  const showScore = isLive || isFinal

  const handleTeamClick = (teamId: number) => (e: React.MouseEvent) => {
    e.stopPropagation()
    navigate(`/team/${teamId}`)
  }

  return (
    <>
      <div
        id={`game-${game.gamePk}`}
        onClick={() => setModalOpen(true)}
        className="flex items-center px-4 py-3 hover:bg-zinc-800/50 cursor-pointer border-b border-zinc-800 last:border-b-0 transition-colors"
      >
        {/* Left accent bar */}
        <div
          className={cn(
            'w-0.5 self-stretch rounded-full mr-4 flex-shrink-0',
            isLive ? 'bg-green-500' : isFinal ? 'bg-zinc-700' : 'bg-blue-500/50'
          )}
        />

        {/* Teams */}
        <div className="flex-1 min-w-0 space-y-2">
          <TeamLine team={away} showScore={showScore} onTeamClick={handleTeamClick(away.team.id)} />
          <TeamLine team={home} showScore={showScore} onTeamClick={handleTeamClick(home.team.id)} />
        </div>

        {/* Status + pitcher info */}
        <div className="ml-6 flex-shrink-0 w-36 text-right">
          {isLive && (
            <div className="flex items-center justify-end gap-1.5 mb-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse flex-shrink-0" />
              <span className="text-xs font-semibold text-green-400">{game.status.detailedState}</span>
            </div>
          )}
          {isFinal && (
            <p className="text-xs font-semibold text-zinc-400 mb-1.5 uppercase tracking-wide">Final</p>
          )}
          {!showScore && (
            <p className="text-sm font-semibold text-zinc-200 mb-1.5">{formatGameTime(game.gameDate)}</p>
          )}

          {/* Decisions for final games */}
          {isFinal && game.decisions && (
            <div className="space-y-0.5">
              {game.decisions.winner && (
                <p className="text-[11px] text-zinc-500 truncate">
                  <span className="text-green-500 font-bold">W</span>{' '}
                  {game.decisions.winner.fullName}
                </p>
              )}
              {game.decisions.loser && (
                <p className="text-[11px] text-zinc-500 truncate">
                  <span className="text-red-500 font-bold">L</span>{' '}
                  {game.decisions.loser.fullName}
                </p>
              )}
              {game.decisions.save && (
                <p className="text-[11px] text-zinc-500 truncate">
                  <span className="text-blue-400 font-bold">S</span>{' '}
                  {game.decisions.save.fullName}
                </p>
              )}
            </div>
          )}

          {/* Probable pitchers for scheduled games */}
          {!showScore && (away.probablePitcher || home.probablePitcher) && (
            <div className="space-y-0.5">
              {away.probablePitcher && (
                <p className="text-[11px] text-zinc-500 truncate">{away.probablePitcher.fullName}</p>
              )}
              {home.probablePitcher && (
                <p className="text-[11px] text-zinc-500 truncate">{home.probablePitcher.fullName}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <GameModal game={game} open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
