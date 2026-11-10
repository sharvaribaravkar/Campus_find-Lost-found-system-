import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Tag, 
  Building2, 
  PlusCircle, 
  Globe2, 
  ArrowRight,
  ShieldCheck,
  X
} from 'lucide-react';
import { Item } from '../types';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { ItemCard } from '../components/ItemCard';

interface FoundItemsPageProps {
  onViewDetails: (item: Item) => void;
  onOpenReportModal: (type: 'lost' | 'found') => void;
  onClaimItem: (item: Item) => void;
}

export const FoundItemsPage: React.FC<FoundItemsPageProps> = ({
  onViewDetails,
  onOpenReportModal,
  onClaimItem,
}) => {
  const { currentUser, currentCollege } = useAuth();
  const categories = storage.getCategories();
  const approvedColleges = storage.getApprovedColleges();

  // Filter States
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>(currentCollege?.id || 'all');
  const [globalSearch, setGlobalSearch] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [locationFilter, setLocationFilter] = useState('');
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');

  // Filter computation
  const filteredItems = useMemo(() => {
    const effectiveCollegeId = globalSearch ? null : (selectedCollegeId === 'all' ? currentCollege?.id || null : selectedCollegeId);

    let items = storage.getItems({
      collegeId: effectiveCollegeId,
      type: 'found',
      category: selectedCategory,
      search,
      status: statusFilter,
      globalSearch,
    });

    if (locationFilter.trim()) {
      const q = locationFilter.toLowerCase();
      items = items.filter(i => 
        i.location_name.toLowerCase().includes(q) || 
        (i.deposit_location && i.deposit_location.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'oldest') {
      items.sort((a, b) => new Date(a.date_occurred).getTime() - new Date(b.date_occurred).getTime());
    } else {
      items.sort((a, b) => new Date(b.date_occurred).getTime() - new Date(a.date_occurred).getTime());
    }

    return items;
  }, [search, selectedCategory, selectedCollegeId, globalSearch, statusFilter, locationFilter, sortBy, currentCollege]);

  const clearFilters = () => {
    setSearch('');
    setSelectedCategory('all');
    setSelectedCollegeId(currentCollege?.id || 'all');
    setStatusFilter('all');
    setLocationFilter('');
    setGlobalSearch(false);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-emerald-900/30 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-600 text-white uppercase tracking-wider">
              Found & Safely Deposited Registry
            </span>
            {currentCollege && !globalSearch && (
              <span className="text-xs bg-slate-800 text-sky-300 px-2.5 py-1 rounded-md font-mono border border-slate-700">
                {currentCollege.code} Campus Only
              </span>
            )}
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-white">
            Search Found Belongings
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl">
            Recovered items deposited at campus security cabins, HOD offices, and central libraries. If you recognize your property, click "Claim Item" and submit verifying details!
          </p>
        </div>

        <button
          onClick={() => onOpenReportModal('found')}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs sm:text-sm px-5 py-3 rounded-2xl shadow-lg shadow-emerald-600/30 transition shrink-0"
        >
          <PlusCircle className="w-4 h-4" />
          Report Found Item
        </button>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 space-y-4">
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by found item name, color, deposit cabin, or description..."
              className="w-full pl-9 pr-4 py-2.5 text-xs rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
            {search && (
              <button
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => setGlobalSearch(!globalSearch)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition border shrink-0 ${
              globalSearch
                ? 'bg-sky-50 text-sky-700 border-sky-300 shadow-sm ring-1 ring-sky-400'
                : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
            }`}
          >
            <Globe2 className="w-4 h-4 text-sky-500" />
            <span>Search All Campuses {globalSearch ? '(Enabled)' : '(Off)'}</span>
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2 border-t border-slate-100 text-xs">
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Categories</option>
              {categories.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Campus / College</label>
            <select
              disabled={!globalSearch && !!currentCollege}
              value={globalSearch ? selectedCollegeId : (currentCollege?.id || 'all')}
              onChange={(e) => setSelectedCollegeId(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-60"
            >
              <option value="all">All Colleges</option>
              {approvedColleges.map(c => (
                <option key={c.id} value={c.id}>{c.code} - {c.city}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Location or Deposit Spot</label>
            <input
              type="text"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              placeholder="e.g. Gate 1, Library Desk..."
              className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Status</label>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full p-2 rounded-xl border border-slate-200 bg-slate-50 font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active (Available for Claim)</option>
              <option value="claimed">Claim Verification Pending</option>
              <option value="returned">Successfully Returned</option>
            </select>
          </div>
        </div>

        {(search || selectedCategory !== 'all' || locationFilter || globalSearch || statusFilter !== 'all') && (
          <div className="flex items-center justify-between pt-2 text-xs text-slate-500">
            <span>Showing <strong>{filteredItems.length}</strong> found item records</span>
            <button
              onClick={clearFilters}
              className="text-emerald-600 hover:text-emerald-700 font-semibold"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>

      {/* Items Grid */}
      {filteredItems.length === 0 ? (
        <div className="bg-white rounded-3xl border border-slate-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
            <Search className="w-8 h-8" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-800">No matching found items</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              If an item was just turned in to security, please allow campus staff a short time to log the entry.
            </p>
          </div>
          <button
            onClick={clearFilters}
            className="px-4 py-2 text-xs font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition"
          >
            Clear Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(item => (
            <ItemCard
              key={item.id}
              item={item}
              onViewDetails={onViewDetails}
              onClaim={onClaimItem}
            />
          ))}
        </div>
      )}
    </div>
  );
};
