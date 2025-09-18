import { Routes, Route } from 'react-router-dom'
import LandingPage from '../pages/landing/page'
import HomePage from '../pages/home/page'
import NotFound from '../pages/NotFound'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}