import { useState } from 'react'
import { Send, Bot, User } from 'lucide-react'
import Button from '../base/Button'
import Input from '../base/Input'

interface Message {
  id: number
  text: string
  sender: 'user' | 'bot'
  timestamp: Date
}

const initialMessages: Message[] = [
  {
    id: 1,
    text: "Hi! I'm your JobGenie AI assistant. I can help you with job searching, resume tips, interview preparation, and career advice. What would you like to know?",
    sender: 'bot',
    timestamp: new Date()
  }
]

export default function AIChatbot() {
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [inputValue, setInputValue] = useState('')
  const [isTyping, setIsTyping] = useState(false)

  const handleSendMessage = async () => {
    if (!inputValue.trim()) return

    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    setInputValue('')
    setIsTyping(true)

    // Simulate AI response
    setTimeout(() => {
      const botResponse: Message = {
        id: messages.length + 2,
        text: getBotResponse(inputValue),
        sender: 'bot',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botResponse])
      setIsTyping(false)
    }, 1500)
  }

  const getBotResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()
    
    if (input.includes('resume')) {
      return "Great question about resumes! Here are some key tips: 1) Keep it concise (1-2 pages), 2) Use action verbs and quantify achievements, 3) Tailor it to each job application, 4) Include relevant keywords from the job description. Would you like specific advice for any section?"
    }
    
    if (input.includes('interview')) {
      return "Interview preparation is crucial! Here's what I recommend: 1) Research the company thoroughly, 2) Practice common questions, 3) Prepare specific examples using the STAR method, 4) Have thoughtful questions ready to ask them. What type of interview are you preparing for?"
    }
    
    if (input.includes('salary')) {
      return "Salary negotiation can be tricky! Research market rates using sites like Glassdoor, consider the total compensation package, and be prepared to justify your ask with specific achievements. What role are you negotiating for?"
    }
    
    return "That's an interesting question! I can help you with job searching strategies, resume optimization, interview preparation, salary negotiation, and career development. Could you be more specific about what you'd like help with?"
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