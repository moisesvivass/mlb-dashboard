import type { ScheduleResponse } from '../types/mlb'

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
}