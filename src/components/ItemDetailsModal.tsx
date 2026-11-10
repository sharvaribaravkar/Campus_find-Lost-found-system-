import React, { useState } from 'react';
import { 
  X, 
  MapPin, 
  Calendar, 
  Clock, 
  Tag, 
  Building2, 
  ShieldCheck, 
  CheckCircle, 
  AlertCircle, 
  Upload, 
  FileText,
  User,
  ExternalLink,
  Sparkles
} from 'lucide-react';
import { Item, Claim } from '../types';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

interface ItemDetailsModalProps {
  item: Item | null;
  onClose: () => void;
  onOpenReportModal?: (type: 'lost' | 'found') => void;
  onSmartMatchClick?: (lostItem: Item, foundItem: Item) => void;
}

export const ItemDetailsModal: React.FC<ItemDetailsModalProps> = ({
  item,
  onClose,
  onOpenReportModal,
  onSmartMatchClick,
}) => {
  const { currentUser } = useAuth();
  const [showClaimForm, setShowClaimForm] = useState(false);
  const [claimReason, setClaimReason] = useState('');
  const [proofText, setProofText] = useState('');
  const [proofUrl, setProofUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [claimSuccess, setClaimSuccess] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!item) return null;

  const college = storage.getCollegeById(item.college_id);
  const categories = storage.getCategories();
  const category = categories.find(c => c.id === item.category_id);
  const reporter = storage.getUserById(item.user_id);

  // Check if current user is the reporter of this item
  const isReporter = currentUser?.id === item.user_id;

  // Find smart match candidates for this item
  const smartMatches = storage.runSmartMatchingForItem(item);
  const topMatch = smartMatches.length > 0 ? smartMatches[0] : null;

  // Existing claims on this item
  const allClaims = storage.getClaims(item.college_id);
  const itemClaims = allClaims.filter(c => c.item_id === item.id);
  const userExistingClaim = currentUser 
    ? itemClaims.find(c => c.claimant_user_id === currentUser.id) 
    : null;

  const handleClaimSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setErrorMsg('Please log in with a student account to claim this item.');
      return;
    }

    if (currentUser.role !== 'student') {
      setErrorMsg('Only registered students can claim lost belongings.');
      return;
    }

    if (isReporter) {
      setErrorMsg('You cannot submit an ownership claim on an item you reported yourself.');
      return;
    }

    if (!claimReason.trim()) {
      setErrorMsg('Please provide a reason or distinguishing description to prove your ownership.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      storage.submitClaim({
        item_id: item.id,
        claimant_user_id: currentUser.id,
        college_id: item.college_id,
        claim_reason: claimReason.trim(),
        proof_text: proofText.trim() || undefined,
        proof_url: proofUrl.trim() || undefined,
      });

      confetti({
        particleCount: 50,
        spread: 60,
        origin: { y: 0.7 }
      });

      setClaimSuccess(true);
      setShowClaimForm(false);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to submit claim.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden my-8 transform transition-all">
        {/* Header with Close */}
        <div className="relative bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
              item.type === 'lost' ? 'bg-rose-600 text-white' : 'bg-emerald-600 text-white'
            }`}>
              {item.type === 'lost' ? 'Lost Item Report' : 'Found Item Record'}
            </span>
            <span className="text-xs bg-slate-800 text-sky-300 px-2 py-0.5 rounded font-mono border border-slate-700">
              {college?.code || 'CAMPUS'}
            </span>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 max-h-[80vh] overflow-y-auto space-y-6">
          {/* Top Hero Image & Key Details */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="relative rounded-2xl overflow-hidden bg-slate-100 border border-slate-200 h-64 md:h-full">
              <img
                src={item.image_url || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600'}
                alt={item.title}
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-2 left-2 right-2 bg-slate-900/80 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-xs flex items-center justify-between">
                <span className="text-[11px] text-slate-300">Status</span>
                <span className="font-semibold capitalize text-sky-400">{item.status}</span>
              </div>
            </div>

            <div className="space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-2 text-xs font-semibold text-sky-600 mb-1">
                  <Tag className="w-3.5 h-3.5" />
                  <span>{category?.name || 'General Item'}</span>
                </div>

                <h2 className="text-xl font-bold text-slate-900 leading-snug">
                  {item.title}
                </h2>

                <p className="text-xs text-slate-600 mt-2.5 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                  {item.description}
                </p>
              </div>

              {/* Specific metadata */}
              <div className="space-y-2 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                  <div>
                    <strong className="text-slate-800">Campus Location: </strong>
                    <span>{item.location_name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-sky-500 shrink-0" />
                  <div>
                    <strong className="text-slate-800">Date: </strong>
                    <span>{new Date(item.date_occurred).toLocaleDateString([], { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</span>
                    {item.time_occurred && <span className="ml-1 text-slate-500">at {item.time_occurred}</span>}
                  </div>
                </div>

                {item.type === 'found' && item.deposit_location && (
                  <div className="p-2.5 bg-emerald-50 rounded-xl border border-emerald-200 text-emerald-900 font-medium">
                    📍 <strong>Currently Deposited at:</strong> {item.deposit_location}
                  </div>
                )}

                {item.type === 'lost' && item.additional_details && (
                  <div className="p-2.5 bg-amber-50 rounded-xl border border-amber-200 text-amber-900 text-[11px]">
                    <strong>Note:</strong> {item.additional_details}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Privacy & Safe Verification Banner */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 flex items-start gap-3 text-xs text-slate-600">
            <ShieldCheck className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <strong className="text-slate-800">Protected Chain of Custody:</strong>
              <p className="mt-0.5 leading-relaxed">
                Reported via {college?.name || 'Campus'}. To prevent false claims, recovered belongings are released exclusively upon in-person presentation of your college ID card at the designated security desk.
              </p>
            </div>
          </div>

          {/* Smart Match Suggestion Banner if applicable */}
          {topMatch && (
            <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-amber-400 text-amber-950 flex items-center justify-center font-bold text-sm shrink-0 shadow">
                  ⚡
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-900 uppercase tracking-wide">
                    Smart Match Engine Detected a Counterpart ({topMatch.matchScore}% Match)
                  </h4>
                  <p className="text-xs text-amber-800 mt-0.5">
                    {topMatch.matchReasons.join(' • ')}
                  </p>
                </div>
              </div>
              {onSmartMatchClick && (
                <button
                  onClick={() => {
                    onSmartMatchClick(topMatch.lostItem, topMatch.foundItem);
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl shadow transition shrink-0"
                >
                  Compare Side-by-Side
                </button>
              )}
            </div>
          )}

          {/* Claim Section for Found Items */}
          {item.type === 'found' && (
            <div className="pt-4 border-t border-slate-200">
              {item.status === 'returned' ? (
                <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center">
                  <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto mb-1" />
                  <h4 className="text-sm font-bold text-emerald-900">This Item Has Been Recovered & Returned!</h4>
                  <p className="text-xs text-emerald-700 mt-1">
                    The verified owner successfully claimed and collected this item from campus security.
                  </p>
                </div>
              ) : userExistingClaim ? (
                <div className="bg-sky-50 border border-sky-200 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-sky-900 uppercase tracking-wider">
                      Your Claim Status:
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold capitalize ${
                      userExistingClaim.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      userExistingClaim.status === 'completed' ? 'bg-emerald-600 text-white' :
                      userExistingClaim.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800'
                    }`}>
                      {userExistingClaim.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700">
                    <strong>Your claim remarks:</strong> {userExistingClaim.claim_reason}
                  </p>
                  {userExistingClaim.admin_remarks && (
                    <div className="p-2.5 bg-white rounded-lg border border-sky-100 text-xs text-slate-800">
                      <strong>Admin note:</strong> {userExistingClaim.admin_remarks}
                    </div>
                  )}
                  {userExistingClaim.status === 'approved' && (
                    <p className="text-xs font-semibold text-emerald-700">
                      ✅ Visit the administrative office or security gate with your College ID card to take possession of your belonging.
                    </p>
                  )}
                </div>
              ) : claimSuccess ? (
                <div className="bg-emerald-50 border border-emerald-200 p-5 rounded-2xl text-center space-y-2">
                  <CheckCircle className="w-8 h-8 text-emerald-600 mx-auto" />
                  <h4 className="text-sm font-bold text-emerald-900">Ownership Claim Submitted!</h4>
                  <p className="text-xs text-emerald-700 leading-relaxed max-w-md mx-auto">
                    Your claim has been forwarded to the {college?.name || 'College'} administration desk. You will be notified once reviewed.
                  </p>
                </div>
              ) : showClaimForm ? (
                /* The Claim Form */
                <form onSubmit={handleClaimSubmit} className="bg-slate-50 border border-slate-200 p-5 rounded-2xl space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                      <FileText className="w-4 h-4 text-sky-600" />
                      Submit Ownership Claim Form
                    </h4>
                    <button
                      type="button"
                      onClick={() => setShowClaimForm(false)}
                      className="text-xs text-slate-400 hover:text-slate-600"
                    >
                      Cancel
                    </button>
                  </div>

                  {errorMsg && (
                    <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0" />
                      <span>{errorMsg}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Explain Why This Belonging Is Yours *
                    </label>
                    <textarea
                      rows={3}
                      required
                      value={claimReason}
                      onChange={(e) => setClaimReason(e.target.value)}
                      placeholder="Describe hidden details only the true owner would know: sticker colors, scratches, wallpapers, passcode pattern, brand model, or content inside..."
                      className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Proof of Ownership / Serial No. / Bill Details (Optional)
                      </label>
                      <input
                        type="text"
                        value={proofText}
                        onChange={(e) => setProofText(e.target.value)}
                        placeholder="e.g. Amazon Order #, IMEI, Serial #8943"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 mb-1">
                        Proof Image / Receipt URL (Optional)
                      </label>
                      <input
                        type="url"
                        value={proofUrl}
                        onChange={(e) => setProofUrl(e.target.value)}
                        placeholder="https://... photo of box, warranty or invoice"
                        className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
                      />
                    </div>
                  </div>

                  <div className="pt-2 flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setShowClaimForm(false)}
                      className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 rounded-xl transition"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition shadow flex items-center gap-1.5"
                    >
                      {isSubmitting ? 'Submitting Claim...' : 'Submit Claim to College Admin'}
                    </button>
                  </div>
                </form>
              ) : (
                <div className="flex items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
                  <div>
                    <h4 className="text-xs font-bold text-slate-800">Is this your item?</h4>
                    <p className="text-[11px] text-slate-500">
                      Submit an ownership claim with identifying details for admin approval.
                    </p>
                  </div>
                  <button
                    onClick={() => {
                      if (!currentUser) {
                        alert('Please log in with a student account first.');
                        return;
                      }
                      if (isReporter) {
                        alert('You cannot claim an item you reported yourself.');
                        return;
                      }
                      setShowClaimForm(true);
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition"
                  >
                    Claim This Item
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="bg-slate-50 px-6 py-4 border-t border-slate-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold text-slate-600 hover:text-slate-900 bg-white border border-slate-300 rounded-xl transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
