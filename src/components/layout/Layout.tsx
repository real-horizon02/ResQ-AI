import Header from './Header'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="relative min-h-screen flex flex-col bg-surface">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-6 py-8">
        {children}
      </main>
      <footer className="border-t border-sentinel-outline-variant/10 py-8 bg-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-4 lg:px-6 text-center">
          <p className="text-sm text-sentinel-on-surface-variant">
            &copy; 2026 ResQ AI. Saving lives through AI-driven response.
          </p>
          <div className="mt-4 flex justify-center gap-6">
            <a href="#" className="text-xs text-sentinel-on-surface-variant/60 hover:text-brand-red transition-colors">Terms</a>
            <a href="#" className="text-xs text-sentinel-on-surface-variant/60 hover:text-brand-red transition-colors">Privacy</a>
            <a href="#" className="text-xs text-sentinel-on-surface-variant/60 hover:text-brand-red transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
