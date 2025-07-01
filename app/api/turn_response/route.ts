import { MODEL } from "@/config/constants";
import { supportsReasoning } from "@/config/models";
import { NextResponse } from "next/server";
import OpenAI from "openai";

// Ensure this API route runs in Node.js runtime so process.env variables are accessible
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    // Extract parameters from request body
    const { messages, tools, model: requestedModel, apiKey: clientKey, reasoning, previousResponseId } = await request.json();
    
    console.log("API Route - Tools received:", tools);
    console.log("API Route - Messages received:", messages?.length);
    
    // Determine API key, fallback to environment variable
    const apiKey = clientKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY is not defined in environment variables");
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }
    
    const openai = new OpenAI({ apiKey });

    // Use requested model or fallback to default
    const modelToUse = requestedModel || MODEL;
    
    // Build streaming payload for multi-turn support  
    // Using ResponseCreateParamsBase with stream: true for proper typing
    const openaiPayload = {
      model: modelToUse,
      input: messages,
      tools,
      stream: true as const,
      parallel_tool_calls: true,
    } satisfies { stream: true } & Record<string, unknown>;
    
    // Include previous_response_id for multi-turn context
    if (previousResponseId) {
      (openaiPayload as any).previous_response_id = previousResponseId;
    }
    
    // Only include reasoning for models that support it
    if (supportsReasoning(modelToUse) && reasoning) {
      (openaiPayload as any).reasoning = reasoning;
      (openaiPayload as any).reasoning.summary = "auto";
    }
    
    // Call OpenAI to get streaming events using the stream method
    const responseStream = openai.responses.stream(openaiPayload);

    // Build a ReadableStream that emits SSE events
    const sseStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of responseStream) {
            console.log("SSE Event received:", event.type, event);
            const data = JSON.stringify({ event: event.type, data: event });
            controller.enqueue(`data: ${data}\n\n`);
          }
          controller.close();
        } catch (err) {
          console.error("Error in streaming loop:", err);
          controller.error(err);
        }
      },
    });

    // Return SSE stream
    return new Response(sseStream, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
      },
    });
  } catch (error) {
    console.error("Error in POST handler:", error);
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
