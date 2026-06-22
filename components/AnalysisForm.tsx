'use client';

import { useState } from 'react';

interface Props {
  onAnalyze: (name: string, email: string) => void;
  loading: boolean;
  onReset?: () => void;
}

export default function AnalysisForm({ onAnalyze, loading, onReset }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [touched, setTouched] = useState({ name: false, email: false });

  const nameEmpty = touched.name && !name.trim();
  const emailInvalid = touched.email && email.trim() && (!email.includes('@') || !email.includes('.'));
  const canSubmit = name.trim() && email.trim() && email.includes('@') && !loading;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTouched({ name: true, email: true });
    if (!canSubmit) return;
    onAnalyze(name.trim(), email.trim());
  }

  function handleReset() {
    setName('');
    setEmail('');
    setTouched({ name: false, email: false });
    onReset?.();
  }

  return (
    <form onSubmit={handleSubmit} className="w-full max-w-lg">
      <div className="rounded-2xl p-6 flex flex-col gap-5 bg-white shadow-sm border border-slate-100">
        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Full name</label>
          <input
            type="text"
            placeholder="e.g. João Silva"
            value={name}
            onChange={e => setName(e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, name: true }))}
            disabled={loading}
            className={`px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 outline-none transition-all
              placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-400
              ${nameEmpty
                ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                : 'border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
              }`}
          />
          {nameEmpty && (
            <p className="text-xs text-red-500">Name is required</p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label className="text-sm font-medium text-slate-700">Email address</label>
          <input
            type="email"
            placeholder="e.g. joao.silva@sns.min-saude.pt"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onBlur={() => setTouched(t => ({ ...t, email: true }))}
            disabled={loading}
            className={`px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 outline-none transition-all
              placeholder:text-slate-400 disabled:bg-slate-50 disabled:text-slate-400
              ${emailInvalid
                ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                : 'border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
              }`}
          />
          {emailInvalid && (
            <p className="text-xs text-red-500">Please enter a valid email address</p>
          )}
        </div>

        <div className="flex items-center gap-3 pt-1">
          <button
            type="submit"
            disabled={!canSubmit}
            className="flex-1 py-2.5 rounded-xl text-sm font-semibold text-white
              bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800
              disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed
              transition-colors flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <span className="w-3.5 h-3.5 rounded-full border-2 border-white/40 border-t-white animate-spin" />
                Researching…
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 115 11a6 6 0 0112 0z" />
                </svg>
                Analyse
              </>
            )}
          </button>
          {onReset && (
            <button
              type="button"
              onClick={handleReset}
              disabled={loading}
              className="px-4 py-2.5 rounded-xl text-sm font-medium text-slate-500
                hover:bg-slate-100 active:bg-slate-200 disabled:opacity-50
                transition-colors"
            >
              Reset
            </button>
          )}
        </div>
      </div>
    </form>
  );
}
