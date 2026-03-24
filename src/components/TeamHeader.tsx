import { getTeamLogoUrl } from '@/lib/utils'
import type { TeamInfo, StandingsTeam } from '../types/mlb'

interface TeamHeaderProps {
  teamInfo: TeamInfo | null
  standingsTeam: StandingsTeam | null
  teamId: number
}

export const TeamHeader = ({ teamInfo, standingsTeam, teamId }: TeamHeaderProps) => {
  const wins = standingsTeam?.leagueRecord.wins ?? standingsTeam?.wins
  const losses = standingsTeam?.leagueRecord.losses ?? standingsTeam?.losses

  return (
    <div className="flex items-center gap-5 py-6">
      <img
        src={getTeamLogoUrl(teamId)}
        alt={teamInfo?.name ?? ''}
        className="w-20 h-20 drop-shadow-lg flex-shrink-0"
      />
      <div>
        <h1 className="text-2xl font-bold text-white leading-tight">
          {teamInfo?.name ?? 'Loading…'}
        </h1>
        {teamInfo && (
          <p className="text-sm text-zinc-500 mt-0.5">
            {teamInfo.locationName} · {teamInfo.division?.name ?? teamInfo.league?.name}
          </p>
        )}
        {wins !== undefined && losses !== undefined && (
          <div className="mt-2 inline-flex items-center gap-2">
            <span className="text-base font-bold text-zinc-200 tabular-nums">
              {wins}–{losses}
            </span>
            {standingsTeam && (
              <span className="text-xs text-zinc-500">
                .{Math.round(Number(standingsTeam.leagueRecord.pct) * 1000)} ·{' '}
                {standingsTeam.gamesBack === '-' ? 'GB: —' : `${standingsTeam.gamesBack} GB`}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
