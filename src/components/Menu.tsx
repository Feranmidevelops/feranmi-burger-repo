import { menuSection } from '../data/content'
import { Burst } from './Icons'
import styles from './Menu.module.css'

export function Menu() {
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
          {menuSection.items.map((item) => (
            <li key={item.id} className={styles.card}>
              <div className={styles.media}>
                <img
                  src={item.image}
                  alt={item.alt}
                  width={323}
                  height={323}
                  loading="lazy"
                />
              </div>
              {item.isNew && (
                <span className={styles.flag}>
                  <Burst className={styles.flagBurst} points={10} />
                  <span className={styles.flagText}>new</span>
                </span>
              )}
              <div className={styles.body}>
                <h3 className={styles.name}>{item.name}</h3>
                <p className={styles.description}>{item.description}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
