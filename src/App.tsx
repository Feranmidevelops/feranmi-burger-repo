import { Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { Home } from './routes/Home'
import { MenuPage } from './routes/MenuPage'
import { CartPage } from './routes/CartPage'
import { CheckoutPage } from './routes/CheckoutPage'
import { ReservationsPage } from './routes/ReservationsPage'
import { NotFound } from './routes/NotFound'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="menu" element={<MenuPage />} />
        <Route path="cart" element={<CartPage />} />
        <Route path="checkout" element={<CheckoutPage />} />
        <Route path="reservations" element={<ReservationsPage />} />
        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  )
}
