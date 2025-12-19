import { useEffect, useState } from 'react'
import { getWorks } from '../../services/works.api'
import SectionTitle from '../ui/SectionTitle'
import FireCards from './FireCards'

export default function LatestWorks() {
  const [items, setItems] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    (async () => {
      try {
        const data = await getWorks()
        setItems(data)
      } catch (e) {
        console.error('Failed to fetch works', e)
      } finally {
        setLoading(false)
      }
    })()
  }, [])

  return (
    <section className="py-16">
      <div className="container">
        <SectionTitle title="Latest Works" subtitle="A peek into our recent projects" />
        <FireCards items={loading ? [] : items} />
      </div>
    </section>
  )
}