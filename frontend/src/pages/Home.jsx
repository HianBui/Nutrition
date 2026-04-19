import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { useT } from '../i18n/translations'

export default function Home() {
  const { lang } = useApp()
  const t = useT(lang)

  const FEATURES = [
    { to: '/analyze', icon: '◎', titleKey: 'feat_scan_title', descKey: 'feat_scan_desc', color: '#D8F3DC' },
    { to: '/meal-plan', icon: '▤', titleKey: 'feat_meal_title', descKey: 'feat_meal_desc', color: '#FFF0EB' },
    { to: '/health', icon: '◈', titleKey: 'feat_health_title', descKey: 'feat_health_desc', color: '#E8F4FD' },
    { to: '/recipes', icon: '◇', titleKey: 'feat_recipe_title', descKey: 'feat_recipe_desc', color: '#FEF9C3' },
  ]

  const STATS = [
    { value: '4', labelKey: 'stat_features' },
    { value: '100+', labelKey: 'stat_nutrients' },
    { value: t('stat_free'), labelKey: 'stat_usage' },
    { value: t('stat_fast'), labelKey: 'stat_speed' },
  ]

  const HOW_STEPS = [
    { step: '01', titleKey: 'how_step1_title', descKey: 'how_step1_desc' },
    { step: '02', titleKey: 'how_step2_title', descKey: 'how_step2_desc' },
    { step: '03', titleKey: 'how_step3_title', descKey: 'how_step3_desc' },
  ]

  return (
    <div>
      <div className="hero">
        <p className="hero-label">{t('hero_label')}</p>
        <h1>{t('hero_title')}</h1>
        <p>{t('hero_desc')}</p>
      </div>

      <div className="feature-grid" style={{ marginBottom: 32 }}>
        {FEATURES.map(f => (
          <Link key={f.to} to={f.to} className="feature-card">
            <div className="feature-icon" style={{ background: f.color }}>
              <span style={{ fontSize: '1.4rem' }}>{f.icon}</span>
            </div>
            <h3>{t(f.titleKey)}</h3>
            <p>{t(f.descKey)}</p>
          </Link>
        ))}
      </div>

      <div className="grid-4" style={{ marginBottom: 40 }}>
        {STATS.map(s => (
          <div key={s.labelKey} className="stat-box">
            <div className="value">{s.value}</div>
            <div className="label">{t(s.labelKey)}</div>
          </div>
        ))}
      </div>

      <div className="card" style={{ background: 'linear-gradient(135deg, var(--green-50), var(--white))' }}>
        <h2 className="section-title" style={{ marginBottom: 10 }}>{t('how_title')}</h2>
        <p className="section-subtitle">{t('how_subtitle')}</p>
        <div className="grid-3">
          {HOW_STEPS.map(s => (
            <div key={s.step} style={{ padding: '20px 0' }}>
              <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', color: 'var(--green-400)', marginBottom: 10 }}>{s.step}</div>
              <h3 style={{ fontFamily: 'var(--font-body)', fontWeight: 600, marginBottom: 6 }}>{t(s.titleKey)}</h3>
              <p style={{ color: 'var(--stone-500)', fontSize: '0.9rem', lineHeight: 1.6 }}>{t(s.descKey)}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
