import { createOpenAI } from "@ai-sdk/openai";
import { streamText, convertToCoreMessages, CoreMessage } from "ai";
import dotenv from "dotenv";

dotenv.config();

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // 👇 use this if using other oai compatible model providers
  // baseURL: "...",
  // fetch: ..., 👈 could this be an avenue to solve issues?
});

export async function POST(request: Request) {
  const { messages }: { messages: CoreMessage[] } = await request.json();
  const result = await streamText({
    model: openai("gpt-4o-mini"),
    messages,
  });

  for await (const textPart of result.textStream) {
    console.log(textPart);
  }

  return result.toTextStreamResponse();
}

// Use a API Client like hoppscotch.io to test this endpoint
export async function GET(request: Request) {
  const result = await streamText({
    model: openai("gpt-4o-mini"),
    messages: convertToCoreMessages([{ role: "user", content: "How many r's are there in STaR?" }]),
  });

  for await (const textPart of result.textStream) {
    console.log(textPart);
  }

  return result.toTextStreamResponse();
}
