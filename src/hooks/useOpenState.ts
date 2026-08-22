import { useEffect, useState } from 'react'
import { openState, type OpenState } from '../lib/hours'

/**
 * The live trading state, re-evaluated on a timer.
 *
 * Without the interval a tab left open across closing time would keep claiming
 * the kitchen is taking orders. Half a minute is fine — the only thing that
 * turns over is a badge.
 */
export function useOpenState(): OpenState {
  const [state, setState] = useState<OpenState>(() => openState(new Date()))

  useEffect(() => {
    const tick = () => setState(openState(new Date()))
    tick()
    const timer = window.setInterval(tick, 30_000)
    return () => window.clearInterval(timer)
  }, [])

  return state
}
