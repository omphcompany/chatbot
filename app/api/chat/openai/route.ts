import { checkApiKey, getServerProfile } from "@/lib/server/server-chat-helpers"
import { ChatSettings } from "@/types"
import { OpenAIStream, StreamingTextResponse } from "ai"
import { ServerRuntime } from "next"
import OpenAI from "openai"
import { ChatCompletionCreateParamsBase } from "openai/resources/chat/completions.mjs"

export const runtime: ServerRuntime = "edge"

export async function POST(request: Request) {

  const json = await request.json()
  const { chatSettings, messages } = json as {
    chatSettings: ChatSettings
    messages: any[]
  }

  try {

    const profile = await getServerProfile()

    checkApiKey(profile.openai_api_key, "OpenAI")

    const openai = new OpenAI({
      apiKey: profile.openai_api_key || "",
      organization: profile.openai_organization_id
    })

    const response = await openai.chat.completions.create({
      model: chatSettings.model as ChatCompletionCreateParamsBase["model"],
      messages: messages as ChatCompletionCreateParamsBase["messages"],
      temperature: chatSettings.temperature,
      image: true,
      max_tokens: chatSettings.model === "gpt-4-vision-preview" ? 4096 : null,
    })

    let imageUrl = null

    const stream = OpenAIStream(response)

    stream.on('data', (data: any) => {
      if (data.image) {
        imageUrl = data.image
      }
    })

    const result = {
      text: await stream.join('\n'),
      image: imageUrl
    }

    return new Response(JSON.stringify(result))

  } catch (error) {

    // Error handling

  }

}
