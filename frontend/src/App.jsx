import { useState } from 'react'
import { BrowserRouter, Routes, Route, NavLink } from 'react-router-dom'
import './App.css'
import Home from './pages/Home'
import FoodAnalyzer from './pages/FoodAnalyzer'
import MealPlan from './pages/MealPlan'
import HealthAnalysis from './pages/HealthAnalysis'
import RecipeSuggester from './pages/RecipeSuggester'
import { AppProvider, useApp } from './context/AppContext'
import { useT } from './i18n/translations'

function Nav() {
  const { theme, toggleTheme, lang, toggleLang } = useApp()
  const t = useT(lang)
  const [menuOpen, setMenuOpen] = useState(false)

  const NAV_ITEMS = [
    { to: '/', label: t('nav_home'), end: true },
    { to: '/analyze', label: t('nav_scan') },
    { to: '/meal-plan', label: t('nav_meal') },
    { to: '/health', label: t('nav_health') },
    { to: '/recipes', label: t('nav_recipes') },
  ]

  return (
    <nav className="nav">
      <div className="nav-inner">
        <NavLink to="/" className="nav-logo">
          <div className="nav-logo-mark">N</div>
          <span className="nav-logo-text">Nutrition AI</span>
        </NavLink>
        <ul className="nav-links">
          {NAV_ITEMS.map(item => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
              >
                {item.label}
              </NavLink>
            </li>
          ))}
        </ul>
        <div className="nav-controls">
          <button
            className="nav-toggle-btn lang-toggle"
            onClick={toggleLang}
            title={lang === 'en' ? 'Chuyển sang Tiếng Việt' : 'Switch to English'}
          >
            <span className="toggle-flag">{lang === 'en' ? '🇻🇳' : '🇺🇸'}</span>
            <span className="toggle-label">{lang === 'en' ? 'VI' : 'EN'}</span>
          </button>

          <button
            className="nav-toggle-btn theme-toggle"
            onClick={toggleTheme}
            title={theme === 'light' ? 'Chế độ tối' : 'Chế độ sáng'}
          >
            {theme === 'light' ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/>
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            )}
          </button>

          {/* Hamburger - mobile only */}
          <button
            className="nav-toggle-btn nav-hamburger"
            onClick={() => setMenuOpen(o => !o)}
            aria-label="Menu"
          >
            {menuOpen ? (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
            ) : (
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="nav-mobile-menu">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              className={({ isActive }) => `nav-mobile-link${isActive ? ' active' : ''}`}
              onClick={() => setMenuOpen(false)}
            >
              {item.label}
            </NavLink>
          ))}
        </div>
      )}
    </nav>
  )
}

function AppContent() {
  return (
    <BrowserRouter>
      <div className="app">
        <Nav />
        <main className="main">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/analyze" element={<FoodAnalyzer />} />
            <Route path="/meal-plan" element={<MealPlan />} />
            <Route path="/health" element={<HealthAnalysis />} />
            <Route path="/recipes" element={<RecipeSuggester />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  )
}
