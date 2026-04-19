import { useState } from 'react'
import { suggestRecipes } from '../services/api'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n/translations'

function RecipeCard({ recipe, active, onClick, t }) {
  const diffMap = { Easy: 'rs_diff_easy', Medium: 'rs_diff_medium', Hard: 'rs_diff_hard' }
  const diffColor = { Easy: '#10B981', Medium: '#F59E0B', Hard: '#EF4444' }[recipe.difficulty] || '#78716C'
  const diffLabel = diffMap[recipe.difficulty] ? t(diffMap[recipe.difficulty]) : recipe.difficulty

  return (
    <div onClick={onClick} style={{ background: 'var(--white)', borderRadius: 'var(--radius-lg)', padding: '20px', border: `1.5px solid ${active ? 'var(--green-700)' : 'var(--stone-200)'}`, cursor: 'pointer', transition: 'all 0.2s', boxShadow: active ? 'var(--shadow-md)' : 'var(--shadow-sm)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
        <h4 style={{ fontFamily: 'var(--font-display)', fontSize: '1.05rem', lineHeight: 1.3, maxWidth: '70%' }}>{recipe.name}</h4>
        <span style={{ fontWeight: 700, color: 'var(--green-700)', fontSize: '0.95rem', whiteSpace: 'nowrap' }}>{recipe.calories_per_serving} kcal</span>
      </div>
      <p style={{ fontSize: '0.83rem', color: 'var(--stone-500)', marginBottom: 12, lineHeight: 1.5 }}>{recipe.description}</p>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 10 }}>
        <span style={{ fontSize: '0.75rem', padding: '2px 9px', borderRadius: 20, background: 'var(--stone-100)', color: 'var(--stone-600)' }}>{recipe.cooking_time} min</span>
        <span style={{ fontSize: '0.75rem', padding: '2px 9px', borderRadius: 20, background: `${diffColor}18`, color: diffColor, fontWeight: 600 }}>{diffLabel}</span>
        <span style={{ fontSize: '0.75rem', padding: '2px 9px', borderRadius: 20, background: 'var(--stone-100)', color: 'var(--stone-600)' }}>{recipe.servings} {t('rs_servings')}</span>
      </div>
      <div style={{ display: 'flex', gap: 10 }}>
        {[['P', recipe.macros?.protein, '#3B82F6'], ['C', recipe.macros?.carbs, '#F59E0B'], ['F', recipe.macros?.fat, '#EF4444']].map(([l, v, c]) => (
          <span key={l} style={{ fontSize: '0.72rem', color: c, fontWeight: 600 }}>{l} {v}g</span>
        ))}
        <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 4 }}>
          <div style={{ width: 40, height: 4, background: 'var(--stone-100)', borderRadius: 2, overflow: 'hidden' }}>
            <div style={{ width: `${recipe.health_score}%`, height: '100%', background: 'var(--green-500)' }} />
          </div>
          <span style={{ fontSize: '0.7rem', color: 'var(--stone-400)' }}>{recipe.health_score}</span>
        </div>
      </div>
    </div>
  )
}

export default function RecipeSuggester() {
  const { lang } = useApp()
  const t = useT(lang)

  const CUISINES = [
    { value: 'any', labelKey: 'rs_cuisine_any' },
    { value: 'vietnamese', labelKey: 'rs_cuisine_vi' },
    { value: 'italian', labelKey: 'rs_cuisine_it' },
    { value: 'japanese', labelKey: 'rs_cuisine_jp' },
    { value: 'mediterranean', labelKey: 'rs_cuisine_med' },
    { value: 'american', labelKey: 'rs_cuisine_us' },
    { value: 'thai', labelKey: 'rs_cuisine_th' },
    { value: 'chinese', labelKey: 'rs_cuisine_cn' },
  ]
  const GOALS = [
    { value: 'healthy', labelKey: 'rs_goal_healthy' },
    { value: 'high_protein', labelKey: 'rs_goal_protein' },
    { value: 'low_carb', labelKey: 'rs_goal_lowcarb' },
    { value: 'weight_loss', labelKey: 'rs_goal_loss' },
  ]

  const [ingredients, setIngredients] = useState('')
  const [form, setForm] = useState({ cuisine: 'any', goal: 'healthy', max_time: 30 })
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [activeRecipe, setActiveRecipe] = useState(0)

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }))

  const handleSuggest = async () => {
    const ingredientList = ingredients.split(',').map(s => s.trim()).filter(Boolean)
    if (!ingredientList.length) { setError(t('rs_error_no_ingredients')); return }
    setLoading(true)
    setError(null)
    try {
      const data = await suggestRecipes({ ingredients: ingredientList, ...form, max_time: parseInt(form.max_time) })
      setResult(data.data)
      setActiveRecipe(0)
    } catch (e) {
      setError(e.response?.data?.detail || t('rs_error'))
    } finally {
      setLoading(false)
    }
  }

  const recipe = result?.recipes?.[activeRecipe]

  return (
    <div>
      <div className="page-header">
        <h2 className="section-title">{t('rs_title')}</h2>
        <p className="section-subtitle">{t('rs_subtitle')}</p>
      </div>

      <div className="card" style={{ marginBottom: 24 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.8fr auto', gap: 16, alignItems: 'end' }} className="rs-form-grid">
          <div style={{ gridColumn: '1 / -1' }}>
            <label className="label">{t('rs_ingredients_label')}</label>
            <textarea className="input" rows={2} placeholder={t('rs_ingredients_placeholder')} value={ingredients} onChange={e => setIngredients(e.target.value)} style={{ resize: 'vertical' }} />
          </div>
          <div>
            <label className="label">{t('rs_cuisine')}</label>
            <select className="select" value={form.cuisine} onChange={e => set('cuisine', e.target.value)}>
              {CUISINES.map(c => <option key={c.value} value={c.value}>{t(c.labelKey)}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{t('rs_goal')}</label>
            <select className="select" value={form.goal} onChange={e => set('goal', e.target.value)}>
              {GOALS.map(g => <option key={g.value} value={g.value}>{t(g.labelKey)}</option>)}
            </select>
          </div>
          <div>
            <label className="label">{t('rs_max_time', form.max_time)}</label>
            <input type="range" min={10} max={90} step={5} value={form.max_time} onChange={e => set('max_time', e.target.value)} style={{ width: '100%', accentColor: 'var(--green-700)', marginTop: 6 }} />
          </div>
          <button className="btn-primary" onClick={handleSuggest} disabled={loading} style={{ whiteSpace: 'nowrap', alignSelf: 'end', padding: '12px 24px' }}>
            {loading ? t('rs_btn_finding') : t('rs_btn_find')}
          </button>
        </div>

        {error && <div style={{ marginTop: 12, padding: '10px 14px', background: '#FEF2F2', borderRadius: 'var(--radius-sm)', color: '#B91C1C', fontSize: '0.85rem' }}>{error}</div>}
        {loading && <div style={{ textAlign: 'center', marginTop: 20 }}><div className="loading-spinner" /><p style={{ color: 'var(--stone-500)', fontSize: '0.85rem', marginTop: 8 }}>{t('rs_finding_hint')}</p></div>}
      </div>

      {result && (
        <div className="fade-in rs-results-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {result.recipes?.map((r, i) => (
              <RecipeCard key={i} recipe={r} active={activeRecipe === i} onClick={() => setActiveRecipe(i)} t={t} />
            ))}
            {result.nutrition_tip && (
              <div style={{ padding: '16px 20px', background: 'var(--green-50)', borderRadius: 'var(--radius-md)', borderLeft: '3px solid var(--green-600)' }}>
                <p style={{ fontSize: '0.85rem', color: 'var(--green-800)', lineHeight: 1.6, fontStyle: 'italic' }}>{result.nutrition_tip}</p>
              </div>
            )}
          </div>

          {recipe && (
            <div>
              <div className="card" style={{ marginBottom: 16 }}>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.4rem', marginBottom: 6 }}>{recipe.name}</h3>
                <p style={{ color: 'var(--stone-500)', fontSize: '0.9rem', marginBottom: 16, lineHeight: 1.6 }}>{recipe.description}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
                  {recipe.tags?.map(tag => <span key={tag} className="tag">{tag}</span>)}
                </div>

                <h4 style={{ fontWeight: 600, marginBottom: 10 }}>{t('rs_ingredients_section')}</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, marginBottom: 20 }}>
                  {recipe.ingredients?.map((ing, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0', borderBottom: '1px solid var(--stone-100)' }}>
                      <div style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green-500)', flexShrink: 0 }} />
                      <span style={{ fontSize: '0.85rem', color: 'var(--stone-700)' }}>{ing}</span>
                    </div>
                  ))}
                </div>

                <h4 style={{ fontWeight: 600, marginBottom: 10 }}>{t('rs_instructions')}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {recipe.instructions?.map((step, i) => (
                    <div key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                      <div style={{ minWidth: 26, height: 26, borderRadius: '50%', background: 'var(--green-800)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.72rem', fontWeight: 700, flexShrink: 0 }}>{i + 1}</div>
                      <p style={{ fontSize: '0.88rem', color: 'var(--stone-700)', lineHeight: 1.6, paddingTop: 3 }}>{step}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="card">
                <h4 style={{ fontWeight: 600, marginBottom: 10 }}>{t('rs_health_benefits')}</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {recipe.health_benefits?.map((b, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
                      <div style={{ width: 16, height: 16, borderRadius: '50%', background: 'var(--green-100)', color: 'var(--green-700)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.55rem', fontWeight: 700, flexShrink: 0, marginTop: 2 }}>✓</div>
                      <p style={{ fontSize: '0.85rem', color: 'var(--stone-600)', lineHeight: 1.5 }}>{b}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
