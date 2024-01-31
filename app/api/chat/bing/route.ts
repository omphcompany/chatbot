import { BingChat } from '@bing-ai/chat';

const bingClient = new BingChat({
  apiKey: process.env.BING_API_KEY
});

export async function POST(request) {

  const { chatSettings, messages } = await request.json();

  const query = messages[messages.length - 1].content;

  const bingResponse = await bingClient.chat({
    query,
    sessionId: // optional session id
  });

  return new Response(JSON.stringify(bingResponse), {
    headers: { 'Content-Type': 'application/json' },
  });

}
