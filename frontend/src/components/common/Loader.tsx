interface LoaderProps {
  size?: 'sm' | 'md' | 'lg'
  label?: string
}

export default function Loader({ size = 'md', label }: LoaderProps) {
  const dimensions = { sm: 'w-4 h-4', md: 'w-7 h-7', lg: 'w-12 h-12' }[size]

  return (
    <div className="flex flex-col items-center justify-center gap-3 py-8">
      <div className={`relative ${dimensions}`}>
        <div className="absolute inset-0 rounded-full border-2 border-base-700" />
        <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-ember-500 animate-spin" />
      </div>
      {label && <p className="text-ash-400 text-sm font-body">{label}</p>}
    </div>
  )
}
