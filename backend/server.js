const express = require("express")
const cors = require("cors")
const app = express()
const port = 5000

app.use(cors())
app.use(express.json())

// Enhanced API endpoints with more detailed responses
app.get("/api/weather", (req, res) => {
  const weatherData = {
    message:
      "Current weather: 72°F (22°C), sunny with light clouds. Humidity: 45%, Wind: 8 mph from the west. UV Index: 6 (High). Perfect day for outdoor activities!",
    temperature: 72,
    condition: "sunny",
    humidity: 45,
    windSpeed: 8,
  }
  res.json(weatherData)
})

app.get("/api/news", (req, res) => {
  const newsData = {
    message:
      "🔥 Breaking: Scientists achieve breakthrough in quantum computing, potentially revolutionizing AI processing speeds by 1000x. Tech stocks surge as major companies announce quantum partnerships.",
    category: "technology",
    timestamp: new Date().toISOString(),
  }
  res.json(newsData)
})

app.get("/api/employment", (req, res) => {
  const employmentData = {
    message:
      "📊 Employment Update: Current rate at 95.8% (up 0.3% from last month). Tech sector leading with 12,000 new positions. Remote work opportunities increased by 25%. Job market remains robust across all sectors.",
    rate: 95.8,
    trend: "increasing",
    topSectors: ["Technology", "Healthcare", "Finance"],
  }
  res.json(employmentData)
})

app.get("/api/market", (req, res) => {
  const marketData = {
    message:
      "📈 Markets Today: S&P 500 +2.8%, NASDAQ +3.1%, DOW +2.2%. AI and clean energy stocks leading gains. Bitcoin at $45,200 (+4.2%). Strong earnings reports driving optimism.",
    sp500: "+2.8%",
    nasdaq: "+3.1%",
    dow: "+2.2%",
    bitcoin: "$45,200 (+4.2%)",
  }
  res.json(marketData)
})

app.get("/api/brenin_projects", (req, res) => {
  const projectData = {
    message:
      "🚀 Brenin Technologies Current Projects:\n• Advanced Digital Human AI with DeepSeek integration\n• Real-time conversation processing\n• Multi-modal file handling system\n• Voice recognition & synthesis\n• Enterprise AI solutions\n• Next-gen chatbot frameworks",
    projects: [
      "Digital Human AI Platform",
      "DeepSeek Integration",
      "Voice AI Systems",
      "Enterprise Solutions",
      "Multi-modal Processing",
    ],
    status: "active_development",
  }
  res.json(projectData)
})

// New endpoints for enhanced functionality
app.get("/api/ai-status", (req, res) => {
  res.json({
    message:
      "🤖 Brenin AI Status: All systems operational. DeepSeek integration active. Processing speed: optimal. Ready to assist with any queries!",
    status: "operational",
    uptime: "99.9%",
    lastUpdate: new Date().toISOString(),
  })
})

app.get("/api/capabilities", (req, res) => {
  res.json({
    message:
      "💡 My Capabilities:\n• Real-time information retrieval\n• Complex question answering\n• File processing & analysis\n• Multi-language support\n• Code assistance\n• Creative writing\n• Data analysis\n• Problem solving",
    features: [
      "Information Retrieval",
      "Question Answering",
      "File Processing",
      "Multi-language Support",
      "Code Assistance",
      "Creative Writing",
      "Data Analysis",
    ],
  })
})

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    server: "Brenin Digital Human Backend",
  })
})

app.listen(port, () => {
  console.log(`🚀 Brenin Digital Human Server running at http://localhost:${port}`)
  console.log(`📊 Health check available at http://localhost:${port}/health`)
})
