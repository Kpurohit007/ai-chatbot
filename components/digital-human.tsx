"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Mic, MicOff, Brain, Sparkles, MessageCircle, Zap, Settings, Paperclip, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"

type Message = {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  isTyping?: boolean
}

type FileAttachment = {
  name: string
  type: string
  size: number
  url?: string
}

export default function DigitalAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    { id: "1", content: "Hello! I'm Brenin AI. How can I assist you?", sender: "ai", timestamp: new Date() },
  ])
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const [showSettings, setShowSettings] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

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

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const newAttachments: FileAttachment[] = []
    for (let i = 0; i < Math.min(files.length, 3); i++) {
      const file = files[i]
      if (file.size > 10 * 1024 * 1024) continue

      newAttachments.push({
        name: file.name,
        type: file.type || "unknown",
        size: file.size,
        url: URL.createObjectURL(file),
      })
    }

    setAttachments((prev) => [...prev, ...newAttachments])
    event.target.value = ""
  }

  const removeAttachment = (index: number) => {
    setAttachments((prev) => {
      const newAttachments = [...prev]
      if (newAttachments[index].url) {
        URL.revokeObjectURL(newAttachments[index].url!)
      }
      newAttachments.splice(index, 1)
      return newAttachments
    })
  }

  const handleSend = async () => {
    if (!input.trim() && attachments.length === 0) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input || "Sent files",
      sender: "user",
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    setInput("")
    setAttachments([])
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
    }, 1500)
  }

  const toggleListening = () => {
    setIsListening(!isListening)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-400/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-indigo-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-400/10 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-4">
        {/* Enhanced Header */}
        <div className="text-center mb-8">
          <h1 className="text-5xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 mb-4 animate-pulse">
            Brenin Digital Human
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Experience the future of AI conversation with our advanced digital human assistant
          </p>
        </div>

        {/* Main Chat Container */}
        <Card className="w-full max-w-4xl bg-white/80 backdrop-blur-xl border-0 shadow-2xl rounded-3xl overflow-hidden">
          {/* Enhanced Chat Header */}
          <div className="bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 p-6 relative overflow-hidden">
            <div className="absolute inset-0 bg-black/10"></div>
            <div className="relative z-10 flex items-center justify-between">
              <div className="flex items-center gap-4">
                {/* Enhanced Avatar */}
                <div className="relative">
                  <div className="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center border-2 border-white/30">
                    <Brain className="h-8 w-8 text-white" />
                  </div>
                  <div className="absolute -top-1 -right-1 w-6 h-6 bg-green-400 rounded-full border-2 border-white flex items-center justify-center">
                    <Zap className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    Brenin AI Assistant
                    <Sparkles className="h-5 w-5 text-yellow-300 animate-pulse" />
                  </h2>
                  <p className="text-white/80 text-sm flex items-center gap-1">
                    <MessageCircle className="h-4 w-4" />
                    Intelligent Conversation • Online
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20 rounded-full"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {/* Enhanced Messages Area */}
          <div className="h-96 overflow-y-auto p-6 bg-gradient-to-b from-gray-50/50 to-white/50 backdrop-blur-sm">
            <div className="space-y-4">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                  <div
                    className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl relative ${
                      msg.sender === "user"
                        ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg"
                        : "bg-white/90 backdrop-blur-sm text-gray-800 shadow-md border border-gray-100"
                    }`}
                  >
                    {msg.sender === "ai" && (
                      <div className="absolute -left-2 top-3 w-4 h-4 bg-white/90 backdrop-blur-sm rotate-45 border-l border-t border-gray-100"></div>
                    )}
                    {msg.sender === "user" && (
                      <div className="absolute -right-2 top-3 w-4 h-4 bg-gradient-to-r from-blue-500 to-indigo-600 rotate-45"></div>
                    )}
                    <p className="text-sm leading-relaxed">{msg.content}</p>
                    <p className={`text-xs mt-2 ${msg.sender === "user" ? "text-blue-100" : "text-gray-500"}`}>
                      {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))}

              {isTyping && (
                <div className="flex justify-start">
                  <div className="max-w-xs lg:max-w-md px-4 py-3 rounded-2xl bg-white/90 backdrop-blur-sm text-gray-800 shadow-md border border-gray-100 relative">
                    <div className="absolute -left-2 top-3 w-4 h-4 bg-white/90 backdrop-blur-sm rotate-45 border-l border-t border-gray-100"></div>
                    <div className="flex space-x-1 items-center">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.1s" }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: "0.2s" }}
                        ></div>
                      </div>
                      <span className="text-xs text-gray-500 ml-2">Brenin is typing...</span>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          </div>

          {/* Enhanced Input Area */}
          <div className="p-6 bg-white/90 backdrop-blur-sm border-t border-gray-100">
            {/* File Attachments Preview */}
            {attachments.length > 0 && (
              <div className="mb-4">
                <div className="flex flex-wrap gap-2">
                  {attachments.map((attachment, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-2 text-sm"
                    >
                      <Paperclip className="h-4 w-4 text-blue-500" />
                      <span className="truncate max-w-[100px] text-blue-700">{attachment.name}</span>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-4 w-4 p-0 text-blue-500 hover:text-red-500"
                        onClick={() => removeAttachment(index)}
                      >
                        <X className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex items-center gap-3">
              {/* Enhanced Microphone Button */}
              <Button
                variant={isListening ? "destructive" : "outline"}
                size="icon"
                className={`rounded-full h-12 w-12 transition-all duration-300 ${
                  isListening
                    ? "bg-red-500 hover:bg-red-600 animate-pulse shadow-lg"
                    : "border-gray-200 hover:bg-gray-50 hover:border-blue-300"
                }`}
                onClick={toggleListening}
              >
                {isListening ? <MicOff className="h-5 w-5" /> : <Mic className="h-5 w-5 text-gray-600" />}
              </Button>

              {/* File Attachment Button */}
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-12 w-12 border-gray-200 hover:bg-gray-50 hover:border-blue-300 transition-all duration-300"
                onClick={() => fileInputRef.current?.click()}
              >
                <Paperclip className="h-5 w-5 text-gray-600" />
              </Button>

              {/* Enhanced Input Field */}
              <div className="flex-1 relative">
                <Input
                  ref={inputRef}
                  placeholder="Type your message..."
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  className="rounded-full h-12 px-6 border-gray-200 bg-gray-50/50 backdrop-blur-sm focus:bg-white focus:border-blue-300 focus:ring-blue-200 text-gray-700 placeholder-gray-500 transition-all duration-300"
                />
                {input && (
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                )}
              </div>

              {/* Enhanced Send Button */}
              <Button
                onClick={handleSend}
                disabled={(!input.trim() && attachments.length === 0) || isTyping}
                className="rounded-full h-12 w-12 bg-gradient-to-r from-blue-500 via-purple-500 to-indigo-600 hover:from-blue-600 hover:via-purple-600 hover:to-indigo-700 shadow-lg hover:shadow-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>

            {/* Status Indicator */}
            <div className="flex items-center justify-center mt-3">
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                <span>Powered by DeepSeek AI • Secure & Private</span>
              </div>
            </div>
          </div>
        </Card>

        {/* Hidden file input */}
        <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} accept="*/*" />
      </div>
    </div>
  )
}
