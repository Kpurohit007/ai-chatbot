"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Mic, Brain, Plus, X, FileText, ImageIcon, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

type Message = {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  attachments?: FileAttachment[]
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
  const [isTyping, setIsTyping] = useState(false)
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files
    if (!files) return

    const newAttachments: FileAttachment[] = []
    for (let i = 0; i < Math.min(files.length, 3); i++) {
      const file = files[i]
      if (file.size > 10 * 1024 * 1024) continue // 10MB limit

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

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes"
    const k = 1024
    const sizes = ["Bytes", "KB", "MB", "GB"]
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Number.parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i]
  }

  const getFileIcon = (type: string) => {
    if (type.startsWith("image/")) return <ImageIcon className="h-4 w-4" />
    if (type.includes("pdf") || type.includes("document")) return <FileText className="h-4 w-4" />
    return <File className="h-4 w-4" />
  }

  // Manual AI Assistant Responses
  const getAIResponse = (userInput: string, attachments?: FileAttachment[]): string => {
    const input = userInput.toLowerCase()

    // Handle file attachments
    if (attachments && attachments.length > 0) {
      const fileNames = attachments.map((att) => att.name).join(", ")
      const fileTypes = attachments.map((att) => {
        if (att.type.startsWith("image/")) return "image"
        if (att.type.includes("pdf")) return "PDF document"
        if (att.type.includes("text")) return "text file"
        if (att.type.includes("document")) return "document"
        return "file"
      })

      return `I can see you've uploaded ${attachments.length} file(s): ${fileNames}. These appear to be ${fileTypes.join(", ")}. While I can't directly process the file contents yet, I can help you with questions about file management, organization, or general information about these file types. What would you like to know?`
    }

    // Basic conversation responses
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
    } else if (input.includes("what can you do") || input.includes("help")) {
      return "I can help you with general questions, provide information about time and weather, assist with file-related queries, and have conversations. Feel free to upload files using the + button and ask me about them!"
    } else if (input.includes("file") || input.includes("upload")) {
      return "You can upload files by clicking the + button next to the input field. I can help you with information about different file types and general file management questions."
    } else if (input.includes("brenin")) {
      return "I'm Brenin AI, your digital human assistant. I'm here to help you with various tasks and answer your questions. What would you like to know?"
    } else {
      return "That's interesting. Tell me more about that or ask me something else."
    }
  }

  const handleSend = async () => {
    if (!input.trim() && attachments.length === 0) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input || "Uploaded files",
      sender: "user",
      timestamp: new Date(),
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    const currentAttachments = [...attachments]
    setInput("")
    setAttachments([])
    setIsTyping(true)

    // Simulate thinking time
    setTimeout(() => {
      const aiResponse = getAIResponse(currentInput, currentAttachments)
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

                  {/* Display file attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 bg-black/10 dark:bg-white/10 rounded-lg"
                        >
                          {getFileIcon(attachment.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-medium truncate">{attachment.name}</p>
                            <p className="text-xs opacity-70">{formatFileSize(attachment.size)}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

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

        {/* Input Area - Exact match to screenshot with file upload */}
        <div className="p-6 bg-white border-t border-gray-100">
          {/* File Attachments Preview */}
          {attachments.length > 0 && (
            <div className="mb-4">
              <div className="flex flex-wrap gap-2">
                {attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-blue-50 border border-blue-200 rounded-lg p-2 text-sm"
                  >
                    {getFileIcon(attachment.type)}
                    <span className="truncate max-w-[120px] text-blue-700">{attachment.name}</span>
                    <span className="text-xs text-blue-500">({formatFileSize(attachment.size)})</span>
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
            {/* Microphone Button - Exact match */}
            <Button variant="outline" size="icon" className="rounded-full h-12 w-12 border-gray-200 hover:bg-gray-50">
              <Mic className="h-5 w-5 text-gray-600" />
            </Button>

            {/* File Upload Button - New + button */}
            <Button
              variant="outline"
              size="icon"
              className="rounded-full h-12 w-12 border-gray-200 hover:bg-gray-50"
              onClick={() => fileInputRef.current?.click()}
            >
              <Plus className="h-5 w-5 text-gray-600" />
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
              disabled={(!input.trim() && attachments.length === 0) || isTyping}
              className="rounded-full h-12 w-12 bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-lg"
            >
              <Send className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} accept="*/*" />
    </div>
  )
}
