import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Users, Plus, Copy, LogOut, Flame, Zap, Crown, Check } from 'lucide-react'
import { getMySquads, createSquad, joinSquad, leaveSquad } from '@/services/squad.service'
import { sendNudge, sendCheer } from '@/services/notification.service'
import { useAuthStore } from '@/store/authStore'
import type { Squad } from '@/types/squad'

function SquadCard({ squad, currentUserId, onLeave }: { squad: Squad; currentUserId: number; onLeave: () => void }) {
  const [copied, setCopied] = useState(false)
  const [sendingTo, setSendingTo] = useState<number | null>(null)

  const copyCode = () => {
    navigator.clipboard.writeText(squad.invite_code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleNudge = async (userId: number) => {
    setSendingTo(userId)
    try { await sendNudge(userId) } finally { setSendingTo(null) }
  }
  const handleCheer = async (userId: number) => {
    setSendingTo(userId)
    try { await sendCheer(userId) } finally { setSendingTo(null) }
  }

  const sortedMembers = [...squad.members].sort((a, b) => b.current_streak - a.current_streak)

  return (
    <div className="border rounded-2xl overflow-hidden bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 transition-all duration-300 shadow-sm">
      {/* Squad header */}
      <div className="p-5 border-b border-base-800 flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-ash-50">{squad.name}</h3>
          {squad.description && <p className="text-ash-500 text-sm mt-0.5">{squad.description}</p>}
          <div className="flex items-center gap-2 mt-2">
            <Users className="w-4 h-4 text-ash-500" />
            <span className="text-ash-400 text-sm">{squad.member_count} members</span>
          </div>
        </div>
        <div className="flex flex-col gap-2">
          <button
            onClick={copyCode}
            className="flex items-center gap-2 text-xs bg-base-800 hover:bg-base-700 border border-base-700 rounded-lg px-3 py-1.5 text-ash-300 transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied!' : squad.invite_code}
          </button>
        </div>
      </div>

      {/* Members */}
      <div className="p-4 space-y-2">
        {sortedMembers.map((member, idx) => (
          <div key={member.user_id} className={`flex items-center gap-3 p-3 rounded-xl ${
            member.user_id === currentUserId ? 'bg-ember-500/10 border border-ember-500/20' : 'bg-base-800/50'
          }`}>
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-ember-600 to-purple-600 flex items-center justify-center shrink-0">
              {idx === 0 && <Crown className="w-4 h-4 text-yellow-400" />}
              {idx > 0 && <span className="text-white font-bold text-xs">{member.name[0]}</span>}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-ash-100 text-sm truncate">
                {member.name} {member.user_id === currentUserId && <span className="text-xs text-ash-500">(you)</span>}
                {member.role === 'owner' && <span className="ml-1 text-xs text-yellow-500">Owner</span>}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-xs text-ash-500 flex items-center gap-1">
                  <Flame className="w-3 h-3 text-ember-400" />{member.current_streak}d
                </span>
                <span className="text-xs text-ash-500 flex items-center gap-1">
                  <Zap className="w-3 h-3 text-purple-400" />Lv.{member.level}
                </span>
              </div>
            </div>
            {member.user_id !== currentUserId && (
              <div className="flex gap-1.5 shrink-0">
                <button
                  onClick={() => handleNudge(member.user_id)}
                  disabled={sendingTo === member.user_id}
                  className="text-xs bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 px-2 py-1 rounded-lg transition-colors disabled:opacity-50"
                  title="Send nudge"
                >👋</button>
                <button
                  onClick={() => handleCheer(member.user_id)}
                  disabled={sendingTo === member.user_id}
                  className="text-xs bg-green-500/20 hover:bg-green-500/30 text-green-300 px-2 py-1 rounded-lg transition-colors disabled:opacity-50"
                  title="Send cheer"
                >🎉</button>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Leave */}
      <div className="px-4 pb-4">
        <button
          onClick={onLeave}
          className="w-full flex items-center justify-center gap-2 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
        >
          <LogOut className="w-4 h-4" /> Leave Squad
        </button>
      </div>
    </div>
  )
}

export default function Squads() {
  const { user } = useAuthStore()
  const [squads, setSquads] = useState<Squad[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreate, setShowCreate] = useState(false)
  const [showJoin, setShowJoin] = useState(false)
  const [createName, setCreateName] = useState('')
  const [createDesc, setCreateDesc] = useState('')
  const [joinCode, setJoinCode] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const load = () => {
    setIsLoading(true)
    getMySquads().then(setSquads).finally(() => setIsLoading(false))
  }

  useEffect(() => { load() }, [])

  const handleCreate = async () => {
    if (!createName.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      await createSquad(createName.trim(), createDesc.trim() || undefined)
      setShowCreate(false)
      setCreateName('')
      setCreateDesc('')
      load()
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Failed to create squad')
    } finally {
      setSubmitting(false)
    }
  }

  const handleJoin = async () => {
    if (!joinCode.trim()) return
    setSubmitting(true)
    setError(null)
    try {
      await joinSquad(joinCode.trim())
      setShowJoin(false)
      setJoinCode('')
      load()
    } catch (e: any) {
      setError(e?.response?.data?.detail || 'Invalid invite code')
    } finally {
      setSubmitting(false)
    }
  }

  const handleLeave = async (squadId: number) => {
    await leaveSquad(squadId)
    load()
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Users className="w-7 h-7 text-ember-400" />
          <div>
            <h1 className="text-2xl font-bold text-ash-50">Squads</h1>
            <p className="text-ash-500 text-sm">Train together. Win together.</p>
          </div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowJoin(true); setShowCreate(false); setError(null) }}
            className="px-4 py-2 text-sm font-medium bg-base-800 border border-base-700 text-ash-300 hover:text-ash-100 rounded-xl transition-colors"
          >
            Join Squad
          </button>
          <button
            onClick={() => { setShowCreate(true); setShowJoin(false); setError(null) }}
            className="flex items-center gap-2 px-4 py-2 text-sm font-medium bg-ember-500 hover:bg-ember-400 text-white rounded-xl transition-colors"
          >
            <Plus className="w-4 h-4" /> Create
          </button>
        </div>
      </div>

      {/* Create / Join Modals */}
      <AnimatePresence>
        {(showCreate || showJoin) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -10 }}
            className="border rounded-2xl p-6 space-y-4 bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 transition-all duration-300 shadow-sm"
          >
            <h2 className="font-bold text-ash-50 text-lg">{showCreate ? 'Create a Squad' : 'Join a Squad'}</h2>
            {error && <p className="text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-lg px-3 py-2">{error}</p>}
            {showCreate ? (
              <>
                <input
                  value={createName}
                  onChange={(e) => setCreateName(e.target.value)}
                  placeholder="Squad name..."
                  className="w-full bg-base-800 border border-base-700 rounded-xl px-4 py-3 text-ash-100 placeholder:text-ash-600 focus:outline-none focus:border-ember-500"
                />
                <input
                  value={createDesc}
                  onChange={(e) => setCreateDesc(e.target.value)}
                  placeholder="Description (optional)..."
                  className="w-full bg-base-800 border border-base-700 rounded-xl px-4 py-3 text-ash-100 placeholder:text-ash-600 focus:outline-none focus:border-ember-500"
                />
              </>
            ) : (
              <input
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Enter invite code (e.g. AB3X9P2Q)..."
                className="w-full bg-base-800 border border-base-700 rounded-xl px-4 py-3 text-ash-100 placeholder:text-ash-600 focus:outline-none focus:border-ember-500 font-mono tracking-widest"
              />
            )}
            <div className="flex gap-3">
              <button
                onClick={() => { setShowCreate(false); setShowJoin(false) }}
                className="flex-1 py-2.5 border border-base-700 text-ash-400 hover:text-ash-200 rounded-xl text-sm transition-colors"
              >Cancel</button>
              <button
                onClick={showCreate ? handleCreate : handleJoin}
                disabled={submitting}
                className="flex-1 py-2.5 bg-ember-500 hover:bg-ember-400 text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
              >
                {submitting ? 'Loading...' : showCreate ? 'Create Squad' : 'Join Squad'}
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Squads list */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => <div key={i} className="h-48 rounded-2xl animate-pulse border bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 transition-all duration-300 shadow-sm" />)}
        </div>
      ) : squads.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <Users className="w-14 h-14 mx-auto text-ash-600" />
          <p className="text-ash-400 font-medium">No squads yet</p>
          <p className="text-ash-600 text-sm">Create a squad or join one with an invite code to compete with friends</p>
        </div>
      ) : (
        <div className="space-y-4">
          {squads.map((squad) => (
            <SquadCard
              key={squad.id}
              squad={squad}
              currentUserId={user?.id || 0}
              onLeave={() => handleLeave(squad.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
