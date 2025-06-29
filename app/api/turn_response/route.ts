import { MODEL } from "@/config/constants";
import { supportsReasoning } from "@/config/models";
import { NextResponse } from "next/server";
import OpenAI from "openai";

// Ensure this API route runs in Node.js runtime so process.env variables are accessible
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    // Extract parameters from request body
        const { messages, tools, model: requestedModel, apiKey: clientKey, reasoning } = await request.json();
    // Determine API key, fallback to environment variable
    const apiKey = clientKey || process.env.OPENAI_API_KEY;
    if (!apiKey) {
      console.error("OPENAI_API_KEY is not defined in environment variables");
      return NextResponse.json(
        { error: "API key not configured" },
        { status: 500 }
      );
    }
    
    if (!apiKey) {
      console.error("API key not provided or configured");
      return NextResponse.json({ error: "API key not configured" }, { status: 500 });
    }
    const openai = new OpenAI({ apiKey });

    // Use requested model or fallback to default
    const modelToUse = requestedModel || MODEL;
    
    // Build OpenAI request payload conditionally based on model capabilities
    const openaiPayload: any = {
      model: modelToUse,
      input: messages,
      tools,
      stream: true,
      parallel_tool_calls: true,
    };
    
    // Only include reasoning for models that support it
    if (supportsReasoning(modelToUse) && reasoning) {
      openaiPayload.reasoning = reasoning;
      openaiPayload.reasoning.summary = "auto";
    }
    
    // Call OpenAI with conditionally included reasoning
    const events = await openai.responses.create(openaiPayload as any);

    // Create a ReadableStream that emits SSE data
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of events) {
            // Sending all events to the client
            const data = JSON.stringify({
              event: event.type,
              data: event,
            });
            controller.enqueue(`data: ${data}\n\n`);
          }
          // End of stream
          controller.close();
        } catch (error) {
          console.error("Error in streaming loop:", error);
          controller.error(error);
        }
      },
    });

    // Return the ReadableStream as SSE
    return new Response(stream, {
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
