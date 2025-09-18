import { TrendingUp, Users, Calendar } from 'lucide-react'

const stats = [
  { label: 'Profile Views', value: '127', change: '+12%', icon: TrendingUp },
  { label: 'Applications', value: '23', change: '+5%', icon: Users },
  { label: 'Interviews', value: '4', change: '+2', icon: Calendar },
]

const recentActivity = [
  { action: 'Applied to Frontend Developer at TechCorp', time: '2 hours ago' },
  { action: 'Saved UX Designer position', time: '4 hours ago' },
  { action: 'Updated resume', time: '1 day ago' },
]

export default function RightSidebar() {
  return (
    <aside className="w-80 bg-white border-l p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Stats</h3>
          <div className="space-y-3">
            {stats.map((stat) => (
              <div key={stat.label} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <stat.icon className="w-5 h-5 text-blue-600 mr-3" />
                  <div>
                    <p className="text-sm text-gray-600">{stat.label}</p>
                    <p className="text-lg font-semibold text-gray-900">{stat.value}</p>
                  </div>
                </div>
                <span className="text-sm text-green-600">{stat.change}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Activity</h3>
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <div key={index} className="pb-3 border-b border-gray-100 last:border-b-0">
                <p className="text-sm text-gray-900">{activity.action}</p>
                <p className="text-xs text-gray-500 mt-1">{activity.time}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}