import { useState, useEffect, useRef } from 'react'
import { Send, Bot, User, Minimize2, Maximize2, X } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { ChatbotService, type ChatMessage } from '../../services/chatbotService'
import Button from '../base/Button'
import Input from '../base/Input'

const initialMessages: ChatMessage[] = [
  {
    id: '1',
    text: "Hi! I'm your JobGenie AI assistant. I can help you with job searching, resume tips, interview preparation, and career advice. What would you like to know?",
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

    try {
      let botResponse: ChatMessage
      
      if (isAuthenticated && user) {
        // Use real chatbot service
        botResponse = await ChatbotService.processMessage(user.id, currentInput)
      } else {
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
      console.error('Error getting bot response:', error)
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
        className="fixed bottom-4 right-4 bg-blue-600 text-white p-4 rounded-full shadow-lg hover:bg-blue-700 transition-colors z-50"
      >
        <Bot className="w-6 h-6" />
      </button>
    )
  }

  return (
    <div className={`fixed bottom-4 right-4 bg-white rounded-lg shadow-xl border flex flex-col z-50 transition-all duration-300 ${
      isMinimized ? 'w-80 h-16' : 'w-96 h-96'
    }`}>
      {/* Header */}
      <div className="p-4 border-b bg-blue-600 text-white rounded-t-lg flex items-center justify-between">
        <div className="flex items-center">
          <Bot className="w-5 h-5 mr-2" />
          <h3 className="font-semibold">AI Career Assistant</h3>
          {isAuthenticated && user && (
            <span className="ml-2 text-xs bg-blue-500 px-2 py-1 rounded-full">
              Personalized
            </span>
          )}
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setIsMinimized(!isMinimized)}
            className="p-1 hover:bg-blue-500 rounded"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </button>
          <button
            onClick={() => setIsVisible(false)}
            className="p-1 hover:bg-blue-500 rounded"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
      
      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs px-3 py-2 rounded-lg ${
                    message.sender === 'user'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-900'
                  }`}
                >
                  <div className="flex items-start space-x-2">
                    {message.sender === 'bot' && <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                    {message.sender === 'user' && <User className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                    <div className="flex-1">
                      {renderMessage(message)}
                      <div className="text-xs opacity-70 mt-1">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-3 py-2 rounded-lg">
                  <div className="flex items-center space-x-1">
                    <Bot className="w-4 h-4" />
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
          
          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex space-x-2">
              <Input
                placeholder={isAuthenticated ? "Ask me anything..." : "Sign in for personalized help..."}
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                disabled={isTyping}
              />
              <Button 
                onClick={handleSendMessage} 
                size="sm"
                disabled={!inputValue.trim() || isTyping}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            {!isAuthenticated && (
              <p className="text-xs text-gray-500 mt-2 text-center">
                Sign in to get personalized job recommendations and career advice
              </p>
            )}
          </div>
        </>
      )}
    </div>
  )
}

  return (
    <div className="fixed bottom-4 right-4 w-96 h-96 bg-white rounded-lg shadow-xl border flex flex-col">
      <div className="p-4 border-b bg-blue-600 text-white rounded-t-lg">
        <div className="flex items-center">
          <Bot className="w-5 h-5 mr-2" />
          <h3 className="font-semibold">AI Career Assistant</h3>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs px-3 py-2 rounded-lg ${
                message.sender === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="flex items-start space-x-2">
                {message.sender === 'bot' && <Bot className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                {message.sender === 'user' && <User className="w-4 h-4 mt-0.5 flex-shrink-0" />}
                <p className="text-sm">{message.text}</p>
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-3 py-2 rounded-lg">
              <div className="flex items-center space-x-1">
                <Bot className="w-4 h-4" />
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      
      <div className="p-4 border-t">
        <div className="flex space-x-2">
          <Input
            placeholder="Ask me anything..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            className="flex-1"
          />
          <Button onClick={handleSendMessage} size="sm">
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}