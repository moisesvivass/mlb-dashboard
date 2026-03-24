import { useEffect, useRef } from 'react'
import { getTeamLogoUrl } from '@/lib/utils'
import type { Play, Game } from '../types/mlb'

interface LiveFeedProps {
  plays: Play[]
  game: Game
}

export const LiveFeed = ({ plays, game }: LiveFeedProps) => {
  const feedRef = useRef<HTMLDivElement>(null)
  const { away, home } = game.teams

  // Auto-scroll to bottom when plays update
  useEffect(() => {
    if (feedRef.current) {
      feedRef.current.scrollTop = feedRef.current.scrollHeight
    }
  }, [plays])

  const completedPlays = plays.filter((p) => p.about.isComplete)

  if (completedPlays.length === 0) {
    return (
      <div className="flex items-center justify-center h-40 text-zinc-500 text-sm">
        No plays yet.
      </div>
    )
  }

  // Group plays by inning number
  const inningMap = new Map<number, Play[]>()
  for (const play of completedPlays) {
    const key = play.about.inning
    if (!inningMap.has(key)) inningMap.set(key, [])
    inningMap.get(key)!.push(play)
  }

  return (
    <div
      ref={feedRef}
      className="h-96 overflow-y-auto space-y-4 pr-1 scrollbar-thin"
    >
      {Array.from(inningMap.entries()).map(([inning, inningPlays]) => (
        <div key={inning}>
          {/* Inning divider */}
          <div className="flex items-center gap-2 mb-2 sticky top-0 bg-zinc-950 py-1 z-10">
            <div className="h-px flex-1 bg-zinc-800" />
            <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest whitespace-nowrap">
              Inning {inning}
            </span>
            <div className="h-px flex-1 bg-zinc-800" />
          </div>

          <div className="space-y-1.5">
            {inningPlays.map((play, i) => {
              const isScoring = play.about.isScoringPlay
              const scoringTeam = play.about.isTopInning ? away : home

              return (
                <div
                  key={i}
                  className={`flex gap-2.5 items-start rounded-md px-2.5 py-2 border transition-colors ${
                    isScoring
                      ? 'bg-yellow-500/5 border-yellow-500/20'
                      : 'bg-zinc-900/40 border-zinc-800/60'
                  }`}
                >
                  {isScoring && (
                    <img
                      src={getTeamLogoUrl(scoringTeam.team.id)}
                      alt=""
                      className="w-4 h-4 mt-0.5 flex-shrink-0"
                    />
                  )}
                  {!isScoring && (
                    <div className="w-4 flex-shrink-0 flex items-start justify-center mt-1">
                      <div className="w-1 h-1 rounded-full bg-zinc-700 mt-0.5" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-[10px] font-semibold text-zinc-600 uppercase tracking-wide mb-0.5">
                      {play.about.isTopInning ? 'Top' : 'Bot'} {play.about.inning}
                      {play.result.rbi > 0 && (
                        <span className="ml-1.5 text-yellow-600">{play.result.rbi} RBI</span>
                      )}
                    </p>
                    <p className="text-xs text-zinc-300 leading-relaxed">{play.result.description}</p>
                  </div>

                  {isScoring && (
                    <span className="flex-shrink-0 text-xs tabular-nums font-bold text-zinc-200 whitespace-nowrap">
                      {play.result.awayScore}–{play.result.homeScore}
                    </span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      ))}
    </div>
  )
}
