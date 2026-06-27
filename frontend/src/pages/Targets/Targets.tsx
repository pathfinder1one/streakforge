import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Sparkles, Loader2 } from 'lucide-react'
import { useTargetStore } from '@/store/targetStore'
import TargetList from '@/components/targets/TargetList'
import Button from '@/components/common/Button'
import Loader from '@/components/common/Loader'
import EmptyState from '@/components/common/EmptyState'
import { aiService } from '@/services/ai.service'
import AICopilot from '@/components/ai/AICopilot'

export default function Targets() {
  const navigate = useNavigate()
  const { targets, isLoading, error, fetchTargets, removeTarget } = useTargetStore()
  const [isSorting, setIsSorting] = useState(false)
  const [sortedTargets, setSortedTargets] = useState(targets)

  useEffect(() => {
    fetchTargets()
  }, [fetchTargets])

  useEffect(() => {
    setSortedTargets(targets)
  }, [targets])

  async function handleAISort() {
    if (targets.length === 0) return
    setIsSorting(true)
    try {
      const res = await aiService.prioritize(targets.map((t) => t.id))
      const ordered = res.ordered_ids
        .map((id: number) => targets.find((t) => t.id === id))
        .filter(Boolean)
      // Add any not returned
      const returnedIds = new Set(res.ordered_ids)
      targets.forEach((t) => { if (!returnedIds.has(t.id)) ordered.push(t) })
      setSortedTargets(ordered as typeof targets)
    } catch {
      // fallback: keep original order
    } finally {
      setIsSorting(false)
    }
  }

  async function handleDelete(id: number) {
    if (confirm('Delete this target? This cannot be undone.')) {
      await removeTarget(id)
    }
  }

  return (
    <div className="px-8 py-8 max-w-3xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="font-display font-semibold text-2xl text-ash-100">Targets</h1>
          <p className="text-ash-400 text-sm mt-1">Manage what you're tracking.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={handleAISort}
            disabled={isSorting || targets.length === 0}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border border-ember-800/50 text-ember-400 hover:bg-ember-950/30 disabled:opacity-40 transition-all"
            id="ai-sort-btn"
          >
            {isSorting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            {isSorting ? 'Sorting...' : 'AI Sort'}
          </button>
          <Button onClick={() => navigate('/targets/new')}>
            <Plus className="w-4 h-4 inline-block mr-1.5" />
            New Target
          </Button>
        </div>
      </div>

      {isSorting && (
        <div className="mb-4 px-3 py-2 rounded-lg bg-ember-950/30 border border-ember-900/50 text-ember-400 text-xs flex items-center gap-2">
          <Sparkles className="w-3 h-3" />
          AI is analyzing your tasks and optimizing the order...
        </div>
      )}

      {isLoading && <Loader label="Loading targets..." />}

      {error && (
        <div className="p-4 rounded-xl bg-red-950/30 border border-red-900/50 text-red-300 text-sm mb-4">
          {error}
        </div>
      )}

      {!isLoading && sortedTargets.length > 0 && (
        <TargetList
          targets={sortedTargets}
          onDelete={handleDelete}
          onReorder={(newOrder) => {
            setSortedTargets(newOrder)
            useTargetStore.getState().reorderTargets(newOrder.map(t => t.id))
          }}
        />
      )}

      {!isLoading && sortedTargets.length === 0 && (
        <div className="mt-12">
          <EmptyState
            icon="🎯"
            title="No targets forged yet"
            description="Start building your streak by forging your first daily target. What do you want to accomplish today?"
            action={{
              label: 'Forge First Target',
              onClick: () => navigate('/targets/new')
            }}
          />
        </div>
      )}

      {/* Floating AI Copilot */}
      <AICopilot />
    </div>
  )
}
