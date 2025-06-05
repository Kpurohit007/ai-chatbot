import { type NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const { message, context } = await request.json()

    // DeepSeek API configuration
    const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"
    const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY

    if (!DEEPSEEK_API_KEY) {
      console.error("DeepSeek API key not found")
      return NextResponse.json({ error: "DeepSeek API key not configured" }, { status: 500 })
    }

    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          {
            role: "system",
            content:
              context ||
              "You are Brenin AI, a helpful digital human assistant. Provide accurate, helpful, and engaging responses. Be conversational and friendly.",
          },
          {
            role: "user",
            content: message,
          },
        ],
        max_tokens: 1000,
        temperature: 0.7,
        stream: false,
      }),
    })

    if (!response.ok) {
      const errorData = await response.text()
      console.error("DeepSeek API error:", response.status, errorData)
      return NextResponse.json({ error: "Failed to get response from DeepSeek" }, { status: response.status })
    }

    const data = await response.json()
    const aiResponse = data.choices?.[0]?.message?.content || "I apologize, but I could not generate a response."

    return NextResponse.json({ response: aiResponse })
  } catch (error) {
    console.error("DeepSeek API route error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
