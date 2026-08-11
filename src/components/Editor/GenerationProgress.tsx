import React, { useEffect, useState } from 'react';
import { GenerationStep } from '../../types';
import { Sparkles, CheckCircle2, Loader2, Clock, XCircle } from 'lucide-react';

interface Props {
  prompt: string;
  onComplete: () => void;
  onCancel?: () => void;
}

export const GenerationProgress: React.FC<Props> = ({ prompt, onComplete, onCancel }) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);

  const steps: GenerationStep[] = [
    { id: 1, label: 'Generating', detail: 'Parsing requirement & structuring design system...' },
    { id: 2, label: 'Processing', detail: 'Creating semantic HTML5 elements & accessibility tags...' },
    { id: 3, label: 'Building', detail: 'Compiling CSS variables, layout grid & interactive JS logic...' },
    { id: 4, label: 'Completed', detail: 'Saving project snapshot & mounting iframe preview...' },
  ];

  // Timer counter
  useEffect(() => {
    const timer = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Step advancement
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < steps.length - 1) {
          return prev + 1;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            onComplete();
          }, 600);
          return prev;
        }
      });
    }, 1200);

    return () => clearInterval(interval);
  }, []);

  const progressPercent = Math.round(((currentStepIndex + 1) / steps.length) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl animate-fade-in text-slate-100">
      <div className="w-full max-w-xl rounded-2xl bg-slate-900 border border-slate-800 p-8 shadow-2xl text-center space-y-6">
        {/* LOGO GLOW SPINNER */}
        <div className="relative w-20 h-20 mx-auto flex items-center justify-center">
          <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-600 via-indigo-500 to-purple-600 animate-spin blur-md opacity-60" />
          <div className="relative w-16 h-16 rounded-full bg-slate-950 border border-indigo-500/40 flex items-center justify-center">
            <Sparkles className="w-8 h-8 text-indigo-400 animate-pulse" />
          </div>
        </div>

        <div>
          <h2 className="text-2xl font-extrabold text-white">VERVOX AI Building Your Website</h2>
          <p className="text-xs text-slate-400 mt-2 max-w-md mx-auto line-clamp-2 italic">
            “{prompt}”
          </p>
        </div>

        {/* TIMER & PROGRESS DISPLAY */}
        <div className="flex items-center justify-between px-2 text-xs font-mono font-semibold text-slate-400">
          <span className="flex items-center gap-1 text-indigo-300">
            <Clock className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            Time Elapsed: {elapsedSeconds}s
          </span>
          <span className="text-emerald-400">
            {steps[currentStepIndex].label} stage
          </span>
        </div>

        {/* PROGRESS BAR */}
        <div className="space-y-2">
          <div className="flex justify-between items-center text-xs text-slate-400 font-mono font-bold">
            <span>{steps[currentStepIndex].label}</span>
            <span className="text-indigo-400">{progressPercent}%</span>
          </div>
          <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden p-0.5 border border-slate-800">
            <div
              className="bg-gradient-to-r from-blue-600 via-indigo-500 to-purple-600 h-full rounded-full transition-all duration-300 shadow-md shadow-indigo-500/50"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* STAGES PIPELINE */}
        <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono font-bold">
          {steps.map((s, idx) => {
            const active = idx === currentStepIndex;
            const done = idx < currentStepIndex;
            return (
              <div
                key={s.id}
                className={`py-2 px-1 rounded-xl border transition-all ${
                  done
                    ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                    : active
                    ? 'bg-indigo-950/60 border-indigo-500 text-indigo-200 shadow-md shadow-indigo-500/20'
                    : 'bg-slate-950 border-slate-800 text-slate-600'
                }`}
              >
                <div>{s.label}</div>
              </div>
            );
          })}
        </div>

        {/* CANCEL BUTTON */}
        {onCancel && (
          <div className="pt-2">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-semibold flex items-center gap-2 mx-auto transition-colors"
            >
              <XCircle className="w-4 h-4 text-rose-400" />
              Cancel Generation
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
