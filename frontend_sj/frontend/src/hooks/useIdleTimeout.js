import { useEffect, useRef, useCallback } from 'react'

const ACTIVITY_EVENTS = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll', 'click']

/**
 * Calls onWarn after `warnAfterMs` of inactivity,
 * then calls onIdle after `idleAfterMs` of inactivity.
 * Calling reset() restarts both timers.
 */
export function useIdleTimeout({ idleAfterMs, warnAfterMs, onWarn, onIdle }) {
  const warnTimer  = useRef(null)
  const idleTimer  = useRef(null)

  const clearTimers = useCallback(() => {
    clearTimeout(warnTimer.current)
    clearTimeout(idleTimer.current)
  }, [])

  const reset = useCallback(() => {
    clearTimers()
    warnTimer.current = setTimeout(onWarn, warnAfterMs)
    idleTimer.current = setTimeout(onIdle, idleAfterMs)
  }, [clearTimers, onWarn, onIdle, warnAfterMs, idleAfterMs])

  useEffect(() => {
    reset()
    ACTIVITY_EVENTS.forEach((e) => window.addEventListener(e, reset, { passive: true }))
    return () => {
      clearTimers()
      ACTIVITY_EVENTS.forEach((e) => window.removeEventListener(e, reset))
    }
  }, [reset, clearTimers])

  return { reset }
}
