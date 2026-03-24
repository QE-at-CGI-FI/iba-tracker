export const ICONS = [
  { id: 'rocket',    emoji: '🚀', label: 'Rocket'     },
  { id: 'star',      emoji: '⭐', label: 'Star'        },
  { id: 'trophy',    emoji: '🏆', label: 'Trophy'      },
  { id: 'lightbulb', emoji: '💡', label: 'Lightbulb'  },
  { id: 'target',    emoji: '🎯', label: 'Target'      },
  { id: 'diamond',   emoji: '💎', label: 'Diamond'     },
  { id: 'lightning', emoji: '⚡', label: 'Lightning'   },
  { id: 'seedling',  emoji: '🌱', label: 'Growth'      },
  { id: 'fire',      emoji: '🔥', label: 'Fire'        },
  { id: 'puzzle',    emoji: '🧩', label: 'Puzzle'      },
  { id: 'sparkle',   emoji: '✨', label: 'Sparkle'     },
  { id: 'chart',     emoji: '📈', label: 'Chart'       },
  { id: 'handshake', emoji: '🤝', label: 'Teamwork'    },
  { id: 'brain',     emoji: '🧠', label: 'Learning'    },
  { id: 'medal',     emoji: '🥇', label: 'First Place' },
  { id: 'unicorn',   emoji: '🦄', label: 'Unicorn'     },
]

export const PERSON_COLORS = [
  '#6366f1', '#f59e0b', '#10b981', '#ef4444',
  '#8b5cf6', '#06b6d4', '#f97316', '#84cc16',
  '#ec4899', '#14b8a6', '#a78bfa', '#fb7185',
]

export const STORAGE_KEY = 'iba-tracker-v1'

export function formatMonth(yearMonth) {
  if (!yearMonth) return ''
  const [year, month] = yearMonth.split('-')
  const d = new Date(Number(year), Number(month) - 1)
  return d.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
}

export function currentYearMonth() {
  return new Date().toISOString().slice(0, 7)
}

export function formatDateRange(startMonth, completedMonth) {
  const start = formatMonth(startMonth)
  if (!completedMonth) return `${start} → ongoing`
  if (startMonth === completedMonth) return start
  return `${start} → ${formatMonth(completedMonth)}`
}
