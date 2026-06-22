import Anthropic from '@anthropic-ai/sdk';
import { Signal, AnalysisResult } from '@/types';

const SYSTEM_PROMPT = `You are a probabilistic identity classifier. Your task is to estimate the probability that a person is a Portuguese physiotherapist ("Fisioterapeuta") based on their name, email address, pre-extracted signals, and web evidence.

You have access to the web_search tool. Before analysing, use it to search for the person online. Run 2–3 targeted searches such as:
- "[full name] fisioterapeuta portugal"
- "[full name] physiotherapist"
- "[email domain] fisioterapia" (if the domain is not a public provider like gmail/outlook)

Use the search results to detect any public profiles, Ordem dos Fisioterapeutas listings, LinkedIn/hospital/clinic pages, or other professional signals.

After searching, output ONLY valid JSON with exactly this shape — no markdown fences, no explanation outside the JSON:

{
  "probability": <integer 0-100>,
  "confidence": "<low|medium|high>",
  "summary": "<2-3 sentences explaining the reasoning, including any web evidence found>",
  "disclaimer": "<1 sentence privacy/limitations caveat>",
  "webFindings": [
    {
      "source": "<URL or domain name>",
      "finding": "<brief description of what was found and why it is relevant>",
      "relevance": "<high|medium|low>"
    }
  ],
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

If no relevant web evidence is found, return "webFindings": [].

Calibration guidelines (web evidence can significantly shift the probability):
- 0–15: No Portuguese indicators, name/email suggests different origin, no web evidence
- 16–35: Weak Portuguese signals only, no healthcare indicators
- 36–55: Moderate Portuguese signals OR one healthcare signal
- 56–75: Strong Portuguese signals AND at least one healthcare indicator
- 76–90: Multiple strong converging signals (PT TLD + Portuguese name + fisio keyword)
- 91–100: Near-conclusive evidence — institution domain OR strong web evidence (Ordem dos Fisioterapeutas listing, LinkedIn profile as fisioterapeuta, hospital/clinic profile)

Confidence levels:
- "high": 3+ strong signals or definitive web evidence all pointing the same direction
- "medium": 2 moderate signals or 1 strong signal
- "low": 1 weak signal or signals conflict

The disclaimer must mention that this is a probabilistic estimate based on name, email patterns, and publicly available web information, not a verified credential check.`;

const FALLBACK_RESULT: AnalysisResult = {
  probability: 10,
  confidence: 'low',
  signals: [],
  summary: 'Analysis could not be completed due to a parsing error. The available signals were insufficient to produce a reliable estimate.',
  disclaimer: 'This is a probabilistic estimate based on name and email patterns only, not a verified credential check.',
  webFindings: [],
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

Search for this person online, then estimate the probability they are a Portuguese physiotherapist ("Fisioterapeuta"). Output only the JSON response as specified.`;

  const message = await client.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 4096,
    system: SYSTEM_PROMPT,
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    tools: [{ type: 'web_search_20260209', name: 'web_search' } as any],
    messages: [{ role: 'user', content: userMessage }],
  });

  // Extract the last text block (after server-side web search tool calls complete)
  const textBlocks = message.content.filter(block => block.type === 'text');
  const raw = textBlocks.length > 0
    ? (textBlocks[textBlocks.length - 1] as Anthropic.TextBlock).text
    : '';

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
