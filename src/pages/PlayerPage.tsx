import { useParams, useNavigate } from 'react-router-dom'
import { Button } from '@/components/ui/button'

export const PlayerPage = () => {
  const { playerId } = useParams<{ playerId: string }>()
  const navigate = useNavigate()

  return (
    <div className="min-h-screen bg-zinc-950 text-foreground">
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
          <h1 className="text-sm font-semibold text-zinc-400">Player #{playerId}</h1>
        </div>
      </header>
      <main className="max-w-5xl mx-auto px-6 py-20 text-center">
        <p className="text-4xl mb-4">⚾</p>
        <p className="text-zinc-400 font-semibold mb-1">Player page coming soon</p>
        <p className="text-zinc-600 text-sm">Player #{playerId}</p>
      </main>
    </div>
  )
}
