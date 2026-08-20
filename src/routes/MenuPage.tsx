import { useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { categories, menu, type Category } from '../data/menu'
import { MenuCard } from '../components/MenuCard'
import { Select } from '../components/Select'
import { PageHeader, EmptyState } from '../components/ui'
import { useDocumentTitle } from '../hooks/useDocumentTitle'
import styles from './MenuPage.module.css'

type Sort = 'default' | 'price-asc' | 'price-desc'

const SORTS: { id: Sort; label: string }[] = [
  { id: 'default', label: 'Chef’s order' },
  { id: 'price-asc', label: 'Price: low to high' },
  { id: 'price-desc', label: 'Price: high to low' },
]

function isCategory(value: string | null): value is Category {
  return categories.some((category) => category.id === value)
}

function isSort(value: string | null): value is Sort {
  return SORTS.some((sort) => sort.id === value)
}

/**
 * Filter state lives in the URL so a filtered menu is shareable and the back
 * button steps through it.
 */
export function MenuPage() {
  useDocumentTitle('Menu')
  const [params, setParams] = useSearchParams()

  const category = isCategory(params.get('category')) ? (params.get('category') as Category) : null
  const sort: Sort = isSort(params.get('sort')) ? (params.get('sort') as Sort) : 'default'
  const query = params.get('q') ?? ''

  const update = (key: string, value: string | null) => {
    const next = new URLSearchParams(params)
    if (value === null || value === '') next.delete(key)
    else next.set(key, value)
    setParams(next, { replace: true })
  }

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase()
    const filtered = menu.filter((item) => {
      if (category && item.category !== category) return false
      if (!needle) return true
      return (
        item.name.toLowerCase().includes(needle) ||
        item.description.toLowerCase().includes(needle) ||
        item.detail.toLowerCase().includes(needle)
      )
    })
    if (sort === 'price-asc') return [...filtered].sort((a, b) => a.price - b.price)
    if (sort === 'price-desc') return [...filtered].sort((a, b) => b.price - a.price)
    return filtered
  }, [category, query, sort])

  return (
    <>
      <PageHeader eyebrow="Lekki Phase 1 · Lagos" title="Our menu">
        <p>
          Ten things, done properly. Beef ground this morning, chicken brined overnight, and a
          Chapman built the way Lagos actually drinks it.
        </p>
      </PageHeader>

      <section className={styles.menu}>
        <div className="container">
          <div className={styles.controls}>
            <div className={styles.search}>
              <label className="visuallyHidden" htmlFor="menu-search">
                Search the menu
              </label>
              <input
                id="menu-search"
                type="search"
                placeholder="Search for suya, plantain, chicken…"
                value={query}
                onChange={(event) => update('q', event.target.value)}
              />
            </div>

            <div className={styles.sort}>
              <Select
                id="menu-sort"
                label="Sort by"
                value={sort}
                options={SORTS.map((option) => ({ value: option.id, label: option.label }))}
                onChange={(next) => update('sort', next)}
              />
            </div>
          </div>

          <div className={styles.filters} role="group" aria-label="Filter by category">
            <button
              type="button"
              className={styles.chip}
              data-active={category === null}
              onClick={() => update('category', null)}
            >
              Everything
            </button>
            {categories.map((entry) => (
              <button
                key={entry.id}
                type="button"
                className={styles.chip}
                data-active={category === entry.id}
                onClick={() => update('category', entry.id)}
              >
                {entry.label}
              </button>
            ))}
          </div>

          <p className={styles.count} role="status">
            {results.length} {results.length === 1 ? 'dish' : 'dishes'}
            {category ? ` in ${categories.find((c) => c.id === category)?.label}` : ''}
            {query ? ` matching “${query}”` : ''}
          </p>

          {results.length === 0 ? (
            <EmptyState
              title="Nothing matches that"
              body="Try a different search, or clear the filters to see the whole menu."
              action={
                <button
                  type="button"
                  className={styles.clear}
                  onClick={() => setParams(new URLSearchParams(), { replace: true })}
                >
                  Clear filters
                </button>
              }
            />
          ) : (
            <ul className={styles.grid}>
              {results.map((item) => (
                <li key={item.id}>
                  <MenuCard item={item} />
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>
    </>
  )
}
