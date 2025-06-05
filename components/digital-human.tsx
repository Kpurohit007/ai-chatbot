"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Mic, MicOff, Loader, Sparkles, Brain, Paperclip, ImageIcon, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"

type Message = {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  isNew?: boolean
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
  const [isListening, setIsListening] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  useEffect(() => {
    const newMessages = messages.filter((m) => m.isNew)
    if (newMessages.length > 0) {
      const timer = setTimeout(() => {
        setMessages((prev) => prev.map((m) => (m.isNew ? { ...m, isNew: false } : m)))
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [messages])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const files = event.target.files
      if (!files || files.length === 0) return

      const newAttachments: FileAttachment[] = []

      for (let i = 0; i < Math.min(files.length, 3); i++) {
        const file = files[i]
        if (file.size > 10 * 1024 * 1024) continue

        const attachment: FileAttachment = {
          name: file.name,
          type: file.type || "unknown",
          size: file.size,
          url: URL.createObjectURL(file),
        }
        newAttachments.push(attachment)
      }

      setAttachments((prev) => [...prev, ...newAttachments])
      setShowAttachmentMenu(false)
      event.target.value = ""
    } catch (error) {
      console.error("Error handling file selection:", error)
    }
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
    if (type.startsWith("image/")) return <ImageIcon className="h-3 w-3" />
    return <Paperclip className="h-3 w-3" />
  }

  // DeepSeek API integration
  const callDeepSeekAPI = async (userMessage: string, attachments?: FileAttachment[]): Promise<string> => {
    try {
      let contextMessage = userMessage
      if (attachments && attachments.length > 0) {
        const fileInfo = attachments.map((att) => `${att.name} (${att.type})`).join(", ")
        contextMessage += `\n\nFiles attached: ${fileInfo}`
      }

      const response = await fetch("/api/deepseek", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: contextMessage,
          context: "You are Brenin AI, a helpful digital human assistant. Provide accurate, helpful responses.",
        }),
      })

      if (!response.ok) throw new Error(`API error: ${response.status}`)
      const data = await response.json()
      return data.response || "I apologize, but I couldn't process your request at the moment."
    } catch (error) {
      console.error("DeepSeek API error:", error)
      return getBasicResponse(userMessage, attachments)
    }
  }

  const getBasicResponse = (userInput: string, attachments?: FileAttachment[]): string => {
    const input = userInput.toLowerCase()

    if (attachments && attachments.length > 0) {
      return `I can see you've shared ${attachments.length} file(s). While I can't process files directly yet, I'm here to help with any questions you have!`
    }

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
    if (!input.trim() && attachments.length === 0) return

    const userMessage: Message = {
      id: Date.now().toString(),
      content: input || "Sent files",
      sender: "user",
      timestamp: new Date(),
      isNew: true,
      attachments: attachments.length > 0 ? [...attachments] : undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    const currentInput = input
    const currentAttachments = [...attachments]
    setInput("")
    setAttachments([])
    setLoading(true)

    setTimeout(async () => {
      setLoading(false)
      setIsTyping(true)

      setTimeout(async () => {
        const aiResponse = await callDeepSeekAPI(currentInput, currentAttachments)
        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: aiResponse,
          sender: "ai",
          timestamp: new Date(),
          isNew: true,
        }

        setIsTyping(false)
        setMessages((prev) => [...prev, aiMessage])
      }, 1000)
    }, 500)
  }

  const toggleListening = () => {
    setIsListening(!isListening)
  }

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      <Card className="w-full border-none shadow-lg">
        <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border-b">
          <CardTitle className="flex items-center gap-3">
            <Avatar className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600">
              <AvatarFallback>
                <Brain className="h-6 w-6 text-white" />
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col">
              <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600">
                Brenin AI Assistant
              </span>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" /> Intelligent Conversation
              </span>
            </div>
          </CardTitle>
        </CardHeader>

        <CardContent className="p-0">
          <div className="h-[400px] overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}>
                <div
                  className={`max-w-[80%] rounded-2xl p-4 ${
                    msg.sender === "user"
                      ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white"
                      : "bg-gray-100 dark:bg-gray-800 text-gray-900 dark:text-gray-100"
                  }`}
                >
                  <p className="leading-relaxed">{msg.content}</p>

                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-2 space-y-1">
                      {msg.attachments.map((attachment, index) => (
                        <div key={index} className="flex items-center gap-2 text-xs opacity-80">
                          {getFileIcon(attachment.type)}
                          <span className="truncate">{attachment.name}</span>
                        </div>
                      ))}
                    </div>
                  )}

                  <p className="text-xs opacity-70 mt-2 text-right">
                    {msg.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </p>
                </div>
              </div>
            ))}

            {isTyping && (
              <div className="flex justify-start">
                <div className="max-w-[80%] rounded-2xl p-4 bg-gray-100 dark:bg-gray-800">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    ></div>
                    <div
                      className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex justify-center">
                <Loader className="h-6 w-6 animate-spin text-blue-500" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>

        <CardFooter className="p-4 border-t bg-white dark:bg-gray-950">
          {/* File attachments preview */}
          {attachments.length > 0 && (
            <div className="w-full mb-3">
              <div className="flex flex-wrap gap-2">
                {attachments.map((attachment, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg p-2 text-sm"
                  >
                    {getFileIcon(attachment.type)}
                    <span className="truncate max-w-[100px]">{attachment.name}</span>
                    <Button size="sm" variant="ghost" className="h-4 w-4 p-0" onClick={() => removeAttachment(index)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex w-full items-center space-x-3">
            <Button
              variant={isListening ? "destructive" : "outline"}
              size="icon"
              className="rounded-full h-10 w-10 flex-shrink-0"
              onClick={toggleListening}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>

            <div className="relative">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-10 w-10 flex-shrink-0"
                onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              >
                <Paperclip className="h-4 w-4" />
              </Button>

              {showAttachmentMenu && (
                <div className="absolute bottom-12 left-0 bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-2 z-10">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-sm"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4 mr-2" />
                    Attach Files
                  </Button>
                </div>
              )}
            </div>

            <Input
              ref={inputRef}
              placeholder="Type your message..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="rounded-full bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700 focus-visible:ring-blue-500 h-10 px-4 flex-1"
            />

            <Button
              onClick={handleSend}
              className="rounded-full h-10 w-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 flex-shrink-0"
              disabled={(!input.trim() && attachments.length === 0) || loading || isTyping}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Hidden file input */}
      <input ref={fileInputRef} type="file" multiple className="hidden" onChange={handleFileSelect} accept="*/*" />
    </div>
  )
}
