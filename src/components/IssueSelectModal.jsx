import { X, AlertTriangle } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { getIssuesForPoint } from '../data/inspectionPoints'

export default function IssueSelectModal({ open, onClose, onSelect, currentIssueId, pointId, pointName }) {
  const { t, language } = useLanguage()
  if (!open) return null

  // Get issues specific to this inspection point
  const issues = getIssuesForPoint(pointId)

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
            <button
              key={err.id}
              onClick={() => { onSelect(err.id); onClose() }}
              className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex gap-3 items-start ${
                currentIssueId === err.id
                  ? 'border-rose-500 bg-rose-50'
                  : 'border-slate-200 hover:border-rose-300 hover:bg-rose-50/40'
              }`}
            >
              <div className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                currentIssueId === err.id
                  ? 'bg-rose-600 text-white'
                  : 'bg-slate-100 text-slate-600'
              }`}>
                {index + 1}
              </div>
              <div className="flex-1 text-sm leading-snug font-medium text-slate-700">
                {err[language]}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
