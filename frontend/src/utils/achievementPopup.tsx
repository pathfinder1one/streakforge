import toast from 'react-hot-toast'
import { Trophy } from 'lucide-react'

export const triggerAchievementPopup = (title: string, description: string, icon: string = '🏆') => {
  toast.custom(
    (t) => (
      <div
        className={`${
          t.visible ? 'animate-enter' : 'animate-leave'
        } max-w-md w-full bg-gradient-to-r from-yellow-900/90 to-amber-900/90 shadow-[0_0_30px_rgba(251,191,36,0.3)] rounded-2xl pointer-events-auto flex ring-1 ring-yellow-500/50 backdrop-blur-xl overflow-hidden`}
      >
        <div className="flex-1 w-0 p-4">
          <div className="flex items-start">
            <div className="flex-shrink-0 pt-0.5">
              <div className="w-10 h-10 rounded-full bg-yellow-500/20 flex items-center justify-center text-2xl border border-yellow-500/50">
                {icon}
              </div>
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-bold text-yellow-400 uppercase tracking-wider">
                Achievement Unlocked!
              </p>
              <p className="mt-1 text-base font-semibold text-white">
                {title}
              </p>
              <p className="mt-1 text-sm text-yellow-200/80">
                {description}
              </p>
            </div>
          </div>
        </div>
        <div className="flex border-l border-yellow-500/30">
          <button
            onClick={() => toast.dismiss(t.id)}
            className="w-full border border-transparent rounded-none rounded-r-2xl p-4 flex items-center justify-center text-sm font-medium text-yellow-400 hover:text-yellow-300 hover:bg-yellow-800/50 focus:outline-none transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    ),
    { duration: 5000, position: 'top-center' }
  )
}
