import React from 'react';
import { 
  MapPin, 
  Calendar, 
  Clock, 
  Tag, 
  Building2, 
  ShieldCheck, 
  Sparkles,
  CheckCircle,
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { Item } from '../types';
import { storage } from '../services/storage';

interface ItemCardProps {
  item: Item;
  onViewDetails: (item: Item) => void;
  onClaim?: (item: Item) => void;
  hasSmartMatch?: boolean;
}

export const ItemCard: React.FC<ItemCardProps> = ({
  item,
  onViewDetails,
  onClaim,
  hasSmartMatch = false,
}) => {
  const college = storage.getCollegeById(item.college_id);
  const categories = storage.getCategories();
  const category = categories.find(c => c.id === item.category_id);

  const isLost = item.type === 'lost';

  return (
    <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group hover:-translate-y-1">
      {/* Image & Badges Container */}
      <div className="relative h-48 w-full bg-slate-100 overflow-hidden">
        <img
          src={item.image_url || 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80'}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          onError={(e) => {
            (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1584438784894-089d6a62b8fa?w=600&auto=format&fit=crop&q=80';
          }}
        />

        {/* Top Floating Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 items-center">
          <span className={`px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider shadow-sm flex items-center gap-1 ${
            isLost 
              ? 'bg-rose-600 text-white shadow-rose-900/20' 
              : 'bg-emerald-600 text-white shadow-emerald-900/20'
          }`}>
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-ping" />
            {isLost ? 'Lost Item' : 'Found Item'}
          </span>

          {item.status === 'returned' && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-100 text-emerald-800 border border-emerald-300 flex items-center gap-1">
              <CheckCircle className="w-3 h-3" /> Returned
            </span>
          )}

          {item.status === 'claimed' && (
            <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" /> Verification Pending
            </span>
          )}
        </div>

        {/* Smart Match Pill */}
        {hasSmartMatch && (
          <div className="absolute top-3 right-3">
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-400 text-amber-950 shadow-md flex items-center gap-1 animate-bounce">
              <Sparkles className="w-3 h-3 fill-amber-950" /> Possible Match
            </span>
          </div>
        )}

        {/* College Code Tag at bottom of image */}
        {college && (
          <div className="absolute bottom-2 left-2 bg-slate-900/85 backdrop-blur-sm text-white px-2.5 py-1 rounded-md text-[11px] font-medium flex items-center gap-1.5 shadow">
            <Building2 className="w-3 h-3 text-sky-400" />
            <span className="font-semibold">{college.code}</span>
          </div>
        )}
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category Tag */}
          <div className="flex items-center gap-1.5 text-xs text-sky-700 font-medium mb-1.5">
            <Tag className="w-3.5 h-3.5 text-sky-500" />
            <span>{category?.name || 'General Item'}</span>
          </div>

          {/* Title */}
          <h3 
            onClick={() => onViewDetails(item)}
            className="font-bold text-slate-800 text-base line-clamp-1 hover:text-sky-600 cursor-pointer transition"
            title={item.title}
          >
            {item.title}
          </h3>

          {/* Description snippet */}
          <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
            {item.description}
          </p>

          {/* Location and Time metadata */}
          <div className="mt-3 pt-3 border-t border-slate-100 space-y-1 text-xs text-slate-600">
            <div className="flex items-center gap-1.5 truncate">
              <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0" />
              <span className="truncate font-medium">{item.location_name}</span>
            </div>
            <div className="flex items-center gap-3 text-slate-500 text-[11px]">
              <span className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                {new Date(item.date_occurred).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
              {item.time_occurred && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3 text-slate-400" />
                  {item.time_occurred}
                </span>
              )}
            </div>

            {/* Found deposit location indicator */}
            {!isLost && item.deposit_location && (
              <div className="mt-1 text-[11px] bg-slate-50 border border-slate-200/80 rounded px-2 py-1 text-slate-700 truncate">
                <strong className="text-slate-900 font-semibold">Deposited at:</strong> {item.deposit_location}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 flex items-center gap-2">
          <button
            onClick={() => onViewDetails(item)}
            className="flex-1 py-2 px-3 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition text-center"
          >
            View Details
          </button>

          {!isLost && item.status === 'active' && onClaim && (
            <button
              onClick={() => onClaim(item)}
              className="flex-1 py-2 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl transition shadow-sm text-center flex items-center justify-center gap-1"
            >
              <span>Claim Item</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          )}

          {isLost && item.status === 'active' && (
            <button
              onClick={() => onViewDetails(item)}
              className="flex-1 py-2 px-3 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 rounded-xl transition text-center"
            >
              Found this?
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
