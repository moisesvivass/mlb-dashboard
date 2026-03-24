import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getTeamLogoUrl(teamId: number): string {
  return `https://www.mlbstatic.com/team-logos/${teamId}.svg`
}

const AL_IDS = new Set([108, 117, 133, 136, 140, 141, 110, 111, 147, 139, 114, 116, 118, 142, 145])
const NL_IDS = new Set([109, 115, 119, 135, 137, 112, 113, 158, 134, 138, 144, 146, 121, 143, 120])

export function getTeamLeague(teamId: number): 'AL' | 'NL' | null {
  if (AL_IDS.has(teamId)) return 'AL'
  if (NL_IDS.has(teamId)) return 'NL'
  return null
}

export function formatGameTime(dateStr: string): string {
  return new Date(dateStr).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}

export function formatGameDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
  })
}

export function getTeamAbbreviation(team: { abbreviation?: string; name: string }): string {
  return team.abbreviation ?? team.name.split(' ').pop() ?? ''
}

export function formatInningDisplay(inningState?: string, ordinal?: string): string {
  if (!ordinal) return '—'
  const isTop = inningState === 'Top' || inningState === 'Middle'
  return `${isTop ? '↑' : '↓'} ${ordinal}`
}
