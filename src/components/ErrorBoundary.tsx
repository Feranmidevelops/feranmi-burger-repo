import { Component, type ErrorInfo, type ReactNode } from 'react'
import { ArrowClockwise, House, WarningOctagon } from '@phosphor-icons/react'
import { site } from '../data/site'
import { whatsappLink } from '../lib/whatsapp'
import { ICON } from './Icons'
import styles from './ErrorBoundary.module.css'

interface Props {
  children: ReactNode
  /**
   * `route` keeps the surrounding chrome and offers a way back into the app.
   * `app` is the outermost net, where even the header may be what broke.
   */
  variant?: 'app' | 'route'
}

interface State {
  error: Error | null
}

/**
 * Catches render-time crashes so a single bad component cannot blank the page.
 *
 * The recovery links are plain anchors rather than router `<Link>`s on purpose:
 * this component is mounted both inside and outside the router, and after a
 * crash a hard navigation is the more reliable reset anyway.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // The only telemetry there is on a static host. Kept so a customer who
    // reports "it went blank" can be asked for the console.
    console.error('Unhandled render error', error, info.componentStack)
  }

  private retry = () => this.setState({ error: null })

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    const report = whatsappLink(
      `Hi — the website showed an error page. Details: ${error.message.slice(0, 200)}`,
    )

    return (
      <section className={styles.wrap} data-variant={this.props.variant ?? 'route'}>
        <div className="container">
          <WarningOctagon className={styles.icon} weight="duotone" aria-hidden />
          <h1 className={styles.title}>Something broke on our side</h1>
          <p className={styles.body}>
            Not your fault, and nothing in your cart is lost — it is saved on this device. Try
            again, and if it keeps happening a message on WhatsApp gets your order in faster than
            we can fix this.
          </p>

          <div className={styles.actions}>
            <button type="button" className={styles.primary} onClick={this.retry}>
              <ArrowClockwise weight={ICON.strong} aria-hidden />
              Try again
            </button>
            <a className={styles.secondary} href={import.meta.env.BASE_URL}>
              <House weight={ICON.strong} aria-hidden />
              Back to the start
            </a>
            <a
              className={styles.secondary}
              href={report}
              target="_blank"
              rel="noreferrer noopener"
            >
              Order on WhatsApp
            </a>
          </div>

          <p className={styles.small}>
            Or call {site.phoneDisplay}.{' '}
            {import.meta.env.DEV && <code className={styles.detail}>{error.message}</code>}
          </p>
        </div>
      </section>
    )
  }
}
