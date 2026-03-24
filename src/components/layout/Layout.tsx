import { Header } from './Header'

interface LayoutProps {
  children: React.ReactNode
}

export function Layout({ children }: LayoutProps) {
  return (
    <div className="relative min-h-screen flex flex-col bg-brand-light">
      <Header />
      <main className="flex-1 container mx-auto px-4 py-8">
        {children}
      </main>
      <footer className="border-t py-8 bg-white">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            &copy; 2026 ResQ AI. Saving lives through AI-driven response.
          </p>
          <div className="mt-4 flex justify-center gap-6">
            <a href="#" className="text-xs text-brand-dark/60 hover:text-brand-red">Terms</a>
            <a href="#" className="text-xs text-brand-dark/60 hover:text-brand-red">Privacy</a>
            <a href="#" className="text-xs text-brand-dark/60 hover:text-brand-red">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
