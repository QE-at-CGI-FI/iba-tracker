import { useState, useEffect } from 'react'
import { STORAGE_KEY } from './constants.js'
import Dashboard from './components/Dashboard.jsx'
import TimeTracker from './components/TimeTracker.jsx'
import Achievements from './components/Achievements.jsx'

const DEFAULT_DATA = {
  people: [],
  entries: [],
  achievements: [],
}

function migrate(data) {
  return {
    ...data,
    achievements: (data.achievements || []).map(a => {
      if (!a.startMonth) {
        // Legacy: single `month` field — treat as a point-in-time completed achievement
        return { ...a, startMonth: a.month || '', completedMonth: a.month || null }
      }
      return a
    }),
  }
}

function loadData() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? migrate({ ...DEFAULT_DATA, ...JSON.parse(raw) }) : DEFAULT_DATA
  } catch {
    return DEFAULT_DATA
  }
}

export default function App() {
  const [data, setData] = useState(loadData)
  const [tab, setTab] = useState('dashboard')

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  }, [data])

  function update(patch) {
    setData(d => ({ ...d, ...patch }))
  }

  const tabs = [
    { id: 'dashboard',    label: '📊 Dashboard' },
    { id: 'tracker',      label: '🕐 Hours'     },
    { id: 'achievements', label: '🏆 Achievements' },
  ]

  return (
    <div className="app">
      <header className="app-header">
        <div className="header-inner">
          <div className="brand">
            <span className="brand-iba">IBA</span>
            <div className="brand-taglines">
              <span className="tagline-idle">In Between Assignments</span>
              <span className="tagline-arrow">→</span>
              <span className="tagline-active">Investment Blueprint Accelerator</span>
            </div>
          </div>
          <nav className="tab-nav">
            {tabs.map(t => (
              <button
                key={t.id}
                className={`tab-btn${tab === t.id ? ' active' : ''}`}
                onClick={() => setTab(t.id)}
              >
                {t.label}
              </button>
            ))}
          </nav>
        </div>
      </header>

      <main className="app-main">
        {tab === 'dashboard'    && <Dashboard    data={data} />}
        {tab === 'tracker'      && <TimeTracker  data={data} update={update} />}
        {tab === 'achievements' && <Achievements data={data} update={update} />}
      </main>
    </div>
  )
}
