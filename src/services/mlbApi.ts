import type {
  ScheduleResponse,
  StandingsResponse,
  BoxscoreResponse,
  LinescoreResponse,
  PlayByPlayResponse,
  TeamStatsResponse,
  RosterResponse,
  TeamInfoResponse,
} from '../types/mlb'

const BASE_URL = 'https://statsapi.mlb.com/api/v1'

export const mlbApi = {
  getSchedule: async (date: string): Promise<ScheduleResponse> => {
    const response = await fetch(
      `${BASE_URL}/schedule?sportId=1&date=${date}&hydrate=decisions,probablePitchers,linescore`
    )
    if (!response.ok) {
      throw new Error('Failed to fetch schedule')
    }
    return response.json()
  },

  getTodaySchedule: async (): Promise<ScheduleResponse> => {
    const today = new Date().toISOString().split('T')[0]
    return mlbApi.getSchedule(today)
  },

  getStandings: async (): Promise<StandingsResponse> => {
    const response = await fetch(
      `${BASE_URL}/standings?leagueId=103,104&season=2026&standingsType=regularSeason`
    )
    if (!response.ok) {
      throw new Error('Failed to fetch standings')
    }
    return response.json()
  },

  getBoxscore: async (gamePk: number): Promise<BoxscoreResponse> => {
    const response = await fetch(`${BASE_URL}/game/${gamePk}/boxscore`)
    if (!response.ok) {
      throw new Error('Failed to fetch boxscore')
    }
    return response.json()
  },

  getLinescore: async (gamePk: number): Promise<LinescoreResponse> => {
    const response = await fetch(`${BASE_URL}/game/${gamePk}/linescore`)
    if (!response.ok) {
      throw new Error('Failed to fetch linescore')
    }
    return response.json()
  },

  getGameByPk: async (gamePk: number): Promise<ScheduleResponse> => {
    const response = await fetch(`${BASE_URL}/schedule?sportId=1&gamePk=${gamePk}`)
    if (!response.ok) {
      throw new Error('Failed to fetch game')
    }
    return response.json()
  },

  getPlayByPlay: async (gamePk: number): Promise<PlayByPlayResponse> => {
    const response = await fetch(`${BASE_URL}/game/${gamePk}/playByPlay`)
    if (!response.ok) {
      throw new Error('Failed to fetch play by play')
    }
    return response.json()
  },

  getTeamInfo: async (teamId: number): Promise<TeamInfoResponse> => {
    const response = await fetch(`${BASE_URL}/teams/${teamId}`)
    if (!response.ok) {
      throw new Error('Failed to fetch team info')
    }
    return response.json()
  },

  getTeamRoster: async (teamId: number): Promise<RosterResponse> => {
    const response = await fetch(
      `${BASE_URL}/teams/${teamId}/roster?rosterType=fullRoster&season=2026&hydrate=person`
    )
    if (!response.ok) {
      throw new Error('Failed to fetch team roster')
    }
    return response.json()
  },

  getTeamBattingStats: async (teamId: number): Promise<TeamStatsResponse> => {
    const response = await fetch(
      `${BASE_URL}/stats?stats=season&group=hitting&teamId=${teamId}&season=2026&sportId=1&limit=100`
    )
    if (!response.ok) {
      throw new Error('Failed to fetch team batting stats')
    }
    return response.json()
  },

  getTeamPitchingStats: async (teamId: number): Promise<TeamStatsResponse> => {
    const response = await fetch(
      `${BASE_URL}/stats?stats=season&group=pitching&teamId=${teamId}&season=2026&sportId=1&limit=100`
    )
    if (!response.ok) {
      throw new Error('Failed to fetch team pitching stats')
    }
    return response.json()
  },

  getTeamSchedule: async (teamId: number): Promise<ScheduleResponse> => {
    const response = await fetch(
      `${BASE_URL}/schedule?teamId=${teamId}&season=2026&sportId=1&hydrate=decisions,probablePitchers`
    )
    if (!response.ok) {
      throw new Error('Failed to fetch team schedule')
    }
    return response.json()
  },
}