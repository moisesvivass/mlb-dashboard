import { useState } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { cn, getTeamLogoUrl } from '@/lib/utils'
import { GameModal } from './GameModal'
import type { Game, GameTeam } from '../types/mlb'

interface GameCardProps {
  game: Game
}

const StatusBadge = ({ state, detailedState }: { state: string; detailedState: string }) => {
  switch (state) {
    case 'Live':
      return (
        <Badge className="bg-green-500/20 text-green-400 border border-green-500/40 animate-pulse gap-1">
          <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-400" />
          LIVE
        </Badge>
      )
    case 'Final':
      return <Badge variant="secondary">Final</Badge>
    default:
      return (
        <Badge variant="outline" className="text-blue-400 border-blue-500/30">
          {detailedState}
        </Badge>
      )
  }
}

const TeamRow = ({
  team,
  showScore,
  isLive,
}: {
  team: GameTeam
  showScore: boolean
  isLive: boolean
}) => (
  <div className="flex items-center gap-3">
    <img
      src={getTeamLogoUrl(team.team.id)}
      alt={team.team.name}
      className="w-12 h-12 flex-shrink-0 drop-shadow-sm"
      onError={(e) => {
        e.currentTarget.style.visibility = 'hidden'
      }}
    />
    <span
      className={cn(
        'flex-1 font-semibold text-sm leading-tight transition-colors',
        team.isWinner ? 'text-white' : 'text-zinc-400'
      )}
    >
      {team.team.name}
    </span>
    {showScore && (
      <span
        className={cn(
          'text-4xl font-bold tabular-nums leading-none',
          team.isWinner ? 'text-white' : 'text-zinc-500',
          isLive && 'transition-all duration-700'
        )}
      >
        {team.score ?? 0}
      </span>
    )}
  </div>
)

export const GameCard = ({ game }: GameCardProps) => {
  const [modalOpen, setModalOpen] = useState(false)
  const { away, home } = game.teams
  const state = game.status.abstractGameState
  const isLive = state === 'Live'
  const isFinal = state === 'Final'
  const showScore = isLive || isFinal

  const accentLine = isLive ? 'bg-green-500' : isFinal ? 'bg-zinc-600' : 'bg-blue-500/60'
  const cardBorder = isLive
    ? 'border-green-500/40 shadow-md shadow-green-500/10'
    : isFinal
    ? 'border-zinc-700'
    : 'border-blue-500/20'

  return (
    <>
    <Card
      id={`game-${game.gamePk}`}
      onClick={() => setModalOpen(true)}
      className={cn(
        'relative overflow-hidden border bg-zinc-900 transition-all duration-200',
        'hover:scale-[1.02] hover:shadow-xl hover:shadow-black/50 cursor-pointer',
        cardBorder
      )}
    >
      <div className={cn('h-0.5 w-full', accentLine)} />

      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-4">
          <span className="text-xs text-zinc-500 truncate max-w-[140px]">{game.venue.name}</span>
          <StatusBadge state={state} detailedState={game.status.detailedState} />
        </div>

        <div className="space-y-2.5">
          <TeamRow team={away} showScore={showScore} isLive={isLive} />
          <div className="h-px bg-zinc-800 mx-1" />
          <TeamRow team={home} showScore={showScore} isLive={isLive} />
        </div>

        <div className="mt-3 text-center min-h-[1.25rem]">
          {isLive && (
            <span className="text-xs text-green-400 font-medium">{game.status.detailedState}</span>
          )}
          {!showScore && (
            <span className="text-sm text-zinc-300 font-medium">
              {new Date(game.gameDate).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                timeZoneName: 'short',
              })}
            </span>
          )}
        </div>
      </CardContent>
    </Card>
    <GameModal game={game} open={modalOpen} onClose={() => setModalOpen(false)} />
    </>
  )
}
