import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { IconContext } from '@phosphor-icons/react'
import App from './App'
import { CartProvider } from './cart/CartContext'
import './styles/global.css'

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root was not found')

createRoot(container).render(
  <StrictMode>
    {/* BASE_URL keeps routing correct when served from a GitHub Pages sub-path. */}
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      {/* Icons track the font-size of their line; weight is set per usage. */}
      <IconContext.Provider value={{ size: '1em', weight: 'regular' }}>
        <CartProvider>
          <App />
        </CartProvider>
      </IconContext.Provider>
    </BrowserRouter>
  </StrictMode>,
)
