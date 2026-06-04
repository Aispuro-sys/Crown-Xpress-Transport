import { useState, useEffect } from 'react'
import { X, AlertTriangle, Edit3 } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { getIssuesForPoint } from '../data/inspectionPoints'

export default function IssueSelectModal({ open, onClose, onSelect, currentIssueId, pointId, pointName, currentCustomText = '', onCustomTextChange }) {
  const { t, language } = useLanguage()
  const [customText, setCustomText] = useState(currentCustomText)
  const [showCustomInput, setShowCustomInput] = useState(false)
  
  // Get issues specific to this inspection point
  const issues = getIssuesForPoint(pointId)
  
  // Find if current selection is "OTHER"
  const otherIssue = issues.find(i => i.isOther)
  
  useEffect(() => {
    if (currentIssueId && otherIssue && currentIssueId === otherIssue.id) {
      setShowCustomInput(true)
    }
    setCustomText(currentCustomText || '')
  }, [currentIssueId, otherIssue, currentCustomText])
  
  if (!open) return null

  const handleSelectOther = (issueId, isOther) => {
    if (isOther) {
      setShowCustomInput(true)
      onSelect(issueId, customText)
    } else {
      setShowCustomInput(false)
      setCustomText('')
      onSelect(issueId, null)
      onClose()
    }
  }
  
  const handleConfirmCustom = () => {
    if (customText.trim()) {
      onSelect(otherIssue.id, customText.trim().toUpperCase())
      onClose()
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white rounded-2xl w-full max-w-lg max-h-[95vh] flex flex-col overflow-hidden shadow-crown-lg" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between px-5 py-3 bg-gradient-to-r from-rose-600 to-rose-700 text-white">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 flex-shrink-0" />
              <h3 className="font-bold">{t('selectIssue')}</h3>
            </div>
            {pointName && (
              <p className="text-xs text-white/70 mt-0.5 truncate">{pointName}</p>
            )}
          </div>
          <button onClick={onClose} className="p-1.5 hover:bg-white/10 rounded-lg transition flex-shrink-0">
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="overflow-y-auto p-3 space-y-1.5">
          {issues.map((err, index) => (
            <div key={err.id}>
              <button
                onClick={() => handleSelectOther(err.id, err.isOther)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex gap-3 items-start ${
                  currentIssueId === err.id
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-slate-200 hover:border-rose-300 hover:bg-rose-50/40'
                } ${err.isOther ? 'bg-amber-50 border-amber-300' : ''}`}
              >
                <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                  currentIssueId === err.id
                    ? 'bg-rose-600 text-white'
                    : err.isOther ? 'bg-amber-500 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {err.isOther ? <Edit3 className="w-3 h-3" /> : index + 1}
                </div>
                <div className={`flex-1 text-sm leading-snug font-medium ${err.isOther ? 'text-amber-700' : 'text-slate-700'}`}>
                  {err[language]}
                </div>
              </button>
              
              {/* Custom text input for "OTHER" option */}
              {err.isOther && showCustomInput && currentIssueId === err.id && (
                <div className="mt-2 ml-9 space-y-2">
                  <textarea
                    value={customText}
                    onChange={(e) => setCustomText(e.target.value.toUpperCase())}
                    placeholder={language === 'es' ? 'DESCRIBA LA FALLA...' : 'DESCRIBE THE ISSUE...'}
                    className="w-full px-3 py-2 border-2 border-amber-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 text-sm uppercase"
                    rows={3}
                    autoFocus
                  />
                  <button
                    onClick={handleConfirmCustom}
                    disabled={!customText.trim()}
                    className="w-full py-2 bg-amber-500 text-white font-bold rounded-lg hover:bg-amber-600 disabled:bg-slate-300 disabled:cursor-not-allowed transition"
                  >
                    {language === 'es' ? 'CONFIRMAR FALLA' : 'CONFIRM ISSUE'}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
