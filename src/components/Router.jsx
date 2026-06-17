import { useState } from 'react'
import { ClipboardCheck, History, Home, ShieldCheck, FileText, Users, MapPin, Truck } from 'lucide-react'
import GuidedInspection from './GuidedInspection'
import UnitInfo from './UnitInfoEnhanced'
import TruckDiagram from './TruckDiagram'
import InspectionList from './InspectionList'
import SealPhoto from './SealPhoto'
import SignaturesSection from './SignaturesSection'
import SubmitBar from './SubmitBar'
import SuccessModal from './SuccessModal'
import InspectionHistory from './InspectionHistory'
import GuardHistory from './GuardHistory'
import SupervisorView from './SupervisorView'
import UserManagement from './UserManagement'
import YardManagement from './YardManagement'
import { useLanguage } from '../context/LanguageContext'
import { useInspection } from '../context/InspectionContext'
import { useAuth } from '../context/AuthContext'
import { getNbcwOutputs } from '../utils/api'

export default function Router() {
  const { t, language } = useLanguage()
  const { resetInspection, unitInfo } = useInspection()
  const { user, canEdit, canViewAll } = useAuth()
  const [page, setPage] = useState(canViewAll() && !canEdit() ? 'supervisor' : 'form')
  const [success, setSuccess] = useState({ open: false, filename: null })
  const [unitInfoFlowComplete, setUnitInfoFlowComplete] = useState(false)
  const [showInspectionPoints, setShowInspectionPoints] = useState(false)
  const [nbcwOutputs, setNbcwOutputs] = useState([])
  const [showNbcwModal, setShowNbcwModal] = useState(false)
  const [loadingNbcw, setLoadingNbcw] = useState(false)
  
  // Check if inspection type and trailer info has been selected
  // For BOBTAIL: only need inspectionType
  // For LOADED/EMPTY: need inspectionType + trailerType + trailerSize + equipmentOwner
  // For CROWN owner: also need crownFleet
  // For CUSTOMER with CONTAINER: also need customerPrefix
  const inspectionTypeSelected = !!unitInfo?.inspectionType && (
    unitInfo.inspectionType === 'BOBTAIL' || 
    (!!unitInfo?.trailerType && !!unitInfo?.trailerSize && !!unitInfo?.equipmentOwner && 
      (unitInfo.equipmentOwner === 'CROWN' ? !!unitInfo?.crownFleet : 
        (unitInfo.trailerType === 'CONTAINER' ? !!unitInfo?.customerPrefix : true)))
  )

  const handleSuccess = (payload) => {
    setSuccess({ open: true, filename: payload.filename })
    // Optionally switch to history after success
    // setPage('history')
  }

  const handleNbcwOutputs = async () => {
    if (!user?.location_name) {
      alert(language === 'es' ? 'No se encontró información de la yarda del usuario' : 'User yard information not found')
      return
    }

    setLoadingNbcw(true)
    try {
      const response = await getNbcwOutputs(user.location_name)
      if (response.success) {
        setNbcwOutputs(response.data)
        setShowNbcwModal(true)
      } else {
        alert(language === 'es' ? 'Error al cargar datos NBCW' : 'Error loading NBCW data')
      }
    } catch (error) {
      console.error('NBCW Error:', error)
      alert(language === 'es' ? 'Error al conectar con NBCW' : 'Error connecting to NBCW')
    } finally {
      setLoadingNbcw(false)
    }
  }

  const handleNewInspection = () => {
    resetInspection()
    setSuccess({ open: false, filename: null })
    setShowInspectionPoints(false)
    setUnitInfoFlowComplete(false)
    setPage('form')
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const isAdmin = user?.role === 'admin'
  
  const tabs = [
    canEdit() && { id: 'form', label: 'v1 - Vista Clásica', icon: FileText },
    canEdit() && { id: 'guided', label: 'v2 - Inspección Guiada', icon: Home },
    canEdit() && { id: 'my-history', label: language === 'es' ? 'Mi Historial' : 'My History', icon: History },
    canViewAll() && { id: 'supervisor', label: language === 'es' ? 'Vista Supervisor' : 'Supervisor View', icon: ShieldCheck },
    isAdmin && { id: 'users', label: language === 'es' ? 'Usuarios' : 'Users', icon: Users },
    isAdmin && { id: 'yards', label: language === 'es' ? 'Yardas' : 'Yards', icon: MapPin },
  ].filter(Boolean)

  const Nav = () => (
    <nav className="sticky top-14 z-20 bg-white border-b border-slate-200 no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-1 py-2 overflow-x-auto">
          {tabs.map(tab => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setPage(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors whitespace-nowrap ${
                  page === tab.id
                    ? 'bg-crown-navy text-white'
                    : 'text-slate-600 hover:bg-slate-100'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )

  return (
    <>
      <Nav />
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {page === 'form' && canEdit() && (
          <div className="space-y-5">
            <UnitInfo onFlowComplete={setUnitInfoFlowComplete} />
            {/* For BOBTAIL: go directly to 20 points, no button needed */}
            {/* For LOADED/EMPTY: Show "Start Inspection" button after unit info is complete */}
            {inspectionTypeSelected && unitInfoFlowComplete && !showInspectionPoints && unitInfo?.inspectionType !== 'BOBTAIL' && (
              <div className="flex flex-col gap-4">
                <div className="flex justify-center">
                  <button
                    onClick={() => {
                      setShowInspectionPoints(true)
                      window.scrollTo({ top: 0, behavior: 'smooth' })
                    }}
                    className="px-8 py-4 bg-crown-gold hover:bg-crown-gold-dark text-crown-navy font-bold rounded-xl text-lg transition-colors shadow-lg"
                  >
                    {language === 'es' ? 'COMENZAR INSPECCIÓN DE 20 PUNTOS' : 'START 20-POINT INSPECTION'}
                  </button>
                </div>
                <div className="flex justify-center">
                  <button
                    onClick={handleNbcwOutputs}
                    disabled={loadingNbcw}
                    className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg transition-colors shadow-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Truck className="w-5 h-5" />
                    {loadingNbcw 
                      ? (language === 'es' ? 'Cargando...' : 'Loading...') 
                      : (language === 'es' ? 'SALIDAS NBCW' : 'NBCW OUTPUTS')
                    }
                  </button>
                </div>
              </div>
            )}
            {/* Only show inspection components after clicking the button (or directly for BOBTAIL) */}
            {inspectionTypeSelected && unitInfoFlowComplete && (showInspectionPoints || unitInfo?.inspectionType === 'BOBTAIL') && (
              <>
                <TruckDiagram />
                <InspectionList />
                <SealPhoto />
                <SignaturesSection />
                <SubmitBar onSuccess={handleSuccess} />
              </>
            )}
          </div>
        )}
        {page === 'guided' && canEdit() && (
          <div className="space-y-5">
            <GuidedInspection />
          </div>
        )}
        {page === 'my-history' && canEdit() && <GuardHistory />}
        {page === 'supervisor' && canViewAll() && <SupervisorView />}
        {page === 'users' && isAdmin && <UserManagement />}
        {page === 'yards' && isAdmin && <YardManagement />}
      </div>

      <footer className="border-t border-slate-200 bg-white/50 backdrop-blur py-4 mt-2 no-print">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-xs text-slate-500">
            {t('footer')} · <span className="font-mono text-crown-gold-dark">{t('formCode')}</span>
          </p>
        </div>
      </footer>

      <SuccessModal
        open={success.open}
        filename={success.filename}
        onClose={() => setSuccess({ open: false, filename: null })}
        onNew={handleNewInspection}
      />

        {/* NBCW Outputs Modal */}
        {showNbcwModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
              <div className="p-6 border-b border-slate-200">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-crown-navy">
                    {language === 'es' ? 'Salidas NBCW' : 'NBCW Outputs'} - {user?.location_name}
                  </h2>
                  <button
                    onClick={() => setShowNbcwModal(false)}
                    className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
              
              <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                {nbcwOutputs.length === 0 ? (
                  <div className="text-center py-12">
                    <Truck className="w-12 h-12 mx-auto text-slate-300 mb-4" />
                    <p className="text-slate-500">
                      {language === 'es' ? 'No se encontraron salidas para esta yarda' : 'No outputs found for this yard'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-slate-50 sticky top-0">
                        <tr>
                          <th className="px-3 py-2 text-left font-semibold text-slate-700">WO</th>
                          <th className="px-3 py-2 text-left font-semibold text-slate-700">BL</th>
                          <th className="px-3 py-2 text-left font-semibold text-slate-700">Conductor</th>
                          <th className="px-3 py-2 text-left font-semibold text-slate-700">Fecha</th>
                          <th className="px-3 py-2 text-left font-semibold text-slate-700">Origen</th>
                          <th className="px-3 py-2 text-left font-semibold text-slate-700">Destino</th>
                          <th className="px-3 py-2 text-left font-semibold text-slate-700">Equipo</th>
                          <th className="px-3 py-2 text-left font-semibold text-slate-700">Cliente</th>
                          <th className="px-3 py-2 text-left font-semibold text-slate-700">Acción</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200">
                        {nbcwOutputs.map((output, index) => (
                          <tr key={index} className="hover:bg-slate-50">
                            <td className="px-3 py-2 font-medium">{output.WONO}</td>
                            <td className="px-3 py-2">{output.BLNO}</td>
                            <td className="px-3 py-2">{output.DRVCODE}</td>
                            <td className="px-3 py-2">{output.FECHA}</td>
                            <td className="px-3 py-2">{output.FROMD} - {output.FROMCITY}</td>
                            <td className="px-3 py-2">{output.TOD} - {output.TOCITY}</td>
                            <td className="px-3 py-2">{output.EL}</td>
                            <td className="px-3 py-2">{output.CSTMER}</td>
                            <td className="px-3 py-2">
                              <button
                                onClick={() => {
                                  // Aquí puedes agregar la lógica para crear inspección desde estos datos
                                  alert(`Crear inspección para WO: ${output.WONO}`)
                                  setShowNbcwModal(false)
                                }}
                                className="px-3 py-1 bg-crown-gold hover:bg-crown-gold-dark text-crown-navy font-semibold rounded text-xs transition-colors"
                              >
                                {language === 'es' ? 'Inspeccionar' : 'Inspect'}
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
    </>
  )
}
