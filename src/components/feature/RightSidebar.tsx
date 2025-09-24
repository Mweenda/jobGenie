import { motion } from 'framer-motion'
import { TrendingUp, Users, Calendar, Activity, Clock } from 'lucide-react'
import { GlassCard } from '../ui/glass-card'

const stats = [
  { label: 'Profile Views', value: '127', change: '+12%', icon: TrendingUp, color: 'text-blue-500' },
  { label: 'Applications', value: '23', change: '+5%', icon: Users, color: 'text-green-500' },
  { label: 'Interviews', value: '4', change: '+2', icon: Calendar, color: 'text-purple-500' },
]

const recentActivity = [
  { action: 'Applied to Frontend Developer at TechCorp', time: '2 hours ago', icon: Users },
  { action: 'Saved UX Designer position', time: '4 hours ago', icon: Activity },
  { action: 'Updated resume', time: '1 day ago', icon: Clock },
]

export default function RightSidebar() {
  return (
    <aside className="w-72 lg:w-80 p-4 lg:p-6 flex flex-col space-y-4">
      {/* Your Stats Section */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6 }}
      >
        <GlassCard variant="floating" className="p-4 lg:p-6">
          <div className="flex items-center space-x-2 mb-4">
            <TrendingUp className="w-5 h-5 text-blue-500" />
            <h3 className="text-lg font-semibold">Your Stats</h3>
          </div>
          
          <div className="space-y-3">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.1 }}
                className="glass-subtle rounded-lg p-3 hover:glass-prominent transition-all duration-200"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`p-2 rounded-full glass-subtle ${stat.color}`}>
                      <stat.icon className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">{stat.label}</p>
                      <p className="text-lg font-semibold">{stat.value}</p>
                    </div>
                  </div>
                  <span className="text-xs font-medium text-green-600 bg-green-50 dark:bg-green-900/20 px-2 py-1 rounded-full">
                    {stat.change}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
      
      {/* Recent Activity Section */}
      <motion.div
        initial={{ opacity: 0, x: 20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.6, delay: 0.2 }}
      >
        <GlassCard variant="floating" className="p-4 lg:p-6">
          <div className="flex items-center space-x-2 mb-4">
            <Activity className="w-5 h-5 text-purple-500" />
            <h3 className="text-lg font-semibold">Recent Activity</h3>
          </div>
          
          <div className="space-y-3">
            {recentActivity.map((activity, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.3 + (index * 0.1) }}
                className="flex items-start space-x-3 p-3 glass-subtle rounded-lg hover:glass-prominent transition-all duration-200"
              >
                <div className="p-2 rounded-full glass-subtle text-gray-500 dark:text-gray-400 flex-shrink-0">
                  <activity.icon className="w-3 h-3" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 leading-relaxed">
                    {activity.action}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {activity.time}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </GlassCard>
      </motion.div>
    </aside>
  )
}