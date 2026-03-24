import { PERSON_COLORS, formatMonth, currentYearMonth } from '../constants.js'

function personColor(people, name) {
  const idx = people.indexOf(name)
  return PERSON_COLORS[idx % PERSON_COLORS.length]
}

function CumulativeChart({ people, entries }) {
  if (people.length === 0 || entries.length === 0) return null

  const months = [...new Set(entries.map(e => e.month))].sort()
  if (months.length === 0) return null

  const W = 640, H = 220
  const PAD = { top: 16, right: 24, bottom: 36, left: 44 }
  const cw = W - PAD.left - PAD.right
  const ch = H - PAD.top - PAD.bottom

  // Running totals per person
  const series = people.map(person => {
    let running = 0
    const points = months.map((month, i) => {
      running += entries
        .filter(e => e.person === person && e.month === month)
        .reduce((s, e) => s + e.hours, 0)
      return { i, v: running }
    })
    return { person, points }
  })

  const maxVal = Math.max(...series.flatMap(s => s.points.map(p => p.v)), 1)
  const xScale = i => PAD.left + (months.length === 1 ? cw / 2 : (i / (months.length - 1)) * cw)
  const yScale = v => PAD.top + ch - (v / maxVal) * ch

  const ticks = [0, 0.25, 0.5, 0.75, 1].map(t => Math.round(maxVal * t))

  return (
    <div className="chart-wrap">
      <svg viewBox={`0 0 ${W} ${H}`} className="cumulative-chart">
        {/* Grid lines */}
        {ticks.map(t => (
          <g key={t}>
            <line
              x1={PAD.left} y1={yScale(t)}
              x2={W - PAD.right} y2={yScale(t)}
              stroke="#e2e8f0" strokeWidth="1"
            />
            <text x={PAD.left - 6} y={yScale(t)} textAnchor="end"
              dominantBaseline="middle" fontSize="10" fill="#94a3b8">
              {t}h
            </text>
          </g>
        ))}

        {/* X axis labels */}
        {months.map((m, i) => (
          <text key={m} x={xScale(i)} y={H - 6}
            textAnchor="middle" fontSize="10" fill="#94a3b8">
            {m.slice(5)}/{m.slice(2, 4)}
          </text>
        ))}

        {/* Lines per person */}
        {series.map(({ person, points }) => {
          const color = personColor(people, person)
          const pts = points.map(p => `${xScale(p.i)},${yScale(p.v)}`).join(' ')
          return (
            <g key={person}>
              {points.length > 1
                ? <polyline points={pts} fill="none" stroke={color}
                    strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
                : null}
              {points.map(p => (
                <circle key={p.i} cx={xScale(p.i)} cy={yScale(p.v)} r="4"
                  fill={color} stroke="white" strokeWidth="1.5" />
              ))}
            </g>
          )
        })}
      </svg>

      {/* Legend */}
      <div className="chart-legend">
        {people.map(p => (
          <span key={p} className="legend-item">
            <span className="legend-dot" style={{ background: personColor(people, p) }} />
            {p}
          </span>
        ))}
      </div>
    </div>
  )
}

function CumulativeBars({ people, entries }) {
  if (people.length === 0) return null

  const totals = people.map(p => ({
    person: p,
    total: entries.filter(e => e.person === p).reduce((s, e) => s + e.hours, 0),
  })).sort((a, b) => b.total - a.total)

  const max = Math.max(...totals.map(t => t.total), 1)

  return (
    <div className="bar-list">
      {totals.map(({ person, total }) => (
        <div key={person} className="bar-row">
          <span className="bar-name">{person}</span>
          <div className="bar-track">
            <div
              className="bar-fill"
              style={{
                width: `${(total / max) * 100}%`,
                background: personColor(people, person),
              }}
            />
          </div>
          <span className="bar-val">{total}h</span>
        </div>
      ))}
    </div>
  )
}

export default function Dashboard({ data }) {
  const { people, entries, achievements } = data
  const thisMonth = currentYearMonth()

  const hoursThisMonth = entries
    .filter(e => e.month === thisMonth)
    .reduce((s, e) => s + e.hours, 0)

  const totalHours = entries.reduce((s, e) => s + e.hours, 0)

  const recentAchievements = [...achievements]
    .sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
    .slice(0, 3)

  return (
    <div className="dashboard">
      {/* Stat cards */}
      <div className="stat-row">
        <div className="stat-card">
          <div className="stat-icon">👥</div>
          <div className="stat-value">{people.length}</div>
          <div className="stat-label">Team members</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-value">{hoursThisMonth}h</div>
          <div className="stat-label">{formatMonth(thisMonth)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">⏱️</div>
          <div className="stat-value">{totalHours}h</div>
          <div className="stat-label">Total IBA hours</div>
        </div>
        <div className="stat-card accent">
          <div className="stat-icon">🏆</div>
          <div className="stat-value">{achievements.length}</div>
          <div className="stat-label">Achievements</div>
        </div>
      </div>

      {people.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">🌱</div>
          <h2>Ready to track some IBA time?</h2>
          <p>Start by adding people in the <strong>Hours</strong> tab, then log time and celebrate achievements!</p>
        </div>
      ) : (
        <>
          {entries.length > 0 && (
            <section className="dashboard-section">
              <h2 className="section-title">Cumulative IBA Hours</h2>
              <CumulativeBars people={people} entries={entries} />
              {[...new Set(entries.map(e => e.month))].length > 1 && (
                <>
                  <h2 className="section-title" style={{ marginTop: '1.5rem' }}>Growth Over Time</h2>
                  <CumulativeChart people={people} entries={entries} />
                </>
              )}
            </section>
          )}

          {recentAchievements.length > 0 && (
            <section className="dashboard-section">
              <h2 className="section-title">Recent Achievements</h2>
              <div className="mini-achievements">
                {recentAchievements.map(a => (
                  <div key={a.id} className="mini-card">
                    <span className="mini-icon">{a.icon}</span>
                    <div>
                      <div className="mini-title">{a.title}</div>
                      <div className="mini-meta">{formatMonth(a.month)} · {a.people.join(', ')}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
