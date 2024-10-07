import { createOpenAI } from "@ai-sdk/openai";
import { generateText, convertToCoreMessages } from "ai";
import dotenv from "dotenv";

dotenv.config();

const openai = createOpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  // 👇 use this if using other oai compatible model providers
  // baseURL: "...",
  // fetch: ..., 👈 could this be an avenue to solve issues?
});

export async function POST(request: Request) {
  if (request.headers.get("X-Is-Completion")?.toLowerCase() === "yes") {
    console.log("X-Is-Completion header detected");
    const { prompt }: { prompt: string } = await request.json();

    const { text } = await generateText({
      model: openai("gpt-4o-mini"),
      prompt,
    });

    console.log(text);

    return new Response(text, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
      },
    });
  }

  const { messages } = await request.json();
  const { responseMessages } = await generateText({
    model: openai("gpt-4o-mini"),
    messages: convertToCoreMessages(messages),
  });

  console.log(responseMessages);

  return Response.json({ messages: responseMessages });
}

// Use a API Client like hoppscotch.io to test this endpoint
export async function GET(request: Request) {
  const { text } = await generateText({
    model: openai("gpt-4o-mini"),
    messages: [{ role: "user", content: "How many r's are there in STaR?" }],
  });

  console.log(text);

  return new Response(text, {
    headers: {
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}
