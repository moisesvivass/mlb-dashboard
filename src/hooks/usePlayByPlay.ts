import { useState, useEffect } from 'react'
import { mlbApi } from '../services/mlbApi'
import type { PlayByPlayResponse } from '../types/mlb'

interface UsePlayByPlayReturn {
  data: PlayByPlayResponse | null
  loading: boolean
  error: string | null
}

export const usePlayByPlay = (gamePk: number, enabled: boolean): UsePlayByPlayReturn => {
  const [data, setData] = useState<PlayByPlayResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const result = await mlbApi.getPlayByPlay(gamePk)
        setData(result)
      } catch (err) {
        setError('Failed to load play by play')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [gamePk, enabled])

  return { data, loading, error }
}
