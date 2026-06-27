import { motion } from 'framer-motion'

interface EmptyStateProps {
  icon?: string
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export default function EmptyState({ icon = '🎯', title, description, action }: EmptyStateProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 px-6 text-center"
    >
      {/* Animated icon */}
      <motion.div
        animate={{ y: [-4, 4, -4] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        className="text-6xl mb-6 drop-shadow-lg"
      >
        {icon}
      </motion.div>

      {/* Glow circle */}
      <div className="absolute w-32 h-32 rounded-full bg-ember-500/5 blur-3xl pointer-events-none" />

      <h3 className="font-display font-bold text-xl text-ash-200 mb-2">{title}</h3>
      <p className="text-ash-500 text-sm max-w-xs leading-relaxed mb-6">{description}</p>

      {action && (
        <button
          onClick={action.onClick}
          className="px-6 py-2.5 rounded-xl bg-ember-gradient text-white text-sm font-semibold shadow-ember-sm hover:scale-105 active:scale-95 transition-all duration-200"
        >
          {action.label}
        </button>
      )}
    </motion.div>
  )
}
