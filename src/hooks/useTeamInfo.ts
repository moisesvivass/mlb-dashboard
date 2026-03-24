import { useState, useEffect } from 'react'
import { mlbApi } from '../services/mlbApi'
import type { TeamInfo, StandingsTeam } from '../types/mlb'

interface UseTeamInfoReturn {
  teamInfo: TeamInfo | null
  standingsTeam: StandingsTeam | null
  loading: boolean
  error: string | null
}

export const useTeamInfo = (teamId: number): UseTeamInfoReturn => {
  const [teamInfo, setTeamInfo] = useState<TeamInfo | null>(null)
  const [standingsTeam, setStandingsTeam] = useState<StandingsTeam | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        setError(null)
        const [infoRes, standingsRes] = await Promise.all([
          mlbApi.getTeamInfo(teamId),
          mlbApi.getStandings(),
        ])
        setTeamInfo(infoRes.teams[0] ?? null)

        let found: StandingsTeam | null = null
        for (const division of standingsRes.records) {
          const match = division.teamRecords.find((t) => t.team.id === teamId)
          if (match) {
            found = match
            break
          }
        }
        setStandingsTeam(found)
      } catch (err) {
        setError('Failed to load team info')
        console.error(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [teamId])

  return { teamInfo, standingsTeam, loading, error }
}
