import { NextRequest, NextResponse } from 'next/server';
import { extractSignals } from '@/lib/signals';
import { analyzeWithClaude } from '@/lib/claude';
import { AnalyzeRequest } from '@/types';

export async function POST(req: NextRequest) {
  let body: Partial<AnalyzeRequest> = {};
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();

  if (!name || !email) {
    return NextResponse.json({ error: 'name and email are required' }, { status: 400 });
  }
  if (!email.includes('@') || !email.includes('.')) {
    return NextResponse.json({ error: 'email does not appear to be valid' }, { status: 400 });
  }
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ error: 'ANTHROPIC_API_KEY is not configured on the server' }, { status: 500 });
  }

  const signals = extractSignals(name, email);

  try {
    const result = await analyzeWithClaude(name, email, signals);
    return NextResponse.json(result);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Analysis failed';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
