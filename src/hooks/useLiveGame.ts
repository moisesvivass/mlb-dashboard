import { useState, useEffect } from 'react'
import { mlbApi } from '../services/mlbApi'
import type { LinescoreResponse, Play } from '../types/mlb'

interface UseLiveGameReturn {
  linescore: LinescoreResponse | null
  plays: Play[]
  loading: boolean
  error: string | null
}

export const useLiveGame = (gamePk: number, enabled: boolean, isLive: boolean): UseLiveGameReturn => {
  const [linescore, setLinescore] = useState<LinescoreResponse | null>(null)
  const [plays, setPlays] = useState<Play[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!enabled) return

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [ls, pbp] = await Promise.all([
          mlbApi.getLinescore(gamePk),
          mlbApi.getPlayByPlay(gamePk),
        ])
        setLinescore(ls)
        setPlays(pbp.allPlays)
      } catch (err) {
        setError('Failed to load live game data')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()

    if (!isLive) return // fetch once for non-live games, no polling

    const interval = setInterval(fetchData, 15000)
    return () => clearInterval(interval)
  }, [gamePk, enabled, isLive])

  return { linescore, plays, loading, error }
}
