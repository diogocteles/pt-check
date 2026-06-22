'use client';

import { useState } from 'react';
import AnalysisForm from '@/components/AnalysisForm';
import PasswordGate from '@/components/PasswordGate';
import ResultCard from '@/components/ResultCard';
import { AnalysisResult } from '@/types';

type State =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; result: AnalysisResult }
  | { status: 'error'; message: string };

export default function Home() {
  const [state, setState] = useState<State>({ status: 'idle' });

  async function handleAnalyze(name: string, email: string) {
    setState({ status: 'loading' });
    try {
      const res = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? 'Analysis failed');
      setState({ status: 'success', result: data });
    } catch (err) {
      setState({
        status: 'error',
        message: err instanceof Error ? err.message : 'Unknown error occurred',
      });
    }
  }

  function handleReset() {
    setState({ status: 'idle' });
  }

  return (
    <PasswordGate>
    <main className="min-h-screen flex flex-col items-center px-4 py-16 bg-slate-50">

      {/* Header */}
      <div className="text-center mb-10 max-w-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 mb-5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
          AI-Powered · Portugal Healthcare
        </div>
        <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight leading-tight">
          Fisioterapeuta<br />
          <span className="text-emerald-600">Checker</span>
        </h1>
        <p className="text-slate-500 text-base leading-relaxed">
          Enter a name and email to estimate the probability that the person
          is a physiotherapist based in Portugal — and understand why.
        </p>
      </div>

      {/* Form */}
      <AnalysisForm
        onAnalyze={handleAnalyze}
        loading={state.status === 'loading'}
        onReset={state.status !== 'idle' ? handleReset : undefined}
      />

      {/* Error */}
      {state.status === 'error' && (
        <div className="mt-5 w-full max-w-lg px-4 py-3 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3">
          <svg className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
          </svg>
          <p className="text-sm text-red-700">{state.message}</p>
        </div>
      )}

      {/* Results */}
      {state.status === 'success' && (
        <ResultCard result={state.result} />
      )}

      {/* Footer */}
      <footer className="mt-auto pt-16 pb-4 text-xs text-slate-400 text-center">
        Powered by Claude · For research purposes only
      </footer>
    </main>
    </PasswordGate>
  );
}
