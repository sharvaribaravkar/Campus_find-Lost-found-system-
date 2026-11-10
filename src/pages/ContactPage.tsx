import React, { useState } from 'react';
import { Mail, Phone, MapPin, Send, CheckCircle2, MessageSquare, ShieldCheck } from 'lucide-react';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';

export const ContactPage: React.FC = () => {
  const { currentUser, currentCollege } = useAuth();
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (currentUser) {
      storage.addComplaint({
        user_id: currentUser.id,
        college_id: currentUser.college_id || 'col_dypcoe',
        subject: subject.trim(),
        description: message.trim(),
        priority: 'medium',
      });
    }
    setSent(true);
    setSubject('');
    setMessage('');
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-12 space-y-10">
      <div className="text-center space-y-2">
        <span className="px-3 py-1 rounded-full text-xs font-bold bg-sky-100 text-sky-800 uppercase tracking-wider">
          Direct Helpdesk
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
          Contact CampusFind Central Helpdesk
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 max-w-lg mx-auto">
          Need assistance verifying an item claim, reporting an inter-campus issue, or reaching security coordinators?
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        <div className="bg-slate-900 text-white rounded-3xl p-8 space-y-6 shadow-xl">
          <h3 className="font-bold text-lg text-white">Central Operations Office</h3>
          <div className="space-y-4 text-xs text-slate-300">
            <div className="flex items-start gap-3">
              <MapPin className="w-5 h-5 text-sky-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Physical Location:</strong>
                Campus Security Command Center, Sector 29, Pradhikaran, Pune 411044
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Helpline:</strong>
                +91 20 2765 3000 (Mon - Sat, 8:00 AM - 7:00 PM)
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Mail className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-white block">Email:</strong>
                helpdesk@campusfind.in / lostfound@dypcoeakurdi.ac.in
              </div>
            </div>
          </div>

          <div className="p-4 bg-slate-800/80 rounded-2xl border border-slate-700 text-xs text-slate-400 flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Emergency lost ID cards or passports receive prioritized 2-hour escalation.</span>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-xl space-y-4">
          <h3 className="font-bold text-base text-slate-900">Send an Inquiry or Ticket</h3>

          {sent && (
            <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs rounded-xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
              <span>Inquiry received! Your ticket ID has been registered in the database.</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Subject</label>
              <input
                type="text"
                required
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                placeholder="e.g. Urgent query regarding recovered Scientific Calculator"
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Message Details</label>
              <textarea
                rows={4}
                required
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                placeholder="Provide as much context as possible..."
                className="w-full p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <button
              type="submit"
              className="w-full py-2.5 bg-sky-600 hover:bg-sky-500 text-white font-bold rounded-xl transition shadow flex items-center justify-center gap-2"
            >
              <Send className="w-4 h-4" />
              <span>Submit Ticket</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
