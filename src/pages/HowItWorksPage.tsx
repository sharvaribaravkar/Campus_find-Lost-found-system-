import React from 'react';
import { Sparkles, ShieldCheck, CheckCircle2, ArrowRight, Package, UserCheck, HelpCircle } from 'lucide-react';

interface HowItWorksPageProps {
  onOpenReportModal: (type: 'lost' | 'found') => void;
  setCurrentTab: (tab: string) => void;
}

export const HowItWorksPage: React.FC<HowItWorksPageProps> = ({ onOpenReportModal, setCurrentTab }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-16">
      {/* Header */}
      <div className="text-center space-y-3">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 uppercase tracking-wider">
          Transparent Process
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900">
          How CampusFind Protects & Recovers
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          From the moment a lost item is reported to the final in-person handshake at campus security, every step is logged and authorized.
        </p>
      </div>

      {/* Step by step cards */}
      <div className="space-y-8">
        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start gap-6">
          <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-600 flex items-center justify-center font-bold text-xl shrink-0">
            01
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-slate-900">Step 1: File an Item Report (Lost or Found)</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              When a student loses an item, they log its category, campus location (e.g. Library, Canteen, Workshop), date, photo, and confidential identifiers. When an item is found by a classmate or campus guard, it is logged along with its current physical deposit spot (such as Main Security Gate #1).
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start gap-6">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold text-xl shrink-0">
            02
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-slate-900">Step 2: Rule-Based Smart Matching Engine</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              CampusFind's engine automatically scans for reciprocal pairs. Category match earns +35 points, keyword overlap in descriptions adds up to +45 points, and proximity in location/date adds +35 points. Once the score hits 40%, both parties receive immediate in-app notifications and a side-by-side comparison modal.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start gap-6">
          <div className="w-14 h-14 rounded-2xl bg-sky-100 text-sky-700 flex items-center justify-center font-bold text-xl shrink-0">
            03
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-slate-900">Step 3: Ownership Claim & Proof Verification</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              To prevent fraudulent claims, the claimant must state specific characteristics not visible in the public summary (e.g. serial numbers, order invoice receipt, secret lock code, custom stickers). To prevent abuse, students cannot claim items they reported finding themselves.
            </p>
          </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-sm flex flex-col md:flex-row items-start gap-6">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xl shrink-0">
            04
          </div>
          <div className="space-y-2">
            <h3 className="font-bold text-lg text-slate-900">Step 4: College Admin Review & Physical Handover</h3>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              The College Administrator reviews the claim. Once approved, the student visits the security cabin with their physical College ID card. After verifying identity, the administrator marks the item as <strong>Returned</strong>, completing the recovery chain.
            </p>
          </div>
        </div>
      </div>

      {/* CTAs */}
      <div className="bg-slate-900 text-white rounded-3xl p-8 text-center space-y-4">
        <h3 className="text-xl sm:text-2xl font-bold">Ready to recover your belonging?</h3>
        <p className="text-xs text-slate-400 max-w-md mx-auto">
          Start browsing the campus repository or file a new lost/found report now.
        </p>
        <div className="flex flex-wrap justify-center gap-3 pt-2">
          <button
            onClick={() => onOpenReportModal('lost')}
            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl transition"
          >
            Report Lost Item
          </button>
          <button
            onClick={() => setCurrentTab('found-items')}
            className="px-5 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs rounded-xl transition"
          >
            Browse Found Items
          </button>
        </div>
      </div>
    </div>
  );
};
