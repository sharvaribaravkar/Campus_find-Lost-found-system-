import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  MapPin, 
  Calendar, 
  Clock, 
  Tag, 
  Building2, 
  ShieldCheck, 
  Sparkles,
  AlertCircle,
  CheckCircle,
  HelpCircle,
  Image as ImageIcon
} from 'lucide-react';
import { ItemType, Category } from '../types';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

interface ReportItemModalProps {
  initialType?: ItemType;
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (itemId: string) => void;
}

const PRESET_SAMPLE_IMAGES: { label: string; url: string }[] = [
  { label: 'Earbuds / TWS', url: 'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?w=600&auto=format&fit=crop&q=80' },
  { label: 'Calculator', url: 'https://images.unsplash.com/photo-1594980596870-8aa52a78d8cd?w=600&auto=format&fit=crop&q=80' },
  { label: 'Wallet', url: 'https://images.unsplash.com/photo-1627123424574-724758594e93?w=600&auto=format&fit=crop&q=80' },
  { label: 'Water Bottle', url: 'https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=600&auto=format&fit=crop&q=80' },
  { label: 'Backpack', url: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop&q=80' },
  { label: 'Smartwatch', url: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop&q=80' },
  { label: 'Laptop Charger', url: 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=600&auto=format&fit=crop&q=80' },
  { label: 'Keys / Ring', url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?w=600&auto=format&fit=crop&q=80' },
  { label: 'Spectacles / Glasses', url: 'https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=600&auto=format&fit=crop&q=80' },
  { label: 'Book / Notebook', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=600&auto=format&fit=crop&q=80' },
];

export const ReportItemModal: React.FC<ReportItemModalProps> = ({
  initialType = 'lost',
  isOpen,
  onClose,
  onSuccess,
}) => {
  const { currentUser, currentCollege } = useAuth();
  const [type, setType] = useState<ItemType>(initialType);
  const categories = storage.getCategories();

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState(categories[0]?.id || 'cat_electronics');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [dateOccurred, setDateOccurred] = useState(new Date().toISOString().split('T')[0]);
  const [timeOccurred, setTimeOccurred] = useState('14:00');
  const [locationName, setLocationName] = useState('');
  const [contactPreference, setContactPreference] = useState('In-app Chat & Verified Admin Handover');
  
  // Specific fields
  const [additionalDetails, setAdditionalDetails] = useState('');
  const [depositLocation, setDepositLocation] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!currentUser) {
      setErrorMsg('Please log in with a valid account before reporting an item.');
      return;
    }

    if (!currentUser.college_id) {
      setErrorMsg('You must belong to an approved college to file lost or found reports.');
      return;
    }

    if (!title.trim() || !locationName.trim() || !description.trim()) {
      setErrorMsg('Please fill in all mandatory fields.');
      return;
    }

    if (type === 'found' && !depositLocation.trim()) {
      setErrorMsg('Please specify where you deposited the found item (e.g. Main Security Desk, HOD Cabin).');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const selectedImg = imageUrl.trim() || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80';

      const newItem = storage.addItem({
        college_id: currentUser.college_id,
        user_id: currentUser.id,
        title: title.trim(),
        category_id: categoryId,
        type,
        description: description.trim(),
        image_url: selectedImg,
        date_occurred: dateOccurred,
        time_occurred: timeOccurred,
        location_name: locationName.trim(),
        contact_preference: contactPreference,
        status: 'active',
        additional_details: type === 'lost' ? additionalDetails.trim() : undefined,
        deposit_location: type === 'found' ? depositLocation.trim() : undefined,
      });

      confetti({
        particleCount: 40,
        spread: 50,
        origin: { y: 0.6 }
      });

      onSuccess(newItem.id);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Error creating report');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-slate-200 max-w-2xl w-full overflow-hidden my-8 transform transition-all">
        {/* Header */}
        <div className="bg-slate-900 text-white p-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-base text-white">
              {type === 'lost' ? 'Report a Lost Item' : 'Report a Found Item'}
            </h3>
            {currentCollege && (
              <span className="text-xs bg-slate-800 text-sky-300 px-2.5 py-0.5 rounded font-mono border border-slate-700">
                {currentCollege.code}
              </span>
            )}
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switch inside modal */}
        <div className="bg-slate-100 p-2 flex border-b border-slate-200">
          <button
            type="button"
            onClick={() => setType('lost')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              type === 'lost'
                ? 'bg-rose-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            I Lost Something
          </button>
          <button
            type="button"
            onClick={() => setType('found')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition ${
              type === 'found'
                ? 'bg-emerald-600 text-white shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            I Found Something
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 max-h-[75vh] overflow-y-auto space-y-4">
          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* College association indicator */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs flex items-center justify-between text-slate-600">
            <span className="flex items-center gap-1.5">
              <Building2 className="w-4 h-4 text-sky-600" />
              <span>Registering record for: <strong>{currentCollege?.name || 'Your Registered College'}</strong></span>
            </span>
            <span className="text-[11px] text-slate-400">Strict college data separation</span>
          </div>

          {/* Title & Category */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Item Name / Title *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder={type === 'lost' ? 'e.g. Boat Airdopes 141 (Black Case)' : 'e.g. Black Wireless Earbuds Case'}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Item Category *
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              >
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Description *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={type === 'lost' 
                ? 'Describe unique visual traits, stickers, colour shades, scratches, brand logo...'
                : 'Describe appearance, color, brand, condition (do not disclose private ID numbers publicly)...'
              }
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Location & Time */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Campus Location *
              </label>
              <input
                type="text"
                required
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Central Library 2nd Fl, Canteen Lawn"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Date {type === 'lost' ? 'Lost' : 'Found'} *
              </label>
              <input
                type="date"
                required
                value={dateOccurred}
                onChange={(e) => setDateOccurred(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Approximate Time
              </label>
              <input
                type="time"
                value={timeOccurred}
                onChange={(e) => setTimeOccurred(e.target.value)}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          </div>

          {/* Found specific: Deposit Location */}
          {type === 'found' && (
            <div className="bg-emerald-50 border border-emerald-200 p-3.5 rounded-xl">
              <label className="block text-xs font-bold text-emerald-900 mb-1">
                Where is the item currently deposited? *
              </label>
              <input
                type="text"
                required
                value={depositLocation}
                onChange={(e) => setDepositLocation(e.target.value)}
                placeholder="e.g. Central Security Office Gate 1 with Head Guard, or Library Reception Desk"
                className="w-full text-xs p-2.5 rounded-xl border border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />
              <p className="text-[11px] text-emerald-700 mt-1">
                For security and chain of custody, deposited items should be handed over to official campus personnel.
              </p>
            </div>
          )}

          {/* Lost specific: Additional details */}
          {type === 'lost' && (
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Confidential Ownership Proof / Serial No. / Reward (Optional)
              </label>
              <input
                type="text"
                value={additionalDetails}
                onChange={(e) => setAdditionalDetails(e.target.value)}
                placeholder="e.g. Serial ending in 8943, has yellow Batman emblem sticker, reward Rs 200"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
          )}

          {/* Image Selection / Preset Picker */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Item Photo (Select a sample or paste custom image URL)
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://... direct image link"
                className="flex-1 text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Quick Presets */}
            <div className="space-y-1">
              <span className="text-[11px] text-slate-500 font-medium">Or pick a quick category sample photo:</span>
              <div className="flex flex-wrap gap-1.5">
                {PRESET_SAMPLE_IMAGES.map((sample, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setImageUrl(sample.url)}
                    className={`text-[11px] px-2 py-1 rounded-lg border transition ${
                      imageUrl === sample.url
                        ? 'bg-sky-100 border-sky-400 text-sky-800 font-semibold'
                        : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {sample.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            {imageUrl && (
              <div className="mt-2 relative w-24 h-24 rounded-xl overflow-hidden border border-slate-200">
                <img src={imageUrl} alt="Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => setImageUrl('')}
                  className="absolute top-1 right-1 p-0.5 bg-slate-900/80 rounded-full text-white"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          {/* Contact Preference */}
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Contact / Handover Preference
            </label>
            <select
              value={contactPreference}
              onChange={(e) => setContactPreference(e.target.value)}
              className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
            >
              <option value="In-app Chat & Verified Admin Handover">In-app Verification & Security Handover (Safest)</option>
              <option value="College Admin / Security Desk Handover">Official Security Desk Direct Handover</option>
              <option value="Call or WhatsApp">Direct Contact Phone / WhatsApp</option>
            </select>
          </div>

          <div className="pt-4 border-t border-slate-200 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={`px-6 py-2.5 text-xs font-bold text-white rounded-xl shadow-md transition flex items-center gap-1.5 ${
                type === 'lost' ? 'bg-rose-600 hover:bg-rose-500' : 'bg-emerald-600 hover:bg-emerald-500'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              <span>{isSubmitting ? 'Saving...' : `Publish ${type === 'lost' ? 'Lost' : 'Found'} Report`}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
