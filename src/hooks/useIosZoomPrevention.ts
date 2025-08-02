'use client'

import { useEffect, useRef } from 'react'

// This is a simplified version of the experimental useEffectEvent
// It's used to create stable event handlers that don't trigger effect re-runs
function useEvent(handler: (...args: any[]) => void) {
  const handlerRef = useRef(handler)
  
  // Update the handler ref when the handler changes
  useEffect(() => {
    handlerRef.current = handler
  })
  
  // Return a stable function that calls the latest handler
  return useRef((...args: any[]) => {
    return handlerRef.current(...args)
  }).current
}

const isIOS = () => {
  if (typeof window === 'undefined') return false
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || 
         (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

export function useIosZoomPrevention() {
  // Create stable event handlers
  const handleFocus = useEvent((e: FocusEvent) => {
    // Only handle focus on input elements
    if (!(e.target instanceof HTMLInputElement || 
          e.target instanceof HTMLTextAreaElement || 
          e.target instanceof HTMLElement && e.target.isContentEditable)) {
      return
    }
    
    const viewportMeta = document.querySelector('meta[name="viewport"]')
    if (viewportMeta) {
      viewportMeta.setAttribute('content', 
        'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover')
    }
  })

  const handleBlur = useEvent(() => {
    const viewportMeta = document.querySelector('meta[name="viewport"]')
    if (viewportMeta) {
      viewportMeta.setAttribute('content', 
        'width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover, interactive-widget=resizes-visual')
    }
  })

  useEffect(() => {
    if (!isIOS()) return

    // Add event listeners to document and let events bubble up
    document.addEventListener('focusin', handleFocus, true)
    document.addEventListener('focusout', handleBlur, true)

    // Cleanup function
    return () => {
      document.removeEventListener('focusin', handleFocus, true)
      document.removeEventListener('focusout', handleBlur, true)
    }
  }, [handleFocus, handleBlur])
}
