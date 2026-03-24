import { useState } from 'react'
import { ICONS, formatMonth, currentYearMonth } from '../constants.js'

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

function AchievementCard({ achievement, people, onEdit, onDelete }) {
  return (
    <div className="achievement-card">
      <button className="card-delete" onClick={onDelete} title="Delete">×</button>
      <div className="card-icon">{achievement.icon}</div>
      <div className="card-title">{achievement.title}</div>
      {achievement.description && (
        <div className="card-desc">{achievement.description}</div>
      )}
      <div className="card-footer">
        <div className="card-people">
          {achievement.people.map(p => (
            <span key={p} className="person-badge">{p}</span>
          ))}
        </div>
        <div className="card-date">{formatMonth(achievement.month)}</div>
      </div>
      <button className="card-edit" onClick={onEdit}>Edit</button>
    </div>
  )
}

const BLANK = {
  title: '',
  description: '',
  icon: '🚀',
  people: [],
  month: currentYearMonth(),
}

export default function Achievements({ data, update }) {
  const { people, achievements } = data
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null) // achievement id
  const [form, setForm] = useState(BLANK)

  function openNew() {
    setForm({ ...BLANK, month: currentYearMonth() })
    setEditing(null)
    setShowForm(true)
  }

  function openEdit(achievement) {
    setForm({
      title: achievement.title,
      description: achievement.description,
      icon: achievement.icon,
      people: achievement.people,
      month: achievement.month,
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

    if (editing) {
      update({
        achievements: achievements.map(a =>
          a.id === editing ? { ...a, ...form, title: form.title.trim() } : a
        ),
      })
    } else {
      update({
        achievements: [...achievements, {
          id: newId(),
          createdAt: Date.now(),
          ...form,
          title: form.title.trim(),
        }],
      })
    }
    closeForm()
  }

  function deleteAchievement(id) {
    if (!confirm('Delete this achievement?')) return
    update({ achievements: achievements.filter(a => a.id !== id) })
  }

  const sorted = [...achievements].sort((a, b) =>
    (b.month || '').localeCompare(a.month || '') || (b.createdAt || 0) - (a.createdAt || 0)
  )

  return (
    <div className="achievements-page">
      <div className="achievements-header">
        <h2 className="section-title">Achievements</h2>
        <button className="btn-primary" onClick={openNew}>+ New achievement</button>
      </div>

      {/* Form modal */}
      {showForm && (
        <div className="modal-overlay" onClick={e => e.target === e.currentTarget && closeForm()}>
          <div className="modal">
            <div className="modal-header">
              <h3>{editing ? 'Edit achievement' : 'New achievement'}</h3>
              <button className="modal-close" onClick={closeForm}>×</button>
            </div>
            <form className="achievement-form" onSubmit={submit}>
              {/* Icon picker */}
              <div className="form-field">
                <label>Icon</label>
                <IconPicker selected={form.icon} onSelect={icon => setForm(f => ({ ...f, icon }))} />
              </div>

              {/* Title */}
              <div className="form-field">
                <label>Title <span className="required">*</span></label>
                <input
                  type="text"
                  className="input"
                  placeholder="What did the team accomplish?"
                  value={form.title}
                  onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                  required
                  maxLength={80}
                />
              </div>

              {/* Description */}
              <div className="form-field">
                <label>Description</label>
                <textarea
                  className="input textarea"
                  placeholder="Tell the story…"
                  value={form.description}
                  onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                  rows={3}
                  maxLength={300}
                />
              </div>

              {/* Month */}
              <div className="form-field">
                <label>Month</label>
                <input
                  type="month"
                  className="input"
                  value={form.month}
                  onChange={e => setForm(f => ({ ...f, month: e.target.value }))}
                />
              </div>

              {/* People */}
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

      {/* Cards grid */}
      {sorted.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">✨</div>
          <h2>No achievements yet</h2>
          <p>When your IBA time turns into something great, capture it here!</p>
        </div>
      ) : (
        <div className="cards-grid">
          {sorted.map(a => (
            <AchievementCard
              key={a.id}
              achievement={a}
              people={people}
              onEdit={() => openEdit(a)}
              onDelete={() => deleteAchievement(a.id)}
            />
          ))}
        </div>
      )}
    </div>
  )
}
