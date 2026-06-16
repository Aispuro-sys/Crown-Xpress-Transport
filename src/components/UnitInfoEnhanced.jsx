import { useEffect, useState } from 'react'
import { Truck, Package, Tag, User, Lock, Search, CheckCircle } from 'lucide-react'
import { useLanguage } from '../context/LanguageContext'
import { useInspection } from '../context/InspectionContext'
import { useAuth } from '../context/AuthContext'
import { INSPECTION_TYPES } from '../data/inspectionPoints'

export default function UnitInfoEnhanced() {
  const { t, language } = useLanguage()
  const { user } = useAuth()
  const { unitInfo, updateUnitInfo } = useInspection()

  useEffect(() => {
    const today = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Tijuana' })
    updateUnitInfo('inspectionDate', today)
    updateUnitInfo('guardName', user?.full_name || '')
  }, [user, updateUnitInfo])

  return (
    <section className="card">
      <div className="card-header">
        <Truck className="icon" />
        <h2>{t('unitInfo')}</h2>
      </div>
      <div className="card-body">
        <div className="grid">
          <div>
            <label>
              <Truck className="icon" />
              {t('trailerNumber')}
            </label>
            <input
              type="text"
              value={unitInfo.trailerNumber || ''}
              onChange={(e) => updateUnitInfo('trailerNumber', e.target.value.toUpperCase())}
              placeholder="TRL-12345"
              required
            />
          </div>

          <div>
            <label>
              <Package className="icon" />
              {t('containerNumber')}
            </label>
            <input
              type="text"
              value={unitInfo.containerNumber || ''}
              onChange={(e) => updateUnitInfo('containerNumber', e.target.value.toUpperCase())}
              placeholder="CONT-123456"
              required
            />
          </div>

          <div>
            <label>
              <Tag className="icon" />
              {t('sealNumber')}
            </label>
            <input
              type="text"
              value={unitInfo.sealNumber || ''}
              onChange={(e) => updateUnitInfo('sealNumber', e.target.value.toUpperCase())}
              placeholder="SEAL-00001"
              required
            />
          </div>

          <div>
            <label>
              <User className="icon" />
              {t('driverName')}
            </label>
            <input
              type="text"
              value={unitInfo.driverName || ''}
              onChange={(e) => updateUnitInfo('driverName', e.target.value.toUpperCase())}
              placeholder="JUAN PEREZ"
              required
            />
          </div>

          <div>
            <label>
              <Lock className="icon" />
              {t('lockNumber')}
            </label>
            <input
              type="text"
              value={unitInfo.lockNumber || ''}
              onChange={(e) => updateUnitInfo('lockNumber', e.target.value.toUpperCase())}
              placeholder="LOCK-00001"
            />
          </div>

          <div>
            <label>
              <Search className="icon" />
              {t('inspectionType')}
            </label>
            <select
              value={unitInfo.inspectionType || ''}
              onChange={(e) => updateUnitInfo('inspectionType', e.target.value)}
              required
            >
              <option value="">{language === 'es' ? 'SELECCIONE...' : 'SELECT...'}</option>
              {INSPECTION_TYPES.map(type => (
                <option key={type.id} value={type.id}>
                  {type.label[language]}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="yes-no">
          <div>
            <label>
              <input
                type="checkbox"
                checked={unitInfo.highSecuritySeal === 'yes'}
                onChange={(e) => updateUnitInfo('highSecuritySeal', e.target.checked ? 'yes' : 'no')}
              />
              <Package className="icon" />
              {t('highSecuritySeal')}
            </label>
          </div>

          <div>
            <label>
              <input
                type="checkbox"
                checked={unitInfo.sealAffixed === 'yes'}
                onChange={(e) => updateUnitInfo('sealAffixed', e.target.checked ? 'yes' : 'no')}
              />
              <CheckCircle className="icon" />
              {t('sealAffixed')}
            </label>
          </div>
        </div>
      </div>
    </section>
  )
}
