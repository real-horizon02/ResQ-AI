import { useState, useRef } from 'react'
import { Search, X, MapPin, Loader2 } from 'lucide-react'

interface SearchResult {
  display_name: string
  lat: string
  lon: string
  type: string
}

interface MapSearchProps {
  onFlyTo: (lat: number, lng: number) => void
}

export default function MapSearch({ onFlyTo }: MapSearchProps) {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = async (q: string) => {
    if (q.length < 3) { setResults([]); return }
    setLoading(true)
    try {
      const res = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(q)}&format=json&countrycodes=in&limit=5`
      )
      const data: SearchResult[] = await res.json()
      setResults(data)
    } catch {
      setResults([])
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (value: string) => {
    setQuery(value)
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => search(value), 400)
  }

  const flyTo = (result: SearchResult) => {
    onFlyTo(parseFloat(result.lat), parseFloat(result.lon))
    setQuery(result.display_name.split(',')[0])
    setOpen(false)
    setResults([])
  }

  return (
    <div className="relative w-full">
      <div className="flex items-center gap-2 bg-surface-container-lowest rounded-xl px-3 py-2.5 shadow-glass ghost-border">
        <Search className="w-4 h-4 text-sentinel-on-surface-variant shrink-0" />
        <input
          type="text"
          placeholder="Search places in India..."
          value={query}
          onChange={(e) => { handleChange(e.target.value); setOpen(true) }}
          onFocus={() => setOpen(true)}
          className="flex-1 bg-transparent text-sm text-sentinel-on-surface placeholder:text-sentinel-on-surface-variant/40 outline-none"
        />
        {loading && <Loader2 className="w-4 h-4 text-brand-blue animate-spin shrink-0" />}
        {query && !loading && (
          <button onClick={() => { setQuery(''); setResults([]); setOpen(false) }}>
            <X className="w-4 h-4 text-sentinel-on-surface-variant hover:text-sentinel-on-surface" />
          </button>
        )}
      </div>

      {/* Results dropdown */}
      {open && results.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-surface-container-lowest rounded-xl shadow-glass-lg ghost-border overflow-hidden z-50">
          {results.map((r, i) => (
            <button
              key={i}
              onClick={() => flyTo(r)}
              className="w-full flex items-start gap-3 px-4 py-3 hover:bg-surface-container-low transition-colors text-left"
            >
              <MapPin className="w-4 h-4 text-brand-red shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-sentinel-on-surface truncate">{r.display_name.split(',')[0]}</p>
                <p className="text-[10px] text-sentinel-on-surface-variant truncate">{r.display_name}</p>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
