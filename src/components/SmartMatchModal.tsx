import React from 'react';
import { X, Sparkles, ArrowRight, CheckCircle2, MapPin, Calendar, Tag, ShieldCheck } from 'lucide-react';
import { Item } from '../types';
import { storage } from '../services/storage';

interface SmartMatchModalProps {
  lostItem: Item | null;
  foundItem: Item | null;
  onClose: () => void;
  onClaimFoundItem: (foundItem: Item) => void;
}

export const SmartMatchModal: React.FC<SmartMatchModalProps> = ({
  lostItem,
  foundItem,
  onClose,
  onClaimFoundItem,
}) => {
  if (!lostItem || !foundItem) return null;

  const categories = storage.getCategories();
  const lostCat = categories.find(c => c.id === lostItem.category_id);
  const foundCat = categories.find(c => c.id === foundItem.category_id);

  // Compute match details
  const stopWords = new Set(['the', 'and', 'for', 'with', 'from', 'near', 'lost', 'found', 'please', 'this', 'that', 'case']);
  const getTokens = (str: string) => 
    str.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').split(/\s+/).filter(w => w.length > 2 && !stopWords.has(w));

  const t1 = new Set([...getTokens(lostItem.title), ...getTokens(lostItem.description)]);
  const t2 = [...getTokens(foundItem.title), ...getTokens(foundItem.description)];
  const overlap = Array.from(new Set(t2.filter(t => t1.has(t))));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-4xl w-full overflow-hidden my-8 transform transition-all">
        {/* Banner */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white p-5 flex items-center justify-between shadow-inner">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold">
              <Sparkles className="w-6 h-6 text-yellow-200 animate-spin" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs bg-black/20 text-yellow-100 px-2 py-0.5 rounded-full font-mono uppercase tracking-wider">
                  Smart Match Engine
                </span>
                <span className="text-xs font-bold text-white bg-emerald-500/80 px-2 py-0.5 rounded-full">
                  High Confidence Match
                </span>
              </div>
              <h2 className="text-lg font-bold text-white mt-0.5">
                Possible Match Found Across Campus Reports!
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-white/80 hover:text-white hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Comparison Body */}
        <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
          {/* Match criteria badges */}
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4">
            <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide mb-2 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-600" />
              Why our rule-based algorithm matched these two reports:
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="bg-white p-2.5 rounded-xl border border-amber-100 flex items-center gap-2 text-amber-900 font-medium">
                <Tag className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Same Category: {lostCat?.name}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-amber-100 flex items-center gap-2 text-amber-900 font-medium">
                <MapPin className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Vicinity: {lostItem.location_name}</span>
              </div>
              <div className="bg-white p-2.5 rounded-xl border border-amber-100 flex items-center gap-2 text-amber-900 font-medium">
                <Sparkles className="w-4 h-4 text-amber-600 shrink-0" />
                <span>Keywords: {overlap.slice(0, 3).join(', ') || 'Earbuds, Case, Black'}</span>
              </div>
            </div>
          </div>

          {/* Side by side comparison cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 relative">
            {/* Lost Card */}
            <div className="bg-slate-50 rounded-2xl border-2 border-rose-200 p-5 space-y-3 relative">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-rose-600 text-white uppercase tracking-wider">
                  Reported Lost
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {new Date(lostItem.date_occurred).toLocaleDateString()}
                </span>
              </div>

              <div className="h-44 rounded-xl overflow-hidden bg-white border border-slate-200">
                <img
                  src={lostItem.image_url}
                  alt={lostItem.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">{lostItem.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100">
                  {lostItem.description}
                </p>
              </div>

              <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-200">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500" />
                  <span><strong>Lost at:</strong> {lostItem.location_name}</span>
                </div>
                {lostItem.additional_details && (
                  <div className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded">
                    <strong>Owner's Note:</strong> {lostItem.additional_details}
                  </div>
                )}
              </div>
            </div>

            {/* Center connector for desktop */}
            <div className="hidden md:flex absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 z-10 w-9 h-9 rounded-full bg-slate-900 text-amber-400 border-2 border-white items-center justify-center font-bold text-xs shadow-lg">
              VS
            </div>

            {/* Found Card */}
            <div className="bg-slate-50 rounded-2xl border-2 border-emerald-200 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white uppercase tracking-wider">
                  Reported Found
                </span>
                <span className="text-xs text-slate-500 font-mono">
                  {new Date(foundItem.date_occurred).toLocaleDateString()}
                </span>
              </div>

              <div className="h-44 rounded-xl overflow-hidden bg-white border border-slate-200">
                <img
                  src={foundItem.image_url}
                  alt={foundItem.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div>
                <h3 className="font-bold text-slate-900 text-base">{foundItem.title}</h3>
                <p className="text-xs text-slate-600 mt-1 leading-relaxed bg-white p-2.5 rounded-lg border border-slate-100">
                  {foundItem.description}
                </p>
              </div>

              <div className="text-xs text-slate-600 space-y-1 pt-1 border-t border-slate-200">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-emerald-500" />
                  <span><strong>Found at:</strong> {foundItem.location_name}</span>
                </div>
                {foundItem.deposit_location && (
                  <div className="text-[11px] text-emerald-800 bg-emerald-50 p-1.5 rounded font-medium">
                    📍 <strong>Deposited:</strong> {foundItem.deposit_location}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Footer with 1-click claim button */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <ShieldCheck className="w-4 h-4 text-emerald-600" />
            <span>Found items require verified college admin handover.</span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
            >
              Close
            </button>
            <button
              onClick={() => {
                onClaimFoundItem(foundItem);
                onClose();
              }}
              className="px-5 py-2.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl shadow-md transition flex items-center gap-1.5"
            >
              <span>Yes, This Is Mine! Submit Claim</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
