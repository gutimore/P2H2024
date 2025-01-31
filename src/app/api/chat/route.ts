import { NextResponse } from "next/server";
import { askQuestion } from "../../../lib/vectorStore";

export async function POST(request: Request) {
  try {
    const { messages, fileIds } = await request.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json(
        { error: "Invalid or missing messages" },
        { status: 400 }
      );
    }

    const answer = await askQuestion(
      messages[messages.length - 1].content,
      fileIds
    );

    console.log("ANS > ", answer);

    return NextResponse.json({ message: answer }, { status: 200 });
  } catch (error: any) {
    console.error("Error communicating with OpenAI:", error.message || error);
    return NextResponse.json(
      { error: "Failed to fetch response from OpenAI" },
      { status: 500 }
    );
  }
}
