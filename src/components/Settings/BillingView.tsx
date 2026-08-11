import React from 'react';
import { User, PlanType } from '../../types';
import { CreditCard, Check } from 'lucide-react';

interface Props {
  user: User;
  onUpdatePlan: (plan: PlanType) => void;
  onToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const BillingView: React.FC<Props> = ({ user, onUpdatePlan, onToast }) => {
  const plans: { name: PlanType; price: string; desc: string; features: string[] }[] = [
    {
      name: 'free',
      price: '$0 / mo',
      desc: 'Free starter tier with 200 monthly credits.',
      features: ['200 Monthly Credits', '10 Active Projects', 'Live Preview & ZIP Export', 'Standard AI Speed'],
    },
    {
      name: 'starter',
      price: '$12 / mo',
      desc: 'For freelancers and creators.',
      features: ['1,000 Monthly Credits', '30 Active Projects', 'Priority AI Queue', 'All Starter Templates'],
    },
    {
      name: 'pro',
      price: '$29 / mo',
      desc: 'For active developers, freelancers and agencies.',
      features: ['3,000 Monthly Credits', '100 Active Projects', 'BYOK API Key Support', 'All Premium Templates'],
    },
    {
      name: 'premium',
      price: '$79 / mo',
      desc: 'Maximum capacity for power users and studios.',
      features: ['10,000 Monthly Credits', 'Unlimited Active Projects', 'Dedicated Account Support', 'Ultra-fast AI Engine'],
    },
  ];

  const handleSelect = (plan: PlanType) => {
    onUpdatePlan(plan);
    onToast('success', `Upgraded to ${plan.toUpperCase()} plan!`);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 text-slate-100 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-white flex items-center gap-3">
          <CreditCard className="w-7 h-7 text-indigo-400" />
          Subscription & Billing
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Current Plan: <span className="text-indigo-400 font-bold uppercase">{user.plan}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((p) => {
          const isCurrent = user.plan === p.name;
          return (
            <div
              key={p.name}
              className={`p-6 rounded-2xl border flex flex-col justify-between ${
                isCurrent
                  ? 'bg-slate-900 border-indigo-500 shadow-xl shadow-indigo-500/10'
                  : 'bg-slate-900/40 border-slate-800'
              }`}
            >
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="font-mono text-xs font-bold text-indigo-400 uppercase">{p.name}</span>
                  {isCurrent && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      CURRENT
                    </span>
                  )}
                </div>

                <div className="text-2xl font-extrabold text-white mb-2">{p.price}</div>
                <p className="text-xs text-slate-400 mb-6">{p.desc}</p>

                <div className="space-y-2 pt-4 border-t border-slate-800 text-xs text-slate-300 mb-6">
                  {p.features.map((f, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{f}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handleSelect(p.name)}
                disabled={isCurrent}
                className={`w-full py-2.5 rounded-xl font-bold text-xs transition-all ${
                  isCurrent
                    ? 'bg-slate-800 text-slate-500 cursor-default'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30'
                }`}
              >
                {isCurrent ? 'Current Plan' : 'Select Plan'}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};
