import Anthropic from '@anthropic-ai/sdk';
import { Signal, AnalysisResult } from '@/types';

const SYSTEM_PROMPT = `You are a probabilistic identity classifier. Your task is to estimate the probability that a person is a Portuguese physiotherapist ("Fisioterapeuta") based solely on their name and email address.

You will receive the person's name, email, and a list of pre-extracted signals from deterministic rules.

Your job is to:
- Weigh the signals, accounting for their interaction (e.g. a Portuguese name + .pt domain + "fisio" in email username is near-conclusive)
- Reason about base rates (physiotherapists are a small fraction of the Portuguese population)
- Produce a calibrated probability estimate from 0 to 100

Output ONLY valid JSON with exactly this shape — no markdown fences, no explanation outside the JSON:

{
  "probability": <integer 0-100>,
  "confidence": "<low|medium|high>",
  "summary": "<2-3 sentences explaining the reasoning in plain language>",
  "disclaimer": "<1 sentence privacy/limitations caveat>",
  "signals": [
    {
      "factor": "<same factor string as input>",
      "impact": "<positive|negative|neutral>",
      "strength": "<strong|moderate|weak>",
      "rawValue": "<same rawValue as input>",
      "explanation": "<1 sentence: why this specific signal matters for this specific person>",
      "category": "<same category as input>"
    }
  ]
}

Calibration guidelines:
- 0–15: No Portuguese indicators, name/email suggests different origin
- 16–35: Weak Portuguese signals only, no healthcare indicators
- 36–55: Moderate Portuguese signals OR one healthcare signal
- 56–75: Strong Portuguese signals AND at least one healthcare indicator
- 76–90: Multiple strong converging signals (PT TLD + Portuguese name + fisio keyword)
- 91–100: Near-conclusive evidence (institution domain + Portuguese name + explicit fisio username)

Confidence levels:
- "high": 3+ strong signals all pointing the same direction
- "medium": 2 moderate signals or 1 strong signal
- "low": 1 weak signal or signals conflict

The disclaimer must mention that this is a probabilistic estimate based on name and email patterns only, not a verified credential check.`;

const FALLBACK_RESULT: AnalysisResult = {
  probability: 10,
  confidence: 'low',
  signals: [],
  summary: 'Analysis could not be completed due to a parsing error. The available signals were insufficient to produce a reliable estimate.',
  disclaimer: 'This is a probabilistic estimate based on name and email patterns only, not a verified credential check.',
};

export async function analyzeWithClaude(
  name: string,
  email: string,
  signals: Signal[]
): Promise<AnalysisResult> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const userMessage = `Name: ${name}
Email: ${email}

Pre-extracted signals:
${JSON.stringify(signals, null, 2)}

Estimate the probability this person is a Portuguese physiotherapist ("Fisioterapeuta").`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 1024,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userMessage }],
  });

  const raw = message.content[0].type === 'text' ? message.content[0].text : '';
  const jsonText = raw
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim();

  try {
    const parsed = JSON.parse(jsonText) as AnalysisResult;
    return parsed;
  } catch {
    return FALLBACK_RESULT;
  }
}
