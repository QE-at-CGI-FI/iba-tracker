import { useState } from 'react'
import { ICONS, formatDateRange, currentYearMonth } from '../constants.js'

function newId() {
  return Math.random().toString(36).slice(2)
}

function IconPicker({ selected, onSelect }) {
  return (
    <div className="icon-picker">
      {ICONS.map(({ id, emoji, label }) => (
        <button
          key={id}
          type="button"
          className={`icon-btn${selected === emoji ? ' selected' : ''}`}
          onClick={() => onSelect(emoji)}
          title={label}
        >
          {emoji}
        </button>
      ))}
    </div>
  )
}

function StatusBadge({ completedMonth }) {
  return completedMonth
    ? <span className="status-badge completed">✓ Completed</span>
    : <span className="status-badge in-progress">● In Progress</span>
}

function AchievementCard({ achievement, onEdit, onDelete, onMarkComplete }) {
  const done = !!achievement.completedMonth
  return (
    <div className={`achievement-card${done ? ' completed' : ' in-progress'}`}>
      <button className="card-delete" onClick={onDelete} title="Delete">×</button>
      <div className="card-top">
        <span className="card-icon">{achievement.icon}</span>
        <StatusBadge completedMonth={achievement.completedMonth} />
      </div>
      <div className="card-title">{achievement.title}</div>
      <div className="card-date-range">
        {formatDateRange(achievement.startMonth, achievement.completedMonth)}
      </div>
      <div className="card-footer">
        <div className="card-people">
          {achievement.people.map(p => (
            <span key={p} className="person-badge">{p}</span>
          ))}
        </div>
      </div>
      <div className="card-actions">
        {!done && (
          <button className="btn-complete" onClick={onMarkComplete}>Mark complete</button>
        )}
        <button className="card-edit" onClick={onEdit}>Edit</button>
      </div>
    </div>
  )
}

const BLANK = {
  title: '',
  description: '',
  icon: '🚀',
  people: [],
  startMonth: currentYearMonth(),
  completedMonth: '',
}

export default function Achievements({ data, update }) {
  const { people, achievements } = data
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(BLANK)
  const [filter, setFilter] = useState('all') // 'all' | 'in-progress' | 'completed'

  function openNew() {
    setForm({ ...BLANK, startMonth: currentYearMonth() })
    setEditing(null)
    setShowForm(true)
  }

  function openEdit(achievement) {
    setForm({
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
      people: achievement.people,
      startMonth: achievement.startMonth || '',
      completedMonth: achievement.completedMonth || '',
    })
    setEditing(achievement.id)
    setShowForm(true)
  }

  function closeForm() {
    setShowForm(false)
    setEditing(null)
  }

  function togglePerson(name) {
    setForm(f => ({
      ...f,
      people: f.people.includes(name)
        ? f.people.filter(p => p !== name)
        : [...f.people, name],
    }))
  }

  function submit(e) {
    e.preventDefault()
    if (!form.title.trim() || form.people.length === 0) return
    const payload = {
      ...form,
      title: form.title.trim(),
      completedMonth: form.completedMonth || null,
    }
    if (editing) {
      update({ achievements: achievements.map(a => a.id === editing ? { ...a, ...payload } : a) })
    } else {
      update({ achievements: [...achievements, { id: newId(), createdAt: Date.now(), ...payload }] })
    }
    closeForm()
  }

  function deleteAchievement(id) {
    if (!confirm('Delete this achievement?')) return
    update({ achievements: achievements.filter(a => a.id !== id) })
  }

  function markComplete(id) {
    update({
      achievements: achievements.map(a =>
        a.id === id ? { ...a, completedMonth: currentYearMonth() } : a
      ),
    })
  }

  // Sort: in-progress first (by startMonth desc), then completed (by completedMonth desc)
  const sorted = [...achievements].sort((a, b) => {
    const aDone = !!a.completedMonth
    const bDone = !!b.completedMonth
    if (aDone !== bDone) return aDone ? 1 : -1
    const aDate = aDone ? a.completedMonth : a.startMonth
    const bDate = bDone ? b.completedMonth : b.startMonth
    return (bDate || '').localeCompare(aDate || '')
  })

  const visible = sorted.filter(a => {
    if (filter === 'in-progress') return !a.completedMonth
    if (filter === 'completed')   return !!a.completedMonth
    return true
  })

  const inProgressCount = achievements.filter(a => !a.completedMonth).length
  const completedCount  = achievements.filter(a =>  a.completedMonth).length

  return (
    <div className="achievements-page">
      <div className="achievements-header">
        <h2 className="section-title">Achievements</h2>
        <button className="btn-primary" onClick={openNew}>+ New achievement</button>
      </div>

      {achievements.length > 0 && (
        <div className="filter-bar">
          {[
            { id: 'all',         label: `All (${achievements.length})` },
            { id: 'in-progress', label: `🔄 In Progress (${inProgressCount})` },
            { id: 'completed',   label: `✓ Completed (${completedCount})` },
          ].map(f => (
            <button
              key={f.id}
              className={`filter-btn${filter === f.id ? ' active' : ''}`}
              onClick={() => setFilter(f.id)}
            >
              {f.label}
            </button>
          ))}
        </div>
      )}

      {/* Form modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeForm()}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? 'Edit achievement' : 'New achievement'}</h3>
              <button className="modal-close" onClick={closeForm}>×</button>
            </div>
            <form className="achievement-form" onSubmit={submit}>
              <div className="form-field">
                <label>Icon</label>
                <IconPicker selected={form.icon} onSelect={icon => setForm(f => ({ ...f, icon }))} />
              </div>

              <div className="form-field">
                <label>Title <span className="required">*</span></label>
                <input
                  type="text"
                  className="input"
                  placeholder="What is the team working toward?"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  required
                  maxLength={80}
                />
              </div>

              <div className="form-field">
                <label>Description</label>
                <textarea
                  className="input textarea"
                  placeholder="Tell the story of the effort…"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  maxLength={300}
                />
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label>Started <span className="required">*</span></label>
                  <input
                    type="month"
                    className="input"
                    value={form.startMonth}
                    onChange={e => setForm(f => ({ ...f, startMonth: e.target.value }))}
                    required
                  />
                </div>
                <div className="form-field">
                  <label>Completed</label>
                  <input
                    type="month"
                    className="input"
                    value={form.completedMonth}
                    onChange={e => setForm(f => ({ ...f, completedMonth: e.target.value }))}
                    min={form.startMonth || undefined}
                    placeholder="Leave blank if ongoing"
                  />
                  <span className="field-hint">Leave blank if still in progress</span>
                </div>
              </div>

              <div className="form-field">
                <label>People <span className="required">*</span></label>
                {people.length === 0 ? (
                  <p className="field-hint">Add people in the Hours tab first.</p>
                ) : (
                  <div className="people-check-list">
                    {people.map(p => (
                      <label key={p} className={`check-person${form.people.includes(p) ? ' checked' : ''}`}>
                        <input
                          type="checkbox"
                          checked={form.people.includes(p)}
                          onChange={() => togglePerson(p)}
                        />
                        {p}
                      </label>
                    ))}
                  </div>
                )}
              </div>

              <div className="form-actions">
                <button type="button" className="btn-secondary" onClick={closeForm}>Cancel</button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={!form.title.trim() || form.people.length === 0}
                >
                  {editing ? 'Save changes' : 'Add achievement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {visible.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✨</div>
          <h2>{achievements.length === 0 ? 'No achievements yet' : 'Nothing here'}</h2>
          <p>{achievements.length === 0
            ? 'When your IBA time turns into something great, capture it here!'
            : 'Try a different filter.'}</p>
        </div>
      ) : (
        <div className="cards-grid">
          {visible.map(a => (
            <AchievementCard
              key={a.id}
              achievement={a}
              onEdit={() => openEdit(a)}
              onDelete={() => deleteAchievement(a.id)}
              onMarkComplete={() => markComplete(a.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
