import { useDisasters } from '../../hooks/useDisasters'
import { RefreshCcw } from 'lucide-react'

export default function DataFreshness() {
  const { lastUpdated, loading } = useDisasters()

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 bg-white/90 backdrop-blur-sm rounded-full shadow-sm border border-gray-100 text-[10px] font-bold text-gray-500 uppercase tracking-wider">
      <RefreshCcw className={`w-3 h-3 ${loading ? 'animate-spin' : ''}`} />
      <span>Last Sync: {lastUpdated.toLocaleTimeString()}</span>
    </div>
  )
}
