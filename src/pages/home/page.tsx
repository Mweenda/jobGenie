import Header from '../../components/feature/Header'
import Sidebar from '../../components/feature/Sidebar'
import JobFeed from '../../components/feature/JobFeed'
import RightSidebar from '../../components/feature/RightSidebar'
import AIChatbot from '../../components/feature/AIChatbot'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <Header />
      <div className="flex pt-20">
        <Sidebar />
        <main className="flex-1 p-6">
          <JobFeed />
        </main>
        <RightSidebar />
      </div>
      <AIChatbot />
    </div>
  )
}