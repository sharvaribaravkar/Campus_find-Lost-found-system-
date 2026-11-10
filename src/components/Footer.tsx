import React from 'react';
import { MapPin, Search, ShieldCheck, Mail, Phone, Heart, FileCode, CheckCircle2 } from 'lucide-react';

interface FooterProps {
  setCurrentTab: (tab: string) => void;
  onOpenXamppExport: () => void;
}

export const Footer: React.FC<FooterProps> = ({ setCurrentTab, onOpenXamppExport }) => {
  return (
    <footer className="bg-slate-950 text-slate-400 border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8">
          {/* Brand Column */}
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-emerald-400 p-0.5 shadow-md">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center relative">
                  <MapPin className="w-5 h-5 text-sky-400" />
                  <Search className="w-3 h-3 text-emerald-400 absolute top-1.5 right-1.5" />
                </div>
              </div>
              <div>
                <span className="text-xl font-bold tracking-tight text-white">
                  Campus<span className="text-sky-400">Find</span>
                </span>
                <p className="text-xs text-slate-400">One Platform, Every Campus.</p>
              </div>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed max-w-sm">
              The unified multi-college lost and found management platform. Connecting universities, campus security desks, and students to recover lost belongings with smart matching and verified chain of custody.
            </p>
            <div className="flex items-center gap-3 pt-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-950/80 text-emerald-400 border border-emerald-800/60">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified Campus Security
              </span>
              <button 
                onClick={onOpenXamppExport}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-sky-950/80 text-sky-400 border border-sky-800/60 hover:bg-sky-900 transition"
              >
                <FileCode className="w-3.5 h-3.5" /> XAMPP / PHP 8 Codebase
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <button onClick={() => setCurrentTab('home')} className="hover:text-white transition">Home</button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('lost-items')} className="hover:text-white transition">Browse Lost Items</button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('found-items')} className="hover:text-white transition">Browse Found Items</button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('how-it-works')} className="hover:text-white transition">How Smart Match Works</button>
              </li>
              <li>
                <button onClick={() => setCurrentTab('college-register')} className="text-sky-400 hover:text-sky-300 transition">Register Your College</button>
              </li>
            </ul>
          </div>

          {/* Participating Campuses */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Participating Campuses</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">DY Patil College of Engineering</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">PCCOE, Pune</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">MIT World Peace University</span>
              </li>
              <li className="flex items-center gap-1.5 text-slate-300">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                <span className="truncate">COEP Technological Univ.</span>
              </li>
            </ul>
          </div>

          {/* Security & Contact */}
          <div>
            <h4 className="text-white text-xs font-semibold uppercase tracking-wider mb-3">Security & Helpdesk</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>support@campusfind.in</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-sky-400 shrink-0" />
                <span>+91 20 2765 3000 (Central)</span>
              </li>
              <li className="pt-2 text-[11px] text-slate-500 leading-normal">
                Strict data privacy: Roll numbers and sensitive government ID numbers are never displayed publicly.
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
          <p>© {new Date().getFullYear()} CampusFind. All rights reserved. Centralized Multi-College Lost & Found Management System.</p>
          <div className="flex items-center gap-4">
            <button onClick={() => setCurrentTab('about')} className="hover:text-slate-400">About</button>
            <span>•</span>
            <button onClick={() => setCurrentTab('contact')} className="hover:text-slate-400">Contact</button>
            <span>•</span>
            <button onClick={onOpenXamppExport} className="text-emerald-400 hover:text-emerald-300 font-medium">PHP 8+ / MySQL Export</button>
          </div>
        </div>
      </div>
    </footer>
  );
};
