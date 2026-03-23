import { useState, useEffect } from 'react'
import { mlbApi } from '../services/mlbApi'
import type { DivisionStandings } from '../types/mlb'

interface UseStandingsReturn {
  divisions: DivisionStandings[]
  loading: boolean
  error: string | null
}

export const useStandings = (): UseStandingsReturn => {
  const [divisions, setDivisions] = useState<DivisionStandings[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchStandings = async () => {
      try {
        setLoading(true)
        const data = await mlbApi.getStandings()
        setDivisions(data.records)
      } catch (err) {
        setError('Failed to load standings')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchStandings()
  }, [])

  return { divisions, loading, error }
}
