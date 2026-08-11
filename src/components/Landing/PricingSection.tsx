import React, { useState } from 'react';
import { Check, Sparkles, Zap, ShieldCheck } from 'lucide-react';

interface Props {
  onSelectPlan: (planName: string, price: string) => void;
}

export const PricingSection: React.FC<Props> = ({ onSelectPlan }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const plans = [
    {
      name: 'FREE',
      price: '₹0',
      period: '/month',
      description: 'Ideal for trying out VERVOX and creating initial personal projects.',
      popular: false,
      buttonText: 'Start Free',
      features: [
        '3 projects / month',
        'Limited AI generations',
        'Basic templates gallery',
        'Real-time live preview',
        'Full ZIP file export',
        'Basic AI editing assistant',
      ],
    },
    {
      name: 'STUDENT',
      price: billingCycle === 'yearly' ? '₹79' : '₹99',
      period: '/month',
      description: 'Perfect for students, learners, and personal portfolio creators.',
      popular: false,
      buttonText: 'Choose Student',
      features: [
        '20 projects / month',
        'Expanded AI generations',
        'Access to all templates',
        'Full ZIP file export',
        'Enhanced AI editing assistant',
        'Priority project generation',
      ],
    },
    {
      name: 'PRO',
      price: billingCycle === 'yearly' ? '₹239' : '₹299',
      period: '/month',
      description: 'Most popular plan for active developers, freelancers & agencies.',
      popular: true,
      buttonText: 'Choose Pro',
      features: [
        '100 projects / month',
        'Advanced Gemini AI features',
        'All premium templates & code',
        'Advanced multi-file editing',
        'Priority 24/7 generation queue',
        'Bring Your Own Key (BYOK) support',
      ],
    },
    {
      name: 'CREATOR',
      price: billingCycle === 'yearly' ? '₹479' : '₹599',
      period: '/month',
      description: 'Maximum limits for high-volume creators, studios and power users.',
      popular: false,
      buttonText: 'Choose Creator',
      features: [
        'Unlimited projects',
        'Uncapped AI generations',
        'Team collaboration tools',
        'Custom domain deployment readiness',
        'Dedicated priority support',
        'Custom template exports',
      ],
    },
  ];

  return (
    <section id="pricing" className="py-24 bg-slate-950 border-t border-slate-900 relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-block px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 text-xs font-mono font-bold uppercase tracking-wider mb-3">
            Transparent Pricing
          </div>
          <h2 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight">
            Simple, Accessible Pricing for Everyone
          </h2>
          <p className="text-slate-400 text-base sm:text-lg mt-4">
            Start completely free without credit card. Upgrade whenever you need higher generation limits and advanced AI tools.
          </p>

          {/* BILLING CYCLE TOGGLE */}
          <div className="mt-8 inline-flex items-center gap-3 p-1.5 rounded-full bg-slate-900 border border-slate-800">
            <button
              onClick={() => setBillingCycle('monthly')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all ${
                billingCycle === 'monthly' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Monthly Billing
            </button>
            <button
              onClick={() => setBillingCycle('yearly')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${
                billingCycle === 'yearly' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
              }`}
            >
              Yearly Billing
              <span className="bg-emerald-500/20 text-emerald-300 text-[10px] px-2 py-0.5 rounded-full font-extrabold border border-emerald-500/30">
                SAVE 20%
              </span>
            </button>
          </div>
        </div>

        {/* PRICING CARDS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan, idx) => (
            <div
              key={idx}
              className={`relative rounded-2xl p-6 flex flex-col justify-between transition-all duration-300 ${
                plan.popular
                  ? 'bg-slate-900 border-2 border-indigo-500/80 shadow-2xl shadow-indigo-500/20 scale-105 z-10'
                  : 'bg-slate-900/50 border border-slate-800 hover:border-slate-700'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-indigo-500 to-purple-600 text-white text-[10px] font-extrabold tracking-wider uppercase shadow-lg shadow-indigo-500/30 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  MOST POPULAR
                </div>
              )}

              <div>
                <div className="font-mono text-sm font-bold text-indigo-400 mb-2 uppercase tracking-wider">
                  {plan.name}
                </div>
                <div className="flex items-baseline gap-1 mb-3">
                  <span className="text-4xl font-extrabold text-white tracking-tight">{plan.price}</span>
                  <span className="text-slate-400 text-sm">{plan.period}</span>
                </div>
                <p className="text-slate-400 text-xs min-h-[36px] leading-relaxed mb-6">
                  {plan.description}
                </p>

                <div className="space-y-3 pt-4 border-t border-slate-800/80 text-xs text-slate-300 mb-8">
                  {plan.features.map((feat, fIdx) => (
                    <div key={fIdx} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{feat}</span>
                    </div>
                  ))}
                </div>
              </div>

              <button
                onClick={() => onSelectPlan(plan.name, plan.price)}
                className={`w-full py-3 px-4 rounded-xl font-bold text-sm transition-all ${
                  plan.popular
                    ? 'bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/30'
                    : 'bg-slate-800 hover:bg-slate-700 text-white border border-slate-700'
                }`}
              >
                {plan.buttonText}
              </button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
