import { useState, useEffect } from 'react'
import { mlbApi } from '../services/mlbApi'
import type { RosterPlayer } from '../types/mlb'

interface UseTeamRosterReturn {
  players: RosterPlayer[]
  loading: boolean
  error: string | null
}

export const useTeamRoster = (teamId: number): UseTeamRosterReturn => {
  const [players, setPlayers] = useState<RosterPlayer[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const res = await mlbApi.getTeamRoster(teamId)
        setPlayers(res.roster)
      } catch (err) {
        setError('Failed to load roster')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [teamId])

  return { players, loading, error }
}
