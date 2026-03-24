import { useState } from 'react'
import { PERSON_COLORS, formatMonth, currentYearMonth } from '../constants.js'

function personColor(people, name) {
  const idx = people.indexOf(name)
  return PERSON_COLORS[idx % PERSON_COLORS.length]
}

function newId() {
  return Math.random().toString(36).slice(2)
}

export default function TimeTracker({ data, update }) {
  const { people, entries } = data

  const [newName, setNewName] = useState('')
  const [entryPerson, setEntryPerson] = useState('')
  const [entryMonth, setEntryMonth] = useState(currentYearMonth())
  const [entryHours, setEntryHours] = useState('')

  function addPerson(e) {
    e.preventDefault()
    const name = newName.trim()
    if (!name || people.includes(name)) return
    update({ people: [...people, name] })
    setNewName('')
    if (!entryPerson) setEntryPerson(name)
  }

  function removePerson(name) {
    if (!confirm(`Remove ${name}? Their logged hours will also be deleted.`)) return
    update({
      people: people.filter(p => p !== name),
      entries: entries.filter(e => e.person !== name),
    })
  }

  function logHours(e) {
    e.preventDefault()
    const hours = parseFloat(entryHours)
    if (!entryPerson || !entryMonth || isNaN(hours) || hours <= 0) return
    update({
      entries: [...entries, {
        id: newId(),
        person: entryPerson,
        month: entryMonth,
        hours,
      }],
    })
    setEntryHours('')
  }

  function deleteEntry(id) {
    update({ entries: entries.filter(e => e.id !== id) })
  }

  // Group entries by month desc, then by person
  const sorted = [...entries].sort((a, b) =>
    b.month.localeCompare(a.month) || a.person.localeCompare(b.person)
  )

  // Summary: month x person totals
  const months = [...new Set(entries.map(e => e.month))].sort().reverse()
  const summary = months.map(month => {
    const row = { month }
    people.forEach(p => {
      row[p] = entries
        .filter(e => e.person === p && e.month === month)
        .reduce((s, e) => s + e.hours, 0)
    })
    row._total = people.reduce((s, p) => s + (row[p] || 0), 0)
    return row
  })

  return (
    <div className="tracker">
      {/* People management */}
      <section className="tracker-section">
        <h2 className="section-title">Team</h2>
        <form className="add-form" onSubmit={addPerson}>
          <input
            type="text"
            placeholder="First name"
            value={newName}
            onChange={e => setNewName(e.target.value)}
            className="input"
            maxLength={30}
          />
          <button type="submit" className="btn-primary">Add person</button>
        </form>
        {people.length > 0 && (
          <div className="people-chips">
            {people.map(p => (
              <div key={p} className="person-chip"
                style={{ borderColor: personColor(people, p) }}>
                <span className="chip-dot" style={{ background: personColor(people, p) }} />
                <span>{p}</span>
                <button className="chip-remove" onClick={() => removePerson(p)}
                  title={`Remove ${p}`}>×</button>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Log hours */}
      {people.length > 0 && (
        <section className="tracker-section">
          <h2 className="section-title">Log IBA Hours</h2>
          <form className="log-form" onSubmit={logHours}>
            <select
              value={entryPerson}
              onChange={e => setEntryPerson(e.target.value)}
              className="input"
              required
            >
              <option value="">Select person…</option>
              {people.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            <input
              type="month"
              value={entryMonth}
              onChange={e => setEntryMonth(e.target.value)}
              className="input"
              required
            />
            <input
              type="number"
              placeholder="Hours"
              value={entryHours}
              onChange={e => setEntryHours(e.target.value)}
              className="input input-hours"
              min="0.5"
              max="744"
              step="0.5"
              required
            />
            <button type="submit" className="btn-primary">Log</button>
          </form>
        </section>
      )}

      {/* Monthly summary table */}
      {summary.length > 0 && (
        <section className="tracker-section">
          <h2 className="section-title">Monthly Summary</h2>
          <div className="table-scroll">
            <table className="summary-table">
              <thead>
                <tr>
                  <th>Month</th>
                  {people.map(p => (
                    <th key={p}>
                      <span className="th-dot" style={{ background: personColor(people, p) }} />
                      {p}
                    </th>
                  ))}
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {summary.map(row => (
                  <tr key={row.month}>
                    <td className="month-cell">{formatMonth(row.month)}</td>
                    {people.map(p => (
                      <td key={p} className="hours-cell">
                        {row[p] ? `${row[p]}h` : '—'}
                      </td>
                    ))}
                    <td className="total-cell">{row._total}h</td>
                  </tr>
                ))}
                {/* Cumulative totals row */}
                <tr className="cumulative-row">
                  <td>Cumulative</td>
                  {people.map(p => {
                    const tot = entries.filter(e => e.person === p).reduce((s, e) => s + e.hours, 0)
                    return <td key={p} className="hours-cell">{tot}h</td>
                  })}
                  <td className="total-cell">{entries.reduce((s, e) => s + e.hours, 0)}h</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* Individual entries */}
      {sorted.length > 0 && (
        <section className="tracker-section">
          <h2 className="section-title">All Entries</h2>
          <div className="entries-list">
            {sorted.map(entry => (
              <div key={entry.id} className="entry-row">
                <span className="entry-dot" style={{ background: personColor(people, entry.person) }} />
                <span className="entry-person">{entry.person}</span>
                <span className="entry-month">{formatMonth(entry.month)}</span>
                <span className="entry-hours">{entry.hours}h</span>
                <button className="entry-delete" onClick={() => deleteEntry(entry.id)} title="Delete">×</button>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
