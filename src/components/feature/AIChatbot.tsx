import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Minimize2, Maximize2, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { ChatbotService, type ChatMessage } from '../../services/chatbotService'
import Button from '../base/Button'
import Input from '../base/Input'

const initialMessages: ChatMessage[] = [
  {
    id: '1',
    text: "👋 Hi! I'm your JobGenie AI assistant. I can help you with:\n\n🔍 Job search strategies\n📝 Resume optimization\n🎯 Interview preparation\n💰 Salary negotiation\n📈 Career development\n\nWhat can I help you with today?",
    sender: 'bot',
    timestamp: new Date(),
    type: 'text'
  }
]

export default function AIChatbot() {
  const { user, isAuthenticated } = useAuth()
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      text: inputValue,
      sender: 'user',
      timestamp: new Date(),
      type: 'text'
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = inputValue
    setInputValue('')
    setIsTyping(true)

    console.log('💬 ChatBot UI: Processing user message:', currentInput)

    try {
      let botResponse: ChatMessage
      
      if (isAuthenticated && user) {
        console.log('👤 ChatBot UI: User authenticated, calling ChatBot service...')
        // Use real chatbot service
        botResponse = await ChatbotService.processMessage(user.id, currentInput)
        console.log('🤖 ChatBot UI: Received response:', botResponse.text.substring(0, 50) + '...')
      } else {
        console.log('🔒 ChatBot UI: User not authenticated, using fallback response')
        // Fallback for non-authenticated users
        botResponse = {
          id: Date.now().toString(),
          text: "I'd love to help you! Please sign in to get personalized career advice and job recommendations tailored to your profile.",
          sender: 'bot',
          timestamp: new Date(),
          type: 'text'
        }
      }
      
      setMessages(prev => [...prev, botResponse])
    } catch (error) {
      console.error('❌ ChatBot UI: Error getting bot response:', error)
      const errorResponse: ChatMessage = {
        id: Date.now().toString(),
        text: "I apologize, but I'm having trouble processing your request right now. Please try again!",
        sender: 'bot',
        timestamp: new Date(),
        type: 'text'
      }
      setMessages(prev => [...prev, errorResponse])
    } finally {
      setIsTyping(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const renderMessage = (message: ChatMessage) => {
    if (message.type === 'job_recommendations' && message.data) {
      return (
        <div className="space-y-2">
          <p className="text-sm">{message.text}</p>
          <div className="space-y-2">
            {message.data.slice(0, 3).map((job: any) => (
              <div key={job.id} className="bg-blue-50 rounded-lg p-3 text-sm">
                <div className="font-medium text-blue-900">{job.title}</div>
                <div className="text-blue-700">{job.company.name}</div>
                <div className="text-blue-600 text-xs mt-1">
                  {job.location} • {job.salaryMin && job.salaryMax ? `$${job.salaryMin/1000}k-$${job.salaryMax/1000}k` : 'Salary not specified'}
                  {job.matchScore && (
                    <span className="ml-2 bg-green-100 text-green-800 px-1 py-0.5 rounded">
                      {Math.round(job.matchScore * 100)}% match
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )
    }

    return <p className="text-sm whitespace-pre-wrap">{message.text}</p>
  }

  if (!isVisible) {
    return (
      <button
        onClick={() => setIsVisible(true)}
        className="fixed bottom-6 right-6 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-4 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 z-50 hover:scale-110"
      >
        <Bot className="w-7 h-7" />
      </button>
    )
  }

  return (
    <div className={`fixed bottom-6 right-6 bg-white/95 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20 flex flex-col z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-[420px] h-[600px]'
    }`}>
      {/* Header */}
      <div className="p-5 border-b border-white/10 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-2xl flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
            <Bot className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-lg">JobGenie AI</h3>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs bg-green-500/80 px-2 py-0.5 rounded-full backdrop-blur-sm">
                AI-Powered
              </span>
              {isAuthenticated && user && (
                <span className="text-xs bg-purple-500/80 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  Personalized
                </span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[280px] px-4 py-3 rounded-2xl ${
                    message.sender === 'user'
                      ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg'
                      : 'bg-gray-50 text-gray-900 border border-gray-200 shadow-sm'
                  }`}
                >
                  <div className="flex items-start space-x-3">
                    {message.sender === 'bot' && (
                      <div className="p-1.5 bg-blue-100 rounded-full flex-shrink-0 mt-0.5">
                        <Bot className="w-3.5 h-3.5 text-blue-600" />
                      </div>
                    )}
                    {message.sender === 'user' && (
                      <div className="p-1.5 bg-white/20 rounded-full flex-shrink-0 mt-0.5">
                        <User className="w-3.5 h-3.5 text-white" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="text-sm leading-relaxed">
                        {renderMessage(message)}
                      </div>
                      <div className={`text-xs mt-2 ${
                        message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                      }`}>
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 rounded-2xl border border-blue-100 shadow-sm">
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 bg-blue-100 rounded-full">
                      <Bot className="w-3.5 h-3.5 text-blue-600" />
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm text-blue-700 font-medium">AI is thinking</span>
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input */}
          <div className="p-5 border-t border-gray-100 bg-gray-50/50">
            <div className="flex space-x-3">
              <div className="flex-1 relative">
                <Input
                  placeholder={isAuthenticated ? "Ask me anything about your career..." : "Sign in for personalized help..."}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyPress}
                  className="w-full pl-4 pr-12 py-3 rounded-xl border border-gray-200 bg-white shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                  disabled={isTyping}
                />
              </div>
              <Button 
                onClick={handleSendMessage} 
                size="sm"
                disabled={!inputValue.trim() || isTyping}
                className="px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-xl shadow-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            {!isAuthenticated && (
              <p className="text-xs text-gray-500 mt-3 text-center leading-relaxed">
                💡 Sign in to get personalized job recommendations and career advice
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}