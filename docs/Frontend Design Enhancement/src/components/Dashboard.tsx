import React, { useState } from 'react';
import { motion } from 'motion/react';
import { 
  Home, 
  Search, 
  Briefcase, 
  User, 
  Settings, 
  Bell, 
  TrendingUp,
  Calendar,
  MessageCircle,
  Award,
  Target,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { GlassCard } from './GlassCard';
import { FloatingButton } from './FloatingButton';
import { Card } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { ImageWithFallback } from './figma/ImageWithFallback';

interface SidebarItemProps {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
}

function SidebarItem({ icon, label, active = false, onClick }: SidebarItemProps) {
  return (
    <motion.button
      whileHover={{ scale: 1.02, x: 5 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-all duration-200 ${
        active 
          ? 'glass-floating text-blue-600' 
          : 'hover:glass-subtle text-muted-foreground hover:text-foreground'
      }`}
    >
      {icon}
      <span className="text-sm font-medium">{label}</span>
    </motion.button>
  );
}

interface RecentApplicationProps {
  company: string;
  position: string;
  status: 'pending' | 'interview' | 'rejected' | 'accepted';
  date: string;
  delay: number;
}

function RecentApplication({ company, position, status, date, delay }: RecentApplicationProps) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
    interview: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200',
    rejected: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
    accepted: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <GlassCard variant="subtle" className="p-4 hover:glass-prominent transition-all duration-200">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-sm">{position}</h4>
            <p className="text-xs text-muted-foreground">{company}</p>
            <p className="text-xs text-muted-foreground mt-1">{date}</p>
          </div>
          <Badge className={statusColors[status]} variant="secondary">
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </Badge>
        </div>
      </GlassCard>
    </motion.div>
  );
}

interface StatCardProps {
  icon: React.ReactNode;
  title: string;
  value: string;
  change: string;
  delay: number;
}

function StatCard({ icon, title, value, change, delay }: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <GlassCard variant="prominent" hover className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold">{value}</p>
            <p className="text-xs text-green-600 mt-1">{change}</p>
          </div>
          <div className="p-3 rounded-full glass-subtle">
            {icon}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}

export function Dashboard() {
  const [activeSection, setActiveSection] = useState('dashboard');

  const sidebarItems = [
    { icon: <Home className="w-5 h-5" />, label: 'Dashboard', key: 'dashboard' },
    { icon: <Search className="w-5 h-5" />, label: 'Job Search', key: 'search' },
    { icon: <Briefcase className="w-5 h-5" />, label: 'Applications', key: 'applications' },
    { icon: <MessageCircle className="w-5 h-5" />, label: 'Messages', key: 'messages' },
    { icon: <User className="w-5 h-5" />, label: 'Profile', key: 'profile' },
    { icon: <Settings className="w-5 h-5" />, label: 'Settings', key: 'settings' }
  ];

  const recentApplications = [
    { company: 'TechCorp', position: 'Senior Developer', status: 'interview' as const, date: '2 days ago', delay: 0.1 },
    { company: 'StartupInc', position: 'Product Manager', status: 'pending' as const, date: '3 days ago', delay: 0.2 },
    { company: 'BigTech', position: 'UX Designer', status: 'accepted' as const, date: '1 week ago', delay: 0.3 },
    { company: 'Innovation Labs', position: 'Data Scientist', status: 'rejected' as const, date: '1 week ago', delay: 0.4 }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <div className="flex">
        {/* Glass Sidebar */}
        <motion.aside
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.6 }}
          className="w-64 h-screen sticky top-0 p-6"
        >
          <GlassCard variant="floating" className="h-full p-6">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="flex items-center space-x-2 mb-8"
            >
              <Sparkles className="w-8 h-8 text-blue-500" />
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                JobGenie
              </span>
            </motion.div>

            {/* Navigation */}
            <nav className="space-y-2">
              {sidebarItems.map((item) => (
                <SidebarItem
                  key={item.key}
                  icon={item.icon}
                  label={item.label}
                  active={activeSection === item.key}
                  onClick={() => setActiveSection(item.key)}
                />
              ))}
            </nav>

            {/* Profile Section */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mt-auto pt-6 border-t border-white/10"
            >
              <GlassCard variant="subtle" className="p-4">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 rounded-full overflow-hidden">
                    <ImageWithFallback
                      src="https://images.unsplash.com/photo-1420310414923-bf3651a89816?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxwcm9mZXNzaW9uYWwlMjB3b21hbiUyMGxhcHRvcHxlbnwxfHx8fDE3NTg1MzMyNDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">Sarah Wilson</p>
                    <p className="text-xs text-muted-foreground">Product Designer</p>
                  </div>
                </div>
              </GlassCard>
            </motion.div>
          </GlassCard>
        </motion.aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="flex items-center justify-between mb-8"
          >
            <div>
              <h1 className="text-3xl font-bold mb-2">Welcome back, Sarah! 👋</h1>
              <p className="text-muted-foreground">Here's what's happening with your job search today.</p>
            </div>
            
            <div className="flex items-center space-x-4">
              <FloatingButton variant="glass">
                <Bell className="w-5 h-5" />
              </FloatingButton>
              <FloatingButton variant="primary">
                <Search className="w-5 h-5 mr-2" />
                Find Jobs
              </FloatingButton>
            </div>
          </motion.div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<Briefcase className="w-6 h-6 text-blue-500" />}
              title="Applications Sent"
              value="24"
              change="+3 this week"
              delay={0.1}
            />
            <StatCard
              icon={<TrendingUp className="w-6 h-6 text-green-500" />}
              title="Profile Views"
              value="128"
              change="+12% this month"
              delay={0.2}
            />
            <StatCard
              icon={<Calendar className="w-6 h-6 text-purple-500" />}
              title="Interviews"
              value="6"
              change="+2 scheduled"
              delay={0.3}
            />
            <StatCard
              icon={<Award className="w-6 h-6 text-yellow-500" />}
              title="Response Rate"
              value="78%"
              change="+5% increase"
              delay={0.4}
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Applications */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="lg:col-span-2"
            >
              <GlassCard variant="prominent" className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-xl font-semibold">Recent Applications</h2>
                  <FloatingButton variant="glass" size="sm">
                    View All
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </FloatingButton>
                </div>
                
                <div className="space-y-4">
                  {recentApplications.map((app, index) => (
                    <RecentApplication key={index} {...app} />
                  ))}
                </div>
              </GlassCard>
            </motion.div>

            {/* Profile Strength */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <GlassCard variant="prominent" className="p-6">
                <h2 className="text-xl font-semibold mb-6">Profile Strength</h2>
                
                <div className="space-y-6">
                  <div className="text-center">
                    <div className="w-20 h-20 mx-auto mb-4 relative">
                      <div className="w-full h-full rounded-full glass-floating flex items-center justify-center">
                        <Target className="w-8 h-8 text-blue-500" />
                      </div>
                      <div className="absolute -top-2 -right-2">
                        <Badge className="bg-green-500 text-white">85%</Badge>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground">Almost complete!</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Experience</span>
                        <span className="text-sm text-muted-foreground">100%</span>
                      </div>
                      <Progress value={100} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Skills</span>
                        <span className="text-sm text-muted-foreground">90%</span>
                      </div>
                      <Progress value={90} className="h-2" />
                    </div>
                    
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <span className="text-sm">Projects</span>
                        <span className="text-sm text-muted-foreground">60%</span>
                      </div>
                      <Progress value={60} className="h-2" />
                    </div>
                  </div>

                  <FloatingButton variant="primary" className="w-full">
                    Complete Profile
                  </FloatingButton>
                </div>
              </GlassCard>
            </motion.div>
          </div>

          {/* AI Recommendations */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.6 }}
            className="mt-6"
          >
            <GlassCard variant="floating" className="p-6">
              <div className="flex items-center space-x-3 mb-6">
                <div className="p-2 rounded-full glass-prominent">
                  <Sparkles className="w-6 h-6 text-blue-500" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold">AI Recommendations</h2>
                  <p className="text-sm text-muted-foreground">Personalized suggestions based on your profile</p>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                <motion.div whileHover={{ scale: 1.02 }}>
                  <GlassCard variant="subtle" className="p-4">
                    <h3 className="font-medium mb-2">📝 Optimize Your Resume</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Add 2-3 more technical skills to increase your match rate by 25%.
                    </p>
                    <FloatingButton variant="glass" size="sm">
                      Get Started
                    </FloatingButton>
                  </GlassCard>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }}>
                  <GlassCard variant="subtle" className="p-4">
                    <h3 className="font-medium mb-2">🎯 Perfect Match Found</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      3 new jobs match your skills and salary expectations perfectly.
                    </p>
                    <FloatingButton variant="glass" size="sm">
                      View Jobs
                    </FloatingButton>
                  </GlassCard>
                </motion.div>

                <motion.div whileHover={{ scale: 1.02 }}>
                  <GlassCard variant="subtle" className="p-4">
                    <h3 className="font-medium mb-2">🚀 Skill Development</h3>
                    <p className="text-sm text-muted-foreground mb-3">
                      Learn React Native to unlock 15+ new job opportunities.
                    </p>
                    <FloatingButton variant="glass" size="sm">
                      Learn More
                    </FloatingButton>
                  </GlassCard>
                </motion.div>
              </div>
            </GlassCard>
          </motion.div>
        </main>
      </div>
    </div>
  );
}