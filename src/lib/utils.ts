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
