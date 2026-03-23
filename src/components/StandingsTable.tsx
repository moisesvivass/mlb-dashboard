import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useStandings } from '../hooks/useStandings'
import type { DivisionStandings } from '../types/mlb'

// Division IDs in display order per league
const AL_IDS = [201, 202, 200] // AL East, AL Central, AL West
const NL_IDS = [204, 205, 203] // NL East, NL Central, NL West

const isPreseason = (divisions: DivisionStandings[]) =>
  divisions.every((d) => d.teamRecords.every((r) => r.wins === 0 && r.losses === 0))

const DivisionTable = ({ division }: { division: DivisionStandings }) => (
  <div>
    <h3 className="text-sm font-semibold text-blue-400 mb-2">{division.division.name}</h3>
    <table className="w-full text-sm">
      <thead>
        <tr className="text-muted-foreground border-b border-border">
          <th className="text-left pb-1 w-8">#</th>
          <th className="text-left pb-1">Team</th>
          <th className="text-right pb-1 w-10">W</th>
          <th className="text-right pb-1 w-10">L</th>
          <th className="text-right pb-1 w-14">PCT</th>
          <th className="text-right pb-1 w-12">GB</th>
        </tr>
      </thead>
      <tbody>
        {division.teamRecords.map((record, index) => (
          <tr
            key={record.team.id}
            className={`border-b border-border/40 ${index === 0 ? 'text-foreground' : 'text-muted-foreground'}`}
          >
            <td className="py-1.5">{index + 1}</td>
            <td className="py-1.5 font-medium">{record.team.name}</td>
            <td className="py-1.5 text-right">{record.leagueRecord.wins}</td>
            <td className="py-1.5 text-right">{record.leagueRecord.losses}</td>
            <td className="py-1.5 text-right">{record.leagueRecord.pct}</td>
            <td className="py-1.5 text-right">{record.gamesBack}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

const LeaguePanel = ({
  divisions,
  ids,
}: {
  divisions: DivisionStandings[]
  ids: number[]
}) => {
  const ordered = ids
    .map((id) => divisions.find((d) => d.division.id === id))
    .filter((d): d is DivisionStandings => d !== undefined)

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {ordered.map((division) => (
        <DivisionTable key={division.division.id} division={division} />
      ))}
    </div>
  )
}

export const StandingsTable = () => {
  const { divisions, loading, error } = useStandings()

  if (loading) {
    return <div className="text-center text-muted-foreground py-20">Loading standings...</div>
  }

  if (error) {
    return <div className="text-center text-red-400 py-20">{error}</div>
  }

  const preseason = isPreseason(divisions)

  return (
    <div>
      {preseason && (
        <div className="mb-6 text-center rounded-md border border-blue-500/40 bg-blue-500/10 py-3 text-sm text-blue-300">
          Regular Season begins March 27, 2026
        </div>
      )}
      <Tabs defaultValue="al">
        <TabsList className="mb-4">
          <TabsTrigger value="al">American League</TabsTrigger>
          <TabsTrigger value="nl">National League</TabsTrigger>
        </TabsList>
        <TabsContent value="al">
          <LeaguePanel divisions={divisions} ids={AL_IDS} />
        </TabsContent>
        <TabsContent value="nl">
          <LeaguePanel divisions={divisions} ids={NL_IDS} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
