import React, { useState } from 'react';
import { User, BillingTransaction, PlanType } from '../../types';
import { PLANS, CREDIT_PACKS, PlanConfig, CreditPackConfig } from '../../config/pricing';
import { apiService } from '../../services/api';
import {
  CreditCard,
  Zap,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Receipt,
  ArrowUpRight,
  RefreshCw,
  Clock,
  Coins,
  Check,
} from 'lucide-react';

interface Props {
  user: User;
  onUserUpdated: (user: User) => void;
  onToast: (type: 'success' | 'error' | 'info', message: string) => void;
}

export const BillingView: React.FC<Props> = ({ user, onUserUpdated, onToast }) => {
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'INR'>('USD');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const monthlyCredits = user?.usage?.monthlyCredits ?? (user as any)?.monthlyCredits ?? 0;
  const purchasedCredits = user?.usage?.purchasedCredits ?? (user as any)?.purchasedCredits ?? 0;
  const maxMonthlyCredits = user?.usage?.maxMonthlyCredits ?? 200;
  const renewalDate = user?.usage?.subscriptionRenewalDate ?? (user as any)?.subscriptionRenewalDate ?? new Date().toISOString();
  const totalCredits = monthlyCredits + purchasedCredits;

  const handleProcessPayment = async (plan?: PlanConfig, pack?: CreditPackConfig) => {
    const targetId = plan ? plan.id : pack?.id || 'payment';
    setProcessingId(targetId);

    try {
      // 1. Create payment order from backend
      const order = await apiService.createPaymentOrder(plan?.id, pack?.id, selectedCurrency);

      // 2. Execute verification and credit allocation
      const result = await apiService.verifyPayment({
        planId: plan?.id,
        creditPackId: pack?.id,
        amount: order.amount,
        currency: selectedCurrency,
        paymentId: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        provider: 'Razorpay',
      });

      onToast('success', result.message);
      onUserUpdated(result.user);
    } catch (err: any) {
      onToast('error', err.message || 'Payment processing failed. Please try again.');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-16">
      {/* PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800 pb-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white flex items-center gap-3">
            <CreditCard className="w-8 h-8 text-indigo-400" />
            Billing & Credit Subscription
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage your monthly credits, upgrade subscription plans, and view transaction history.
          </p>
        </div>

        {/* CURRENCY TOGGLE */}
        <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl shrink-0 self-start md:self-auto">
          <button
            onClick={() => setSelectedCurrency('USD')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              selectedCurrency === 'USD' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            USD ($)
          </button>
          <button
            onClick={() => setSelectedCurrency('INR')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
              selectedCurrency === 'INR' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            INR (₹)
          </button>
        </div>
      </div>

      {/* CURRENT STATUS & CREDIT BALANCE DASHBOARD */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CURRENT PLAN BOX */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-indigo-950/40 border border-indigo-500/30 relative overflow-hidden space-y-3">
          <div className="flex justify-between items-start">
            <div>
              <span className="text-[10px] font-mono uppercase font-bold text-indigo-400 tracking-wider">Current Tier</span>
              <h3 className="text-2xl font-black text-white mt-0.5 uppercase tracking-wide">{user.plan} PLAN</h3>
            </div>
            <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Active
            </span>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed">
            {PLANS[user.plan]?.description || 'Enjoy AI website creation features.'}
          </p>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Next Renewal Date:</span>
            <span className="font-semibold text-white">
              {new Date(renewalDate).toLocaleDateString()}
            </span>
          </div>
        </div>

        {/* MONTHLY REPLENISHING CREDITS */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-slate-400 flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-amber-400" />
              Free Monthly Credits
            </span>
            <span className="font-bold text-amber-400 text-sm">
              {monthlyCredits} Remaining
            </span>
          </div>

          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-amber-500 h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, (monthlyCredits / maxMonthlyCredits) * 100)}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span className="flex items-center gap-1">
              <RefreshCw className="w-3 h-3 text-slate-500" />
              200 free credits/mo
            </span>
            <span>Resets in 30 days</span>
          </div>
        </div>

        {/* PURCHASED EXTRA CREDITS */}
        <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-3">
          <div className="flex justify-between items-center text-xs">
            <span className="font-medium text-slate-400 flex items-center gap-1.5">
              <Coins className="w-4 h-4 text-indigo-400" />
              Purchased Extra Credits
            </span>
            <span className="font-bold text-indigo-400 text-sm">
              {purchasedCredits} Credits
            </span>
          </div>

          <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full transition-all"
              style={{
                width: `${Math.min(100, Math.max(10, (purchasedCredits / 1000) * 100))}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
            <span>Total Available Balance:</span>
            <span className="font-bold text-white text-xs">{totalCredits} Credits</span>
          </div>
        </div>
      </div>

      {/* SUBSCRIPTION PLANS SECTION */}
      <div className="space-y-6">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            Upgrade Subscription Plan
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Get higher monthly credit allowances, faster priority queueing, and expanded project limits.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.values(PLANS).map((plan) => {
            const isCurrent = user.plan === plan.id;
            const priceDisplay = selectedCurrency === 'INR' ? `₹${plan.priceInr}` : `$${plan.priceUsd}`;

            return (
              <div
                key={plan.id}
                className={`p-6 rounded-2xl bg-slate-900/80 border flex flex-col justify-between relative transition-all ${
                  isCurrent
                    ? 'border-indigo-500 ring-2 ring-indigo-500/30'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {plan.badge && (
                  <span className="absolute -top-3 right-4 px-3 py-0.5 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 text-[10px] font-extrabold uppercase text-white shadow-md">
                    {plan.badge}
                  </span>
                )}

                <div>
                  <h3 className="text-lg font-bold text-white uppercase tracking-wider">{plan.name}</h3>
                  <p className="text-xs text-slate-400 mt-1 min-h-[32px]">{plan.description}</p>

                  <div className="my-4">
                    <span className="text-3xl font-black text-white">{priceDisplay}</span>
                    <span className="text-xs text-slate-400"> / month</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80 text-xs mb-4">
                    <span className="font-bold text-indigo-400 block mb-0.5">
                      {plan.monthlyCredits.toLocaleString()} Credits / month
                    </span>
                    <span className="text-slate-400 text-[11px]">Up to {plan.maxProjects} projects</span>
                  </div>

                  <ul className="space-y-2 text-xs text-slate-300 mb-6">
                    {plan.features.map((f, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleProcessPayment(plan)}
                  disabled={isCurrent || processingId === plan.id}
                  className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                    isCurrent
                      ? 'bg-slate-800 text-slate-400 cursor-default'
                      : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25'
                  }`}
                >
                  {processingId === plan.id ? (
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Processing...
                    </span>
                  ) : isCurrent ? (
                    'Current Plan'
                  ) : (
                    `Upgrade to ${plan.name}`
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* EXTRA CREDIT PACKS */}
      <div className="space-y-6 pt-6 border-t border-slate-800">
        <div>
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Coins className="w-5 h-5 text-indigo-400" />
            Buy Extra Credit Booster Packs
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Need more credits without changing your subscription? Purchase extra credits that never expire.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {CREDIT_PACKS.map((pack) => {
            const priceDisplay = selectedCurrency === 'INR' ? `₹${pack.priceInr}` : `$${pack.priceUsd}`;

            return (
              <div
                key={pack.id}
                className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 hover:border-indigo-500/40 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-bold text-white text-base">{pack.name}</h3>
                    {pack.discount && (
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                        {pack.discount}
                      </span>
                    )}
                  </div>

                  <div className="my-3">
                    <span className="text-2xl font-black text-indigo-400">+{pack.credits}</span>
                    <span className="text-xs text-slate-400"> Credits</span>
                  </div>

                  <p className="text-xs text-slate-400 mb-4">
                    Credits added directly to your account immediately.
                  </p>
                </div>

                <button
                  onClick={() => handleProcessPayment(undefined, pack)}
                  disabled={processingId === pack.id}
                  className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2"
                >
                  {processingId === pack.id ? (
                    'Processing...'
                  ) : (
                    `Buy for ${priceDisplay}`
                  )}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* BILLING HISTORY TABLE */}
      <div className="space-y-4 pt-6 border-t border-slate-800">
        <h2 className="text-lg font-bold text-white flex items-center gap-2">
          <Receipt className="w-5 h-5 text-indigo-400" />
          Transaction & Billing History
        </h2>

        {!user.billingHistory || user.billingHistory.length === 0 ? (
          <div className="p-8 text-center rounded-2xl border border-slate-800 bg-slate-900/40 text-slate-400 text-xs">
            No transactions found.
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950 text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                  <tr>
                    <th className="p-3.5">Date</th>
                    <th className="p-3.5">Description</th>
                    <th className="p-3.5">Credits</th>
                    <th className="p-3.5">Amount</th>
                    <th className="p-3.5">Provider</th>
                    <th className="p-3.5 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-200">
                  {user.billingHistory.map((tx) => (
                    <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="p-3.5 font-mono text-slate-400">
                        {new Date(tx.date).toLocaleDateString()}
                      </td>
                      <td className="p-3.5 font-medium">{tx.description}</td>
                      <td className="p-3.5 font-bold text-indigo-400">+{tx.creditsAdded}</td>
                      <td className="p-3.5 font-semibold">
                        {tx.currency === 'INR' ? `₹${tx.amount}` : `$${tx.amount}`}
                      </td>
                      <td className="p-3.5 text-slate-400">{tx.provider}</td>
                      <td className="p-3.5 text-right">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
