"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Send, Mic, MicOff, Loader, Sparkles, Brain, Paperclip, ImageIcon, Folder, X, Upload, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"

type Message = {
  id: string
  content: string
  sender: "user" | "ai"
  timestamp: Date
  isNew?: boolean
  attachments?: FileAttachment[]
  isDeepSeekResponse?: boolean
}

type FileAttachment = {
  name: string
  type: string
  size: number
  url?: string
}

export default function DigitalAssistant() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      content:
        "Hello! I'm Brenin AI powered by DeepSeek. I can provide real-time information, answer complex questions, and assist with various tasks. How can I help you today?",
      sender: "ai",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isListening, setIsListening] = useState(false)
  const [loading, setLoading] = useState(false)
  const [isTyping, setIsTyping] = useState(false)
  const [attachments, setAttachments] = useState<FileAttachment[]>([])
  const [avatarUrl, setAvatarUrl] = useState<string>("")
  const [showAttachmentMenu, setShowAttachmentMenu] = useState(false)
  const [isDeepSeekEnabled, setIsDeepSeekEnabled] = useState(true)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const folderInputRef = useRef<HTMLInputElement>(null)
  const avatarInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  // Focus input on load
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  // Mark new messages as seen after a delay
  useEffect(() => {
    const newMessages = messages.filter((m) => m.isNew)
    if (newMessages.length > 0) {
      const timer = setTimeout(() => {
        setMessages((prev) => prev.map((m) => (m.isNew ? { ...m, isNew: false } : m)))
      }, 1000)
      return () => clearTimeout(timer)
    }
  }, [messages])

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>, isFolder = false) => {
    try {
      const files = event.target.files
      if (!files || files.length === 0) return

      const newAttachments: FileAttachment[] = []

      for (let i = 0; i < Math.min(files.length, 5); i++) {
        const file = files[i]

        if (file.size > 10 * 1024 * 1024) {
          console.warn(`File ${file.name} is too large (max 10MB)`)
          continue
        }

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

  const handleAvatarSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    try {
      const file = event.target.files?.[0]
      if (!file) return

      if (!file.type.startsWith("image/")) {
        console.warn("Please select an image file for avatar")
        return
      }

      if (file.size > 2 * 1024 * 1024) {
        console.warn("Avatar image is too large (max 2MB)")
        return
      }

      const url = URL.createObjectURL(file)
      setAvatarUrl(url)
      event.target.value = ""
    } catch (error) {
      console.error("Error handling avatar selection:", error)
    }
  }

  const removeAttachment = (index: number) => {
    try {
      setAttachments((prev) => {
        const newAttachments = [...prev]
        if (newAttachments[index].url) {
          URL.revokeObjectURL(newAttachments[index].url!)
        }
        newAttachments.splice(index, 1)
        return newAttachments
      })
    } catch (error) {
      console.error("Error removing attachment:", error)
    }
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
    if (type.startsWith("video/")) return <Upload className="h-4 w-4" />
    if (type.includes("pdf")) return <Upload className="h-4 w-4" />
    return <Paperclip className="h-4 w-4" />
  }

  // DeepSeek API integration
  const callDeepSeekAPI = async (userMessage: string, attachments?: FileAttachment[]): Promise<string> => {
    try {
      // Prepare the context for DeepSeek
      let contextMessage = userMessage

      if (attachments && attachments.length > 0) {
        const fileInfo = attachments.map((att) => `${att.name} (${att.type}, ${formatFileSize(att.size)})`).join(", ")
        contextMessage += `\n\nUser has attached files: ${fileInfo}`
      }

      const response = await fetch("/api/deepseek", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: contextMessage,
          context:
            "You are Brenin AI, a helpful digital human assistant. Provide accurate, helpful, and engaging responses.",
        }),
      })

      if (!response.ok) {
        throw new Error(`DeepSeek API error: ${response.status}`)
      }

      const data = await response.json()
      return data.response || "I apologize, but I couldn't process your request at the moment."
    } catch (error) {
      console.error("DeepSeek API error:", error)
      return "I'm experiencing some technical difficulties. Let me try to help you with a basic response."
    }
  }

  // Fallback to Brenin server API
  const callBreninServerAPI = async (queryType: string): Promise<string> => {
    try {
      const response = await fetch(`http://localhost:5000/api/${queryType}`)
      if (!response.ok) {
        throw new Error(`Brenin server error: ${response.status}`)
      }
      const data = await response.json()
      return data.message
    } catch (error) {
      console.error("Brenin server error:", error)
      return getStaticResponse(queryType)
    }
  }

  const getStaticResponse = (queryType: string): string => {
    const responses = {
      weather: "It's currently 72°F and sunny in your area.",
      news: "Today's top headline: Scientists make breakthrough in renewable energy technology.",
      employment: "The current employment rate is 95.2%, showing strong job market growth.",
      market: "Markets are up 2.3% today with technology stocks leading the gains.",
      brenin_projects:
        "Brenin is currently working on AI assistants, digital humans, and natural language processing technologies.",
    }
    return responses[queryType as keyof typeof responses] || "Sorry, I couldn't fetch that information right now."
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

    // Simulate typing indicator
    setTimeout(async () => {
      setLoading(false)
      setIsTyping(true)

      try {
        let aiResponse: string
        let isDeepSeekResponse = false

        if (isDeepSeekEnabled) {
          // Try DeepSeek first for intelligent responses
          aiResponse = await callDeepSeekAPI(currentInput, currentAttachments)
          isDeepSeekResponse = true
        } else {
          // Fallback to basic responses
          aiResponse = await getBasicResponse(currentInput, currentAttachments)
        }

        const aiMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: aiResponse,
          sender: "ai",
          timestamp: new Date(),
          isNew: true,
          isDeepSeekResponse,
        }

        setIsTyping(false)
        setMessages((prev) => [...prev, aiMessage])
      } catch (error) {
        console.error("Error getting AI response:", error)
        const errorMessage: Message = {
          id: (Date.now() + 1).toString(),
          content: "I apologize, but I'm experiencing technical difficulties. Please try again.",
          sender: "ai",
          timestamp: new Date(),
          isNew: true,
        }
        setIsTyping(false)
        setMessages((prev) => [...prev, errorMessage])
      }
    }, 500)
  }

  const getBasicResponse = async (userInput: string, attachments?: FileAttachment[]): Promise<string> => {
    const input = userInput.toLowerCase()

    // Handle file attachments
    if (attachments && attachments.length > 0) {
      const fileTypes = attachments.map((att) => att.type).join(", ")
      const fileNames = attachments.map((att) => att.name).join(", ")
      return `I can see you've shared ${attachments.length} file(s): ${fileNames}. While I can't process files directly yet, I can see they are of types: ${fileTypes}. This is a great feature for future development!`
    }

    // Check for specific queries that should use Brenin server
    if (input.includes("weather")) {
      return await callBreninServerAPI("weather")
    } else if (input.includes("news") || input.includes("headlines")) {
      return await callBreninServerAPI("news")
    } else if (input.includes("employment rate") || input.includes("jobs")) {
      return await callBreninServerAPI("employment")
    } else if (input.includes("market") || input.includes("crash") || input.includes("stocks")) {
      return await callBreninServerAPI("market")
    } else if (input.includes("brenin") && input.includes("project")) {
      return await callBreninServerAPI("brenin_projects")
    }

    // Basic responses
    if (input.includes("hello") || input.includes("hi")) {
      return "Hello there! How can I assist you today?"
    } else if (input.includes("how are you")) {
      return "I'm functioning well, thank you for asking! How about you?"
    } else if (input.includes("name")) {
      return "I'm Brenin, your digital human assistant powered by DeepSeek AI."
    } else if (input.includes("time")) {
      return `The current time is ${new Date().toLocaleTimeString()}.`
    } else if (input.includes("thank")) {
      return "You're welcome! Is there anything else I can help you with?"
    } else if (input.includes("bye") || input.includes("goodbye")) {
      return "Goodbye! Feel free to chat again anytime."
    } else {
      return "That's interesting. Tell me more about that or ask me something else. I'm powered by DeepSeek AI and can help with a wide range of topics!"
    }
  }

  const toggleListening = () => {
    setIsListening(!isListening)
    if (!isListening) {
      console.log("Started listening")
    } else {
      console.log("Stopped listening")
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto relative">
      <div className="chat-background"></div>
      <Card className="w-full chat-container border-none">
        <CardHeader className="chat-header bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          <CardTitle className="flex items-center gap-3">
            <div className="avatar-container relative">
              <Avatar
                className="h-12 w-12 bg-gradient-to-br from-blue-500 to-indigo-600 cursor-pointer"
                onClick={() => avatarInputRef.current?.click()}
              >
                {avatarUrl ? (
                  <AvatarImage src={avatarUrl || "/placeholder.svg"} alt="AI Avatar" />
                ) : (
                  <AvatarFallback>
                    <Brain className="h-6 w-6 text-white" />
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="avatar-glow"></div>
              <Button
                size="sm"
                variant="secondary"
                className="absolute -bottom-1 -right-1 h-6 w-6 rounded-full p-0"
                onClick={() => avatarInputRef.current?.click()}
              >
                <Upload className="h-3 w-3" />
              </Button>
            </div>
            <div className="flex flex-col flex-1">
              <div className="flex items-center gap-2">
                <span className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400">
                  Brenin AI Assistant
                </span>
                {isDeepSeekEnabled && (
                  <div className="flex items-center gap-1 px-2 py-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full">
                    <Zap className="h-3 w-3 text-white" />
                    <span className="text-xs text-white font-medium">DeepSeek</span>
                  </div>
                )}
              </div>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {isDeepSeekEnabled ? "Powered by DeepSeek AI" : "Basic Mode"}
              </span>
            </div>
            <Button
              variant={isDeepSeekEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setIsDeepSeekEnabled(!isDeepSeekEnabled)}
              className="ml-auto"
            >
              <Zap className="h-4 w-4 mr-1" />
              {isDeepSeekEnabled ? "AI On" : "AI Off"}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="h-[400px] overflow-y-auto p-6 space-y-6 messages-container">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"} message-appear`}
                style={{ animationDelay: msg.isNew ? "0ms" : "0ms" }}
              >
                <div
                  className={`max-w-[80%] rounded-2xl p-4 relative ${
                    msg.sender === "user"
                      ? "bg-gradient-to-br from-blue-600 to-indigo-600 text-white user-message-bubble"
                      : `bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 ai-message-bubble ${
                          msg.isDeepSeekResponse ? "border-l-4 border-purple-500" : ""
                        }`
                  }`}
                >
                  {msg.isDeepSeekResponse && (
                    <div className="flex items-center gap-1 mb-2">
                      <Zap className="h-3 w-3 text-purple-500" />
                      <span className="text-xs text-purple-500 font-medium">DeepSeek AI</span>
                    </div>
                  )}

                  <p className="leading-relaxed">{msg.content}</p>

                  {/* Display attachments */}
                  {msg.attachments && msg.attachments.length > 0 && (
                    <div className="mt-3 space-y-2">
                      {msg.attachments.map((attachment, index) => (
                        <div
                          key={index}
                          className="flex items-center gap-2 p-2 bg-black/10 dark:bg-white/10 rounded-lg"
                        >
                          {getFileIcon(attachment.type)}
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{attachment.name}</p>
                            <p className="text-xs opacity-70">{formatFileSize(attachment.size)}</p>
                          </div>
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
              <div className="flex justify-start message-appear">
                <div className="max-w-[80%] rounded-2xl p-4 bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-800 dark:to-gray-900 ai-message-bubble">
                  <div className="typing-indicator">
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              </div>
            )}

            {loading && (
              <div className="flex justify-center">
                <Loader className="h-6 w-6 animate-spin text-primary" />
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </CardContent>
        <CardFooter className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
          {/* Attachments Preview */}
          {attachments.length > 0 && (
            <div className="w-full mb-3">
              <div className="flex flex-wrap gap-2">
                {attachments.map((attachment, index) => (
                  <div key={index} className="flex items-center gap-2 bg-white dark:bg-gray-800 rounded-lg p-2 border">
                    {getFileIcon(attachment.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate max-w-[100px]">{attachment.name}</p>
                      <p className="text-xs text-muted-foreground">{formatFileSize(attachment.size)}</p>
                    </div>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0" onClick={() => removeAttachment(index)}>
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex w-full items-center space-x-2">
            <Button
              variant={isListening ? "destructive" : "outline"}
              size="icon"
              className={`rounded-full h-10 w-10 mic-button ${isListening ? "active" : ""}`}
              onClick={toggleListening}
            >
              {isListening ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>

            {/* Attachment Menu */}
            <div className="relative">
              <Button
                variant="outline"
                size="icon"
                className="rounded-full h-10 w-10"
                onClick={() => setShowAttachmentMenu(!showAttachmentMenu)}
              >
                <Paperclip className="h-4 w-4" />
              </Button>

              {showAttachmentMenu && (
                <div className="absolute bottom-12 left-0 bg-white dark:bg-gray-800 border rounded-lg shadow-lg p-2 space-y-1 z-10">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Paperclip className="h-4 w-4 mr-2" />
                    Select Files
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start"
                    onClick={() => folderInputRef.current?.click()}
                  >
                    <Folder className="h-4 w-4 mr-2" />
                    Select Folder
                  </Button>
                </div>
              )}
            </div>

            <Input
              ref={inputRef}
              placeholder={isDeepSeekEnabled ? "Ask me anything..." : "Type your message..."}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSend()}
              className="rounded-full bg-white dark:bg-gray-800 border-none focus-visible:ring-blue-500 h-10 px-4"
            />
            <Button
              onClick={handleSend}
              className="rounded-full h-10 w-10 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 send-button"
              disabled={(!input.trim() && attachments.length === 0) || loading || isTyping}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </CardFooter>
      </Card>

      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e, false)}
        accept="*/*"
      />
      <input
        ref={folderInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={(e) => handleFileSelect(e, true)}
        {...({ webkitdirectory: "true" } as any)}
      />
      <input ref={avatarInputRef} type="file" className="hidden" onChange={handleAvatarSelect} accept="image/*" />
    </div>
  )
}
