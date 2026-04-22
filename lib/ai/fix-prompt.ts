import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

const SYSTEM_PROMPT = `You are a security expert assistant helping developers fix website vulnerabilities.

Write a short, precise fix prompt that a developer can paste into an AI code editor like Cursor or Claude Code. The prompt must:
- Be 3–6 sentences max
- Specify exactly what file or config to edit (e.g. next.config.ts, nginx.conf, .htaccess, DNS settings)
- Give the exact code snippet, header value, or command to run
- Be actionable with zero ambiguity — the developer should be able to fix it without googling

Return only the fix prompt text. No preamble, no markdown headers, no explanation.`;

export interface FindingInput {
  name: string;
  severity: string;
  category: string;
  description: string;
  detail?: string;
  affectedValue?: string;
}

export async function generateFixPrompt(finding: FindingInput): Promise<string> {
  const userContent = [
    `Vulnerability: ${finding.name}`,
    `Severity: ${finding.severity}`,
    `Category: ${finding.category}`,
    `Description: ${finding.description}`,
    finding.affectedValue ? `Current value: ${finding.affectedValue}` : null,
    finding.detail ? `Technical detail: ${finding.detail}` : null,
  ]
    .filter(Boolean)
    .join("\n");

  const response = await client.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 350,
    system: [
      {
        type: "text",
        text: SYSTEM_PROMPT,
        cache_control: { type: "ephemeral" },
      },
    ],
    messages: [{ role: "user", content: userContent }],
  });

  const block = response.content[0];
  if (block.type !== "text") throw new Error("Unexpected response type from Claude");
  return block.text.trim();
}
