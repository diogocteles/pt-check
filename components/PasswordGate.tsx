'use client';

import { useEffect, useState } from 'react';

const PASSWORD = 'only5done';
const SESSION_KEY = 'pt-check-authed';

export default function PasswordGate({ children }: { children: React.ReactNode }) {
  const [authed, setAuthed] = useState(false);
  const [ready, setReady] = useState(false);
  const [input, setInput] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    setAuthed(sessionStorage.getItem(SESSION_KEY) === '1');
    setReady(true);
  }, []);

  if (!ready) return null;

  if (authed) return <>{children}</>;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (input === PASSWORD) {
      sessionStorage.setItem(SESSION_KEY, '1');
      setAuthed(true);
    } else {
      setError(true);
      setInput('');
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-4 bg-slate-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700 mb-5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block" />
            Restricted access
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Fisioterapeuta Checker</h1>
          <p className="mt-2 text-sm text-slate-500">Enter the access password to continue.</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl p-6 bg-white shadow-sm border border-slate-100 flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={input}
              autoFocus
              placeholder="Enter password"
              onChange={e => { setInput(e.target.value); setError(false); }}
              className={`px-3.5 py-2.5 rounded-xl border text-sm text-slate-900 outline-none transition-all
                placeholder:text-slate-400
                ${error
                  ? 'border-red-300 focus:border-red-400 focus:ring-2 focus:ring-red-100'
                  : 'border-slate-200 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-100'
                }`}
            />
            {error && (
              <p className="text-xs text-red-500">Incorrect password. Please try again.</p>
            )}
          </div>

          <button
            type="submit"
            disabled={!input}
            className="py-2.5 rounded-xl text-sm font-semibold text-white
              bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800
              disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed
              transition-colors"
          >
            Continue
          </button>
        </form>
      </div>
    </main>
  );
}
