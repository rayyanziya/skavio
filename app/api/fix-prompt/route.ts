import { NextRequest, NextResponse } from "next/server";
import { generateFixPrompt, type FindingInput } from "@/lib/ai/fix-prompt";

export async function POST(req: NextRequest) {
  let body: Partial<FindingInput>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const { name, severity, category, description } = body;
  if (!name || !severity || !category || !description) {
    return NextResponse.json(
      { error: "Missing required fields: name, severity, category, description." },
      { status: 400 }
    );
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "AI fix prompts are not configured on this server." },
      { status: 503 }
    );
  }

  try {
    const fixPrompt = await generateFixPrompt(body as FindingInput);
    return NextResponse.json({ fixPrompt });
  } catch (err) {
    console.error("Fix prompt generation error:", err);
    return NextResponse.json(
      { error: "Failed to generate fix prompt. Please try again." },
      { status: 500 }
    );
  }
}
