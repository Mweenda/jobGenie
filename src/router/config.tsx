import { Routes, Route } from 'react-router-dom'
import LandingPage from '../pages/landing/page'
import HomePage from '../pages/home/page'
import ProfilePage from '../pages/profile/page'
import { JobsPage, SavedJobsPage, MessagesPage, SettingsPage } from '../pages'
import AIDemoPage from '../pages/ai-demo'
import NotFound from '../pages/NotFound'

export function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/home" element={<HomePage />} />
      <Route path="/dashboard" element={<HomePage />} />
      <Route path="/jobs" element={<JobsPage />} />
      <Route path="/saved" element={<SavedJobsPage />} />
      <Route path="/messages" element={<MessagesPage />} />
      <Route path="/settings" element={<SettingsPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route path="/ai-demo" element={<AIDemoPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  )
}