import { useState, useMemo } from 'react'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTeamStats } from '../hooks/useTeamStats'
import type { PlayerStatSplit, PlayerStatValues } from '../types/mlb'

interface TeamStatsTableProps {
  teamId: number
}

// ── Leader card ──────────────────────────────────────────────────────────────

interface LeaderCardProps {
  title: string
  value: string | number | undefined
  playerName: string | undefined
}

const LeaderCard = ({ title, value, playerName }: LeaderCardProps) => (
  <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 px-4 py-3 text-center">
    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-1">{title}</p>
    <p className="text-2xl font-bold text-white tabular-nums leading-none mb-1">
      {value ?? '—'}
    </p>
    <p className="text-[11px] text-zinc-400 truncate">{playerName ?? '—'}</p>
  </div>
)

// ── Leaders derivation ────────────────────────────────────────────────────────

const topBy = (
  splits: PlayerStatSplit[],
  key: keyof PlayerStatValues,
  minKey?: keyof PlayerStatValues,
  minVal?: number,
  ascending = false
): PlayerStatSplit | undefined => {
  let filtered = splits
  if (minKey !== undefined && minVal !== undefined) {
    filtered = splits.filter((s) => {
      const v = s.stat[minKey]
      return typeof v === 'number' ? v >= minVal : false
    })
  }
  if (filtered.length === 0) return undefined
  return filtered.reduce((best, curr) => {
    const bVal = best.stat[key]
    const cVal = curr.stat[key]
    if (cVal === undefined) return best
    if (bVal === undefined) return curr
    if (ascending) {
      return Number(cVal) < Number(bVal) ? curr : best
    }
    return Number(cVal) > Number(bVal) ? curr : best
  })
}

// ── Batting leaders ──────────────────────────────────────────────────────────

const BattingLeaders = ({ stats }: { stats: PlayerStatSplit[] }) => {
  const leaders = [
    {
      title: 'AVG',
      split: topBy(stats, 'avg', 'atBats', 15, false),
      key: 'avg' as keyof PlayerStatValues,
    },
    {
      title: 'HR',
      split: topBy(stats, 'homeRuns'),
      key: 'homeRuns' as keyof PlayerStatValues,
    },
    {
      title: 'RBI',
      split: topBy(stats, 'rbi'),
      key: 'rbi' as keyof PlayerStatValues,
    },
    {
      title: 'OBP',
      split: topBy(stats, 'obp', 'atBats', 15, false),
      key: 'obp' as keyof PlayerStatValues,
    },
    {
      title: 'H',
      split: topBy(stats, 'hits'),
      key: 'hits' as keyof PlayerStatValues,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-6">
      {leaders.map(({ title, split, key }) => (
        <LeaderCard
          key={title}
          title={title}
          value={split?.stat[key]}
          playerName={split?.player.fullName}
        />
      ))}
    </div>
  )
}

// ── Pitching leaders ─────────────────────────────────────────────────────────

const PitchingLeaders = ({ stats }: { stats: PlayerStatSplit[] }) => {
  const leaders = [
    {
      title: 'ERA',
      split: topBy(stats, 'era', 'gamesPlayed', 1, true),
      key: 'era' as keyof PlayerStatValues,
    },
    {
      title: 'K',
      split: topBy(stats, 'strikeOuts'),
      key: 'strikeOuts' as keyof PlayerStatValues,
    },
    {
      title: 'W',
      split: topBy(stats, 'wins'),
      key: 'wins' as keyof PlayerStatValues,
    },
    {
      title: 'SV',
      split: topBy(stats, 'saves'),
      key: 'saves' as keyof PlayerStatValues,
    },
  ]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
      {leaders.map(({ title, split, key }) => (
        <LeaderCard
          key={title}
          title={title}
          value={split?.stat[key]}
          playerName={split?.player.fullName}
        />
      ))}
    </div>
  )
}

// ── Batting table ────────────────────────────────────────────────────────────

const st = (val: number | string | undefined, fallback: string | number = '—') => val ?? fallback

const BattingTable = ({ stats }: { stats: PlayerStatSplit[] }) => {
  const sorted = useMemo(
    () => [...stats].sort((a, b) => (b.stat.atBats ?? 0) - (a.stat.atBats ?? 0)),
    [stats]
  )

  return (
    <div className="overflow-x-auto rounded-md border border-zinc-800">
      <table className="text-xs min-w-max w-full">
        <thead>
          <tr className="bg-zinc-800/60 text-zinc-500">
            <th className="text-left py-2 px-3 font-medium">Player</th>
            <th className="py-2 px-2 font-medium">GP</th>
            <th className="py-2 px-2 font-medium">AB</th>
            <th className="py-2 px-2 font-medium">R</th>
            <th className="py-2 px-2 font-medium">H</th>
            <th className="py-2 px-2 font-medium">2B</th>
            <th className="py-2 px-2 font-medium">3B</th>
            <th className="py-2 px-2 font-medium">HR</th>
            <th className="py-2 px-2 font-medium">RBI</th>
            <th className="py-2 px-2 font-medium">BB</th>
            <th className="py-2 px-2 font-medium">K</th>
            <th className="py-2 px-2 font-medium">AVG</th>
            <th className="py-2 px-2 font-medium">OBP</th>
            <th className="py-2 px-2 font-medium">SLG</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((split) => {
            const s = split.stat
            return (
              <tr
                key={split.player.id}
                className="border-t border-zinc-800 hover:bg-zinc-800/30 transition-colors"
              >
                <td className="py-1.5 px-3 text-zinc-200 whitespace-nowrap font-medium">
                  {split.player.fullName}
                </td>
                <td className="py-1.5 px-2 text-center tabular-nums text-zinc-400">{st(s.gamesPlayed)}</td>
                <td className="py-1.5 px-2 text-center tabular-nums text-zinc-300">{st(s.atBats)}</td>
                <td className="py-1.5 px-2 text-center tabular-nums text-zinc-400">{st(s.runs)}</td>
                <td className="py-1.5 px-2 text-center tabular-nums text-zinc-300 font-semibold">{st(s.hits)}</td>
                <td className="py-1.5 px-2 text-center tabular-nums text-zinc-400">{st(s.doubles)}</td>
                <td className="py-1.5 px-2 text-center tabular-nums text-zinc-400">{st(s.triples)}</td>
                <td className="py-1.5 px-2 text-center tabular-nums text-zinc-400">{st(s.homeRuns, 0)}</td>
                <td className="py-1.5 px-2 text-center tabular-nums text-zinc-300">{st(s.rbi, 0)}</td>
                <td className="py-1.5 px-2 text-center tabular-nums text-zinc-400">{st(s.baseOnBalls, 0)}</td>
                <td className="py-1.5 px-2 text-center tabular-nums text-zinc-400">{st(s.strikeOuts, 0)}</td>
                <td className="py-1.5 px-2 text-center tabular-nums text-zinc-300 font-semibold">{s.avg ?? '—'}</td>
                <td className="py-1.5 px-2 text-center tabular-nums text-zinc-400">{s.obp ?? '—'}</td>
                <td className="py-1.5 px-2 text-center tabular-nums text-zinc-400">{s.slg ?? '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Pitching table ───────────────────────────────────────────────────────────

const PitchingTable = ({ stats }: { stats: PlayerStatSplit[] }) => {
  const sorted = useMemo(
    () =>
      [...stats].sort((a, b) => {
        const ipA = parseFloat(a.stat.inningsPitched?.replace('/', '.') ?? '0') || 0
        const ipB = parseFloat(b.stat.inningsPitched?.replace('/', '.') ?? '0') || 0
        return ipB - ipA
      }),
    [stats]
  )

  return (
    <div className="overflow-x-auto rounded-md border border-zinc-800">
      <table className="text-xs min-w-max w-full">
        <thead>
          <tr className="bg-zinc-800/60 text-zinc-500">
            <th className="text-left py-2 px-3 font-medium">Player</th>
            <th className="py-2 px-2 font-medium">GP</th>
            <th className="py-2 px-2 font-medium">GS</th>
            <th className="py-2 px-2 font-medium">W</th>
            <th className="py-2 px-2 font-medium">L</th>
            <th className="py-2 px-2 font-medium">SV</th>
            <th className="py-2 px-2 font-medium">IP</th>
            <th className="py-2 px-2 font-medium">H</th>
            <th className="py-2 px-2 font-medium">ER</th>
            <th className="py-2 px-2 font-medium">BB</th>
            <th className="py-2 px-2 font-medium">K</th>
            <th className="py-2 px-2 font-medium">ERA</th>
            <th className="py-2 px-2 font-medium">WHIP</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((split) => {
            const s = split.stat
            return (
              <tr
                key={split.player.id}
                className="border-t border-zinc-800 hover:bg-zinc-800/30 transition-colors"
              >
                <td className="py-1.5 px-3 text-zinc-200 whitespace-nowrap font-medium">
                  {split.player.fullName}
                </td>
                <td className="py-1.5 px-2 text-center tabular-nums text-zinc-400">{st(s.gamesPlayed)}</td>
                <td className="py-1.5 px-2 text-center tabular-nums text-zinc-400">{st(s.gamesStarted, 0)}</td>
                <td className="py-1.5 px-2 text-center tabular-nums text-zinc-300 font-semibold">{st(s.wins, 0)}</td>
                <td className="py-1.5 px-2 text-center tabular-nums text-zinc-400">{st(s.losses, 0)}</td>
                <td className="py-1.5 px-2 text-center tabular-nums text-zinc-400">{st(s.saves, 0)}</td>
                <td className="py-1.5 px-2 text-center tabular-nums text-zinc-300 font-medium">{st(s.inningsPitched)}</td>
                <td className="py-1.5 px-2 text-center tabular-nums text-zinc-400">{st(s.hits, 0)}</td>
                <td className="py-1.5 px-2 text-center tabular-nums text-zinc-400">{st(s.earnedRuns, 0)}</td>
                <td className="py-1.5 px-2 text-center tabular-nums text-zinc-400">{st(s.baseOnBalls, 0)}</td>
                <td className="py-1.5 px-2 text-center tabular-nums text-zinc-300">{st(s.strikeOuts, 0)}</td>
                <td className="py-1.5 px-2 text-center tabular-nums text-zinc-300 font-semibold">{s.era ?? '—'}</td>
                <td className="py-1.5 px-2 text-center tabular-nums text-zinc-400">{s.whip ?? '—'}</td>
              </tr>
            )
          })}
        </tbody>
      </table>
    </div>
  )
}

// ── Main component ───────────────────────────────────────────────────────────

export const TeamStatsTable = ({ teamId }: TeamStatsTableProps) => {
  const { battingStats, pitchingStats, loading, error } = useTeamStats(teamId)
  const [statTab, setStatTab] = useState<'batting' | 'pitching'>('batting')

  if (loading) {
    return (
      <div className="flex flex-col items-center py-16 gap-3 text-zinc-500">
        <div className="w-5 h-5 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
        <span className="text-sm">Loading stats…</span>
      </div>
    )
  }

  if (error) return <div className="text-center text-red-400 py-10">{error}</div>

  if (battingStats.length === 0 && pitchingStats.length === 0) {
    return <p className="text-center text-zinc-500 py-10 text-sm">No stats available yet for this season.</p>
  }

  return (
    <Tabs value={statTab} onValueChange={(v) => setStatTab(v as 'batting' | 'pitching')}>
      <TabsList className="mb-5">
        <TabsTrigger value="batting">Batting</TabsTrigger>
        <TabsTrigger value="pitching">Pitching</TabsTrigger>
      </TabsList>

      <TabsContent value="batting">
        {battingStats.length > 0 ? (
          <>
            <BattingLeaders stats={battingStats} />
            <BattingTable stats={battingStats} />
          </>
        ) : (
          <p className="text-center text-zinc-500 py-10 text-sm">No batting stats available.</p>
        )}
      </TabsContent>

      <TabsContent value="pitching">
        {pitchingStats.length > 0 ? (
          <>
            <PitchingLeaders stats={pitchingStats} />
            <PitchingTable stats={pitchingStats} />
          </>
        ) : (
          <p className="text-center text-zinc-500 py-10 text-sm">No pitching stats available.</p>
        )}
      </TabsContent>
    </Tabs>
  )
}
