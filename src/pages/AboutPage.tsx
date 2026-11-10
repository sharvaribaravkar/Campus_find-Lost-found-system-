import React from 'react';
import { ShieldCheck, Building2, Users, Sparkles, CheckCircle2, Lock, HeartHandshake, FileCode } from 'lucide-react';

interface AboutPageProps {
  setCurrentTab: (tab: string) => void;
  onOpenXamppExport: () => void;
}

export const AboutPage: React.FC<AboutPageProps> = ({ setCurrentTab, onOpenXamppExport }) => {
  return (
    <div className="max-w-5xl mx-auto px-4 py-12 space-y-12">
      <div className="text-center space-y-3">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 uppercase tracking-wider">
          Our Campus Mission
        </span>
        <h1 className="text-3xl sm:text-5xl font-extrabold text-slate-900">
          About CampusFind
        </h1>
        <p className="text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
          One Platform, Every Campus. Designed to bridge the communication gap between students, faculties, security gates, and student councils to recover lost property safely.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-4 text-xs sm:text-sm text-slate-600 leading-relaxed">
          <h2 className="text-xl font-bold text-slate-900">The Problem with Campus WhatsApp Groups & Notice Boards</h2>
          <p>
            Every day across engineering institutes and university campuses, dozens of calculators, wireless earbuds, student ID cards, wallets, and textbooks are misplaced. Traditionally, students rely on chaotic WhatsApp batch groups or pinned physical notice boards where reports get buried within minutes.
          </p>
          <p>
            CampusFind resolves this by providing a unified, searchable platform that enforces institutional data isolation while allowing automated rule-based smart matching.
          </p>
        </div>

        <div className="bg-slate-900 text-white p-8 rounded-3xl shadow-xl space-y-4">
          <h3 className="font-bold text-base text-sky-400">Core Architecture Principles</h3>
          <ul className="space-y-3 text-xs text-slate-300">
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>College Data Separation:</strong> Every college's records are segmented by <code>college_id</code> in the database.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Supervised Custody:</strong> High-value items are physically released only through verified campus security offices.</span>
            </li>
            <li className="flex items-start gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
              <span><strong>Privacy Safeguards:</strong> Roll numbers and phone details are withheld from public directory pages.</span>
            </li>
          </ul>

          <div className="pt-2">
            <button
              onClick={onOpenXamppExport}
              className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2"
            >
              <FileCode className="w-4 h-4" />
              <span>View Full XAMPP / PHP Architecture Docs</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
