import { useState, useEffect } from 'react'
import { mlbApi } from '../services/mlbApi'
import type { PlayerStatSplit } from '../types/mlb'

interface UseTeamStatsReturn {
  battingStats: PlayerStatSplit[]
  pitchingStats: PlayerStatSplit[]
  loading: boolean
  error: string | null
}

export const useTeamStats = (teamId: number): UseTeamStatsReturn => {
  const [battingStats, setBattingStats] = useState<PlayerStatSplit[]>([])
  const [pitchingStats, setPitchingStats] = useState<PlayerStatSplit[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [batting, pitching] = await Promise.all([
          mlbApi.getTeamBattingStats(teamId),
          mlbApi.getTeamPitchingStats(teamId),
        ])
        setBattingStats(batting.stats[0]?.splits ?? [])
        setPitchingStats(pitching.stats[0]?.splits ?? [])
      } catch (err) {
        setError('Failed to load team stats')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [teamId])

  return { battingStats, pitchingStats, loading, error }
}
