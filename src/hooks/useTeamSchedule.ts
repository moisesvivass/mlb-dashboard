import { useState, useEffect } from 'react'
import { mlbApi } from '../services/mlbApi'
import type { Game } from '../types/mlb'

interface UseTeamScheduleReturn {
  games: Game[]
  loading: boolean
  error: string | null
}

export const useTeamSchedule = (teamId: number): UseTeamScheduleReturn => {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await mlbApi.getTeamSchedule(teamId)
        const allGames = res.dates.flatMap((d) => d.games)
        setGames(allGames)
      } catch (err) {
        setError('Failed to load team schedule')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [teamId])

  return { games, loading, error }
}
