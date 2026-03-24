import { useNavigate } from 'react-router-dom'
import { useTeamRoster } from '../hooks/useTeamRoster'
import type { RosterPlayer } from '../types/mlb'

interface RosterTableProps {
  teamId: number
}

const POSITION_GROUP_ORDER = ['Pitchers', 'Catchers', 'Infielders', 'Outfielders', 'Designated Hitter']

const getPositionGroup = (position: RosterPlayer['position']): string => {
  if (position.abbreviation === 'DH') return 'Designated Hitter'
  switch (position.type) {
    case 'Pitcher': return 'Pitchers'
    case 'Catcher': return 'Catchers'
    case 'Infielder': return 'Infielders'
    case 'Outfielder': return 'Outfielders'
    default: return 'Other'
  }
}

const getBatThrow = (player: RosterPlayer): string => {
  const bat = player.person.batSide?.code ?? '?'
  const thr = player.person.pitchHand?.code ?? '?'
  return `${bat}/${thr}`
}

export const RosterTable = ({ teamId }: RosterTableProps) => {
  const { players, loading, error } = useTeamRoster(teamId)
  const navigate = useNavigate()

  if (loading) {
    return (
      <div className="flex flex-col items-center py-16 gap-3 text-zinc-500">
        <div className="w-5 h-5 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
        <span className="text-sm">Loading roster…</span>
      </div>
    )
  }

  if (error) return <div className="text-center text-red-400 py-10">{error}</div>

  if (players.length === 0) {
    return <p className="text-center text-zinc-500 py-10 text-sm">No roster data available.</p>
  }

  // Group players by position type
  const grouped = new Map<string, RosterPlayer[]>()
  for (const player of players) {
    const group = getPositionGroup(player.position)
    if (!grouped.has(group)) grouped.set(group, [])
    grouped.get(group)!.push(player)
  }

  // Sort players within each group by jersey number
  for (const [, groupPlayers] of grouped) {
    groupPlayers.sort((a, b) => {
      const numA = parseInt(a.jerseyNumber ?? '999')
      const numB = parseInt(b.jerseyNumber ?? '999')
      return numA - numB
    })
  }

  const orderedGroups = POSITION_GROUP_ORDER.filter((g) => grouped.has(g))
  // append any unexpected groups
  for (const key of grouped.keys()) {
    if (!orderedGroups.includes(key)) orderedGroups.push(key)
  }

  return (
    <div className="space-y-6">
      {orderedGroups.map((group) => {
        const groupPlayers = grouped.get(group)!
        return (
          <div key={group}>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">{group}</span>
              <div className="flex-1 h-px bg-zinc-800" />
              <span className="text-[10px] text-zinc-700">{groupPlayers.length}</span>
            </div>

            <div className="overflow-x-auto rounded-md border border-zinc-800">
              <table className="text-xs min-w-max w-full">
                <thead>
                  <tr className="bg-zinc-800/60 text-zinc-500">
                    <th className="text-left py-2 px-3 font-medium w-10">#</th>
                    <th className="text-left py-2 px-3 font-medium">Name</th>
                    <th className="py-2 px-2 font-medium text-center">POS</th>
                    <th className="py-2 px-2 font-medium text-center">B/T</th>
                    <th className="py-2 px-2 font-medium text-center">AGE</th>
                    <th className="py-2 px-2 font-medium text-center">HT</th>
                    <th className="py-2 px-2 font-medium text-center">WT</th>
                  </tr>
                </thead>
                <tbody>
                  {groupPlayers.map((player) => (
                    <tr
                      key={player.person.id}
                      className="border-t border-zinc-800 hover:bg-zinc-800/40 cursor-pointer transition-colors"
                      onClick={() => navigate(`/player/${player.person.id}`)}
                    >
                      <td className="py-2 px-3 text-zinc-600 tabular-nums">
                        {player.jerseyNumber ?? '—'}
                      </td>
                      <td className="py-2 px-3 text-zinc-200 font-medium whitespace-nowrap hover:text-blue-400 transition-colors">
                        {player.person.fullName}
                      </td>
                      <td className="py-2 px-2 text-center text-zinc-400">{player.position.abbreviation}</td>
                      <td className="py-2 px-2 text-center text-zinc-500">{getBatThrow(player)}</td>
                      <td className="py-2 px-2 text-center text-zinc-400 tabular-nums">
                        {player.person.currentAge ?? '—'}
                      </td>
                      <td className="py-2 px-2 text-center text-zinc-500 whitespace-nowrap">
                        {player.person.height ?? '—'}
                      </td>
                      <td className="py-2 px-2 text-center text-zinc-500 tabular-nums">
                        {player.person.weight ?? '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )
      })}
    </div>
  )
}
