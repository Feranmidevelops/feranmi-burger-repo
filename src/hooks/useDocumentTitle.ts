import { useEffect } from 'react'

const SUFFIX = 'Feranmi Restaurant'

/** Keeps the tab title in step with the route. */
export function useDocumentTitle(title?: string) {
  useEffect(() => {
    document.title = title ? `${title} · ${SUFFIX}` : `${SUFFIX} — Lagos' favourite burger`
  }, [title])
}
