import { useRef, useState, useEffect } from 'react'
import type { LinescoreResponse } from '../types/mlb'
import { formatInningDisplay } from '@/lib/utils'

interface BaseballDiamondProps {
  linescore: LinescoreResponse | null
  lastPlayDescription?: string
}

const getLastName = (fullName: string): string => {
  const n = fullName.split(' ').pop() ?? fullName
  return n.length > 9 ? n.slice(0, 8) + '…' : n
}

// ── SVG coordinates (viewBox 0 0 360 380) ────────────────────────────────────
// Home: (180, 305)  First: (290, 180)  Second: (180, 55)  Third: (70, 180)
// Mound: (180, 195)

const Base = ({
  cx,
  cy,
  occupied,
  runnerName,
}: {
  cx: number
  cy: number
  occupied: boolean
  runnerName?: string
}) => (
  <g>
    {occupied && (
      <rect
        x={cx - 17}
        y={cy - 17}
        width="34"
        height="34"
        transform={`rotate(45, ${cx}, ${cy})`}
        fill="rgba(250,204,21,0.18)"
        rx="4"
      />
    )}
    <rect
      x={cx - 11}
      y={cy - 11}
      width="22"
      height="22"
      transform={`rotate(45, ${cx}, ${cy})`}
      fill={occupied ? '#facc15' : '#1a1208'}
      stroke={occupied ? '#fbbf24' : '#3d2e10'}
      strokeWidth="1.5"
      rx="2"
    />
    {occupied && runnerName && (
      <text
        x={cx}
        y={cy + 32}
        textAnchor="middle"
        fontSize="10"
        fontWeight="700"
        fill="#fbbf24"
      >
        {runnerName}
      </text>
    )}
  </g>
)

const CountDot = ({ filled, color }: { filled: boolean; color: string }) => (
  <div
    className="w-3.5 h-3.5 rounded-full border-2 transition-all duration-300"
    style={{
      backgroundColor: filled ? color : 'transparent',
      borderColor: filled ? color : '#52525b',
      boxShadow: filled ? `0 0 7px ${color}` : 'none',
    }}
  />
)

export const BaseballDiamond = ({ linescore, lastPlayDescription }: BaseballDiamondProps) => {
  const outs = linescore?.outs ?? 0
  const balls = linescore?.balls ?? 0
  const strikes = linescore?.strikes ?? 0
  const onFirst = !!linescore?.offense?.onFirst
  const onSecond = !!linescore?.offense?.onSecond
  const onThird = !!linescore?.offense?.onThird
  const firstRunner = linescore?.offense?.onFirst
    ? getLastName(linescore.offense.onFirst.fullName)
    : undefined
  const secondRunner = linescore?.offense?.onSecond
    ? getLastName(linescore.offense.onSecond.fullName)
    : undefined
  const thirdRunner = linescore?.offense?.onThird
    ? getLastName(linescore.offense.onThird.fullName)
    : undefined
  const batter = linescore?.offense?.batter?.fullName
  const pitcher = linescore?.defense?.pitcher?.fullName
  const inningLabel = formatInningDisplay(linescore?.inningState, linescore?.currentInningOrdinal)

  // Ball-in-play animation on new play
  const prevDescRef = useRef(lastPlayDescription)
  const [ballKey, setBallKey] = useState(0)
  const [showBall, setShowBall] = useState(false)

  useEffect(() => {
    if (lastPlayDescription && lastPlayDescription !== prevDescRef.current) {
      prevDescRef.current = lastPlayDescription
      setShowBall(true)
      setBallKey((k) => k + 1)
      const t = setTimeout(() => setShowBall(false), 700)
      return () => clearTimeout(t)
    }
  }, [lastPlayDescription])

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="w-full max-w-[380px]">
        <svg viewBox="0 0 360 380" className="w-full">
          <defs>
            <filter id="ball-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            <radialGradient id="field-grad" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#0d2010" />
              <stop offset="100%" stopColor="#081508" />
            </radialGradient>
          </defs>

          <circle cx="180" cy="178" r="168" fill="url(#field-grad)" />
          <circle cx="180" cy="178" r="168" fill="none" stroke="#0f2a0f" strokeWidth="2" />

          <polygon
            points="180,305 290,180 180,55 70,180"
            fill="#1a1008"
            stroke="#2a1808"
            strokeWidth="1"
          />

          <line x1="180" y1="305" x2="290" y2="180" stroke="#3d2a10" strokeWidth="1.5" strokeDasharray="5,4" />
          <line x1="290" y1="180" x2="180" y2="55" stroke="#3d2a10" strokeWidth="1.5" strokeDasharray="5,4" />
          <line x1="180" y1="55" x2="70" y2="180" stroke="#3d2a10" strokeWidth="1.5" strokeDasharray="5,4" />
          <line x1="70" y1="180" x2="180" y2="305" stroke="#3d2a10" strokeWidth="1.5" strokeDasharray="5,4" />

          <circle cx="180" cy="195" r="11" fill="#1a1008" stroke="#3d2a10" strokeWidth="1.5" />
          <circle cx="180" cy="195" r="4.5" fill="#3d2a10" />

          <circle cx="180" cy="172" r="5.5" fill="none" stroke="#6b7280" strokeWidth="1.5" />
          <line x1="180" y1="177" x2="180" y2="188" stroke="#6b7280" strokeWidth="1.5" />
          <line x1="171" y1="182" x2="189" y2="182" stroke="#6b7280" strokeWidth="1.5" />

          <Base cx={180} cy={55} occupied={onSecond} runnerName={secondRunner} />
          <Base cx={290} cy={180} occupied={onFirst} runnerName={firstRunner} />
          <Base cx={70} cy={180} occupied={onThird} runnerName={thirdRunner} />

          <polygon
            points="180,310 191,318 188,330 172,330 169,318"
            fill="#374151"
            stroke="#9ca3af"
            strokeWidth="1"
          />

          <circle cx="180" cy="342" r="6" fill="none" stroke="#6b7280" strokeWidth="1.5" />
          <line x1="180" y1="348" x2="180" y2="360" stroke="#6b7280" strokeWidth="1.5" />
          <line x1="178" y1="351" x2="196" y2="340" stroke="#9ca3af" strokeWidth="2.5" strokeLinecap="round" />

          {showBall && (
            <g key={ballKey}>
              <circle r="5" fill="white" filter="url(#ball-glow)">
                <animateMotion
                  path="M 180,195 L 180,305"
                  dur="0.55s"
                  repeatCount="1"
                  fill="freeze"
                />
              </circle>
            </g>
          )}
        </svg>
      </div>

      <div className="flex gap-7">
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Balls</span>
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <CountDot key={i} filled={i < balls} color="#4ade80" />
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Strikes</span>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <CountDot key={i} filled={i < strikes} color="#facc15" />
            ))}
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Outs</span>
          <div className="flex gap-1.5">
            {[0, 1, 2].map((i) => (
              <CountDot key={i} filled={i < outs} color="#f87171" />
            ))}
          </div>
        </div>
      </div>

      {/* Info panel */}
      <div className="w-full space-y-2">
        {/* Inning + outs summary */}
        <p className="text-center text-sm font-bold text-zinc-200">
          {inningLabel}
          {linescore && (
            <span className="text-zinc-500 font-normal text-xs ml-2">
              · {outs} {outs === 1 ? 'Out' : 'Outs'}
            </span>
          )}
        </p>

        {/* Matchup */}
        {(pitcher || batter) && (
          <div className="rounded-lg bg-zinc-900 border border-zinc-800 px-4 py-2.5">
            <p className="text-[10px] font-bold text-zinc-600 uppercase tracking-widest mb-1.5">
              Matchup
            </p>
            <div className="flex items-center justify-center gap-4 text-sm">
              <div className="text-center min-w-0">
                <p className="text-[10px] text-zinc-600 mb-0.5">P</p>
                <p className="font-semibold text-blue-400 truncate">{pitcher ?? '—'}</p>
              </div>
              <span className="text-zinc-700 text-xs flex-shrink-0">vs</span>
              <div className="text-center min-w-0">
                <p className="text-[10px] text-zinc-600 mb-0.5">AB</p>
                <p className="font-semibold text-orange-400 truncate">{batter ?? '—'}</p>
              </div>
            </div>
          </div>
        )}

        {/* Last play */}
        {lastPlayDescription && (
          <div className="rounded-lg bg-yellow-500/5 border border-yellow-500/20 px-4 py-2.5">
            <p className="text-[10px] font-bold text-yellow-600/80 uppercase tracking-widest mb-1">
              Last Play
            </p>
            <p className="text-xs text-zinc-300 leading-relaxed">{lastPlayDescription}</p>
          </div>
        )}
      </div>
    </div>
  )
}
