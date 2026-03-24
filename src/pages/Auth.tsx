import { useState } from 'react'
import { supabase } from '../lib/supabase'
import { Button } from '../components/ui/Button'
import { Shield, Phone, Mail, ArrowRight, Loader2 } from 'lucide-react'

export default function AuthPage() {
  const [loading, setLoading] = useState(false)
  const [method, setMethod] = useState<'phone' | 'email'>('phone')
  const [identifier, setIdentifier] = useState('')
  const [otpMode, setOtpMode] = useState(false)
  const [token, setToken] = useState('')
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      if (method === 'phone') {
        const { error } = await supabase.auth.signInWithOtp({
          phone: identifier.startsWith('+') ? identifier : `+91${identifier}`,
        })
        if (error) throw error
        setOtpMode(true)
        setMessage({ type: 'success', text: 'OTP sent to your phone!' })
      } else {
        const { error } = await supabase.auth.signInWithOtp({
          email: identifier,
          options: {
            emailRedirectTo: window.location.origin,
          },
        })
        if (error) throw error
        setMessage({ type: 'success', text: 'Magic link sent! Check your email.' })
      }
    } catch (error: unknown) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Sign-in failed' })
    } finally {
      setLoading(false)
    }
  }

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.auth.verifyOtp({
        phone: identifier.startsWith('+') ? identifier : `+91${identifier}`,
        token,
        type: 'sms',
      })
      if (error) throw error
      // Redirect or state change will be handled by useAuth hook
    } catch (error: unknown) {
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Verification failed' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="glass-card w-full max-w-md p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-2 text-center">
          <div className="bg-brand-red/10 p-3 rounded-2xl">
            <Shield className="w-10 h-10 text-brand-red" />
          </div>
          <h1 className="text-2xl font-bold text-brand-dark">Welcome to ResQ AI</h1>
          <p className="text-sm text-gray-500">Sign in to report incidents and request help.</p>
        </div>

        {message && (
          <div className={`p-3 rounded-lg text-sm font-medium ${
            message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-brand-red border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {!otpMode ? (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div className="flex bg-gray-100 p-1 rounded-xl">
              <button
                type="button"
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${method === 'phone' ? 'bg-white shadow-sm text-brand-dark' : 'text-gray-500 hover:text-brand-dark'}`}
                onClick={() => { setMethod('phone'); setIdentifier(''); }}
              >
                <Phone className="w-4 h-4" /> Phone
              </button>
              <button
                type="button"
                className={`flex-1 flex items-center justify-center gap-2 py-2 text-sm font-medium rounded-lg transition-all ${method === 'email' ? 'bg-white shadow-sm text-brand-dark' : 'text-gray-500 hover:text-brand-dark'}`}
                onClick={() => { setMethod('email'); setIdentifier(''); }}
              >
                <Mail className="w-4 h-4" /> Email
              </button>
            </div>

            <div>
              <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider mb-1">
                {method === 'phone' ? 'Mobile Number' : 'Email Address'}
              </label>
              <div className="relative">
                <input
                  type={method === 'phone' ? 'tel' : 'email'}
                  placeholder={method === 'phone' ? '9876543210' : 'name@example.com'}
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full h-12 bg-white border border-gray-200 rounded-xl px-4 focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none transition-all"
                />
                {method === 'phone' && !identifier.startsWith('+') && identifier && (
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">+91 </span>
                )}
              </div>
              {method === 'phone' && (
                <p className="text-[10px] text-gray-400 mt-2">
                  We'll send a 6-digit OTP to your mobile for verification.
                </p>
              )}
            </div>

            <Button disabled={loading} className="w-full h-12 rounded-xl group" type="submit">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (
                <>
                  Continue <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-6">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-bold text-brand-dark uppercase tracking-wider">
                  Verification Code
                </label>
                <button 
                  type="button" 
                  onClick={() => setOtpMode(false)}
                  className="text-xs text-brand-blue hover:underline"
                >
                  Change number
                </button>
              </div>
              <input
                type="text"
                placeholder="000000"
                maxLength={6}
                required
                value={token}
                onChange={(e) => setToken(e.target.value)}
                className="w-full h-14 text-center text-3xl font-bold tracking-[0.5em] bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-brand-red focus:border-transparent outline-none transition-all"
              />
            </div>

            <Button disabled={loading} className="w-full h-12 rounded-xl" type="submit">
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Verify & Continue'}
            </Button>

            <p className="text-center text-xs text-gray-400">
              Didn't receive code? <button type="button" onClick={handleSignIn} className="text-brand-blue font-bold">Resend</button>
            </p>
          </form>
        )}

        <div className="text-center">
          <p className="text-[10px] text-gray-400 leading-relaxed px-4">
            By continuing, you agree to ResQ AI's Terms of Service and Privacy Policy. 
            Standard messaging rates may apply for SMS.
          </p>
        </div>
      </div>
    </div>
  )
}
