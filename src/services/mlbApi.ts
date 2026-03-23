import type { ScheduleResponse, StandingsResponse } from '../types/mlb'

const BASE_URL = 'https://statsapi.mlb.com/api/v1'

export const mlbApi = {
  getSchedule: async (date: string): Promise<ScheduleResponse> => {
    const response = await fetch(
      `${BASE_URL}/schedule?sportId=1&date=${date}`
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
}