import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  User, 
  Bell, 
  Shield, 
  CreditCard, 
  LogOut, 
  Trash2, 
  Camera,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  Globe,
  Eye,
  EyeOff,
  Download,
  Upload,
  Settings as SettingsIcon,
  // ChevronRight, // Unused
  Save,
  CheckCircle,
  Sparkles,
  Lock
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { GlassCard } from '@/components/ui/glass-card'
import { FloatingButton } from '@/components/ui/floating-button'
import Header from '@/components/feature/Header'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

// Mock user data
const mockUser = {
  name: 'Alex Johnson',
  email: 'alex.johnson@email.com',
  phone: '+1 (555) 123-4567',
  location: 'San Francisco, CA',
  jobTitle: 'Senior Frontend Developer',
  company: 'Current Company',
  bio: 'Passionate frontend developer with 5+ years of experience building scalable web applications.',
  avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
  plan: 'Pro',
  joinDate: 'January 2024'
}

const SettingsPage: React.FC = () => {
  const [user, setUser] = useState(mockUser)
  const [showPassword, setShowPassword] = useState(false)
  const [notifications, setNotifications] = useState({
    jobAlerts: true,
    messageNotifications: true,
    applicationUpdates: true,
    weeklyDigest: false,
    marketingEmails: false
  })
  const [privacy, setPrivacy] = useState({
    profileVisible: true,
    showEmail: false,
    showPhone: false,
    allowMessages: true
  })

  const handleUserUpdate = (field: string, value: string) => {
    setUser(prev => ({ ...prev, [field]: value }))
  }

  const handleNotificationChange = (key: string, value: boolean) => {
    setNotifications(prev => ({ ...prev, [key]: value }))
  }

  const handlePrivacyChange = (key: string, value: boolean) => {
    setPrivacy(prev => ({ ...prev, [key]: value }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <Header />
      
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-8 pt-20 sm:pt-24">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-6 sm:mb-8 text-center sm:text-left"
        >
          <h1 className="text-xl sm:text-display-lg mb-2 flex items-center justify-center sm:justify-start space-x-2 sm:space-x-3">
            <SettingsIcon className="w-6 h-6 sm:w-8 sm:h-8 text-blue-500" />
            <span>Settings</span>
          </h1>
          <p className="text-sm sm:text-body-lg text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Tabs defaultValue="profile" className="space-y-6">
            <GlassCard variant="floating" className="p-1 sm:p-2">
              <TabsList className="grid w-full grid-cols-2 lg:grid-cols-4 glass-subtle border-0 bg-transparent gap-1">
                <TabsTrigger value="profile" className="flex items-center justify-center space-x-1 sm:space-x-2 glass-subtle data-[state=active]:glass-prominent text-xs sm:text-sm p-2 sm:p-3">
                  <User className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Profile</span>
                  <span className="sm:hidden">Profile</span>
                </TabsTrigger>
                <TabsTrigger value="notifications" className="flex items-center justify-center space-x-1 sm:space-x-2 glass-subtle data-[state=active]:glass-prominent text-xs sm:text-sm p-2 sm:p-3">
                  <Bell className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Notifications</span>
                  <span className="sm:hidden">Alerts</span>
                </TabsTrigger>
                <TabsTrigger value="privacy" className="flex items-center justify-center space-x-1 sm:space-x-2 glass-subtle data-[state=active]:glass-prominent text-xs sm:text-sm p-2 sm:p-3">
                  <Shield className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Privacy</span>
                  <span className="sm:hidden">Privacy</span>
                </TabsTrigger>
                <TabsTrigger value="billing" className="flex items-center justify-center space-x-1 sm:space-x-2 glass-subtle data-[state=active]:glass-prominent text-xs sm:text-sm p-2 sm:p-3">
                  <CreditCard className="w-3 h-3 sm:w-4 sm:h-4" />
                  <span className="hidden sm:inline">Billing</span>
                  <span className="sm:hidden">Billing</span>
                </TabsTrigger>
              </TabsList>
            </GlassCard>

            {/* Profile Tab */}
            <TabsContent value="profile" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <GlassCard variant="floating" className="p-6">
                  <div className="mb-6">
                    <h2 className="text-display-sm flex items-center space-x-2 mb-2">
                      <User className="w-5 h-5 text-blue-500" />
                      <span>Profile Information</span>
                    </h2>
                    <p className="text-muted-foreground">
                      Update your personal information and profile details
                    </p>
                  </div>

                  <div className="space-y-6">
                    {/* Avatar Section */}
                    <div className="flex flex-col sm:flex-row items-start space-y-4 sm:space-y-0 sm:space-x-6">
                      <div className="relative">
                        <Avatar className="w-24 h-24 ring-2 ring-white/20">
                          <AvatarFallback className="text-lg bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                            {user.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        <motion.button
                          whileHover={{ scale: 1.1 }}
                          whileTap={{ scale: 0.9 }}
                          className="absolute -bottom-2 -right-2 rounded-full w-8 h-8 p-0 glass-prominent hover:glass-floating transition-all duration-200 flex items-center justify-center"
                        >
                          <Camera className="w-4 h-4" />
                        </motion.button>
                      </div>
                      <div className="flex-1 space-y-4 w-full">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <Label htmlFor="name" className="flex items-center space-x-2 mb-2">
                              <User className="w-4 h-4 text-blue-500" />
                              <span>Full Name</span>
                            </Label>
                            <Input
                              id="name"
                              value={user.name}
                              onChange={(e) => handleUserUpdate('name', e.target.value)}
                              className="glass-subtle border-0 focus:glass-prominent"
                            />
                          </div>
                          <div>
                            <Label htmlFor="jobTitle" className="flex items-center space-x-2 mb-2">
                              <Briefcase className="w-4 h-4 text-purple-500" />
                              <span>Job Title</span>
                            </Label>
                            <Input
                              id="jobTitle"
                              value={user.jobTitle}
                              onChange={(e) => handleUserUpdate('jobTitle', e.target.value)}
                              className="glass-subtle border-0 focus:glass-prominent"
                            />
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="bio" className="flex items-center space-x-2 mb-2">
                            <Sparkles className="w-4 h-4 text-green-500" />
                            <span>Bio</span>
                          </Label>
                          <Input
                            id="bio"
                            value={user.bio}
                            onChange={(e) => handleUserUpdate('bio', e.target.value)}
                            placeholder="Tell us about yourself..."
                            className="glass-subtle border-0 focus:glass-prominent"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-6" />

                    {/* Contact Information */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center space-x-2">
                        <Mail className="w-5 h-5 text-blue-500" />
                        <span>Contact Information</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="email" className="flex items-center space-x-2 mb-2">
                            <Mail className="w-4 h-4 text-blue-500" />
                            <span>Email Address</span>
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={user.email}
                            onChange={(e) => handleUserUpdate('email', e.target.value)}
                            className="glass-subtle border-0 focus:glass-prominent"
                          />
                        </div>
                        <div>
                          <Label htmlFor="phone" className="flex items-center space-x-2 mb-2">
                            <Phone className="w-4 h-4 text-green-500" />
                            <span>Phone Number</span>
                          </Label>
                          <Input
                            id="phone"
                            value={user.phone}
                            onChange={(e) => handleUserUpdate('phone', e.target.value)}
                            className="glass-subtle border-0 focus:glass-prominent"
                          />
                        </div>
                        <div>
                          <Label htmlFor="location" className="flex items-center space-x-2 mb-2">
                            <MapPin className="w-4 h-4 text-red-500" />
                            <span>Location</span>
                          </Label>
                          <Input
                            id="location"
                            value={user.location}
                            onChange={(e) => handleUserUpdate('location', e.target.value)}
                            className="glass-subtle border-0 focus:glass-prominent"
                          />
                        </div>
                        <div>
                          <Label htmlFor="company" className="flex items-center space-x-2 mb-2">
                            <Briefcase className="w-4 h-4 text-purple-500" />
                            <span>Current Company</span>
                          </Label>
                          <Input
                            id="company"
                            value={user.company}
                            onChange={(e) => handleUserUpdate('company', e.target.value)}
                            className="glass-subtle border-0 focus:glass-prominent"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-6" />

                    {/* Password Section */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center space-x-2">
                        <Shield className="w-5 h-5 text-red-500" />
                        <span>Password & Security</span>
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label htmlFor="currentPassword" className="flex items-center space-x-2 mb-2">
                            <Lock className="w-4 h-4 text-red-500" />
                            <span>Current Password</span>
                          </Label>
                          <div className="relative">
                            <Input
                              id="currentPassword"
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter current password"
                              className="glass-subtle border-0 focus:glass-prominent pr-10"
                            />
                            <motion.button
                              type="button"
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              className="absolute right-2 top-1/2 transform -translate-y-1/2 p-1 rounded glass-subtle hover:glass-prominent"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </motion.button>
                          </div>
                        </div>
                        <div>
                          <Label htmlFor="newPassword" className="flex items-center space-x-2 mb-2">
                            <Lock className="w-4 h-4 text-green-500" />
                            <span>New Password</span>
                          </Label>
                          <Input
                            id="newPassword"
                            type="password"
                            placeholder="Enter new password"
                            className="glass-subtle border-0 focus:glass-prominent"
                          />
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-3 pt-6">
                      <FloatingButton variant="glass">
                        Cancel
                      </FloatingButton>
                      <FloatingButton variant="primary">
                        <Save className="w-4 h-4 mr-2" />
                        Save Changes
                      </FloatingButton>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </TabsContent>

            {/* Notifications Tab */}
            <TabsContent value="notifications" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <GlassCard variant="floating" className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold flex items-center space-x-2 mb-2">
                      <Bell className="w-5 h-5 text-blue-500" />
                      <span>Notification Preferences</span>
                    </h2>
                    <p className="text-muted-foreground">
                      Choose what notifications you want to receive
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      {[
                        { key: 'jobAlerts', label: 'Job Alerts', description: 'Get notified about new jobs matching your preferences', icon: Briefcase, color: 'text-blue-500' },
                        { key: 'messageNotifications', label: 'Message Notifications', description: 'Receive notifications when recruiters message you', icon: Mail, color: 'text-green-500' },
                        { key: 'applicationUpdates', label: 'Application Updates', description: 'Get updates on your job applications', icon: CheckCircle, color: 'text-purple-500' },
                        { key: 'weeklyDigest', label: 'Weekly Digest', description: 'Receive a weekly summary of new opportunities', icon: Bell, color: 'text-orange-500' },
                        { key: 'marketingEmails', label: 'Marketing Emails', description: 'Receive promotional emails and product updates', icon: Mail, color: 'text-gray-500' }
                      ].map((item, index) => {
                        const IconComponent = item.icon;
                        return (
                          <motion.div
                            key={item.key}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="flex items-center justify-between p-4 glass-subtle rounded-lg hover:glass-prominent transition-all duration-200"
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`p-2 rounded-lg glass-prominent ${item.color}`}>
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <div className="space-y-1">
                                <h4 className="font-medium">{item.label}</h4>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                              </div>
                            </div>
                            <Switch
                              checked={notifications[item.key as keyof typeof notifications]}
                              onCheckedChange={(checked) => handleNotificationChange(item.key, checked)}
                              className="glass-subtle"
                            />
                          </motion.div>
                        );
                      })}
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-6" />

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center space-x-2">
                        <Globe className="w-5 h-5 text-blue-500" />
                        <span>Delivery Method</span>
                      </h3>
                      <div className="space-y-3">
                        <div className="flex items-center space-x-3 p-3 glass-subtle rounded-lg">
                          <input type="radio" id="email-delivery" name="delivery" defaultChecked className="text-blue-500" />
                          <Label htmlFor="email-delivery" className="flex items-center space-x-2 cursor-pointer">
                            <Mail className="w-4 h-4 text-blue-500" />
                            <span>Email</span>
                          </Label>
                        </div>
                        <div className="flex items-center space-x-3 p-3 glass-subtle rounded-lg">
                          <input type="radio" id="sms-delivery" name="delivery" className="text-blue-500" />
                          <Label htmlFor="sms-delivery" className="flex items-center space-x-2 cursor-pointer">
                            <Phone className="w-4 h-4 text-green-500" />
                            <span>SMS</span>
                          </Label>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end pt-6">
                      <FloatingButton variant="primary">
                        <Save className="w-4 h-4 mr-2" />
                        Save Preferences
                      </FloatingButton>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </TabsContent>

            {/* Privacy Tab */}
            <TabsContent value="privacy" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <GlassCard variant="floating" className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold flex items-center space-x-2 mb-2">
                      <Shield className="w-5 h-5 text-red-500" />
                      <span>Privacy & Visibility</span>
                    </h2>
                    <p className="text-muted-foreground">
                      Control who can see your profile and contact you
                    </p>
                  </div>

                  <div className="space-y-6">
                    <div className="space-y-4">
                      {[
                        { key: 'profileVisible', label: 'Profile Visibility', description: 'Make your profile visible to recruiters', icon: Eye, color: 'text-blue-500' },
                        { key: 'showEmail', label: 'Show Email Address', description: 'Display your email on your public profile', icon: Mail, color: 'text-green-500' },
                        { key: 'showPhone', label: 'Show Phone Number', description: 'Display your phone number on your public profile', icon: Phone, color: 'text-purple-500' },
                        { key: 'allowMessages', label: 'Allow Messages', description: 'Allow recruiters to send you messages', icon: Mail, color: 'text-orange-500' }
                      ].map((item, index) => {
                        const IconComponent = item.icon;
                        return (
                          <motion.div
                            key={item.key}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.3, delay: index * 0.1 }}
                            className="flex items-center justify-between p-4 glass-subtle rounded-lg hover:glass-prominent transition-all duration-200"
                          >
                            <div className="flex items-start space-x-3">
                              <div className={`p-2 rounded-lg glass-prominent ${item.color}`}>
                                <IconComponent className="w-4 h-4" />
                              </div>
                              <div className="space-y-1">
                                <h4 className="font-medium">{item.label}</h4>
                                <p className="text-sm text-muted-foreground">{item.description}</p>
                              </div>
                            </div>
                            <Switch
                              checked={privacy[item.key as keyof typeof privacy]}
                              onCheckedChange={(checked) => handlePrivacyChange(item.key, checked)}
                              className="glass-subtle"
                            />
                          </motion.div>
                        );
                      })}
                    </div>

                    <div className="w-full h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-6" />

                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold flex items-center space-x-2">
                        <Shield className="w-5 h-5 text-red-500" />
                        <span>Data & Privacy</span>
                      </h3>
                      <div className="space-y-3">
                        <FloatingButton variant="glass" className="w-full justify-start">
                          <Download className="w-4 h-4 mr-2" />
                          Download My Data
                        </FloatingButton>
                        <FloatingButton variant="glass" className="w-full justify-start text-red-600 hover:bg-red-500/10">
                          <Upload className="w-4 h-4 mr-2" />
                          Request Data Deletion
                        </FloatingButton>
                      </div>
                    </div>

                    <div className="flex justify-end pt-6">
                      <FloatingButton variant="primary">
                        <Save className="w-4 h-4 mr-2" />
                        Save Privacy Settings
                      </FloatingButton>
                    </div>
                  </div>
                </GlassCard>
              </motion.div>
            </TabsContent>

            {/* Billing Tab */}
            <TabsContent value="billing" className="space-y-6">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                <GlassCard variant="floating" className="p-6">
                  <div className="mb-6">
                    <h2 className="text-xl font-semibold flex items-center space-x-2 mb-2">
                      <CreditCard className="w-5 h-5 text-blue-500" />
                      <span>Billing & Subscription</span>
                    </h2>
                    <p className="text-muted-foreground">
                      Manage your subscription and billing information
                    </p>
                  </div>

                  <div className="space-y-6">
                {/* Current Plan */}
                <div className="p-4 border rounded-lg bg-primary/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-lg">Current Plan</h3>
                      <div className="flex items-center space-x-2 mt-1">
                        <Badge variant="default">{user.plan}</Badge>
                        <span className="text-sm text-muted-foreground">$29/month</span>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">
                        Member since {user.joinDate}
                      </p>
                    </div>
                    <Button variant="outline">
                      Upgrade Plan
                    </Button>
                  </div>
                </div>

                {/* Usage */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Usage This Month</h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">24</div>
                      <div className="text-sm text-muted-foreground">Job Applications</div>
                      <div className="text-xs text-muted-foreground mt-1">of 50 limit</div>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">12</div>
                      <div className="text-sm text-muted-foreground">AI Cover Letters</div>
                      <div className="text-xs text-muted-foreground mt-1">of 25 limit</div>
                    </div>
                    <div className="p-4 border rounded-lg text-center">
                      <div className="text-2xl font-bold text-primary">∞</div>
                      <div className="text-sm text-muted-foreground">Job Searches</div>
                      <div className="text-xs text-muted-foreground mt-1">unlimited</div>
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Payment Method */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Payment Method</h3>
                  <div className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 bg-blue-600 rounded flex items-center justify-center text-white text-xs font-bold">
                          VISA
                        </div>
                        <div>
                          <p className="font-medium">•••• •••• •••• 4242</p>
                          <p className="text-sm text-muted-foreground">Expires 12/26</p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        Update
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Billing History */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Billing History</h3>
                  <div className="space-y-2">
                    {[
                      { date: 'Dec 1, 2024', amount: '$29.00', status: 'Paid' },
                      { date: 'Nov 1, 2024', amount: '$29.00', status: 'Paid' },
                      { date: 'Oct 1, 2024', amount: '$29.00', status: 'Paid' }
                    ].map((invoice, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <div>
                            <p className="font-medium">{invoice.date}</p>
                            <p className="text-sm text-muted-foreground">Pro Plan</p>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className="font-medium">{invoice.amount}</span>
                          <Badge variant="outline" className="text-green-600">
                            {invoice.status}
                          </Badge>
                          <Button variant="ghost" size="sm">
                            <Download className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                  </div>
                </GlassCard>
              </motion.div>
            </TabsContent>

          {/* Danger Zone */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <GlassCard variant="floating" className="p-6 ring-2 ring-red-500/20">
              <div className="mb-6">
                <h2 className="text-xl font-semibold flex items-center space-x-2 mb-2 text-red-600">
                  <Trash2 className="w-5 h-5" />
                  <span>Danger Zone</span>
                </h2>
                <p className="text-muted-foreground">
                  Irreversible and destructive actions
                </p>
              </div>

              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 glass-subtle rounded-lg ring-1 ring-red-500/20">
                  <div>
                    <h4 className="font-medium text-red-600">Sign Out</h4>
                    <p className="text-sm text-muted-foreground">Sign out of your account on this device</p>
                  </div>
                  <FloatingButton variant="glass" className="mt-3 sm:mt-0 text-red-600 hover:bg-red-500/10">
                    <LogOut className="w-4 h-4 mr-2" />
                    Sign Out
                  </FloatingButton>
                </div>

                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-4 glass-subtle rounded-lg ring-1 ring-red-500/20">
                  <div>
                    <h4 className="font-medium text-red-600">Delete Account</h4>
                    <p className="text-sm text-muted-foreground">Permanently delete your account and all data</p>
                  </div>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <FloatingButton variant="glass" className="mt-3 sm:mt-0 text-red-600 hover:bg-red-500/10">
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete Account
                      </FloatingButton>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="glass-floating">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel className="glass-subtle">Cancel</AlertDialogCancel>
                        <AlertDialogAction className="bg-red-600 hover:bg-red-700">
                          Delete Account
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </GlassCard>
          </motion.div>
        </Tabs>
        </motion.div>
      </div>
    </div>
  )
}

export default SettingsPage
