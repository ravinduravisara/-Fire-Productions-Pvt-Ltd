import Hero from '../components/home/Hero'
import LatestWorks from '../components/home/LatestWorks'
import SEO from '../components/seo/SEO'
import { organizationJsonLd } from '../seo/structuredData'

export default function Home() {
  return (
    <>
      <SEO
        title="Fire Productions"
        description="Fire Productions — Music, Acoustic, Entertainment & Film production. Story-led visuals and studio-grade sound."
        path="/"
        jsonLd={organizationJsonLd({
          siteUrl: import.meta.env.VITE_SITE_URL,
          logoPath: '/logo.png',
          sameAs: [
            'https://www.facebook.com/profile.php?id=61585614113109',
            'https://youtube.com/@firemusicproductionsl?si=B24zsbyhqts2XTYE',
            'https://www.tiktok.com/@fireproductionspvtltd?is_from_webapp=1&sender_device=pc',
          ],
        })}
      />
      <Hero />
      <LatestWorks />
    </>
  )
}