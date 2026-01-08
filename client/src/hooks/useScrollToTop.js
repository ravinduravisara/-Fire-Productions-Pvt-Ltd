import { useEffect } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'

export default function useScrollToTop() {
  const { pathname } = useLocation()
  const navType = useNavigationType()
  useEffect(() => {
    // Only scroll to top on PUSH/REPLACE navigations. Preserve scroll on POP (back/forward).
    if (navType !== 'POP') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }, [pathname, navType])
}