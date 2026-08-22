import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { IconContext } from '@phosphor-icons/react'
import App from './App'
import { CartProvider } from './cart/CartContext'
import { ErrorBoundary } from './components/ErrorBoundary'
import './styles/global.css'

const container = document.getElementById('root')
if (!container) throw new Error('Root element #root was not found')

createRoot(container).render(
  <StrictMode>
    {/* The outer net: catches anything the per-route boundary cannot, including
        a failure in the header, the footer or the cart provider itself. */}
    <ErrorBoundary variant="app">
      {/* BASE_URL keeps routing correct when served from a GitHub Pages sub-path. */}
      <BrowserRouter basename={import.meta.env.BASE_URL}>
        {/* Icons track the font-size of their line; weight is set per usage. */}
        <IconContext.Provider value={{ size: '1em', weight: 'regular' }}>
          <CartProvider>
            <App />
          </CartProvider>
        </IconContext.Provider>
      </BrowserRouter>
    </ErrorBoundary>
  </StrictMode>,
)
