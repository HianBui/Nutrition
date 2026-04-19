import { useState } from 'react'
import { analyzeHealth } from '../services/api'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n/translations'

function BMIGauge({ bmi }) {
  const clamp = Math.min(Math.max(bmi, 10), 40)
  const pct = ((clamp - 10) / 30) * 100
  const color = bmi < 18.5 ? '#3B82F6' : bmi < 25 ? '#10B981' : bmi < 30 ? '#F59E0B' : '#EF4444'
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ position: 'relative', width: 140, height: 80, margin: '0 auto 8px' }}>
        <svg width="140" height="80" viewBox="0 0 140 80">
          <path d="M10,70 A60,60 0 0,1 130,70" fill="none" stroke="var(--stone-100)" strokeWidth="12" strokeLinecap="round" />
          <path d="M10,70 A60,60 0 0,1 130,70" fill="none" stroke={color} strokeWidth="12" strokeLinecap="round" strokeDasharray={`${pct * 1.88} 188`} />
          <text x="70" y="65" textAnchor="middle" fontFamily="var(--font-display)" fontSize="22" fill={color}>{bmi?.toFixed(1)}</text>
        </svg>
      </div>
      <div style={{ fontWeight: 700, color, fontSize: '0.9rem' }}>BMI</div>
    </div>
  )
}

export default function HealthAnalysis() {
  const { lang } = useApp()
  const t = useT(lang)

  const ACTIVITY_LEVELS = [
    { value: 'sedentary', labelKey: 'ha_sed', descKey: 'ha_sed_desc' },
    { value: 'light', labelKey: 'ha_light', descKey: 'ha_light_desc' },
    { value: 'moderate', labelKey: 'ha_moderate', descKey: 'ha_moderate_desc' },
    { value: 'active', labelKey: 'ha_active', descKey: 'ha_active_desc' },
    { value: 'very_active', labelKey: 'ha_extra', descKey: 'ha_extra_desc' },
  ]

  const FIELDS = [
    { key: 'weight', labelKey: 'ha_weight', min: 30, max: 200 },
    { key: 'height', labelKey: 'ha_height', min: 100, max: 250 },
    { key: 'age', labelKey: 'ha_age', min: 15, max: 100 },
  ]

  const MACROS = [
    { k: 'protein_g', labelKey: 'fa_protein', color: '#3B82F6' },
    { k: 'carbs_g', labelKey: 'fa_carbs', color: '#F59E0B' },
    { k: 'fat_g', labelKey: 'fa_fat', color: '#EF4444' },
  ]

  const [form, setForm] = useState({ weight: 70, height: 170, age: 30, gender: 'male', activity: 'moderate' })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleAnalyze = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await analyzeHealth({ ...form, weight: parseFloat(form.weight), height: parseFloat(form.height), age: parseInt(form.age) })
      setResult(data.data)
    } catch (e) {
      setError(e.response?.data?.detail || t('ha_error'))
    } finally {
      setLoading(false)
    }
  }

  const CALORIE_GOAL_LABELS = {
    lose_weight: t('ha_lose_weight'),
    maintain: t('ha_maintain'),
    gain_muscle: t('ha_gain_muscle'),
  }

  return (
    <div>
      <div className="page-header">
        <h2 className="section-title">{t('ha_title')}</h2>
        <p className="section-subtitle">{t('ha_subtitle')}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'min(340px, 100%) 1fr', gap: 24 }} className="ha-layout">
        <div className="card" style={{ alignSelf: 'start' }}>
          <h3 style={{ fontWeight: 600, marginBottom: 20 }}>{t('ha_your_measurements')}</h3>

          <div style={{ marginBottom: 16 }}>
            <label className="label">{t('ha_gender')}</label>
            <div style={{ display: 'flex', gap: 8 }}>
              {[['male', 'ha_male'], ['female', 'ha_female']].map(([g, key]) => (
                <button key={g} onClick={() => set('gender', g)} style={{ flex: 1, padding: '10px', borderRadius: 'var(--radius-sm)', border: `1.5px solid ${form.gender === g ? 'var(--green-700)' : 'var(--stone-200)'}`, background: form.gender === g ? 'var(--green-50)' : 'var(--white)', color: form.gender === g ? 'var(--green-800)' : 'var(--stone-600)', fontWeight: form.gender === g ? 600 : 400, fontSize: '0.9rem', cursor: 'pointer' }}>
                  {t(key)}
                </button>
              ))}
            </div>
          </div>

          {FIELDS.map(f => (
            <div key={f.key} style={{ marginBottom: 14 }}>
              <label className="label">{t(f.labelKey)}</label>
              <input type="number" className="input" value={form[f.key]} onChange={e => set(f.key, e.target.value)} min={f.min} max={f.max} />
            </div>
          ))}

          <div style={{ marginBottom: 24 }}>
            <label className="label">{t('ha_activity')}</label>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {ACTIVITY_LEVELS.map(a => (
                <button key={a.value} onClick={() => set('activity', a.value)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', borderRadius: 'var(--radius-sm)', border: `1.5px solid ${form.activity === a.value ? 'var(--green-700)' : 'var(--stone-200)'}`, background: form.activity === a.value ? 'var(--green-50)' : 'var(--white)', cursor: 'pointer', transition: 'all 0.15s' }}>
                  <span style={{ fontWeight: 600, fontSize: '0.88rem', color: form.activity === a.value ? 'var(--green-800)' : 'var(--stone-700)' }}>{t(a.labelKey)}</span>
                  <span style={{ fontSize: '0.75rem', color: form.activity === a.value ? 'var(--green-700)' : 'var(--stone-500)' }}>{t(a.descKey)}</span>
                </button>
              ))}
            </div>
          </div>

          <button className="btn-primary" onClick={handleAnalyze} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
            {loading ? t('ha_btn_analyzing') : t('ha_btn_analyze')}
          </button>
          {error && <div style={{ marginTop: 12, padding: '10px 14px', background: '#FEF2F2', borderRadius: 'var(--radius-sm)', color: '#B91C1C', fontSize: '0.85rem' }}>{error}</div>}
          {loading && <div style={{ textAlign: 'center', marginTop: 20 }}><div className="loading-spinner" /><p style={{ color: 'var(--stone-500)', fontSize: '0.85rem', marginTop: 8 }}>{t('ha_analyzing_hint')}</p></div>}
        </div>

        {result && (
          <div className="fade-in" style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="card" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: 16, alignItems: 'center' }}>
              <BMIGauge bmi={result.bmi} />
              {[
                { labelKey: 'ha_category', value: result.bmi_category },
                { labelKey: 'ha_tdee', value: `${result.tdee} kcal` },
                { labelKey: 'ha_health_score', value: `${result.health_score}/100` },
              ].map(s => (
                <div key={s.labelKey} style={{ textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.3rem', color: 'var(--green-800)', marginBottom: 4 }}>{s.value}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--stone-400)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{t(s.labelKey)}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="card">
                <h4 style={{ fontWeight: 600, marginBottom: 14 }}>{t('ha_calorie_goals')}</h4>
                {result.calorie_goals && Object.entries(result.calorie_goals).map(([k, v]) => (
                  <div key={k} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
                    <span style={{ fontSize: '0.88rem', color: 'var(--stone-600)', textTransform: 'capitalize' }}>
                      {CALORIE_GOAL_LABELS[k] || k.replace('_', ' ')}
                    </span>
                    <span style={{ fontWeight: 700, color: 'var(--green-700)' }}>{v} kcal</span>
                  </div>
                ))}
              </div>
              <div className="card">
                <h4 style={{ fontWeight: 600, marginBottom: 14 }}>{t('ha_daily_macros')}</h4>
                {result.macro_targets && MACROS.map(({ k, labelKey, color }) => (
                  <div key={k} style={{ marginBottom: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                      <span style={{ fontSize: '0.85rem', color: 'var(--stone-600)' }}>{t(labelKey)}</span>
                      <span style={{ fontWeight: 700, color }}>{result.macro_targets[k]}g</span>
                    </div>
                    <div style={{ height: 5, background: 'var(--stone-100)', borderRadius: 3, overflow: 'hidden' }}>
                      <div style={{ width: `${Math.min((result.macro_targets[k] / 300) * 100, 100)}%`, height: '100%', background: color, borderRadius: 3 }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="card">
                <h4 style={{ fontWeight: 600, marginBottom: 12 }}>{t('ha_recommendations')}</h4>
                {result.recommendations?.map((r, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10, alignItems: 'flex-start' }}>
                    <div style={{ width: 22, height: 22, borderRadius: '50%', background: 'var(--green-100)', color: 'var(--green-800)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                    <p style={{ fontSize: '0.85rem', color: 'var(--stone-700)', lineHeight: 1.5 }}>{r}</p>
                  </div>
                ))}
              </div>
              <div className="card">
                <h4 style={{ fontWeight: 600, marginBottom: 12 }}>{t('ha_priority_nutrients')}</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
                  {result.priority_nutrients?.map(n => <span key={n} className="tag">{n}</span>)}
                </div>
                <h4 style={{ fontWeight: 600, marginBottom: 10 }}>{t('ha_ideal_weight')}</h4>
                {result.ideal_weight_range && (
                  <p style={{ color: 'var(--stone-600)', fontSize: '0.9rem' }}>
                    {result.ideal_weight_range.min} – {result.ideal_weight_range.max} kg
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
