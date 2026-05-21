import { useState } from 'react'
import { Eye, EyeOff, User, Lock, Languages } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'

export default function Login() {
  const { language, toggleLanguage } = useLanguage()
  const { login, loading } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await login(username, password)
    } catch (err) {
      setError(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-between p-6 relative overflow-hidden">
      {/* Decorative premium ambient lights */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-crown-gold/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-crown-navy/20 rounded-full blur-[120px] pointer-events-none" />

      {/* Top spacing / Branding */}
      <div className="flex flex-col items-center pt-8 animate-fade-in">
        <div className="w-20 h-24 mb-3 flex items-center justify-center">
          <img src="/crown-logo.png" alt="Crown Logo" className="w-full h-full object-contain" />
        </div>
        <p className="text-[10px] font-bold tracking-[0.3em] text-crown-gold uppercase">
          {language === 'es' ? 'Portal de Inspección' : 'Inspection Portal'}
        </p>
      </div>

      {/* Centered minimalist input container */}
      <div className="w-full max-w-sm mx-auto my-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {language === 'es' ? 'Iniciar Sesión' : 'Sign In'}
          </h1>
          <p className="text-sm text-slate-500 mt-2">
            {language === 'es' ? 'Ingrese sus datos para comenzar' : 'Enter your details to begin'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Username */}
          <div className="space-y-1.5">
            <input
              type="text"
              value={username}
              onChange={e => setUsername(e.target.value)}
              className="w-full px-4 py-4 bg-slate-900 border border-white/10 rounded-xl text-base text-white placeholder-slate-600 focus:outline-none focus:border-crown-gold focus:ring-1 focus:ring-crown-gold transition-all"
              placeholder={language === 'es' ? 'Nombre de usuario' : 'Username'}
              required
              autoFocus
            />
          </div>

          {/* Password */}
          <div className="space-y-1.5 relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              className="w-full pl-4 pr-12 py-4 bg-slate-900 border border-white/10 rounded-xl text-base text-white placeholder-slate-600 focus:outline-none focus:border-crown-gold focus:ring-1 focus:ring-crown-gold transition-all"
              placeholder={language === 'es' ? 'Contraseña' : 'Password'}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors p-1"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
            </button>
          </div>

          {/* Error */}
          {error && (
            <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-3.5 text-xs text-rose-400">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full py-4 bg-gradient-to-r from-crown-gold to-crown-gold-dark text-slate-950 font-bold rounded-xl hover:opacity-95 active:scale-[0.99] transition-all disabled:opacity-20 disabled:cursor-not-allowed text-base shadow-lg shadow-crown-gold/10"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-slate-950/30 border-t-slate-950 rounded-full animate-spin mx-auto" />
            ) : (
              <span>{language === 'es' ? 'Ingresar' : 'Sign In'}</span>
            )}
          </button>
        </form>

        {/* Simple translation toggle */}
        <div className="text-center">
          <button
            type="button"
            onClick={toggleLanguage}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-crown-gold transition-colors"
          >
            <Languages className="w-3.5 h-3.5" />
            {language === 'es' ? 'English version' : 'Versión en Español'}
          </button>
        </div>
      </div>

      {/* Minimal copyright footer */}
      <div className="text-center pb-4">
        <p className="text-[10px] tracking-wider text-slate-700 uppercase">
          © {new Date().getFullYear()} Crown Xpress Transport
        </p>
      </div>
    </div>
  )
}
