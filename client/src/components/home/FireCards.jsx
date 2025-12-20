export default function FireCards({ items = [] }) {
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
            const raw = w.imageUrl || w.image || w.url || ''
            const imageSrc = raw ? (String(raw).startsWith('http') ? raw : `${filesBase}${raw}`) : ''
            return (
              <div className="aspect-video bg-surface" style={{ backgroundImage: `url(${imageSrc})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
            )
          })()}
          <div className="p-4">
            <h3 className="font-medium group-hover:text-brand-600 text-text">{w.title}</h3>
            {w.description ? (
              <p className="mt-1 text-sm text-muted">{w.description}</p>
            ) : null}
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