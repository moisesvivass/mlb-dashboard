import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import type { Game } from '../types/mlb'

interface GameCardProps {
  game: Game
}

const getStatusBadge = (state: string) => {
  switch (state) {
    case 'Live':
      return <Badge className="bg-green-500 text-white animate-pulse">LIVE</Badge>
    case 'Final':
      return <Badge variant="secondary">Final</Badge>
    default:
      return <Badge variant="outline">Scheduled</Badge>
  }
}

export const GameCard = ({ game }: GameCardProps) => {
  const { away, home } = game.teams
  const isLive = game.status.abstractGameState === 'Live'
  const isFinal = game.status.abstractGameState === 'Final'
  const showScore = isLive || isFinal

  return (
    <Card className="hover:border-blue-500 transition-colors cursor-pointer">
      <CardContent className="p-4">
        <div className="flex justify-between items-center mb-3">
          <span className="text-xs text-muted-foreground">{game.venue.name}</span>
          {getStatusBadge(game.status.abstractGameState)}
        </div>

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <span className={`font-medium ${away.isWinner ? 'text-white' : 'text-muted-foreground'}`}>
              {away.team.name}
            </span>
            {showScore && (
              <span className={`text-xl font-bold ${away.isWinner ? 'text-white' : 'text-muted-foreground'}`}>
                {away.score}
              </span>
            )}
          </div>

          <div className="flex justify-between items-center">
            <span className={`font-medium ${home.isWinner ? 'text-white' : 'text-muted-foreground'}`}>
              {home.team.name}
            </span>
            {showScore && (
              <span className={`text-xl font-bold ${home.isWinner ? 'text-white' : 'text-muted-foreground'}`}>
                {home.score}
              </span>
            )}
          </div>
        </div>

        {!showScore && (
          <p className="text-xs text-muted-foreground mt-2">
            {new Date(game.gameDate).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit',
              timeZoneName: 'short'
            })}
          </p>
        )}
      </CardContent>
    </Card>
  )
}