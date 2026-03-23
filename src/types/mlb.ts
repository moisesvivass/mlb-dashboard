export interface Team {
  id: number
  name: string
  link: string
}

export interface TeamRecord {
  wins: number
  losses: number
  pct: string
}

export interface GameTeam {
  team: Team
  leagueRecord: TeamRecord
  score?: number
  isWinner?: boolean
}

export interface GameStatus {
  abstractGameState: 'Preview' | 'Live' | 'Final'
  detailedState: string
  statusCode: string
}

export interface Venue {
  id: number
  name: string
}

export interface Game {
  gamePk: number
  gameDate: string
  status: GameStatus
  teams: {
    away: GameTeam
    home: GameTeam
  }
  venue: Venue
  seriesDescription: string
}

export interface ScheduleDate {
  date: string
  totalGames: number
  totalGamesInProgress: number
  games: Game[]
}

export interface ScheduleResponse {
  totalGames: number
  totalGamesInProgress: number
  dates: ScheduleDate[]
}