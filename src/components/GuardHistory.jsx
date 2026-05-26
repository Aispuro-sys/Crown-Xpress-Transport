import { useState, useEffect, useMemo } from 'react'
import { FileText, Search, Download, AlertTriangle, ChevronDown, ChevronRight, Lock, GitBranch } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useAuth } from '../context/AuthContext'
import { listInspections, downloadPdf, getInspection, reconfirmInspection } from '../utils/api'
import AuditTrail from './AuditTrail'
import ReconfirmModal from './ReconfirmModal'

/**
 * GuardHistory: read-only history of inspections done by the current guard.
 * Guard cannot edit/delete. Can only create reconfirmations linked to original.
 * Shows original and reconfirmations side by side.
 */
export default function GuardHistory() {
  const { t, language } = useLanguage()
  const { user } = useAuth()
  const [inspections, setInspections] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [expanded, setExpanded] = useState({})
  const [search, setSearch] = useState('')
  const [reconfirmTarget, setReconfirmTarget] = useState(null)

  useEffect(() => {
    load()
  }, [user])

  async function load() {
    setLoading(true)
    setError(null)
    try {
      const res = await listInspections({ limit: 200 })
      // Only show inspections from current guard
      const mine = (res.data || []).filter(i => i.guard_name === user?.full_name)
      setInspections(mine)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  // Group inspections: originals with their reconfirmations
  const groupedInspections = useMemo(() => {
    const originals = inspections.filter(i => !i.original_inspection_id)
    const reconfirms = inspections.filter(i => i.original_inspection_id)
    
    return originals.map(orig => ({
      original: orig,
      reconfirmations: reconfirms.filter(r => r.original_inspection_id === orig.id)
        .sort((a, b) => new Date(b.created_at) - new Date(a.created_at))
    }))
  }, [inspections])

  const filteredGroups = groupedInspections.filter(g =>
    !search ||
    g.original.trailer_number?.toLowerCase().includes(search.toLowerCase()) ||
    g.original.driver_name?.toLowerCase().includes(search.toLowerCase()) ||
    g.original.seal_number?.toLowerCase().includes(search.toLowerCase())
  )

  const toggle = (id) => setExpanded(prev => ({ ...prev, [id]: !prev[id] }))

  const handleDownload = async (id, filename) => {
    try {
      const blob = await downloadPdf(id)
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = filename || `inspection-${id}.pdf`
      document.body.appendChild(a)
      a.click()
      a.remove()
      URL.revokeObjectURL(url)
    } catch (e) {
      alert(language === 'es' ? 'Error descargando PDF' : 'Error downloading PDF')
    }
  }

  const handleReconfirm = async (id) => {
    try {
      const full = await getInspection(id)
      setReconfirmTarget(full)
    } catch (e) {
      alert(language === 'es' ? 'Error cargando inspección' : 'Error loading inspection')
    }
  }

  const handleReconfirmSubmit = async (data) => {
    try {
      const result = await reconfirmInspection(data.original_inspection_id, data)
      alert(
        language === 'es'
          ? `Reconfirmación creada exitosamente (ID #${result.id}, ${result.modifications} puntos corregidos)`
          : `Reconfirmation created (ID #${result.id}, ${result.modifications} points corrected)`
      )
      setReconfirmTarget(null)
      load()
    } catch (e) {
      alert(
        language === 'es'
          ? `Error: ${e.message}`
          : `Error: ${e.message}`
      )
    }
  }

  if (loading) {
    return (
      <section className="card">
        <div className="card-body text-center py-12">
          <div className="animate-spin w-8 h-8 border-2 border-crown-navy/30 border-t-crown-navy rounded-full mx-auto mb-3" />
          <p className="text-slate-500">{language === 'es' ? 'Cargando mi historial...' : 'Loading my history...'}</p>
        </div>
      </section>
    )
  }

  if (error) {
    return (
      <section className="card">
        <div className="card-body text-center py-12 text-rose-600">
          <p>{error}</p>
        </div>
      </section>
    )
  }

  return (
    <>
      <section className="card animate-slide-up">
        <div className="card-header flex items-center justify-between flex-wrap gap-3">
          <div className="flex items-center gap-3">
            <FileText className="w-5 h-5 text-crown-gold" />
            <div>
              <h2 className="font-bold uppercase text-sm tracking-wide">
                {language === 'es' ? 'Mi Historial' : 'My History'}
              </h2>
              <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Lock className="w-3 h-3" />
                {language === 'es' ? 'Solo lectura · No se puede editar ni borrar' : 'Read only · Cannot edit or delete'}
              </p>
            </div>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder={language === 'es' ? 'Buscar trailer, sello...' : 'Search trailer, seal...'}
              className="pl-9 pr-3 py-1.5 w-56 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-crown-navy/20"
            />
          </div>
        </div>
        <div className="card-body">
          {filteredGroups.length === 0 ? (
            <div className="text-center py-12 text-slate-400">
              <FileText className="w-12 h-12 mx-auto mb-3" />
              <p>{search ? (language === 'es' ? 'Sin resultados' : 'No results') : (language === 'es' ? 'Sin inspecciones aún' : 'No inspections yet')}</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredGroups.map(group => (
                <div key={group.original.id} className="border border-slate-200 rounded-xl overflow-hidden bg-white shadow-sm">
                  {/* Group Header */}
                  <div
                    className="px-4 py-3 bg-gradient-to-r from-crown-navy to-crown-navy/90 text-white flex items-center justify-between cursor-pointer"
                    onClick={() => toggle(group.original.id)}
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      {expanded[group.original.id] ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                      <div className="min-w-0">
                        <div className="font-bold truncate">
                          {group.original.trailer_number} · {group.original.driver_name}
                        </div>
                        <div className="text-xs text-white/70 truncate">
                          {new Date(group.original.created_at).toLocaleString()} · {group.original.location}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {group.reconfirmations.length > 0 && (
                        <span className="text-xs bg-amber-500 text-white px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                          <GitBranch className="w-3 h-3" />
                          {group.reconfirmations.length} {language === 'es' ? 'reconf.' : 'reconf.'}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Side by side: Original + Reconfirmations */}
                  <div className={`grid gap-3 p-3 ${group.reconfirmations.length > 0 ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
                    {/* Original Inspection Card */}
                    <div className="border-2 border-blue-200 rounded-lg overflow-hidden bg-blue-50/30">
                      <div className="px-3 py-2 bg-blue-100 flex items-center justify-between">
                        <span className="text-xs font-bold text-blue-800 uppercase">
                          {language === 'es' ? 'Original' : 'Original'}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                          group.original.status === 'completed' ? 'bg-blue-600 text-white' : 'bg-blue-200 text-blue-800'
                        }`}>
                          {group.original.status}
                        </span>
                      </div>
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-sm">
                            <span className="text-emerald-600 font-bold">{group.original.good_count || 0}</span>
                            <span className="text-slate-400 mx-1">/</span>
                            <span className="text-rose-600 font-bold">{group.original.bad_count || 0}</span>
                            <span className="text-slate-400 mx-1">/</span>
                            <span className="text-slate-500">{group.original.pending_count || 0}</span>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); handleDownload(group.original.id, group.original.pdf_filename) }}
                            className="p-1.5 rounded hover:bg-blue-100"
                            title={language === 'es' ? 'Descargar PDF' : 'Download PDF'}
                          >
                            <Download className="w-4 h-4 text-blue-600" />
                          </button>
                        </div>
                        <p className="text-xs text-slate-500">
                          {new Date(group.original.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>

                    {/* Reconfirmations */}
                    {group.reconfirmations.length > 0 && (
                      <div className="space-y-2">
                        {group.reconfirmations.map((reconf, idx) => (
                          <div key={reconf.id} className="border-2 border-amber-200 rounded-lg overflow-hidden bg-amber-50/30">
                            <div className="px-3 py-2 bg-amber-100 flex items-center justify-between">
                              <span className="text-xs font-bold text-amber-800 uppercase flex items-center gap-1">
                                <GitBranch className="w-3 h-3" />
                                {language === 'es' ? `Reconfirmación ${idx + 1}` : `Reconfirmation ${idx + 1}`}
                              </span>
                              <span className="text-xs bg-amber-600 text-white px-2 py-0.5 rounded-full font-semibold">
                                {reconf.status}
                              </span>
                            </div>
                            <div className="p-3">
                              <div className="flex items-center justify-between mb-2">
                                <div className="text-sm">
                                  <span className="text-emerald-600 font-bold">{reconf.good_count || 0}</span>
                                  <span className="text-slate-400 mx-1">/</span>
                                  <span className="text-rose-600 font-bold">{reconf.bad_count || 0}</span>
                                  <span className="text-slate-400 mx-1">/</span>
                                  <span className="text-slate-500">{reconf.pending_count || 0}</span>
                                </div>
                                <button
                                  onClick={(e) => { e.stopPropagation(); handleDownload(reconf.id, reconf.pdf_filename) }}
                                  className="p-1.5 rounded hover:bg-amber-100"
                                  title={language === 'es' ? 'Descargar PDF' : 'Download PDF'}
                                >
                                  <Download className="w-4 h-4 text-amber-600" />
                                </button>
                              </div>
                              <p className="text-xs text-slate-500">
                                {new Date(reconf.created_at).toLocaleString()}
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Expanded details */}
                  {expanded[group.original.id] && (
                    <div className="px-4 py-4 bg-slate-50 border-t">
                      <AuditTrail inspectionId={group.original.id} />

                      {/* Reconfirmation button */}
                      <div className="mt-4 pt-4 border-t border-slate-200">
                        <button
                          onClick={() => handleReconfirm(group.original.id)}
                          className="w-full px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2"
                        >
                          <AlertTriangle className="w-4 h-4" />
                          {language === 'es' ? 'Crear Reconfirmación (corregir puntos)' : 'Create Reconfirmation (correct points)'}
                        </button>
                        <p className="text-xs text-slate-500 text-center mt-1">
                          {language === 'es'
                            ? 'Esto creará un nuevo registro vinculado al original. Los datos originales no se modificarán.'
                            : 'This creates a new record linked to the original. Original data is preserved.'}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Reconfirm Modal */}
      <ReconfirmModal
        open={!!reconfirmTarget}
        originalInspection={reconfirmTarget}
        onClose={() => setReconfirmTarget(null)}
        onSubmit={handleReconfirmSubmit}
      />
    </>
  )
}
