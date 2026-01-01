export function organizationJsonLd({
  siteUrl,
  name = 'Fire Productions',
  legalName = 'Fire Productions Pvt Ltd',
  sameAs = [],
  logoPath = '/logo.png',
} = {}) {
  const cleanUrl = typeof siteUrl === 'string' ? siteUrl.replace(/\/+$/, '') : ''

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    legalName,
    url: cleanUrl || undefined,
    sameAs: sameAs.filter(Boolean),
    // Prefer absolute URL for the logo so Google can fetch it reliably
    logo: cleanUrl
      ? {
          '@type': 'ImageObject',
          url: `${cleanUrl}${logoPath.startsWith('/') ? '' : '/'}${logoPath}`,
        }
      : undefined,
  }
}
