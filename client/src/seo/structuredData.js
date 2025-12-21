export function organizationJsonLd({
  siteUrl,
  name = 'Fire Productions',
  legalName = 'Fire Productions Pvt Ltd',
  sameAs = [],
} = {}) {
  const cleanUrl = typeof siteUrl === 'string' ? siteUrl.replace(/\/+$/, '') : ''

  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name,
    legalName,
    url: cleanUrl || undefined,
    sameAs: sameAs.filter(Boolean),
  }
}
