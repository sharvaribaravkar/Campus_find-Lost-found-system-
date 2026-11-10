import React, { useState } from 'react';
import { 
  Search, 
  PlusCircle, 
  Building2, 
  Users, 
  Package, 
  CheckCircle2, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle, 
  ArrowRight,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
  FileCode,
  Send,
  Lock
} from 'lucide-react';
import { Item, SmartMatchResult } from '../types';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { ItemCard } from '../components/ItemCard';

interface HomePageProps {
  setCurrentTab: (tab: string) => void;
  onOpenReportModal: (type: 'lost' | 'found') => void;
  onViewItemDetails: (item: Item) => void;
  onOpenXamppExport: () => void;
  onSmartMatchClick: (lost: Item, found: Item) => void;
}

export const HomePage: React.FC<HomePageProps> = ({
  setCurrentTab,
  onOpenReportModal,
  onViewItemDetails,
  onOpenXamppExport,
  onSmartMatchClick,
}) => {
  const { currentUser, currentCollege } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [feedbackSent, setFeedbackSent] = useState(false);
  const [contactSubject, setContactSubject] = useState('');
  const [contactMessage, setContactMessage] = useState('');

  // Live dynamic statistics directly from database
  const stats = storage.getPlatformStats();

  // Get active items for current college (or all if not logged in)
  const collegeId = currentCollege?.id;
  const recentLost = storage.getItems({ 
    collegeId, 
    type: 'lost', 
    status: 'active' 
  }).slice(0, 4);

  const recentFound = storage.getItems({ 
    collegeId, 
    type: 'found', 
    status: 'active' 
  }).slice(0, 4);

  // Smart matches in current college
  const smartMatches = collegeId ? storage.getSmartMatchesForCollege(collegeId) : [];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setCurrentTab('lost-items');
    }
  };

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser && contactSubject.trim() && contactMessage.trim()) {
      storage.addComplaint({
        user_id: currentUser.id,
        college_id: currentUser.college_id || 'col_dypcoe',
        subject: contactSubject.trim(),
        description: contactMessage.trim(),
        priority: 'medium',
      });
      setFeedbackSent(true);
      setContactSubject('');
      setContactMessage('');
    } else {
      setFeedbackSent(true);
      setTimeout(() => setFeedbackSent(false), 3000);
    }
  };

  const faqs = [
    {
      q: "Can students from other colleges see my personal phone number or roll number?",
      a: "No. CampusFind enforces strict privacy. Private contact numbers and roll numbers are concealed. All verification and custody handovers happen securely under supervision of your college's designated security desk or student welfare office."
    },
    {
      q: "How does the Smart Item Matching algorithm work?",
      a: "When a lost or found report is submitted, our rule-based matching engine instantly scores candidate pairs within the same campus by analyzing item category (+35 points), keyword overlap (+15 to +45 points), campus vicinity (+20 points), and date proximity (+15 points). Once confidence exceeds 40%, both parties receive in-app notifications."
    },
    {
      q: "What happens after I submit an ownership claim?",
      a: "Your claim and proof description (e.g. serial number, scratch marks, invoice) are routed to your College Administrator. The admin evaluates your statement and either approves it for in-person pickup or requests additional verification."
    },
    {
      q: "How do new colleges join the CampusFind network?",
      a: "College authorities register via the 'Register College' page. Once submitted, the Super Admin verifies credentials and activates the campus account, provisioning dedicated college administration access."
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-slate-900 via-slate-900 to-slate-950 text-white pt-16 pb-20 px-4 sm:px-6 lg:px-8">
        {/* Subtle decorative glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-tr from-sky-500/10 via-emerald-500/10 to-sky-600/15 blur-3xl pointer-events-none" />

        <div className="max-w-5xl mx-auto text-center relative z-10 space-y-6">
          {/* Active Campus Badge */}
          {currentCollege ? (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-xs text-slate-300 shadow-sm animate-in fade-in">
              <Building2 className="w-3.5 h-3.5 text-sky-400" />
              <span>Current Campus: <strong className="text-white font-semibold">{currentCollege.name}</strong></span>
              <span className="bg-sky-500/20 text-sky-300 text-[10px] px-1.5 py-0.2 rounded font-mono">
                {currentCollege.code}
              </span>
            </div>
          ) : (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/90 border border-slate-700 text-xs text-sky-300 shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>One Centralized Platform for Every University Campus</span>
            </div>
          )}

          {/* Headings */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Lost Something on Campus? <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-sky-300 to-emerald-400">
              Let's Find It!
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-sm sm:text-base text-slate-300 leading-relaxed font-normal">
            CampusFind connects students, security desks, and faculty across colleges to report, track, match, and safely recover lost belongings.
          </p>

          {/* Quick Search Bar */}
          <div className="max-w-2xl mx-auto pt-2">
            <form onSubmit={handleSearchSubmit} className="relative flex items-center shadow-2xl rounded-2xl overflow-hidden bg-white/10 backdrop-blur-md border border-white/20 p-1.5 focus-within:border-sky-400 transition">
              <div className="pl-3 text-slate-400">
                <Search className="w-5 h-5 text-sky-400" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search lost earphones, casio calculators, wallets, water bottles..."
                className="w-full bg-transparent px-3 py-2.5 text-xs sm:text-sm text-white placeholder-slate-400 focus:outline-none"
              />
              <button
                type="submit"
                className="bg-sky-500 hover:bg-sky-400 text-white font-bold text-xs sm:text-sm px-5 py-2.5 rounded-xl transition shadow-md shrink-0"
              >
                Search Campus
              </button>
            </form>
          </div>

          {/* Main Action CTAs */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
            <button
              onClick={() => onOpenReportModal('lost')}
              className="flex items-center gap-2 bg-rose-600 hover:bg-rose-500 text-white text-sm font-bold px-6 py-3 rounded-2xl shadow-lg shadow-rose-600/30 transition transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" />
              Report Lost Item
            </button>

            <button
              onClick={() => onOpenReportModal('found')}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold px-6 py-3 rounded-2xl shadow-lg shadow-emerald-600/30 transition transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" />
              Report Found Item
            </button>

            <button
              onClick={onOpenXamppExport}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-sky-300 text-sm font-semibold px-5 py-3 rounded-2xl transition"
            >
              <FileCode className="w-4 h-4 text-emerald-400" />
              <span>XAMPP / PHP Source</span>
            </button>
          </div>
        </div>
      </section>

      {/* Dynamic Statistics Section (Real dynamic data from database) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-10 relative z-20">
        <div className="bg-white rounded-3xl shadow-xl border border-slate-200/80 p-6 sm:p-8">
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-6 divide-y lg:divide-y-0 lg:divide-x divide-slate-100">
            {/* Colleges */}
            <div className="text-center pt-2 lg:pt-0">
              <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto mb-2">
                <Building2 className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.totalColleges}</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">Registered Colleges</div>
            </div>

            {/* Students */}
            <div className="text-center pt-2 lg:pt-0">
              <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center mx-auto mb-2">
                <Users className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.totalStudents}</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">Registered Students</div>
            </div>

            {/* Lost Items */}
            <div className="text-center pt-2 lg:pt-0">
              <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto mb-2">
                <Package className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.lostItems}</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">Lost Items Reported</div>
            </div>

            {/* Found Items */}
            <div className="text-center pt-2 lg:pt-0">
              <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-slate-900">{stats.foundItems}</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">Found Items Logged</div>
            </div>

            {/* Successfully Returned */}
            <div className="text-center pt-2 lg:pt-0 col-span-2 lg:col-span-1">
              <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto mb-2">
                <Sparkles className="w-5 h-5" />
              </div>
              <div className="text-2xl sm:text-3xl font-extrabold text-emerald-600">{stats.returnedItems}</div>
              <div className="text-xs font-semibold text-slate-500 mt-0.5">Successfully Returned</div>
            </div>
          </div>
        </div>
      </section>

      {/* Smart Match Spotlight if matches exist for this college */}
      {smartMatches.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-white text-amber-900 uppercase tracking-wider flex items-center gap-1 shadow-sm">
                  <Sparkles className="w-3.5 h-3.5 fill-amber-900" />
                  Algorithm Alert: Possible Match Found!
                </span>
                <span className="text-xs bg-black/20 text-yellow-100 px-2 py-0.5 rounded font-mono">
                  {smartMatches[0].matchScore}% Confidence
                </span>
              </div>
              <h3 className="text-xl sm:text-2xl font-bold">
                "{smartMatches[0].foundItem.title}" strongly matches "{smartMatches[0].lostItem.title}"
              </h3>
              <p className="text-xs sm:text-sm text-yellow-100 max-w-2xl">
                Our smart matcher detected overlapping keywords, identical category, and matching reading room location at {currentCollege?.name || 'campus'}.
              </p>
            </div>

            <button
              onClick={() => onSmartMatchClick(smartMatches[0].lostItem, smartMatches[0].foundItem)}
              className="px-6 py-3 bg-white text-slate-900 hover:bg-slate-100 rounded-2xl font-bold text-xs sm:text-sm shadow-lg transition shrink-0 flex items-center gap-2"
            >
              <span>Compare Side-by-Side</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </section>
      )}

      {/* Recently Lost Items Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-rose-600 uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-rose-600 animate-ping" />
              Active Searches
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Recently Lost on Campus
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              {currentCollege ? `Belongings reported lost at ${currentCollege.name}` : 'Latest reports across all colleges'}
            </p>
          </div>

          <button
            onClick={() => setCurrentTab('lost-items')}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 group"
          >
            <span>View All Lost Items ({stats.lostItems})</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentLost.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onViewDetails={onViewItemDetails}
              hasSmartMatch={smartMatches.some(m => m.lostItem.id === item.id)}
            />
          ))}
        </div>
      </section>

      {/* Recently Found Items Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between mb-8 gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-600 uppercase tracking-wider mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-600" />
              Safely Deposited
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              Recently Found on Campus
            </h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Recovered items waiting for verified owner handover at campus security
            </p>
          </div>

          <button
            onClick={() => setCurrentTab('found-items')}
            className="text-xs font-bold text-sky-600 hover:text-sky-700 flex items-center gap-1 group"
          >
            <span>View All Found Items ({stats.foundItems})</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {recentFound.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onViewDetails={onViewItemDetails}
              onClaim={onViewItemDetails}
              hasSmartMatch={smartMatches.some(m => m.foundItem.id === item.id)}
            />
          ))}
        </div>
      </section>

      {/* How CampusFind Works Section */}
      <section className="bg-slate-900 text-white py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14 space-y-2">
            <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
              Simple 4-Step Recovery Workflow
            </span>
            <h2 className="text-2xl sm:text-4xl font-extrabold">
              How CampusFind Works
            </h2>
            <p className="text-xs sm:text-sm text-slate-400">
              Designed specifically for university ecosystems to eliminate chaos and establish clear chain of custody.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
            {/* Step 1 */}
            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-sky-500 text-white flex items-center justify-center font-bold text-base shadow">
                1
              </div>
              <h3 className="font-bold text-base text-white">Report the Item</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Student or guard logs the item with photo, campus location, date, category, and deposit spot.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-base shadow">
                2
              </div>
              <h3 className="font-bold text-base text-white">Smart Match Engine</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Our rule-based engine auto-compares categories, locations, and descriptions, sending instant alerts.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center font-bold text-base shadow">
                3
              </div>
              <h3 className="font-bold text-base text-white">Submit Ownership Claim</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                The rightful owner describes unique identifying marks, serial numbers, invoice, or secret passcode.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 relative space-y-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500 text-white flex items-center justify-center font-bold text-base shadow">
                4
              </div>
              <h3 className="font-bold text-base text-white">Admin Verified Handover</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                College Admin inspects proof, approves claim, and marks item as returned upon in-person ID verification.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Why Choose CampusFind? Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <span className="text-xs font-bold text-emerald-600 uppercase tracking-wider">
            Built for Institutions
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Why Choose CampusFind?
          </h2>
          <p className="text-xs sm:text-sm text-slate-500">
            A centralized platform providing dedicated data isolation for every college.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <Building2 className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Multi-College Separation</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Every university has its own isolated records, admin dashboard, student roster, and claims pipeline enforced at the database level via <code>college_id</code>.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Anti-Fraud & Privacy</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Prevents users from claiming their own found items. Redacts student contact info and roll numbers from public displays to stop harassment and imposters.
            </p>
          </div>

          <div className="bg-white rounded-3xl p-6 border border-slate-200/80 shadow-sm space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="font-bold text-slate-900 text-lg">Smart Rule Matching</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Intelligent keyword analysis and category comparison immediately connect matching lost and found reports without requiring expensive external AI APIs.
            </p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (Accordion) */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 space-y-2">
          <span className="text-xs font-bold text-sky-600 uppercase tracking-wider">
            Help & Guidelines
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
            Frequently Asked Questions
          </h2>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div 
                key={idx}
                className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm transition"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 text-left font-bold text-sm text-slate-800 flex items-center justify-between gap-4"
                >
                  <span>{faq.q}</span>
                  {isOpen ? <ChevronUp className="w-4 h-4 text-sky-600 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />}
                </button>
                {isOpen && (
                  <div className="px-4 sm:px-5 pb-5 text-xs text-slate-600 leading-relaxed border-t border-slate-100 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Contact Helpdesk Section */}
      <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="space-y-4">
              <span className="text-xs font-bold text-sky-400 uppercase tracking-wider">
                Support & Inquiries
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white">
                Have a Question or Found Item Concern?
              </h2>
              <p className="text-xs text-slate-300 leading-relaxed">
                Reach out to your campus lost and found coordinator. We respond to urgent inquiries regarding lost student identification, hall tickets, or high-value devices within campus hours.
              </p>
              <div className="pt-2 text-xs text-slate-400 space-y-1">
                <div>📍 Central Campus Operations Desk</div>
                <div>📞 Helpdesk: +91 20 2765 3000</div>
                <div>✉️ support@campusfind.in</div>
              </div>
            </div>

            <form onSubmit={handleContactSubmit} className="bg-slate-800/90 p-5 rounded-2xl border border-slate-700 space-y-3">
              {feedbackSent && (
                <div className="p-3 bg-emerald-950/80 border border-emerald-500 text-emerald-300 text-xs rounded-xl flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Thank you! Your inquiry was logged with the campus administrator.</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Subject / Issue</label>
                <input
                  type="text"
                  required
                  value={contactSubject}
                  onChange={(e) => setContactSubject(e.target.value)}
                  placeholder="e.g. Lost ID card not showing in search"
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-600 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Message Details</label>
                <textarea
                  rows={3}
                  required
                  value={contactMessage}
                  onChange={(e) => setContactMessage(e.target.value)}
                  placeholder="Describe your issue or feedback..."
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-600 bg-slate-900 text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 text-xs font-bold text-white bg-sky-500 hover:bg-sky-400 rounded-xl transition shadow flex items-center justify-center gap-1.5"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Submit to Helpdesk</span>
              </button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
};
