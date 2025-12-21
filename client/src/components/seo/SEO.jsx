import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'

function stripTrailingSlash(url) {
  return typeof url === 'string' ? url.replace(/\/+$/, '') : url
}

function getSiteUrl() {
  const fromEnv = stripTrailingSlash(import.meta.env.VITE_SITE_URL)
  if (fromEnv) return fromEnv
  if (typeof window !== 'undefined' && window.location?.origin) return window.location.origin
  return ''
}

function joinUrl(base, pathname) {
  const safeBase = stripTrailingSlash(base)
  if (!safeBase) return ''
  if (!pathname || pathname === '/') return safeBase
  return `${safeBase}${pathname.startsWith('/') ? '' : '/'}${pathname}`
}

const DEFAULTS = {
  siteName: 'Fire Productions',
  description:
    'Fire Productions — Music, Acoustic, Entertainment & Film production. Story-led visuals and studio-grade sound.',
  ogType: 'website',
}

export default function SEO({
  title,
  description,
  canonical,
  path,
  noindex = false,
  ogType = DEFAULTS.ogType,
  jsonLd,
}) {
  const location = useLocation()
  const siteUrl = getSiteUrl()
  const pathname = typeof path === 'string' ? path : location.pathname

  const pageTitle = title?.trim() || DEFAULTS.siteName
  const fullTitle = pageTitle.includes(DEFAULTS.siteName)
    ? pageTitle
    : `${pageTitle} | ${DEFAULTS.siteName}`

  const pageDescription = (description || DEFAULTS.description).trim()
  const canonicalUrl = (canonical || joinUrl(siteUrl, pathname))?.trim()

  return (
    <Helmet prioritizeSeoTags>
      <title>{fullTitle}</title>

      <meta name="description" content={pageDescription} />
      <meta name="robots" content={noindex ? 'noindex, nofollow' : 'index, follow'} />

      {canonicalUrl ? <link rel="canonical" href={canonicalUrl} /> : null}

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={pageDescription} />
      <meta property="og:type" content={ogType} />
      {canonicalUrl ? <meta property="og:url" content={canonicalUrl} /> : null}

      {/* Twitter */}
      <meta name="twitter:card" content="summary" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={pageDescription} />

      {/* JSON-LD */}
      {jsonLd ? (
        <script type="application/ld+json">{JSON.stringify(jsonLd)}</script>
      ) : null}
    </Helmet>
  )
}
