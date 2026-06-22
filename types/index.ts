export type SignalImpact = 'positive' | 'negative' | 'neutral';
export type SignalStrength = 'strong' | 'moderate' | 'weak';
export type Confidence = 'low' | 'medium' | 'high';

export interface Signal {
  factor: string;
  impact: SignalImpact;
  strength: SignalStrength;
  rawValue: string;
  explanation: string;
  category: 'email-tld' | 'email-domain' | 'email-username' | 'name-surname' | 'name-firstname' | 'general';
}

export interface WebFinding {
  source: string;
  finding: string;
  relevance: 'high' | 'medium' | 'low';
}

export interface AnalysisResult {
  probability: number;
  confidence: Confidence;
  signals: Signal[];
  summary: string;
  disclaimer: string;
  webFindings?: WebFinding[];
}

export interface AnalyzeRequest {
  name: string;
  email: string;
}

export interface AnalyzeError {
  error: string;
}
