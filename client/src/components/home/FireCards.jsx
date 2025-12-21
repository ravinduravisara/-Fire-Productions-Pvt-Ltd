import { useState } from 'react'

export default function FireCards({ items = [] }) {
  const [expandedIds, setExpandedIds] = useState(() => new Set())

  const toggleExpanded = (id) => {
    if (!id) return
    setExpandedIds((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  if (!items.length) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="h-40 rounded-lg bg-surface animate-pulse" />
        ))}
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {items.map((w) => (
          <a key={w._id || w.id} href={w.link || '#'} target="_blank" rel="noreferrer"
            className="group rounded-lg overflow-hidden border border-border/60 hover:shadow-lg transition-shadow bg-surface">
          {(() => {
            const apiBase = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'
            const filesBase = apiBase.replace(/\/api$/, '')
            const list = Array.isArray(w.imageUrls) && w.imageUrls.length
              ? w.imageUrls
              : [w.imageUrl || w.image || w.url].filter(Boolean)

            if (list.length <= 1) {
              const raw = list[0] || ''
              const imageSrc = raw ? (String(raw).startsWith('http') ? raw : `${filesBase}${raw}`) : ''
              return (
                <div className="aspect-video bg-surface" style={{ backgroundImage: `url(${imageSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
              )
            }

            const six = list.slice(0, 6)
            return (
              <div className="grid grid-cols-3 gap-0.5 bg-surface">
                {six.map((raw, idx) => {
                  const src = String(raw).startsWith('http') ? raw : `${filesBase}${raw}`
                  return (
                    <div key={raw + idx} className="relative pt-[56%] bg-surface">
                      <img src={src} alt="project" className="absolute inset-0 h-full w-full object-cover" />
                    </div>
                  )
                })}
              </div>
            )
          })()}
          <div className="p-4">
            <h3 className="font-medium group-hover:text-brand-600 text-text">{w.title}</h3>
            {w.description ? (() => {
              const id = w._id || w.id || w.title
              const isExpanded = id ? expandedIds.has(id) : false
              const showToggle = String(w.description || '').trim().length > 140

              return (
                <div className="mt-1">
                  <p
                    className={[
                      'text-sm text-muted',
                      isExpanded
                        ? ''
                        : 'overflow-hidden [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:3]',
                    ].join(' ')}
                  >
                    {w.description}
                  </p>

                  {showToggle ? (
                    <button
                      type="button"
                      className="mt-1 text-xs font-semibold text-brand-600 hover:underline"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        toggleExpanded(id)
                      }}
                    >
                      {isExpanded ? 'Less' : 'More'}
                    </button>
                  ) : null}
                </div>
              )
            })() : null}
            {w.tags?.length ? (
              <div className="mt-2 flex flex-wrap gap-2 text-xs text-muted">
                {w.tags.map((t) => (<span key={t} className="px-2 py-0.5 rounded-full bg-background/60 border border-border/40">{t}</span>))}
              </div>
            ) : null}
          </div>
        </a>
      ))}
    </div>
  )
}