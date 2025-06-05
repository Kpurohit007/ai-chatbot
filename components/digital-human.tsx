"use client"

import { useState, useRef, useEffect } from "react"
import { Send, Mic, Brain } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Message = {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
}

export default function DigitalAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", content: "Hello! I'm Brenin AI. How can I assist you?", sender: "ai", timestamp: new Date() },
  ])
  const [input, setInput] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // DeepSeek API call
  const callDeepSeekAPI = async (userMessage: string): Promise<string> => {
    try {
      const response = await fetch("/api/deepseek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: userMessage,
          context: "You are Brenin AI, a helpful digital human assistant. Provide accurate, helpful responses.",
        }),
      })

      if (!response.ok) throw new Error(`API error: ${response.status}`)
      const data = await response.json()
      return data.response || "I apologize, but I couldn't process your request at the moment."
    } catch (error) {
      console.error("DeepSeek API error:", error)
      return getBasicResponse(userMessage)
    }
  }

  const getBasicResponse = (userInput: string): string => {
    const input = userInput.toLowerCase()

    if (input.includes("hello") || input.includes("hi")) {
      return "Hello there! How can I assist you today?"
    } else if (input.includes("how are you")) {
      return "I'm functioning well, thank you for asking! How about you?"
    } else if (input.includes("weather")) {
      return "It's currently 72°F and sunny in your area."
    } else if (input.includes("time")) {
      return `The current time is ${new Date().toLocaleTimeString()}.`
    } else if (input.includes("thank")) {
      return "You're welcome! Is there anything else I can help you with?"
    } else {
      return "That's interesting. Tell me more about that or ask me something else."
    }
  }

  const handleSend = async () => {
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input,
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput("")
    setIsTyping(true)

    setTimeout(async () => {
      const aiResponse = await callDeepSeekAPI(currentInput)
      const aiMessage: Message = {
        id: (Date.now() + 1).toString(),
        content: aiResponse,
        sender: "ai",
        timestamp: new Date(),
      }

      setIsTyping(false)
      setMessages((prev) => [...prev, aiMessage])
    }, 1000)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex flex-col items-center justify-center p-4">
      {/* Title - Exact match to screenshot */}
      <h1 className="text-4xl font-bold text-center mb-8 bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
        Brenin Digital Human
      </h1>

      {/* Chat Container - Exact match to screenshot */}
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-xl overflow-hidden">
        {/* Header - Exact match to screenshot */}
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 border-b border-gray-100">
          <div className="flex items-center gap-4">
            {/* Avatar - Exact blue circle with brain icon */}
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center">
              <Brain className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-blue-600">Brenin AI Assistant</h2>
              <p className="text-sm text-gray-600 flex items-center gap-1">✨ Intelligent Conversation</p>
            </div>
          </div>
        </div>

        {/* Messages Area - Exact match to screenshot */}
        <div className="h-96 overflow-y-auto p-6 bg-gray-50">
          <div className="space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    msg.sender === "user"
                      ? "bg-blue-600 text-white"
                      : "bg-white text-gray-800 shadow-sm border border-gray-100"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                  <p className={`text-xs mt-2 ${msg.sender === "user" ? "text-blue-100" : "text-gray-500"}`}>
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-white text-gray-800 shadow-sm border border-gray-100">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area - Exact match to screenshot */}
        <div className="p-6 bg-white border-t border-gray-100">
          <div className="flex items-center gap-3">
            {/* Microphone Button - Exact match */}
            <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-gray-200 hover:bg-gray-50">
              <Mic className="h-5 w-5 text-gray-600" />
            </Button>

            {/* Input Field - Exact match */}
            <div className="flex-1">
              <Input
                ref={inputRef}
                placeholder="Type your message..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                className="rounded-full h-12 px-6 border-gray-200 bg-gray-50 focus:bg-white focus:border-blue-300 focus:ring-blue-200 text-gray-700 placeholder-gray-500"
              />
            </div>

            {/* Send Button - Exact blue gradient match */}
            <Button
              onClick={handleSend}
              disabled={!input.trim() || isTyping}
              className="rounded-full h-12 w-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
