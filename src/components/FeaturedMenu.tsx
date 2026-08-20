import { Link } from 'react-router-dom'
import { menu } from '../data/menu'
import { menuSection } from '../data/content'
import { MenuCard } from './MenuCard'
import styles from './FeaturedMenu.module.css'

/** The four dishes the kitchen leads with. The rest live on /menu. */
const FEATURED = ['juicy-feranmi', 'suya-smash', 'shrimp-yo', 'crispy-chi']

const featured = FEATURED.flatMap((id) => menu.filter((item) => item.id === id))

export function FeaturedMenu() {
  return (
    <section id="menu" className={styles.menu}>
      <div className={`container ${styles.inner}`}>
        <p className={styles.mark} aria-label="Feranmi Restaurant">
          <span aria-hidden="true">Feranmi</span>
          <span aria-hidden="true">Restaurant</span>
        </p>

        <header className={styles.intro}>
          <h2 className="sectionTitle">{menuSection.heading}</h2>
          <p className={`lead ${styles.introBody}`}>{menuSection.body}</p>
        </header>

        <ul className={styles.grid}>
          {featured.map((item) => (
            <li key={item.id}>
              <MenuCard item={item} />
            </li>
          ))}
        </ul>

        <Link className={styles.all} to="/menu">
          See all {menu.length} dishes
        </Link>
      </div>
    </section>
  )
}
