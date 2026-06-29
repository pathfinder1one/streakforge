import { useState, useEffect, FormEvent } from 'react'
import { Plus, X, GripVertical, TrendingUp, BanIcon, Flame, Info } from 'lucide-react'
import type { Category, Priority, Frequency, TargetType, TargetCreatePayload, Target, Subtask } from '@/types/target'
import Button from '@/components/common/Button'
import api from '@/services/api'

interface TargetFormProps {
  initial?: Target
  onSubmit: (payload: TargetCreatePayload) => Promise<void>
  onCancel: () => void
  submitLabel?: string
}

const categories: Category[] = ['Study', 'Coding', 'Reading', 'Health', 'Personal']
const priorities: Priority[] = ['High', 'Medium', 'Low']
const frequencies: Frequency[] = ['Daily', 'Weekly', 'One Time']

export default function TargetForm({ initial, onSubmit, onCancel, submitLabel = 'Create Target' }: TargetFormProps) {
  const [title, setTitle] = useState(initial?.title ?? '')
  const [link, setLink] = useState(initial?.link ?? '')
  const [category, setCategory] = useState<Category>(initial?.category ?? 'Personal')
  const [priority, setPriority] = useState<Priority>(initial?.priority ?? 'Medium')
  const [minimumTime, setMinimumTime] = useState(initial?.minimum_time ?? 15)
  const [frequency, setFrequency] = useState<Frequency>(initial?.frequency ?? 'Daily')
  const [scheduledDate, setScheduledDate] = useState(initial?.scheduled_date ? new Date(initial.scheduled_date).toISOString().split('T')[0] : '')
  const [alertTime, setAlertTime] = useState(initial?.alert_time ?? '')
  const [targetType, setTargetType] = useState<TargetType>(initial?.target_type ?? 'positive')
  const [metricUnit, setMetricUnit] = useState(initial?.metric_unit ?? '')
  const [metricGoal, setMetricGoal] = useState<string>(initial?.metric_goal?.toString() ?? '')
  const [useMetric, setUseMetric] = useState(!!(initial?.metric_unit))
  const [pledgeAmount, setPledgeAmount] = useState<number | ''>('')
  
  // AI Suggestion State
  const [aiSuggestion, setAiSuggestion] = useState<string | null>(null)
  const [isAiLoading, setIsAiLoading] = useState(false)

  // Subtasks State
  const [subtasks, setSubtasks] = useState<Partial<Subtask>[]>(
    initial?.subtasks?.map(st => ({ id: st.id, title: st.title, is_completed: st.is_completed })) ?? []
  )
  
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Fetch real AI suggestion with debounce
  useEffect(() => {
    if (title.length < 5 || targetType !== 'positive') {
      setAiSuggestion(null)
      return
    }

    const timer = setTimeout(async () => {
      setIsAiLoading(true)
      try {
        const { data } = await api.post('/ai/suggest-difficulty', { title })
        setAiSuggestion(data.suggestion)
      } catch (err) {
        setAiSuggestion(null)
      } finally {
        setIsAiLoading(false)
      }
    }, 800)

    return () => clearTimeout(timer)
  }, [title, targetType])

  function addSubtask() {
    setSubtasks([...subtasks, { title: '', is_completed: false }])
  }

  function updateSubtaskTitle(index: number, newTitle: string) {
    const updated = [...subtasks]
    updated[index].title = newTitle
    setSubtasks(updated)
  }

  function removeSubtask(index: number) {
    setSubtasks(subtasks.filter((_, i) => i !== index))
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)
    
    const validSubtasks = subtasks.filter(st => st.title && st.title.trim() !== '')

    try {
      await onSubmit({
        title,
        link: link || null,
        category,
        priority,
        minimum_time: useMetric ? 0 : minimumTime,
        frequency,
        scheduled_date: scheduledDate ? new Date(scheduledDate).toISOString() : null,
        alert_time: alertTime || null,
        subtasks: validSubtasks.length > 0 ? validSubtasks : undefined,
        target_type: targetType,
        metric_unit: useMetric && metricUnit ? metricUnit : null,
        metric_goal: useMetric && metricGoal ? parseFloat(metricGoal) : null,
        pledge_amount: pledgeAmount ? Number(pledgeAmount) : undefined,
      })
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Something went wrong')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="p-3 rounded-lg bg-red-950/30 border border-red-900/50 text-red-300 text-sm">{error}</div>
      )}

      {/* Target Type Toggle */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-ash-500 mb-3">Habit Type</label>
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={() => setTargetType('positive')}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
              targetType === 'positive'
                ? 'border-ember-500 bg-ember-500/10 text-ember-300'
                : 'border-base-700 bg-base-900 text-ash-400 hover:border-base-600'
            }`}
          >
            <Flame className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Build Habit</p>
              <p className="text-xs opacity-70 mt-0.5">Do something daily</p>
            </div>
          </button>
          <button
            type="button"
            onClick={() => setTargetType('negative')}
            className={`flex items-center gap-3 p-4 rounded-xl border-2 transition-all text-left ${
              targetType === 'negative'
                ? 'border-red-500 bg-red-500/10 text-red-300'
                : 'border-base-700 bg-base-900 text-ash-400 hover:border-base-600'
            }`}
          >
            <BanIcon className="w-5 h-5 shrink-0" />
            <div>
              <p className="font-semibold text-sm">Break Habit</p>
              <p className="text-xs opacity-70 mt-0.5">Avoid something daily</p>
            </div>
          </button>
        </div>
        {targetType === 'negative' && (
          <p className="text-xs text-ash-600 mt-2 px-1">
            Negative targets succeed automatically at midnight unless you click "I Slipped Today" during the day.
          </p>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-ash-500 mb-2">Title *</label>
        <input
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder={targetType === 'negative' ? 'e.g. No Sugar Today' : 'e.g. Master React Hooks'}
          className="w-full px-4 py-3 rounded-xl border text-ash-100 placeholder-ash-600 focus:border-ember-500/50 focus:shadow-[0_0_15px_rgba(234,63,12,0.1)] outline-none transition-all font-medium bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 duration-300 shadow-sm"
        />
        {/* Feature #54: Smart difficulty AI suggestion */}
        {title.length > 5 && targetType === 'positive' && aiSuggestion && (
          <div className="mt-2 text-[11px] text-amber-500 flex items-center gap-1.5 bg-amber-500/10 p-2 rounded-lg border border-amber-500/20">
            {isAiLoading ? (
              <span className="animate-pulse">AI is analyzing...</span>
            ) : (
              <>
                <TrendingUp className="w-3.5 h-3.5 shrink-0" />
                <span>{aiSuggestion}</span>
              </>
            )}
          </div>
        )}
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-ash-500 mb-2">Resource Link (optional)</label>
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://..."
          className="w-full px-4 py-3 rounded-xl border text-ash-100 placeholder-ash-600 focus:border-ember-500/50 outline-none transition-all text-sm bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 duration-300 shadow-sm"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-ash-500 mb-2">Category</label>
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value as Category)}
            className="w-full px-4 py-3 rounded-xl border text-ash-100 focus:border-ember-500/50 outline-none transition-all text-sm cursor-pointer appearance-none bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 duration-300 shadow-sm"
          >
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-ash-500 mb-2">Priority</label>
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            className="w-full px-4 py-3 rounded-xl border text-ash-100 focus:border-ember-500/50 outline-none transition-all text-sm cursor-pointer appearance-none bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 duration-300 shadow-sm"
          >
            {priorities.map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tracking Mode: Time vs Metric */}
      {targetType === 'positive' && (
        <div className="border rounded-2xl p-5 space-y-4 bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 transition-all duration-300 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-ash-300">Tracking Mode</label>
              <p className="text-[10px] text-ash-500 mt-1">How do you measure completion?</p>
            </div>
            <div className="flex bg-base-900 rounded-lg p-1 gap-1 border border-base-800">
              <button
                type="button"
                onClick={() => setUseMetric(false)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  !useMetric ? 'bg-ember-500 text-white' : 'text-ash-400 hover:text-ash-200'
                }`}
              >
                ⏱ Time
              </button>
              <button
                type="button"
                onClick={() => setUseMetric(true)}
                className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-all ${
                  useMetric ? 'bg-blue-500 text-white' : 'text-ash-400 hover:text-ash-200'
                }`}
              >
                📊 Metric
              </button>
            </div>
          </div>

          {!useMetric ? (
            <div>
              <label className="block text-xs font-bold uppercase tracking-widest text-ash-500 mb-2">Minimum Time (mins)</label>
              <input
                type="number"
                min={0}
                value={minimumTime}
                onChange={(e) => setMinimumTime(parseInt(e.target.value || '0', 10))}
                className="w-full px-4 py-3 rounded-xl border text-ash-100 focus:border-ember-500/50 outline-none transition-all text-sm bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 duration-300 shadow-sm"
              />
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-ash-500 mb-2">Goal Amount</label>
                <input
                  type="number"
                  min={0}
                  step="0.1"
                  value={metricGoal}
                  onChange={(e) => setMetricGoal(e.target.value)}
                  placeholder="e.g. 2"
                  className="w-full px-4 py-3 rounded-xl border text-ash-100 focus:border-blue-500/50 outline-none transition-all text-sm bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 duration-300 shadow-sm"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-ash-500 mb-2">Unit</label>
                <input
                  type="text"
                  value={metricUnit}
                  onChange={(e) => setMetricUnit(e.target.value)}
                  placeholder="e.g. liters, pages, km"
                  className="w-full px-4 py-3 rounded-xl border text-ash-100 focus:border-blue-500/50 outline-none transition-all text-sm bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 duration-300 shadow-sm"
                />
              </div>
            </div>
          )}
        </div>
      )}

      {/* Subtasks Section */}
      <div className="border rounded-2xl p-5 bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 transition-all duration-300 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-ash-300">Subtasks / Micro-Habits</label>
            <p className="text-[10px] text-ash-500 mt-1">Break this target down into smaller actionable steps.</p>
          </div>
          <button 
            type="button" 
            onClick={addSubtask}
            className="flex items-center gap-1.5 text-xs font-bold text-ember-400 hover:text-white bg-ember-500/10 hover:bg-ember-500/20 px-3 py-1.5 rounded-lg transition-colors border border-ember-500/20"
          >
            <Plus className="w-3 h-3" />
            Add Step
          </button>
        </div>

        <div className="space-y-2.5">
          {subtasks.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-base-700 rounded-xl">
              <p className="text-xs text-ash-500">No subtasks added yet.</p>
            </div>
          ) : (
            subtasks.map((st, index) => (
              <div key={index} className="flex items-center gap-2">
                <div className="text-ash-600 shrink-0 cursor-move">
                  <GripVertical className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  value={st.title}
                  onChange={(e) => updateSubtaskTitle(index, e.target.value)}
                  placeholder="e.g. Read Chapter 1"
                  className="flex-1 bg-base-900 border border-base-700 rounded-lg px-3 py-2 text-sm text-ash-100 focus:border-ember-500/50 outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => removeSubtask(index)}
                  className="p-2 text-ash-500 hover:text-red-400 hover:bg-red-950/30 rounded-lg transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-ash-500 mb-2">Frequency</label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as Frequency)}
            className="w-full px-4 py-3 rounded-xl border text-ash-100 focus:border-ember-500/50 outline-none transition-all text-sm cursor-pointer appearance-none bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 duration-300 shadow-sm"
          >
            {frequencies.map((f) => (
              <option key={f} value={f}>{f}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-ash-500 mb-2">Alert Time (optional)</label>
          <input
            type="time"
            value={alertTime}
            onChange={(e) => setAlertTime(e.target.value)}
            className="w-full px-4 py-3 rounded-xl border text-ash-100 placeholder-ash-600 focus:border-ember-500/50 outline-none transition-all text-sm bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 duration-300 shadow-sm"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-bold uppercase tracking-widest text-ash-500 mb-2">Scheduled Date (optional)</label>
        <input
          type="date"
          value={scheduledDate}
          onChange={(e) => setScheduledDate(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border text-ash-100 placeholder-ash-600 focus:border-ember-500/50 outline-none transition-all text-sm bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 duration-300 shadow-sm"
        />
      </div>

      <div className="border border-red-900/30 bg-red-950/10 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-red-500/20 rounded-lg text-red-500">
            <Flame className="w-5 h-5" />
          </div>
          <div>
            <label className="flex items-center gap-1.5 text-sm font-bold text-red-500">
              Accountability Court
              <span title="If you stake coins and fail to complete the target, you'll be called to Court. If the Judge doesn't forgive you, you lose the coins! (If you don't stake any, you only lose your streak)." className="cursor-help">
                <Info className="w-4 h-4 opacity-70 hover:opacity-100 transition-opacity" />
              </span>
            </label>
            <p className="text-[10px] text-ash-500 mt-0.5">Stake your coins. If you fail to complete this target, you will be taken to Court.</p>
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold uppercase tracking-widest text-ash-500 mb-2">Stake Coins (optional)</label>
          <input
            type="number"
            min={1}
            value={pledgeAmount}
            onChange={(e) => setPledgeAmount(e.target.value === '' ? '' : parseInt(e.target.value, 10))}
            placeholder="e.g. 50"
            className="w-full px-4 py-3 rounded-xl border text-ash-100 focus:border-red-500/50 outline-none transition-all text-sm bg-gradient-to-br from-base-950 to-base-900 border-red-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:border-red-500/50 duration-300 shadow-sm"
          />
        </div>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-base-800">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Saving...' : submitLabel}
        </Button>
        <Button type="button" variant="ghost" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
