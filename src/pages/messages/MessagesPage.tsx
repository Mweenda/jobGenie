import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Search, Phone, Video, MoreVertical, ArrowLeft, Paperclip, Smile, Check, CheckCheck, MessageSquare, Users, Briefcase } from 'lucide-react'
// import { Button } from '@/components/ui/button' // Unused
import { Input } from '@/components/ui/input'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { GlassCard } from '@/components/ui/glass-card'
import { FloatingButton } from '@/components/ui/floating-button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '@/components/ui/dropdown-menu'
import Header from '@/components/feature/Header'

// Mock data for conversations
const mockConversations = [
  {
    id: '1',
    name: 'Sarah Johnson',
    role: 'Senior Recruiter',
    company: 'TechCorp Inc',
    avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b1a0?w=150&h=150&fit=crop&crop=face',
    lastMessage: 'Thanks for your interest! I\'d love to schedule a call to discuss the Senior Frontend Developer position.',
    timestamp: '2 min ago',
    unread: 2,
    online: true,
    jobTitle: 'Senior Frontend Developer'
  },
  {
    id: '2',
    name: 'Mike Chen',
    role: 'Hiring Manager',
    company: 'StartupXYZ',
    avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
    lastMessage: 'Great portfolio! When would you be available for a technical interview?',
    timestamp: '1 hour ago',
    unread: 0,
    online: false,
    jobTitle: 'Product Manager'
  },
  {
    id: '3',
    name: 'Emily Rodriguez',
    role: 'HR Manager',
    company: 'Design Studio',
    avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face',
    lastMessage: 'We received your application for the UX Designer role. Our team will review it and get back to you soon.',
    timestamp: '3 hours ago',
    unread: 0,
    online: true,
    jobTitle: 'UX Designer'
  },
  {
    id: '4',
    name: 'David Park',
    role: 'Technical Lead',
    company: 'CloudTech Solutions',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    lastMessage: 'Your experience with AWS and Kubernetes looks impressive. Let\'s connect!',
    timestamp: '1 day ago',
    unread: 1,
    online: false,
    jobTitle: 'DevOps Engineer'
  },
  {
    id: '5',
    name: 'Lisa Wang',
    role: 'Data Science Manager',
    company: 'AI Innovations',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face',
    lastMessage: 'Hi! I saw your application for the Data Scientist position. Would you be interested in a quick chat about the role?',
    timestamp: '2 days ago',
    unread: 0,
    online: true,
    jobTitle: 'Data Scientist'
  }
]

// Mock messages for selected conversation
const mockMessages = [
  {
    id: '1',
    senderId: '1',
    content: 'Hi! I saw your application for the Senior Frontend Developer position. Your experience with React and TypeScript is exactly what we\'re looking for.',
    timestamp: '10:30 AM',
    status: 'read'
  },
  {
    id: '2',
    senderId: 'me',
    content: 'Thank you for reaching out! I\'m very excited about this opportunity. I\'d love to learn more about the role and the team.',
    timestamp: '10:45 AM',
    status: 'read'
  },
  {
    id: '3',
    senderId: '1',
    content: 'Great! We\'re a team of 8 engineers working on our main web platform. The role involves building new features and improving performance. Are you available for a quick call this week?',
    timestamp: '11:00 AM',
    status: 'read'
  },
  {
    id: '4',
    senderId: 'me',
    content: 'That sounds perfect! I\'m available Tuesday or Wednesday afternoon. What time works best for you?',
    timestamp: '11:15 AM',
    status: 'read'
  },
  {
    id: '5',
    senderId: '1',
    content: 'Thanks for your interest! I\'d love to schedule a call to discuss the Senior Frontend Developer position.',
    timestamp: '2 min ago',
    status: 'delivered'
  }
]

const ConversationItem: React.FC<{
  conversation: any;
  isSelected: boolean;
  onClick: () => void;
  delay: number;
}> = ({ conversation, isSelected, onClick, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay }}
      className="px-3 mb-2"
    >
      <motion.div
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
        className={`relative cursor-pointer rounded-xl transition-all duration-200 ${
          isSelected 
            ? 'bg-blue-50/80 border border-blue-200/50 shadow-md' 
            : 'hover:bg-white/40 hover:shadow-sm'
        }`}
        onClick={onClick}
      >
        <div className="p-3">
          <div className="flex items-center space-x-3">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <Avatar className="w-10 h-10">
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white text-sm font-semibold">
                  {conversation.name.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              {conversation.online && (
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-500 border-2 border-white rounded-full" />
              )}
            </div>
            
            {/* Content */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between mb-1">
                <h3 className="font-semibold text-sm text-adaptive truncate">
                  {conversation.name}
                </h3>
                <div className="flex items-center space-x-2 flex-shrink-0">
                  <span className="text-xs text-gray-500">
                    {conversation.timestamp}
                  </span>
                  {conversation.unread > 0 && (
                    <div className="w-2 h-2 bg-blue-500 rounded-full" />
                  )}
                </div>
              </div>
              
              <p className="text-xs text-adaptive-secondary mb-1.5 flex items-center">
                <Briefcase className="w-3 h-3 mr-1 text-gray-400 dark:text-gray-500" />
                {conversation.role} at {conversation.company}
              </p>
              
              <div className="flex items-center justify-between">
                <p className="text-xs text-adaptive-muted truncate pr-2 leading-relaxed flex-1">
                  {conversation.lastMessage}
                </p>
                
                {conversation.unread > 0 && (
                  <Badge className="bg-blue-500 text-white text-xs px-1.5 py-0.5 h-5 min-w-[20px] flex-shrink-0">
                    {conversation.unread}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}

const MessageBubble: React.FC<{ message: any; isMe: boolean; delay: number }> = ({ message, isMe, delay }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.3, delay }}
      className={`flex mb-4 ${isMe ? "justify-end" : "justify-start"}`}
    >
                <div
                  className={`max-w-[85%] sm:max-w-[70%] rounded-2xl px-4 py-3 text-sm relative ${
                    isMe 
                      ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg" 
                      : "glass-prominent"
                  }`}
                >
        <p className={`leading-relaxed ${isMe ? "text-white" : "text-adaptive"}`}>{message.content}</p>
        <div className={`flex items-center justify-end mt-2 space-x-1 text-xs ${
          isMe ? "text-blue-100" : "text-adaptive-muted"
        }`}>
          <span>{message.timestamp}</span>
          {isMe && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: delay + 0.2 }}
            >
              {message.status === 'delivered' && <Check className="w-3 h-3" />}
              {message.status === 'read' && <CheckCheck className="w-3 h-3 text-blue-200" />}
            </motion.div>
          )}
        </div>
        
        {/* Message tail */}
        <div className={`absolute top-4 ${
          isMe 
            ? "-right-2 border-l-8 border-l-blue-500 border-t-4 border-b-4 border-t-transparent border-b-transparent" 
            : "-left-2 border-r-8 border-r-white/20 border-t-4 border-b-4 border-t-transparent border-b-transparent"
        }`} />
      </div>
    </motion.div>
  )
}

const MessagesPage: React.FC = () => {
  const [selectedConversation, setSelectedConversation] = useState(mockConversations[0])
  const [newMessage, setNewMessage] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [showConversationList, setShowConversationList] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const filteredConversations = mockConversations.filter(conv =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
    conv.jobTitle.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [mockMessages])

  const handleSendMessage = () => {
    if (newMessage.trim()) {
      // In real app, this would send the message
      console.log('Sending message:', newMessage)
      setNewMessage('')
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-purple-900">
      <Header />
      
      <div className="h-screen pt-16 sm:pt-20 flex max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
        {/* Conversations Sidebar */}
        <div className={`w-full md:w-72 lg:w-80 flex flex-col ${
          !showConversationList && "hidden md:flex"
        }`}>
          <div className="h-full pr-3 py-4">
            <GlassCard variant="floating" className="h-full flex flex-col shadow-xl">
              {/* Sidebar Header */}
              <div className="p-5 border-b border-white/10">
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="p-2 bg-blue-100 rounded-xl">
                        <MessageSquare className="w-5 h-5 text-blue-600" />
                      </div>
                      <div>
                        <h1 className="text-lg font-bold text-adaptive">Messages</h1>
                        <p className="text-xs text-adaptive-muted">{mockConversations.length} conversations</p>
                      </div>
                    </div>
                  </div>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <Input
                      placeholder="Search conversations..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10 bg-white/60 border border-gray-200/50 rounded-xl text-sm focus:bg-white/80 transition-all"
                    />
                  </div>
                </motion.div>
              </div>

              {/* Conversations List */}
              <div className="flex-1 overflow-y-auto">
                <div className="px-3 py-2">
                  <AnimatePresence>
                    {filteredConversations.length > 0 ? (
                      <div className="space-y-2">
                        {filteredConversations.map((conversation, index) => (
                          <ConversationItem
                            key={conversation.id}
                            conversation={conversation}
                            isSelected={selectedConversation?.id === conversation.id}
                            delay={index * 0.05}
                            onClick={() => {
                              setSelectedConversation(conversation)
                              setShowConversationList(false)
                            }}
                          />
                        ))}
                      </div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="p-8 text-center"
                    >
                      <Search className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                      <p className="text-muted-foreground">No conversations found</p>
                    </motion.div>
                  )}
                  </AnimatePresence>
                </div>
              </div>
            </GlassCard>
          </div>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col min-w-0 ${
          showConversationList && "hidden md:flex"
        }`}>
          <div className="h-full py-4 pl-3">
            {selectedConversation ? (
              <GlassCard variant="floating" className="h-full flex flex-col">
                {/* Chat Header */}
                <motion.div
                  initial={{ opacity: 0, y: -20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  className="p-5 border-b border-white/10"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <FloatingButton
                        variant="glass"
                        size="sm"
                        className="md:hidden"
                        onClick={() => setShowConversationList(true)}
                      >
                        <ArrowLeft className="w-4 h-4" />
                      </FloatingButton>
                      
                      <div className="relative">
                        <Avatar className="w-10 h-10">
                          <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-500 text-white">
                            {selectedConversation.name.split(' ').map((n: string) => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                        {selectedConversation.online && (
                          <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 border-2 border-white rounded-full" />
                        )}
                      </div>
                      
                      <div>
                        <h2 className="text-lg font-bold text-adaptive">{selectedConversation.name}</h2>
                        <div className="flex items-center space-x-3 text-sm">
                          <p className="text-adaptive-secondary flex items-center">
                            <Briefcase className="w-3 h-3 mr-1.5" />
                            {selectedConversation.role} at {selectedConversation.company}
                          </p>
                          <span className="w-1 h-1 bg-gray-400 dark:bg-gray-500 rounded-full"></span>
                          <p className="text-adaptive-muted">
                            {selectedConversation.online ? 'Online now' : 'Last seen recently'}
                          </p>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <FloatingButton variant="glass" size="sm">
                        <Phone className="w-4 h-4" />
                      </FloatingButton>
                      <FloatingButton variant="glass" size="sm">
                        <Video className="w-4 h-4" />
                      </FloatingButton>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <FloatingButton variant="glass" size="sm">
                            <MoreVertical className="w-4 h-4" />
                          </FloatingButton>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="glass-floating border-white/10">
                          <DropdownMenuItem>View Profile</DropdownMenuItem>
                          <DropdownMenuItem>Mute Conversation</DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem className="text-red-600">Block Contact</DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>

                  {/* Job Context */}
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mt-4"
                  >
                    <div className="glass-prominent p-3 rounded-lg">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          <Briefcase className="w-4 h-4 text-blue-500" />
                          <div>
                            <h3 className="font-medium text-sm">
                              {selectedConversation.jobTitle}
                            </h3>
                            <p className="text-xs text-muted-foreground">
                              {selectedConversation.company}
                            </p>
                          </div>
                        </div>
                        <FloatingButton size="sm" variant="primary">
                          View Job
                        </FloatingButton>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-3 sm:p-4">
                  <div className="space-y-3 sm:space-y-4">
                    {mockMessages.map((message, index) => (
                      <MessageBubble
                        key={message.id}
                        message={message}
                        isMe={message.senderId === 'me'}
                        delay={index * 0.1}
                      />
                    ))}
                    <div ref={messagesEndRef} />
                  </div>
                </div>

                {/* Floating Message Input */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="p-5 border-t border-white/10"
                >
                  <div className="flex items-end space-x-3">
                    <FloatingButton variant="glass" size="sm" className="opacity-80 hover:opacity-100 flex-shrink-0">
                      <Paperclip className="w-4 h-4" />
                    </FloatingButton>
                    
                    <div className="flex-1 relative">
                      <Input
                        placeholder="Type your message..."
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        onKeyPress={handleKeyPress}
                        className="bg-white/80 border border-gray-200/50 rounded-xl py-3 px-4 pr-12 text-sm focus:bg-white focus:border-blue-300 transition-all"
                      />
                      <FloatingButton
                        variant="glass"
                        size="sm"
                        className="absolute right-2 top-1/2 transform -translate-y-1/2 opacity-70 hover:opacity-100"
                      >
                        <Smile className="w-4 h-4" />
                      </FloatingButton>
                    </div>
                    
                    <FloatingButton
                      onClick={handleSendMessage}
                      disabled={!newMessage.trim()}
                      variant="primary"
                      size="sm"
                      className="flex-shrink-0 bg-blue-500 hover:bg-blue-600 disabled:opacity-50"
                    >
                      <Send className="w-4 h-4" />
                    </FloatingButton>
                  </div>
                </motion.div>
              </GlassCard>
            ) : (
              // No conversation selected
              <GlassCard variant="floating" className="h-full flex items-center justify-center">
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5 }}
                  className="text-center p-8"
                >
                  <div className="w-24 h-24 mx-auto mb-6 rounded-full glass-prominent flex items-center justify-center">
                    <MessageSquare className="w-12 h-12 text-blue-500" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">
                    Select a conversation
                  </h3>
                  <p className="text-muted-foreground max-w-md">
                    Choose a conversation from the sidebar to start messaging with recruiters and hiring managers.
                  </p>
                </motion.div>
              </GlassCard>
            )}
          </div>
        </div>

        {/* Empty State for no conversations */}
        {filteredConversations.length === 0 && !searchQuery && (
          <div className="flex-1 flex items-center justify-center p-8">
            <GlassCard variant="floating" className="p-12">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
                className="text-center"
              >
                <div className="w-24 h-24 mx-auto mb-6 rounded-full glass-prominent flex items-center justify-center">
                  <Users className="w-12 h-12 text-purple-500" />
                </div>
                <h3 className="text-xl font-semibold mb-2">
                  No messages yet
                </h3>
                <p className="text-muted-foreground max-w-md mb-6">
                  When you apply for jobs or recruiters reach out, your conversations will appear here.
                </p>
                <FloatingButton variant="primary">
                  <Briefcase className="w-4 h-4 mr-2" />
                  Browse Jobs
                </FloatingButton>
              </motion.div>
            </GlassCard>
          </div>
        )}
      </div>
    </div>
  )
}

export default MessagesPage
