export interface Team {
  id: number
  name: string
  link: string
  abbreviation?: string
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
  probablePitcher?: { id: number; fullName: string }
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

export interface GameLinescore {
  currentInning?: number
  currentInningOrdinal?: string
  inningState?: string
  inningHalf?: string
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
  linescore?: GameLinescore
  decisions?: {
    winner?: DecisionPitcher
    loser?: DecisionPitcher
    save?: DecisionPitcher
  }
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

export interface StandingsRecord {
  wins: number
  losses: number
  pct: string
}

export interface StandingsTeam {
  team: Team
  leagueRecord: StandingsRecord
  divisionRank: string
  gamesBack: string
  wins: number
  losses: number
}

export interface DivisionStandings {
  division: {
    id: number
    name: string
  }
  teamRecords: StandingsTeam[]
}

export interface StandingsResponse {
  records: DivisionStandings[]
}

// ── Boxscore ──────────────────────────────────────────────────────────────────

export interface BoxscorePlayerBatting {
  summary?: string
  atBats?: number
  hits?: number
  homeRuns?: number
  rbi?: number
  strikeOuts?: number
  baseOnBalls?: number
  runs?: number
  avg?: string
  obp?: string
  slg?: string
}

export interface BoxscorePlayerPitching {
  summary?: string
  inningsPitched?: string
  strikeOuts?: number
  earnedRuns?: number
  hits?: number
  baseOnBalls?: number
  runs?: number
  homeRuns?: number
  era?: string
}

export interface BoxscorePlayer {
  person: { id: number; fullName: string; boxscoreName?: string }
  jerseyNumber?: string
  position: { name: string; abbreviation: string }
  battingOrder?: string
  stats: {
    batting?: BoxscorePlayerBatting
    pitching?: BoxscorePlayerPitching
  }
  seasonStats: {
    batting?: { avg?: string; obp?: string; slg?: string }
    pitching?: { era?: string }
  }
  gameStatus: { isCurrentBatter: boolean; isCurrentPitcher: boolean }
}

export interface BoxscoreInfoField {
  label: string
  value: string
}

export interface BoxscoreInfoSection {
  title: string
  fieldList: BoxscoreInfoField[]
}

export interface BoxscoreTeam {
  team: Team
  teamStats: {
    batting: {
      runs: number
      hits: number
      atBats?: number
      rbi?: number
      homeRuns?: number
      strikeOuts?: number
      baseOnBalls?: number
      leftOnBase?: number
    }
    pitching?: {
      inningsPitched?: string
      hits?: number
      runs?: number
      earnedRuns?: number
      baseOnBalls?: number
      strikeOuts?: number
      homeRuns?: number
    }
    fielding: { errors: number }
  }
  players: Record<string, BoxscorePlayer>
  pitchers: number[]
  batters: number[]
  battingOrder: number[]
  info?: BoxscoreInfoSection[]
}

export interface DecisionPitcher {
  id: number
  fullName: string
}

export interface BoxscoreResponse {
  teams: {
    away: BoxscoreTeam
    home: BoxscoreTeam
  }
  decisions?: {
    winner?: DecisionPitcher
    loser?: DecisionPitcher
    save?: DecisionPitcher
  }
}

// ── Linescore ─────────────────────────────────────────────────────────────────

export interface LinescoreInningHalf {
  runs?: number
  hits?: number
  errors?: number
}

export interface LinescoreInning {
  num: number
  ordinalNum: string
  home: LinescoreInningHalf
  away: LinescoreInningHalf
}

export interface LinescoreTotals {
  runs: number
  hits: number
  errors: number
}

export interface LiveRunner {
  id: number
  fullName: string
}

export interface LinescoreOffense {
  batter?: LiveRunner
  onDeck?: LiveRunner
  inHole?: LiveRunner
  onFirst?: LiveRunner
  onSecond?: LiveRunner
  onThird?: LiveRunner
}

export interface LinescoreDefense {
  pitcher?: LiveRunner
  catcher?: LiveRunner
}

export interface LinescoreResponse {
  innings: LinescoreInning[]
  teams: {
    away: LinescoreTotals
    home: LinescoreTotals
  }
  decisions?: {
    winner?: DecisionPitcher
    loser?: DecisionPitcher
    save?: DecisionPitcher
  }
  currentInning?: number
  currentInningOrdinal?: string
  inningState?: string
  inningHalf?: string
  outs?: number
  balls?: number
  strikes?: number
  offense?: LinescoreOffense
  defense?: LinescoreDefense
}

// ── Play by Play ──────────────────────────────────────────────────────────────

export interface Play {
  result: {
    event: string
    eventType: string
    description: string
    rbi: number
    awayScore: number
    homeScore: number
  }
  about: {
    atBatIndex: number
    halfInning: 'top' | 'bottom'
    isTopInning: boolean
    inning: number
    isScoringPlay: boolean
    isComplete: boolean
  }
  matchup: {
    batter: { id: number; fullName: string }
    pitcher: { id: number; fullName: string }
  }
}

export interface PlayByPlayResponse {
  allPlays: Play[]
}

// ── Team Stats ─────────────────────────────────────────────────────────────────

export interface PlayerStatValues {
  gamesPlayed?: number
  atBats?: number
  runs?: number
  hits?: number
  doubles?: number
  triples?: number
  homeRuns?: number
  rbi?: number
  baseOnBalls?: number
  strikeOuts?: number
  avg?: string
  obp?: string
  slg?: string
  gamesStarted?: number
  wins?: number
  losses?: number
  saves?: number
  inningsPitched?: string
  earnedRuns?: number
  era?: string
  whip?: string
}

export interface PlayerStatSplit {
  season?: string
  stat: PlayerStatValues
  player: { id: number; fullName: string }
  team?: { id: number; name: string }
}

export interface TeamStatsResponse {
  stats: Array<{
    type?: { displayName: string }
    group?: { displayName: string }
    splits: PlayerStatSplit[]
  }>
}

// ── Team Roster ────────────────────────────────────────────────────────────────

export interface RosterPerson {
  id: number
  fullName: string
  currentAge?: number
  height?: string
  weight?: number
  batSide?: { code: string; description: string }
  pitchHand?: { code: string; description: string }
}

export interface RosterPlayer {
  person: RosterPerson
  jerseyNumber?: string
  position: {
    code: string
    name: string
    type: string
    abbreviation: string
  }
  status?: {
    code: string
    description: string
  }
}

export interface RosterResponse {
  roster: RosterPlayer[]
  teamId: number
  rosterType: string
}

// ── Team Info ──────────────────────────────────────────────────────────────────

export interface TeamInfo {
  id: number
  name: string
  abbreviation: string
  teamName: string
  locationName: string
  division?: { id: number; name: string }
  league?: { id: number; name: string }
  venue?: { id: number; name: string }
}

export interface TeamInfoResponse {
  teams: TeamInfo[]
}