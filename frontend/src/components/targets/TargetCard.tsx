import { Link } from 'react-router-dom'
import { Pencil, Trash2, ExternalLink, Clock, Calendar, Bell, BookOpen, Code, Dumbbell, Target as TargetIcon } from 'lucide-react'
import { motion } from 'framer-motion'
import type { Target } from '@/types/target'

interface TargetCardProps {
  target: Target
  onDelete: (id: number) => void
}

const priorityConfig: Record<string, { label: string; cls: string; dot: string }> = {
  High: { label: 'High Priority', cls: 'text-ember-400 bg-ember-500/10 border-ember-500/20', dot: 'bg-ember-400' },
  Medium: { label: 'Med Priority', cls: 'text-amber-400 bg-amber-500/10 border-amber-500/20', dot: 'bg-amber-400' },
  Low: { label: 'Low Priority', cls: 'text-ash-400 bg-base-700/50 border-base-700', dot: 'bg-ash-500' },
}

const categoryIcon: Record<string, React.ElementType> = {
  Study: BookOpen, Coding: Code, Health: Dumbbell, Reading: BookOpen, Personal: TargetIcon,
}

export default function TargetCard({ target, onDelete }: TargetCardProps) {
  const cfg = priorityConfig[target.priority] || priorityConfig.Low

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, scale: 1.005 }}
      className="p-5 rounded-2xl border transition-all group bg-gradient-to-br from-base-950 to-base-900 border-ember-500/20 border hover:-translate-y-1 hover:scale-[1.01] hover:shadow-[0_0_20px_rgba(234,63,12,0.15)] hover:border-ember-500/50 duration-300 shadow-sm"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 flex-wrap mb-2">
            <span className="bg-base-800 p-2 rounded-lg border border-base-700 shadow-sm flex items-center justify-center">
              {(() => {
                const Icon = categoryIcon[target.category] || TargetIcon
                return <Icon className="w-5 h-5 text-ash-300" />
              })()}
            </span>
            <h3 className="font-display font-bold text-lg text-ash-100">{target.title}</h3>
            <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border flex items-center gap-1.5 ml-2 backdrop-blur-sm shadow-sm ${cfg.cls} ${target.priority === 'High' ? 'shadow-[0_0_8px_rgba(249,89,26,0.3)]' : ''}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} ${target.priority === 'High' ? 'animate-pulse' : ''}`} />
              {cfg.label}
            </span>
          </div>
          
          <div className="flex flex-wrap items-center gap-4 text-xs text-ash-500 font-medium mb-3 bg-base-950/50 inline-flex px-3 py-1.5 rounded-lg border border-base-800/50">
            <span className="text-ash-300">{target.category}</span>
            <div className="w-1 h-1 rounded-full bg-base-700" />
            <span className="text-ash-300">{target.frequency}</span>
            <div className="w-1 h-1 rounded-full bg-base-700" />
            <span className="flex items-center gap-1.5 text-ash-300">
              <Clock className="w-3.5 h-3.5 text-ember-500" />
              {target.minimum_time} mins
            </span>
          </div>

          {(target.scheduled_date || target.alert_time || target.deadline_date) && (
            <div className="flex items-center gap-4 text-[11px] text-ash-400 mb-3 bg-base-800/30 inline-flex px-3 py-1.5 rounded-lg flex-wrap">
              {target.scheduled_date && (
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-blue-400" />
                  {new Date(target.scheduled_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              )}
              {target.alert_time && (
                <span className={`flex items-center gap-1.5 ${target.scheduled_date ? 'border-l border-base-700 pl-4' : ''}`}>
                  <Bell className="w-3.5 h-3.5 text-amber-400" />
                  {target.alert_time}
                </span>
              )}
              {target.deadline_date && (
                <span className={`flex items-center gap-1.5 ${(target.scheduled_date || target.alert_time) ? 'border-l border-base-700 pl-4' : ''}`}>
                  <TargetIcon className="w-3.5 h-3.5 text-red-400" />
                  Due: {new Date(target.deadline_date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric' })}
                </span>
              )}
            </div>
          )}
          
          <br/>
          
          {target.link && (
            <a
              href={target.link}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-ember-500 hover:text-ember-400 transition-colors bg-ember-500/10 px-3 py-1.5 rounded-lg border border-ember-500/20"
            >
              Open Resource <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
        </div>

        <div className="flex items-center gap-1.5 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <Link
            to={`/targets/${target.id}/edit`}
            className="p-2.5 rounded-xl text-ash-400 hover:text-white hover:bg-base-800 border border-transparent hover:border-base-700 transition-all shadow-sm"
          >
            <Pencil className="w-4 h-4" />
          </Link>
          <button
            onClick={() => onDelete(target.id)}
            className="p-2.5 rounded-xl text-ash-400 hover:text-red-400 hover:bg-red-950/30 border border-transparent hover:border-red-900/50 transition-all shadow-sm"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>
    </motion.div>
  )
}
