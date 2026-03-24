import { useState, useEffect } from 'react'
import { useParams, useLocation, useNavigate } from 'react-router-dom'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { cn, getTeamLogoUrl, getTeamAbbreviation, formatGameTime } from '@/lib/utils'
import { mlbApi } from '../services/mlbApi'
import { useBoxscore } from '../hooks/useBoxscore'
import { usePlayByPlay } from '../hooks/usePlayByPlay'
import { useLiveGame } from '../hooks/useLiveGame'
import { BaseballDiamond } from '../components/BaseballDiamond'
import { LiveFeed } from '../components/LiveFeed'
import type {
  Game,
  GameTeam,
  BoxscoreTeam,
  BoxscorePlayer,
  BoxscoreResponse,
} from '../types/mlb'

// ── Helpers ────────────────────────────────────────────────────────────────────

const findPlayer = (
  players: Record<string, BoxscorePlayer>,
  id: number
): BoxscorePlayer | undefined => players[`ID${id}`]

const stat = (val: number | string | undefined, fallback: string | number = 0) =>
  val ?? fallback

// ── Score header ───────────────────────────────────────────────────────────────

const TeamScoreCard = ({
  teamData,
  showScore,
}: {
  teamData: GameTeam
  showScore: boolean
}) => {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center gap-1.5 flex-1">
      <img
        src={getTeamLogoUrl(teamData.team.id)}
        alt={teamData.team.name}
        className="w-20 h-20 drop-shadow-md cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => navigate(`/team/${teamData.team.id}`)}
      />
      <span
        className="text-sm font-semibold text-zinc-300 text-center leading-tight cursor-pointer hover:text-blue-400 transition-colors"
        onClick={() => navigate(`/team/${teamData.team.id}`)}
      >
        {teamData.team.name}
      </span>
      {showScore && (
        <span className={cn('text-6xl font-bold tabular-nums mt-1', teamData.isWinner ? 'text-white' : 'text-zinc-500')}>
          {teamData.score ?? 0}
        </span>
      )}
    </div>
  )
}

const ScoreHeader = ({ game }: { game: Game }) => {
  const state = game.status.abstractGameState
  const showScore = state === 'Live' || state === 'Final'

  return (
    <div className="flex items-center justify-between gap-6">
      <TeamScoreCard teamData={game.teams.away} showScore={showScore} />

      <div className="text-center flex-shrink-0">
        {showScore ? (
          <span className={cn(
            'text-sm font-semibold px-3 py-1 rounded',
            state === 'Live' ? 'bg-green-500/20 text-green-400 animate-pulse' : 'bg-zinc-800 text-zinc-400'
          )}>
            {state === 'Live' ? game.status.detailedState : 'Final'}
          </span>
        ) : (
          <div>
            <p className="text-xl font-semibold text-zinc-200">
              {formatGameTime(game.gameDate)}
            </p>
            <p className="text-xs text-zinc-500 mt-1">Scheduled</p>
          </div>
        )}
        <p className="text-xs text-zinc-600 mt-2">{game.venue.name}</p>
      </div>

      <TeamScoreCard teamData={game.teams.home} showScore={showScore} />
    </div>
  )
}

// ── Team toggle (mobile) ───────────────────────────────────────────────────────

const TeamToggleButtons = ({
  game,
  teamView,
  onTeamChange,
}: {
  game: Game
  teamView: 'away' | 'home'
  onTeamChange: (side: 'away' | 'home') => void
}) => (
  <div className="flex gap-2 mb-4 lg:hidden">
    {(['away', 'home'] as const).map((side) => (
      <button
        key={side}
        onClick={() => onTeamChange(side)}
        className={cn(
          'flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium border transition-colors',
          teamView === side
            ? 'bg-zinc-700 border-zinc-600 text-white'
            : 'border-zinc-800 text-zinc-500 hover:text-zinc-300'
        )}
      >
        <img src={getTeamLogoUrl(game.teams[side].team.id)} alt="" className="w-4 h-4" />
        {getTeamAbbreviation(game.teams[side].team)}
      </button>
    ))}
  </div>
)

// ── Batting tab ────────────────────────────────────────────────────────────────

const BattingTeamTable = ({ teamData, boxscoreTeam }: { teamData: GameTeam; boxscoreTeam: BoxscoreTeam }) => {
  const batters = boxscoreTeam.battingOrder
    .map((id) => findPlayer(boxscoreTeam.players, id))
    .filter((p): p is BoxscorePlayer => p !== undefined)

  const battingNotes = boxscoreTeam.info?.find((s) => s.title === 'BATTING')
  const totals = boxscoreTeam.teamStats.batting

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <img src={getTeamLogoUrl(teamData.team.id)} alt="" className="w-6 h-6" />
        <span className="text-base font-semibold text-zinc-200">{teamData.team.name}</span>
      </div>

      <div className="overflow-x-auto rounded-md border border-zinc-800">
        <table className="text-xs min-w-max w-full">
          <thead>
            <tr className="bg-zinc-800/60 text-zinc-500">
              <th className="text-left py-2 px-3 font-medium">Player</th>
              <th className="py-2 px-2 font-medium">Pos</th>
              <th className="py-2 px-2 font-medium">AB</th>
              <th className="py-2 px-2 font-medium">R</th>
              <th className="py-2 px-2 font-medium">H</th>
              <th className="py-2 px-2 font-medium">RBI</th>
              <th className="py-2 px-2 font-medium">HR</th>
              <th className="py-2 px-2 font-medium">BB</th>
              <th className="py-2 px-2 font-medium">K</th>
              <th className="py-2 px-2 font-medium">AVG</th>
              <th className="py-2 px-2 font-medium">OBP</th>
              <th className="py-2 px-2 font-medium">SLG</th>
            </tr>
          </thead>
          <tbody>
            {batters.map((player) => {
              const b = player.stats.batting
              const sb = player.seasonStats?.batting
              return (
                <tr key={player.person.id} className="border-t border-zinc-800 hover:bg-zinc-800/30 transition-colors">
                  <td className="py-1.5 px-3 text-zinc-200 whitespace-nowrap">{player.person.boxscoreName ?? player.person.fullName}</td>
                  <td className="py-1.5 px-2 text-center text-zinc-500">{player.position.abbreviation}</td>
                  <td className="py-1.5 px-2 text-center tabular-nums text-zinc-300">{stat(b?.atBats, '-')}</td>
                  <td className="py-1.5 px-2 text-center tabular-nums text-zinc-400">{stat(b?.runs)}</td>
                  <td className={cn('py-1.5 px-2 text-center tabular-nums font-semibold', (b?.hits ?? 0) > 0 ? 'text-white' : 'text-zinc-500')}>
                    {stat(b?.hits)}
                  </td>
                  <td className="py-1.5 px-2 text-center tabular-nums text-zinc-300">{stat(b?.rbi)}</td>
                  <td className={cn('py-1.5 px-2 text-center tabular-nums', (b?.homeRuns ?? 0) > 0 ? 'text-yellow-400 font-semibold' : 'text-zinc-500')}>
                    {stat(b?.homeRuns)}
                  </td>
                  <td className="py-1.5 px-2 text-center tabular-nums text-zinc-400">{stat(b?.baseOnBalls)}</td>
                  <td className="py-1.5 px-2 text-center tabular-nums text-zinc-400">{stat(b?.strikeOuts)}</td>
                  <td className="py-1.5 px-2 text-center tabular-nums text-zinc-500">{sb?.avg ?? '—'}</td>
                  <td className="py-1.5 px-2 text-center tabular-nums text-zinc-500">{sb?.obp ?? '—'}</td>
                  <td className="py-1.5 px-2 text-center tabular-nums text-zinc-500">{sb?.slg ?? '—'}</td>
                </tr>
              )
            })}
            <tr className="border-t-2 border-zinc-700 bg-zinc-800/40">
              <td className="py-1.5 px-3 font-semibold text-zinc-300" colSpan={2}>Totals</td>
              <td className="py-1.5 px-2 text-center tabular-nums font-semibold text-zinc-300">{stat(totals.atBats, '-')}</td>
              <td className="py-1.5 px-2 text-center tabular-nums font-semibold text-zinc-300">{totals.runs}</td>
              <td className="py-1.5 px-2 text-center tabular-nums font-semibold text-zinc-300">{totals.hits}</td>
              <td className="py-1.5 px-2 text-center tabular-nums font-semibold text-zinc-300">{stat(totals.rbi, '-')}</td>
              <td className="py-1.5 px-2 text-center tabular-nums font-semibold text-zinc-300">{stat(totals.homeRuns, '-')}</td>
              <td className="py-1.5 px-2 text-center tabular-nums font-semibold text-zinc-300">{stat(totals.baseOnBalls, '-')}</td>
              <td className="py-1.5 px-2 text-center tabular-nums font-semibold text-zinc-300">{stat(totals.strikeOuts, '-')}</td>
              <td colSpan={3} />
            </tr>
          </tbody>
        </table>
      </div>

      {battingNotes && battingNotes.fieldList.length > 0 && (
        <div className="mt-2 space-y-0.5">
          {battingNotes.fieldList.map((field) => (
            <p key={field.label} className="text-xs text-zinc-500 leading-relaxed">
              <span className="text-zinc-400 font-medium">{field.label}: </span>
              {field.value}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Pitching tab ───────────────────────────────────────────────────────────────

const PitchingTeamTable = ({
  teamData,
  boxscoreTeam,
  decisions,
}: {
  teamData: GameTeam
  boxscoreTeam: BoxscoreTeam
  decisions: BoxscoreResponse['decisions']
}) => {
  const pitchers = boxscoreTeam.pitchers
    .map((id) => findPlayer(boxscoreTeam.players, id))
    .filter((p): p is BoxscorePlayer => p !== undefined)

  const pitchingNotes = boxscoreTeam.info?.find((s) => s.title === 'PITCHING')
  const winnerId = decisions?.winner?.id
  const loserId = decisions?.loser?.id

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <img src={getTeamLogoUrl(teamData.team.id)} alt="" className="w-6 h-6" />
        <span className="text-base font-semibold text-zinc-200">{teamData.team.name}</span>
      </div>

      <div className="overflow-x-auto rounded-md border border-zinc-800">
        <table className="text-xs min-w-max w-full">
          <thead>
            <tr className="bg-zinc-800/60 text-zinc-500">
              <th className="text-left py-2 px-3 font-medium">Pitcher</th>
              <th className="py-2 px-2 font-medium">IP</th>
              <th className="py-2 px-2 font-medium">H</th>
              <th className="py-2 px-2 font-medium">R</th>
              <th className="py-2 px-2 font-medium">ER</th>
              <th className="py-2 px-2 font-medium">BB</th>
              <th className="py-2 px-2 font-medium">K</th>
              <th className="py-2 px-2 font-medium">HR</th>
              <th className="py-2 px-2 font-medium">ERA</th>
            </tr>
          </thead>
          <tbody>
            {pitchers.map((player) => {
              const p = player.stats.pitching
              const sp = player.seasonStats?.pitching
              const isWinner = player.person.id === winnerId
              const isLoser = player.person.id === loserId

              return (
                <tr
                  key={player.person.id}
                  className={cn(
                    'border-t border-zinc-800 transition-colors',
                    isWinner ? 'bg-green-500/5' : isLoser ? 'bg-red-500/5' : 'hover:bg-zinc-800/30'
                  )}
                >
                  <td className="py-1.5 px-3 whitespace-nowrap">
                    <span className={cn('font-medium', isWinner ? 'text-green-400' : isLoser ? 'text-red-400' : 'text-zinc-200')}>
                      {player.person.boxscoreName ?? player.person.fullName}
                    </span>
                    {isWinner && <span className="ml-1.5 text-[10px] font-bold text-green-500 bg-green-500/10 px-1 rounded">W</span>}
                    {isLoser && <span className="ml-1.5 text-[10px] font-bold text-red-500 bg-red-500/10 px-1 rounded">L</span>}
                  </td>
                  <td className="py-1.5 px-2 text-center tabular-nums text-zinc-300 font-medium">{stat(p?.inningsPitched, '-')}</td>
                  <td className="py-1.5 px-2 text-center tabular-nums text-zinc-400">{stat(p?.hits)}</td>
                  <td className="py-1.5 px-2 text-center tabular-nums text-zinc-400">{stat(p?.runs)}</td>
                  <td className="py-1.5 px-2 text-center tabular-nums text-zinc-400">{stat(p?.earnedRuns)}</td>
                  <td className="py-1.5 px-2 text-center tabular-nums text-zinc-400">{stat(p?.baseOnBalls)}</td>
                  <td className="py-1.5 px-2 text-center tabular-nums text-zinc-300">{stat(p?.strikeOuts)}</td>
                  <td className={cn('py-1.5 px-2 text-center tabular-nums', (p?.homeRuns ?? 0) > 0 ? 'text-yellow-400 font-semibold' : 'text-zinc-500')}>
                    {stat(p?.homeRuns)}
                  </td>
                  <td className="py-1.5 px-2 text-center tabular-nums text-zinc-500">{sp?.era ?? '—'}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {pitchingNotes && pitchingNotes.fieldList.length > 0 && (
        <div className="mt-2 space-y-0.5">
          {pitchingNotes.fieldList.map((field) => (
            <p key={field.label} className="text-xs text-zinc-500 leading-relaxed">
              <span className="text-zinc-400 font-medium">{field.label}: </span>
              {field.value}
            </p>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Play by Play tab ───────────────────────────────────────────────────────────

const PlayByPlayTab = ({ game, gamePk, enabled }: { game: Game; gamePk: number; enabled: boolean }) => {
  const { data, loading, error } = usePlayByPlay(gamePk, enabled)

  if (loading || (!data && !error)) {
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3 text-zinc-500">
        <div className="w-5 h-5 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
        <span className="text-sm">Loading play by play…</span>
      </div>
    )
  }

  if (error) return <div className="text-center text-red-400 py-10">{error}</div>
  if (!data) return null

  const scoringPlays = data.allPlays.filter((p) => p.about.isScoringPlay)

  if (scoringPlays.length === 0) {
    return <p className="text-center text-zinc-500 py-10 text-sm">No scoring plays yet.</p>
  }

  const inningMap = new Map<number, typeof scoringPlays>()
  for (const play of scoringPlays) {
    const key = play.about.inning
    if (!inningMap.has(key)) inningMap.set(key, [])
    inningMap.get(key)!.push(play)
  }

  const { away, home } = game.teams

  return (
    <div className="space-y-5">
      {Array.from(inningMap.entries()).map(([inning, plays]) => (
        <div key={inning}>
          <div className="flex items-center gap-2 mb-2">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider whitespace-nowrap">
              Inning {inning}
            </span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>
          <div className="space-y-2">
            {plays.map((play, i) => {
              const scoringTeam = play.about.isTopInning ? away : home
              return (
                <div key={i} className="flex gap-3 items-start rounded-md bg-zinc-800/40 border border-zinc-800 p-3">
                  <img src={getTeamLogoUrl(scoringTeam.team.id)} alt="" className="w-5 h-5 mt-0.5 flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-medium text-zinc-500 mb-0.5 uppercase tracking-wide">
                      {play.about.isTopInning ? 'Top' : 'Bot'} {play.about.inning}
                      {play.result.rbi > 0 && (
                        <span className="ml-1.5 text-zinc-400">{play.result.rbi} RBI</span>
                      )}
                    </p>
                    <p className="text-xs text-zinc-200 leading-relaxed">{play.result.description}</p>
                  </div>
                  <span className="flex-shrink-0 text-xs tabular-nums font-bold text-zinc-200 whitespace-nowrap">
                    {play.result.awayScore}–{play.result.homeScore}
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}

// ── Page ───────────────────────────────────────────────────────────────────────

export const GamePage = () => {
  const { gamePk: gamePkStr } = useParams<{ gamePk: string }>()
  const gamePk = Number(gamePkStr)
  const location = useLocation()
  const navigate = useNavigate()

  const stateGame = (location.state as { game?: Game } | null)?.game
  const [fetchedGame, setFetchedGame] = useState<Game | null>(null)
  const [gameLoading, setGameLoading] = useState(!stateGame)
  const [activeTab, setActiveTab] = useState('batting')
  const [pbpEnabled, setPbpEnabled] = useState(false)
  const [teamView, setTeamView] = useState<'away' | 'home'>('away')

  useEffect(() => {
    if (stateGame) return
    mlbApi
      .getGameByPk(gamePk)
      .then((data) => setFetchedGame(data.dates[0]?.games[0] ?? null))
      .catch(console.error)
      .finally(() => setGameLoading(false))
  }, [gamePk, stateGame])

  const game = stateGame ?? fetchedGame
  const isLiveGame = game?.status.abstractGameState === 'Live'
  const hasStarted = game?.status.abstractGameState !== 'Preview'

  const { boxscore, linescore, loading: boxscoreLoading, error: boxscoreError } = useBoxscore(gamePk)
  const decisions = boxscore?.decisions ?? linescore?.decisions

  const [liveEnabled, setLiveEnabled] = useState(false)
  const { linescore: liveLinescore, plays, loading: liveLoading } = useLiveGame(gamePk, liveEnabled, isLiveGame ?? false)

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (tab === 'playbyplay') setPbpEnabled(true)
    if (tab === 'live') setLiveEnabled(true)
  }

  // Default to live tab when game is in progress
  useEffect(() => {
    if (isLiveGame) {
      setActiveTab('live')
      setLiveEnabled(true)
    }
  }, [isLiveGame])

  return (
    <div className="min-h-screen bg-zinc-950 text-foreground">
      {/* Header */}
      <header className="border-b border-zinc-800 bg-zinc-900 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            className="text-zinc-400 hover:text-white gap-1.5 px-2"
            onClick={() => navigate(-1)}
          >
            ← Back
          </Button>
          <h1 className="text-sm font-semibold text-zinc-400">
            {game
              ? `${game.teams.away.team.name} vs ${game.teams.home.team.name}`
              : 'Game Detail'}
          </h1>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-8">
        {/* Score header */}
        {gameLoading && (
          <div className="flex justify-center py-12">
            <div className="w-6 h-6 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
          </div>
        )}

        {!gameLoading && !game && (
          <p className="text-center text-zinc-500 py-12">Game not found.</p>
        )}

        {game && (
          <>
            <div className="mb-8">
              <ScoreHeader game={game} />
            </div>

            {boxscoreLoading && (
              <div className="flex flex-col items-center py-12 gap-3 text-zinc-500">
                <div className="w-5 h-5 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
                <span className="text-sm">Loading boxscore…</span>
              </div>
            )}

            {boxscoreError && (
              <p className="text-center text-red-400 py-10">{boxscoreError}</p>
            )}

            {!boxscoreLoading && !boxscoreError && boxscore && (
              <Tabs value={activeTab} onValueChange={handleTabChange}>
                <div className="flex justify-center mb-6">
                  <TabsList>
                    {hasStarted && <TabsTrigger value="live">Live</TabsTrigger>}
                    <TabsTrigger value="batting">Batting</TabsTrigger>
                    <TabsTrigger value="pitching">Pitching</TabsTrigger>
                    <TabsTrigger value="playbyplay">Play by Play</TabsTrigger>
                  </TabsList>
                </div>

                {hasStarted && (
                  <TabsContent value="live">
                    {liveLoading && !liveLinescore ? (
                      <div className="flex flex-col items-center py-16 gap-3 text-zinc-500">
                        <div className="w-5 h-5 border-2 border-zinc-600 border-t-zinc-300 rounded-full animate-spin" />
                        <span className="text-sm">Loading live data…</span>
                      </div>
                    ) : (
                      <div className="grid lg:grid-cols-2 gap-8">
                        <div className="flex justify-center">
                          <BaseballDiamond
                            linescore={liveLinescore ?? linescore}
                            lastPlayDescription={plays[plays.length - 1]?.result.description}
                          />
                        </div>
                        <div>
                          <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mb-3">
                            Play Feed
                          </p>
                          <LiveFeed plays={plays} game={game} />
                        </div>
                      </div>
                    )}
                  </TabsContent>
                )}

                <TabsContent value="batting">
                  <TeamToggleButtons game={game} teamView={teamView} onTeamChange={setTeamView} />
                  <div className="lg:hidden">
                    <BattingTeamTable
                      teamData={game.teams[teamView]}
                      boxscoreTeam={boxscore.teams[teamView]}
                    />
                  </div>
                  <div className="hidden lg:grid grid-cols-2 gap-6">
                    <BattingTeamTable teamData={game.teams.away} boxscoreTeam={boxscore.teams.away} />
                    <BattingTeamTable teamData={game.teams.home} boxscoreTeam={boxscore.teams.home} />
                  </div>
                </TabsContent>

                <TabsContent value="pitching">
                  <TeamToggleButtons game={game} teamView={teamView} onTeamChange={setTeamView} />
                  <div className="lg:hidden">
                    <PitchingTeamTable
                      teamData={game.teams[teamView]}
                      boxscoreTeam={boxscore.teams[teamView]}
                      decisions={decisions}
                    />
                  </div>
                  <div className="hidden lg:grid grid-cols-2 gap-6">
                    <PitchingTeamTable teamData={game.teams.away} boxscoreTeam={boxscore.teams.away} decisions={decisions} />
                    <PitchingTeamTable teamData={game.teams.home} boxscoreTeam={boxscore.teams.home} decisions={decisions} />
                  </div>
                </TabsContent>

                <TabsContent value="playbyplay">
                  <PlayByPlayTab game={game} gamePk={gamePk} enabled={pbpEnabled} />
                </TabsContent>
              </Tabs>
            )}
          </>
        )}
      </main>
    </div>
  )
}
