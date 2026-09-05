import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { pageviewPath, trackPageview } from './goatcounter'

export function GoatCounterTracker() {
  const location = useLocation()

  useEffect(() => {
    trackPageview(pageviewPath())
  }, [location.pathname, location.search])

  return null
}
