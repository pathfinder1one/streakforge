import { useState, FormEvent, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { SunIcon as Sunburst, Loader2, AlertCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'
import { useAuthStore } from '@/store/authStore'

export default function AuthPage() {
  const navigate = useNavigate()
  const location = useLocation()
  
  const [isLogin, setIsLogin] = useState(location.pathname === '/login')
  
  const login = useAuthStore((s) => s.login)
  const register = useAuthStore((s) => s.register)
  const isLoading = useAuthStore((s) => s.isLoading)

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Password strength
  function getPasswordStrength(pwd: string): { label: string; color: string; width: string } {
    if (!pwd) return { label: '', color: '', width: '0%' }
    if (pwd.length < 6) return { label: 'Weak', color: 'bg-red-500', width: '25%' }
    if (pwd.length < 8) return { label: 'Fair', color: 'bg-yellow-500', width: '50%' }
    if (/[A-Z]/.test(pwd) && /[0-9]/.test(pwd)) return { label: 'Strong', color: 'bg-green-500', width: '100%' }
    return { label: 'Good', color: 'bg-blue-500', width: '75%' }
  }

  const strength = getPasswordStrength(password)

  useEffect(() => {
    setError(null)
  }, [isLogin])

  async function handleLogin(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await login(email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Login failed.')
    }
  }

  async function handleRegister(e: FormEvent) {
    e.preventDefault()
    setError(null)
    try {
      await register(name || 'User', email, password)
      navigate('/dashboard')
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? 'Registration failed.')
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center overflow-hidden p-4">
      <div className="w-full relative max-w-5xl h-[600px] overflow-hidden flex shadow-2xl rounded-3xl bg-white">
        
        {/* SLIDING BLACK INFO PANEL */}
        <motion.div 
          animate={{ x: isLogin ? '0%' : '100%' }}
          transition={{ type: 'spring', damping: 25, stiffness: 200 }}
          className="absolute top-0 left-0 w-1/2 h-full z-20 hidden md:flex flex-col bg-black text-white p-8 md:p-12 justify-center shadow-[0_0_50px_rgba(0,0,0,0.5)] border-r border-white/10"
        >
          {/* Gradients and Orbs from user code */}
          <div className="w-full h-full z-0 absolute top-0 left-0 bg-gradient-to-t from-transparent to-black pointer-events-none"></div>
          <div className="flex absolute z-0 inset-0 overflow-hidden backdrop-blur-2xl pointer-events-none justify-evenly opacity-30">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-full w-16 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            ))}
          </div>
          <div className="w-60 h-60 bg-orange-500 absolute z-0 rounded-full -bottom-20 -left-10 blur-3xl opacity-50 pointer-events-none"></div>
          <div className="w-32 h-20 bg-white absolute z-0 rounded-full bottom-10 right-10 blur-2xl opacity-20 pointer-events-none"></div>

          <motion.div 
            key={isLogin ? 'login' : 'register'}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="z-10 relative flex flex-col items-start"
          >
            <h1 className="text-3xl md:text-4xl font-medium leading-tight tracking-tight mb-6">
              {isLogin ? "Welcome back to your workspace." : "Forge your discipline. Gamify your life."}
            </h1>
            <p className="text-gray-400 mb-8 max-w-sm">
              {isLogin 
                ? "Enter your details to access your account and continue your streak." 
                : "Join us to forge your discipline and gamify your life with our tools."}
            </p>
            <button
              type="button"
              onClick={() => { setIsLogin(!isLogin); setError(null) }}
              className="px-6 py-2 rounded-lg border border-white/30 hover:bg-white hover:text-black transition-colors"
            >
              {isLogin ? "Create an account" : "Sign in instead"}
            </button>
          </motion.div>
        </motion.div>

        {/* REGISTRATION FORM (Left Side) */}
        <div className="w-1/2 h-full absolute top-0 left-0 bg-white z-10 flex flex-col justify-center p-8 md:p-12 text-black">
          <div className="flex flex-col items-start mb-8">
            <div className="text-orange-500 mb-4">
              <Sunburst className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-medium mb-2 tracking-tight">Get Started</h2>
            <p className="text-left text-gray-500">Welcome to StreakForge — Let's get started</p>
          </div>

          {error && !isLogin && (
            <div className="mb-4 flex items-center gap-2 text-red-500 text-sm p-3 bg-red-50 rounded-lg">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleRegister}>
            {!isLogin && (
              <div>
                <label className="block text-sm mb-2 text-gray-700">Your name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="John Doe"
                  className="text-sm w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
                />
              </div>
            )}
            <div>
              <label className="block text-sm mb-2 text-gray-700">Your email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hi@example.com"
                className="text-sm w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm mb-2 text-gray-700">Create new password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-sm w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
                placeholder="••••••••"
              />
              {/* Password Strength Indicator (#32) */}
              {!isLogin && password && (
                <div className="mt-2">
                  <div className="w-full bg-gray-200 rounded-full h-1.5">
                    <div
                      className={`h-1.5 rounded-full transition-all duration-300 ${strength.color}`}
                      style={{ width: strength.width }}
                    />
                  </div>
                  <p className={`text-xs mt-1 font-medium ${strength.label === 'Strong' ? 'text-green-600' : strength.label === 'Weak' ? 'text-red-500' : 'text-gray-500'}`}>
                    {strength.label}
                  </p>
                </div>
              )}
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
              {isLogin ? 'Sign In' : 'Create Account'}
            </button>
            
            {/* Feature #31: Google/GitHub OAuth (Mock) */}
            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-2 bg-gray-50 text-gray-500">Or continue with</span>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => toast.success('Redirecting to Google OAuth... (Mock)')}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  Google
                </button>
                <button
                  type="button"
                  onClick={() => toast.success('Redirecting to GitHub OAuth... (Mock)')}
                  className="w-full inline-flex justify-center py-2 px-4 border border-gray-300 rounded-lg shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                >
                  GitHub
                </button>
              </div>
            </div>
            <div className="text-center text-gray-600 text-sm mt-2 md:hidden">
              Already have account? <button type="button" onClick={() => setIsLogin(true)} className="text-black font-medium underline">Login</button>
            </div>
          </form>
        </div>

        {/* LOGIN FORM (Right Side) */}
        <div className="w-1/2 h-full absolute top-0 right-0 bg-white z-10 flex flex-col justify-center p-8 md:p-12 text-black">
          <div className="flex flex-col items-start mb-8">
            <div className="text-orange-500 mb-4">
              <Sunburst className="h-10 w-10" />
            </div>
            <h2 className="text-3xl font-medium mb-2 tracking-tight">Welcome Back</h2>
            <p className="text-left text-gray-500">Log in to keep the streak alive</p>
          </div>

          {error && isLogin && (
            <div className="mb-4 flex items-center gap-2 text-red-500 text-sm p-3 bg-red-50 rounded-lg">
              <AlertCircle className="w-4 h-4" /> {error}
            </div>
          )}

          <form className="flex flex-col gap-4" onSubmit={handleLogin}>
            <div>
              <label className="block text-sm mb-2 text-gray-700">Your email</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="hi@example.com"
                className="text-sm w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
              />
            </div>
            <div>
              <label className="block text-sm mb-2 text-gray-700">Password</label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="text-sm w-full py-2.5 px-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-orange-500 bg-white"
                placeholder="••••••••"
              />
            </div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-orange-500 hover:bg-orange-600 text-white font-medium py-2.5 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Log In"}
            </button>
            <div className="text-center text-gray-600 text-sm mt-2 md:hidden">
              Don't have an account? <button type="button" onClick={() => setIsLogin(false)} className="text-black font-medium underline">Sign up</button>
            </div>
          </form>
        </div>

      </div>
    </div>
  )
}
