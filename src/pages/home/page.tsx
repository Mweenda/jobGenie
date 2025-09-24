import Header from '../../components/feature/Header'
import Sidebar from '../../components/feature/Sidebar'
import JobFeed from '../../components/feature/JobFeed'
import RightSidebar from '../../components/feature/RightSidebar'
import AIChatbot from '../../components/feature/AIChatbot'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <Header />
      <div className="flex flex-col lg:flex-row pt-20 gap-0 lg:gap-4 max-w-screen-2xl mx-auto">
        <Sidebar />
        <main className="flex-1 p-4 lg:p-6 min-w-0">
          <JobFeed />
        </main>
        {/* Right Sidebar - Hidden on mobile, visible on large screens */}
        <div className="hidden lg:block lg:flex-shrink-0">
          <RightSidebar />
        </div>
      </div>
      <AIChatbot />
    </div>
  )
}