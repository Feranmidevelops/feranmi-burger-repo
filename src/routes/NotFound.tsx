import { Link } from 'react-router-dom'
import { EmptyState, PageHeader } from '../components/ui'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import styles from './NotFound.module.css'

export function NotFound() {
  useDocumentTitle('Page not found')
  return (
    <>
      <PageHeader eyebrow="404" title="That page is off the menu" />
      <section className={styles.page}>
        <div className="container">
          <EmptyState
            title="Nothing cooking here"
            body="The link may be old, or we moved it. The menu is where the good stuff lives."
            action={
              <Link className={styles.primary} to="/menu">
                Go to the menu
              </Link>
            }
          />
        </div>
      </section>
    </>
  )
}
