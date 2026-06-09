import { useState } from 'react'
import { X, Delete, Check } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'

/**
 * NumericKeypad - Modal with calculator-style keypad for entering numbers
 * Designed for iPad use without needing the on-screen keyboard
 */
export default function NumericKeypad({ 
  isOpen, 
  onClose, 
  onConfirm, 
  title, 
  initialValue = '',
  allowLetters = true,
  maxLength = 20
}) {
  const { language } = useLanguage()
  const [value, setValue] = useState(initialValue)

  if (!isOpen) return null

  const handleKeyPress = (key) => {
    if (value.length < maxLength) {
      setValue(prev => prev + key)
    }
  }

  const handleBackspace = () => {
    setValue(prev => prev.slice(0, -1))
  }

  const handleClear = () => {
    setValue('')
  }

  const handleConfirm = () => {
    onConfirm(value.toUpperCase())
    onClose()
  }

  const numericKeys = ['1', '2', '3', '4', '5', '6', '7', '8', '9', '0']
  const letterKeys = allowLetters ? ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M', 'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z'] : []
  const specialKeys = ['-', '/']

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="bg-gradient-to-r from-crown-navy to-crown-navy/90 px-5 py-4 text-white flex items-center justify-between">
          <h3 className="font-bold text-lg uppercase">{title}</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Display */}
        <div className="p-4 bg-slate-50 border-b border-slate-200">
          <div className="bg-white border-2 border-slate-300 rounded-xl px-4 py-3 min-h-[56px] flex items-center justify-between">
            <span className="text-2xl font-mono font-bold text-slate-800 tracking-wider">
              {value || <span className="text-slate-300">---</span>}
            </span>
            <button
              onClick={handleBackspace}
              className="p-2 hover:bg-slate-100 rounded-lg transition-colors text-slate-500"
            >
              <Delete className="w-6 h-6" />
            </button>
          </div>
        </div>

        {/* Keypad */}
        <div className="p-4 space-y-3">
          {/* Numbers */}
          <div className="grid grid-cols-5 gap-2">
            {numericKeys.map(key => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className="p-4 text-xl font-bold bg-slate-100 hover:bg-slate-200 active:bg-slate-300 rounded-xl transition-colors"
              >
                {key}
              </button>
            ))}
          </div>

          {/* Letters (if allowed) */}
          {allowLetters && (
            <div className="grid grid-cols-7 gap-1.5">
              {letterKeys.map(key => (
                <button
                  key={key}
                  onClick={() => handleKeyPress(key)}
                  className="p-2.5 text-sm font-bold bg-blue-50 hover:bg-blue-100 active:bg-blue-200 text-blue-700 rounded-lg transition-colors"
                >
                  {key}
                </button>
              ))}
            </div>
          )}

          {/* Special keys and actions */}
          <div className="grid grid-cols-4 gap-2">
            {specialKeys.map(key => (
              <button
                key={key}
                onClick={() => handleKeyPress(key)}
                className="p-3 text-lg font-bold bg-slate-200 hover:bg-slate-300 active:bg-slate-400 rounded-xl transition-colors"
              >
                {key}
              </button>
            ))}
            <button
              onClick={handleClear}
              className="p-3 text-sm font-bold bg-rose-100 hover:bg-rose-200 active:bg-rose-300 text-rose-700 rounded-xl transition-colors"
            >
              {language === 'es' ? 'BORRAR' : 'CLEAR'}
            </button>
            <button
              onClick={handleConfirm}
              className="p-3 font-bold bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white rounded-xl transition-colors flex items-center justify-center gap-1"
            >
              <Check className="w-5 h-5" />
              OK
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
