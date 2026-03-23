import { useState, useEffect } from 'react'
import { mlbApi } from '../services/mlbApi'
import type { Game } from '../types/mlb'

interface UseScheduleReturn {
  games: Game[]
  loading: boolean
  error: string | null
  totalGamesInProgress: number
}

export const useSchedule = (date?: string): UseScheduleReturn => {
  const [games, setGames] = useState<Game[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [totalGamesInProgress, setTotalGamesInProgress] = useState(0)

  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true)
        setError(null)
        const data = date
          ? await mlbApi.getSchedule(date)
          : await mlbApi.getTodaySchedule()
        const allGames = data.dates[0]?.games ?? []
        setGames(allGames)
        setTotalGamesInProgress(data.totalGamesInProgress)
      } catch (err) {
        setError('Failed to load games')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchGames()
  }, [date])

  return { games, loading, error, totalGamesInProgress }
}