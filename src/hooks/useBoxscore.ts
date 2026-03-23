import { useState, useEffect } from 'react'
import { mlbApi } from '../services/mlbApi'
import type { BoxscoreResponse, LinescoreResponse } from '../types/mlb'

interface UseBoxscoreReturn {
  boxscore: BoxscoreResponse | null
  linescore: LinescoreResponse | null
  loading: boolean
  error: string | null
}

export const useBoxscore = (gamePk: number | null): UseBoxscoreReturn => {
  const [boxscore, setBoxscore] = useState<BoxscoreResponse | null>(null)
  const [linescore, setLinescore] = useState<LinescoreResponse | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (gamePk === null) return

    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [bs, ls] = await Promise.all([
          mlbApi.getBoxscore(gamePk),
          mlbApi.getLinescore(gamePk),
        ])
        setBoxscore(bs)
        setLinescore(ls)
      } catch (err) {
        setError('Failed to load game details')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [gamePk])

  return { boxscore, linescore, loading, error }
}
