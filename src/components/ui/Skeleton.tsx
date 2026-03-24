export function Skeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse bg-gray-200/60 rounded-xl ${className}`} />
  )
}

export function CardSkeleton() {
  return (
    <div className="glass-card p-6 space-y-4">
      <Skeleton className="h-4 w-2/3" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-4/5" />
      <Skeleton className="h-10 w-1/3 mt-4" />
    </div>
  )
}

export function StatSkeleton() {
  return (
    <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm space-y-2">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-8 w-12" />
    </div>
  )
}

export function TableRowSkeleton() {
  return (
    <tr>
      <td className="px-6 py-5"><Skeleton className="h-4 w-32" /></td>
      <td className="px-6 py-5"><Skeleton className="h-4 w-24" /></td>
      <td className="px-6 py-5"><Skeleton className="h-4 w-16" /></td>
      <td className="px-6 py-5"><Skeleton className="h-4 w-20" /></td>
      <td className="px-6 py-5"><Skeleton className="h-4 w-16" /></td>
    </tr>
  )
}

export function MapSkeleton() {
  return (
    <div className="relative w-full h-[calc(100vh-64px)] bg-gray-100 animate-pulse flex items-center justify-center">
      <div className="text-center space-y-3">
        <Skeleton className="h-10 w-10 mx-auto rounded-full" />
        <Skeleton className="h-4 w-32 mx-auto" />
      </div>
    </div>
  )
}
