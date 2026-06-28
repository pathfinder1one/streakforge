import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { Gavel, AlertOctagon, Scale, ShieldAlert, Loader2 } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { getBreachedContracts, submitPlea, ContractResponse, CourtVerdict } from '@/services/court.service'

export default function Court() {
  const navigate = useNavigate()
  const { fetchProfile } = useAuthStore()
  const [breached, setBreached] = useState<ContractResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [activeContract, setActiveContract] = useState<ContractResponse | null>(null)
  const [plea, setPlea] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [verdict, setVerdict] = useState<CourtVerdict | null>(null)

  useEffect(() => {
    getBreachedContracts()
      .then(res => {
        setBreached(res)
        if (res.length > 0) setActiveContract(res[0])
        setLoading(false)
      })
      .catch(() => setLoading(false))
  }, [])

  const handleSubmit = async () => {
    if (!activeContract || !plea.trim()) return
    setSubmitting(true)
    try {
      const res = await submitPlea(activeContract.id, plea)
      setVerdict(res)
      await fetchProfile() // refresh coins
    } catch (e) {
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  const handleDismiss = () => {
    // move to next contract if any
    const remaining = breached.filter(c => c.id !== activeContract?.id)
    setBreached(remaining)
    setVerdict(null)
    setPlea('')
    if (remaining.length > 0) {
      setActiveContract(remaining[0])
    } else {
      navigate('/dashboard')
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-red-500"><Loader2 className="w-8 h-8 animate-spin" /></div>
  }

  if (breached.length === 0) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-6 text-center">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }}>
          <Scale className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">No Charges Pending</h1>
          <p className="text-gray-400 mb-6">You have upheld all your contracts. The court is dismissed.</p>
          <button onClick={() => navigate('/dashboard')} className="px-6 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors">Return to Dashboard</button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-red-950/20 bg-[#0a0000] flex flex-col items-center justify-center p-4 md:p-8 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-red-900/10 rounded-full blur-[120px] pointer-events-none" />

      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-2xl w-full z-10"
      >
        <div className="text-center mb-8">
          <motion.div
            animate={{ scale: [1, 1.1, 1] }}
            transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            className="w-20 h-20 mx-auto bg-red-950 border-2 border-red-900 rounded-full flex items-center justify-center mb-6 shadow-[0_0_50px_rgba(220,38,38,0.3)]"
          >
            <Gavel className="w-10 h-10 text-red-500" />
          </motion.div>
          <h1 className="text-4xl font-black tracking-wider text-red-50 uppercase drop-shadow-[0_2px_10px_rgba(220,38,38,0.8)]">Accountability Court</h1>
          <p className="text-red-400/80 mt-2 font-medium tracking-widest uppercase text-sm">The Judge is waiting</p>
        </div>

        <AnimatePresence mode="wait">
          {!verdict ? (
            <motion.div
              key="plea"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="bg-black/60 border border-red-900/50 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl"
            >
              <div className="flex items-start gap-4 p-4 rounded-xl bg-red-950/40 border border-red-900/50 mb-8">
                <AlertOctagon className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                <div>
                  <h3 className="text-red-200 font-bold text-lg mb-1">Contract Breached</h3>
                  <p className="text-red-400/80 text-sm">You pledged <strong className="text-red-400">{activeContract?.pledge_amount} coins</strong> to complete: <br/> <span className="text-white font-medium">"{activeContract?.target_title}"</span></p>
                </div>
              </div>

              <div className="space-y-4">
                <label className="block text-red-100 font-medium">State your defense:</label>
                <textarea
                  value={plea}
                  onChange={(e) => setPlea(e.target.value)}
                  placeholder="Why did you fail? Tell the truth. The Judge knows when you are lying..."
                  className="w-full h-32 bg-red-950/20 border border-red-900/50 rounded-xl p-4 text-red-100 placeholder-red-900/50 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 resize-none transition-all custom-scrollbar"
                />
                
                <button
                  onClick={handleSubmit}
                  disabled={submitting || !plea.trim()}
                  className="w-full py-4 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold uppercase tracking-widest shadow-[0_0_20px_rgba(220,38,38,0.4)] hover:shadow-[0_0_30px_rgba(220,38,38,0.6)] transition-all disabled:opacity-50 disabled:hover:bg-red-600"
                >
                  {submitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Submit Plea'}
                </button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="verdict"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-black/60 border border-red-900/50 backdrop-blur-xl rounded-2xl p-6 md:p-8 shadow-2xl text-center"
            >
              <div className="mb-6">
                {verdict.verdict === 'forgiven' ? (
                  <ShieldAlert className="w-16 h-16 text-green-500 mx-auto mb-4" />
                ) : (
                  <Gavel className="w-16 h-16 text-red-500 mx-auto mb-4" />
                )}
                <h2 className={`text-3xl font-black uppercase tracking-widest ${verdict.verdict === 'forgiven' ? 'text-green-500' : 'text-red-500'}`}>
                  {verdict.verdict.replace('_', ' ')}
                </h2>
                <div className="mt-2 text-xl text-white font-bold">
                  Penalty: <span className={verdict.coins_deducted === 0 ? 'text-green-400' : 'text-red-400'}>-{verdict.coins_deducted} Coins</span>
                </div>
              </div>

              <div className="bg-red-950/30 border border-red-900/30 p-6 rounded-xl mb-8 relative">
                <div className="absolute -top-3 left-6 px-2 bg-[#0d0404] text-red-500 text-xs font-bold uppercase tracking-widest">The Judge Speaks</div>
                <p className="text-red-200 italic">"{verdict.message}"</p>
              </div>

              <button
                onClick={handleDismiss}
                className="w-full py-3 rounded-xl bg-gray-800 hover:bg-gray-700 text-white font-bold transition-all"
              >
                Accept Judgment
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}
