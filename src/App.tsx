import { Header } from './components/Header'
import { Hero } from './components/Hero'
import { About } from './components/About'
import { Different } from './components/Different'
import { Menu } from './components/Menu'
import { Marquee } from './components/Marquee'
import { Reviews } from './components/Reviews'
import { Instagram } from './components/Instagram'
import { Footer } from './components/Footer'

/**
 * Section order follows the Figma frame "Burger Landing" top to bottom:
 * hero -> about -> photo band -> menu -> marquee -> reviews -> social -> footer.
 */
export default function App() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <About />
        <Different />
        <Menu />
        <Marquee />
        <Reviews />
        <Instagram />
      </main>
      <Footer />
    </>
  )
}
