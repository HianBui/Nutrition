import { useState } from 'react'
import { generateMealPlan } from '../services/api'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n/translations'

function MealCard({ meal, name }) {
  if (!meal) return null
  return (
    <div style={{ background: 'var(--stone-50)', borderRadius: 'var(--radius-sm)', padding: '12px 14px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <div style={{ fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--stone-400)', marginBottom: 2 }}>{name}</div>
          <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{meal.name}</div>
        </div>
        <span style={{ fontWeight: 700, color: 'var(--green-700)', fontSize: '0.95rem' }}>{meal.calories} kcal</span>
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[['P', meal.protein, '#3B82F6'], ['C', meal.carbs, '#F59E0B'], ['F', meal.fat, '#EF4444']].map(([l, v, c]) => (
          <span key={l} style={{ fontSize: '0.72rem', color: c, fontWeight: 600 }}>{l} {v}g</span>
        ))}
        <span style={{ fontSize: '0.72rem', color: 'var(--stone-400)', marginLeft: 'auto' }}>{meal.prep_time}</span>
      </div>
    </div>
  )
}

export default function MealPlan() {
  const { lang } = useApp()
  const t = useT(lang)

  const GOALS = [
    { value: 'lose_weight', labelKey: 'mp_goal_loss' },
    { value: 'gain_muscle', labelKey: 'mp_goal_gain' },
    { value: 'maintain', labelKey: 'mp_goal_maintain' },
    { value: 'eat_healthy', labelKey: 'mp_goal_healthy' },
  ]
  const DIETARY = [
    { value: 'none', labelKey: 'mp_diet_none' },
    { value: 'vegetarian', labelKey: 'mp_diet_vegetarian' },
    { value: 'vegan', labelKey: 'mp_diet_vegan' },
    { value: 'low_carb', labelKey: 'mp_diet_lowcarb' },
    { value: 'high_protein', labelKey: 'mp_diet_highprotein' },
  ]
  const MEAL_LABELS = {
    breakfast: t('mp_breakfast'),
    lunch: t('mp_lunch'),
    dinner: t('mp_dinner'),
    snack: t('mp_snack'),
  }

  const [form, setForm] = useState({ goal: 'lose_weight', calories: 1800, dietary: 'none', days: 7 })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeDay, setActiveDay] = useState(0)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleGenerate = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await generateMealPlan({ ...form, calories: parseInt(form.calories), days: parseInt(form.days) })
      setResult(data.data)
      setActiveDay(0)
    } catch (e) {
      setError(e.response?.data?.detail || t('mp_error'))
    } finally {
      setLoading(false)
    }
  }

  const day = result?.days?.[activeDay]

  return (
    <div>
      <div className="page-header">
        <h2 className="section-title">{t('mp_title')}</h2>
        <p className="section-subtitle">{t('mp_subtitle')}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: result ? 'min(320px, 100%) 1fr' : 'min(480px, 100%) 1fr', gap: 24 }} className="mp-layout">
        <div>
          <div className="card">
            <h3 style={{ fontWeight: 600, marginBottom: 20 }}>{t('mp_your_prefs')}</h3>

            <div style={{ marginBottom: 16 }}>
              <label className="label">{t('mp_goal')}</label>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {GOALS.map(g => (
                  <button key={g.value} onClick={() => set('goal', g.value)} style={{ padding: '10px', borderRadius: 'var(--radius-sm)', border: `1.5px solid ${form.goal === g.value ? 'var(--green-700)' : 'var(--stone-200)'}`, background: form.goal === g.value ? 'var(--green-50)' : 'var(--white)', color: form.goal === g.value ? 'var(--green-800)' : 'var(--stone-600)', fontSize: '0.85rem', fontWeight: form.goal === g.value ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s' }}>
                    {t(g.labelKey)}
                  </button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="label">{t('mp_calories')}</label>
              <input type="number" className="input" value={form.calories} onChange={e => set('calories', e.target.value)} min={1200} max={4000} step={50} />
              <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6 }}>
                {[1200, 1500, 1800, 2200, 2500].map(c => (
                  <button key={c} onClick={() => set('calories', c)} style={{ fontSize: '0.72rem', padding: '3px 7px', borderRadius: 20, border: '1px solid var(--stone-200)', background: form.calories == c ? 'var(--green-800)' : 'transparent', color: form.calories == c ? 'white' : 'var(--stone-500)', cursor: 'pointer' }}>{c}</button>
                ))}
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <label className="label">{t('mp_dietary')}</label>
              <select className="select" value={form.dietary} onChange={e => set('dietary', e.target.value)}>
                {DIETARY.map(d => <option key={d.value} value={d.value}>{t(d.labelKey)}</option>)}
              </select>
            </div>

            <div style={{ marginBottom: 24 }}>
              <label className="label">{t('mp_days_label', form.days)}</label>
              <input type="range" min={3} max={7} value={form.days} onChange={e => set('days', e.target.value)} style={{ width: '100%', accentColor: 'var(--green-700)' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--stone-400)', marginTop: 2 }}>
                <span>{t('mp_days_min')}</span><span>{t('mp_days_max')}</span>
              </div>
            </div>

            <button className="btn-primary" onClick={handleGenerate} disabled={loading} style={{ width: '100%', justifyContent: 'center' }}>
              {loading ? t('mp_btn_generating') : t('mp_btn_generate')}
            </button>
            {error && <div style={{ marginTop: 12, padding: '10px 14px', background: '#FEF2F2', borderRadius: 'var(--radius-sm)', color: '#B91C1C', fontSize: '0.85rem' }}>{error}</div>}
            {loading && <div style={{ textAlign: 'center', marginTop: 20 }}><div className="loading-spinner" /><p style={{ color: 'var(--stone-500)', fontSize: '0.85rem', marginTop: 8 }}>{t('mp_generating_hint')}</p></div>}
          </div>
        </div>

        {result && (
          <div className="fade-in">
            <div className="card" style={{ marginBottom: 16 }}>
              <p style={{ color: 'var(--stone-600)', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: 12 }}>{result.summary}</p>
              <div style={{ display: 'flex', gap: 16 }}>
                <span className="tag">{t('mp_target', result.daily_calories)}</span>
                <span className="tag">{t('mp_days_planned', form.days)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
              {result.days?.map((d, i) => (
                <button key={i} onClick={() => setActiveDay(i)} style={{ padding: '7px 14px', borderRadius: 'var(--radius-sm)', border: `1.5px solid ${activeDay === i ? 'var(--green-700)' : 'var(--stone-200)'}`, background: activeDay === i ? 'var(--green-800)' : 'var(--white)', color: activeDay === i ? 'white' : 'var(--stone-600)', fontSize: '0.82rem', fontWeight: activeDay === i ? 600 : 400, cursor: 'pointer', transition: 'all 0.15s' }}>
                  {d.day_name || `Day ${d.day}`}
                </button>
              ))}
            </div>

            {day && (
              <div className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                  <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600 }}>{day.day_name || `Day ${day.day}`}</h3>
                  <span className="tag">{t('mp_total_cal', day.total_calories)}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  <MealCard meal={day.meals?.breakfast} name={MEAL_LABELS.breakfast} />
                  <MealCard meal={day.meals?.lunch} name={MEAL_LABELS.lunch} />
                  <MealCard meal={day.meals?.dinner} name={MEAL_LABELS.dinner} />
                  <MealCard meal={day.meals?.snack} name={MEAL_LABELS.snack} />
                </div>
              </div>
            )}

            {result.shopping_list?.length > 0 && (
              <div className="card" style={{ marginTop: 16 }}>
                <h4 style={{ fontWeight: 600, marginBottom: 12 }}>{t('mp_shopping_list')}</h4>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {result.shopping_list.map((item, i) => (
                    <span key={i} style={{ padding: '5px 12px', background: 'var(--stone-100)', borderRadius: 20, fontSize: '0.82rem', color: 'var(--stone-700)' }}>{item}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
