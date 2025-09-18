import Header from '../../components/feature/Header'
import Sidebar from '../../components/feature/Sidebar'
import JobFeed from '../../components/feature/JobFeed'
import RightSidebar from '../../components/feature/RightSidebar'
import AIChatbot from '../../components/feature/AIChatbot'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
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