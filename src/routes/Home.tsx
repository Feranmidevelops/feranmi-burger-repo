import { Hero } from '../components/Hero'
import { About } from '../components/About'
import { Different } from '../components/Different'
import { FeaturedMenu } from '../components/FeaturedMenu'
import { Marquee } from '../components/Marquee'
import { Reviews } from '../components/Reviews'
import { Instagram } from '../components/Instagram'

/** Section order follows the original Figma frame, top to bottom. */
export function Home() {
  return (
    <>
      <Hero />
      <About />
      <Different />
      <FeaturedMenu />
      <Marquee />
      <Reviews />
      <Instagram />
    </>
  )
}
