import { useCallback, useRef } from 'react'

export function useAnnouncer() {
  const announcerRef = useRef<HTMLDivElement | null>(null)

  // Create or get the announcer element
  const getAnnouncer = useCallback(() => {
    if (!announcerRef.current) {
      const announcer = document.createElement('div')
      announcer.setAttribute('aria-live', 'polite')
      announcer.setAttribute('aria-atomic', 'true')
      announcer.className = 'sr-only'
      announcer.id = 'screen-reader-announcements'
      document.body.appendChild(announcer)
      announcerRef.current = announcer
    }
    return announcerRef.current
  }, [])

  const announce = useCallback((message: string, priority: 'polite' | 'assertive' = 'polite') => {
    const announcer = getAnnouncer()
    announcer.setAttribute('aria-live', priority)
    
    // Clear and then set the message to ensure it's announced
    announcer.textContent = ''
    setTimeout(() => {
      announcer.textContent = message
    }, 10)
  }, [getAnnouncer])

  return { announce }
}
