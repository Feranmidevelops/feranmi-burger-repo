import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach, beforeEach, vi } from 'vitest'

/*
 * jsdom has no layout engine, so the scroll APIs simply are not there. The
 * components call them only to move a viewport that does not exist in a test,
 * so a no-op is the accurate stand-in rather than a shortcut.
 */
Element.prototype.scrollIntoView = vi.fn()
window.scrollTo = vi.fn()

// jsdom keeps one window per file, so state leaks between tests without this.
afterEach(() => cleanup())
beforeEach(() => localStorage.clear())
