import React, { useState } from 'react';
import { 
  LayoutDashboard, 
  Package, 
  CheckCircle, 
  FileText, 
  Bell, 
  User as UserIcon, 
  Settings, 
  PlusCircle, 
  Sparkles, 
  Building2, 
  Calendar, 
  MapPin, 
  Clock, 
  AlertCircle,
  ExternalLink,
  Trash2,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import { Item, Claim, Notification } from '../types';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import { ItemCard } from '../components/ItemCard';

interface StudentDashboardProps {
  onOpenReportModal: (type: 'lost' | 'found') => void;
  onViewItemDetails: (item: Item) => void;
  onSmartMatchClick: (lost: Item, found: Item) => void;
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  onOpenReportModal,
  onViewItemDetails,
  onSmartMatchClick,
}) => {
  const { currentUser, currentCollege, logout } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'lost' | 'found' | 'claims' | 'notifications' | 'profile'>('overview');

  if (!currentUser) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <UserIcon className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="font-bold text-slate-800 text-lg">Student Login Required</h3>
        <p className="text-xs text-slate-500">Please sign in to view your personalized campus dashboard.</p>
      </div>
    );
  }

  // User's specific items
  const myItems = storage.getItems().filter(i => i.user_id === currentUser.id);
  const myLostItems = myItems.filter(i => i.type === 'lost');
  const myFoundItems = myItems.filter(i => i.type === 'found');
  const myReturnedItems = myItems.filter(i => i.status === 'returned');
  
  // User's claims
  const myClaims = storage.getClaimsByUser(currentUser.id);
  const pendingClaims = myClaims.filter(c => c.status === 'pending');

  // Notifications
  const notifications = storage.getNotifications(currentUser.id);

  // Smart matches for student's active lost items
  const smartMatches = currentUser.college_id 
    ? storage.getSmartMatchesForCollege(currentUser.college_id).filter(m => m.lostItem.user_id === currentUser.id) 
    : [];

  const handleDeleteItem = (itemId: string) => {
    if (confirm('Are you sure you want to remove this item report?')) {
      storage.deleteItem(itemId);
      window.location.reload();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Top Welcome Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
        <div className="flex items-center gap-4">
          <img
            src={currentUser.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=120'}
            alt={currentUser.name}
            className="w-16 h-16 rounded-2xl object-cover border-2 border-sky-400 shadow-md"
          />
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                Welcome back, {currentUser.name}!
              </h1>
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500/20 text-sky-300 border border-sky-500/30">
                Student
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5 text-sky-400" />
              <span>{currentCollege?.name || 'Campus Student'}</span>
              <span>•</span>
              <span className="font-mono">{currentUser.roll_number || 'Roll Verified'}</span>
              <span>•</span>
              <span>{currentUser.department || 'Engineering'}</span>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onOpenReportModal('lost')}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow"
          >
            <PlusCircle className="w-4 h-4" />
            Report Lost
          </button>
          <button
            onClick={() => onOpenReportModal('found')}
            className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition shadow"
          >
            <PlusCircle className="w-4 h-4" />
            Report Found
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Left Sidebar Menu */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/80 shadow-sm p-3 space-y-1">
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition ${
                activeTab === 'overview' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard Overview</span>
            </button>

            <button
              onClick={() => setActiveTab('lost')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                activeTab === 'lost' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Package className="w-4 h-4 text-rose-500" />
                <span>My Lost Items</span>
              </div>
              <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-md font-mono text-slate-700">
                {myLostItems.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('found')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                activeTab === 'found' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <CheckCircle className="w-4 h-4 text-emerald-500" />
                <span>My Found Reports</span>
              </div>
              <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded-md font-mono text-slate-700">
                {myFoundItems.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('claims')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                activeTab === 'claims' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <FileText className="w-4 h-4 text-amber-500" />
                <span>My Claims</span>
              </div>
              {pendingClaims.length > 0 && (
                <span className="text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded-md font-bold">
                  {pendingClaims.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('notifications')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-between transition ${
                activeTab === 'notifications' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-center gap-2.5">
                <Bell className="w-4 h-4 text-indigo-500" />
                <span>Notifications</span>
              </div>
              {notifications.filter(n => !n.is_read).length > 0 && (
                <span className="text-[10px] bg-rose-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                  {notifications.filter(n => !n.is_read).length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('profile')}
              className={`w-full text-left px-3 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition ${
                activeTab === 'profile' ? 'bg-sky-600 text-white shadow-sm' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <UserIcon className="w-4 h-4 text-slate-500" />
              <span>My Profile</span>
            </button>
          </div>

          {/* Smart match alert card if detected */}
          {smartMatches.length > 0 && (
            <div className="bg-amber-50 border border-amber-300 rounded-2xl p-4 text-amber-950 space-y-2">
              <div className="flex items-center gap-1.5 text-xs font-bold">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>Smart Match Alert!</span>
              </div>
              <p className="text-[11px] leading-relaxed">
                A newly found item on campus matches your lost report "{smartMatches[0].lostItem.title}".
              </p>
              <button
                onClick={() => onSmartMatchClick(smartMatches[0].lostItem, smartMatches[0].foundItem)}
                className="w-full py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-bold rounded-lg shadow-sm transition"
              >
                Inspect Match ({smartMatches[0].matchScore}%)
              </button>
            </div>
          )}
        </div>

        {/* Right Content Area */}
        <div className="lg:col-span-3 space-y-6">
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Four Key Student Stats */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center">
                  <div className="text-2xl font-bold text-rose-600">{myLostItems.length}</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">My Lost Reports</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center">
                  <div className="text-2xl font-bold text-emerald-600">{myFoundItems.length}</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">Found Items Logged</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center">
                  <div className="text-2xl font-bold text-amber-600">{pendingClaims.length}</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">Pending Claims</div>
                </div>

                <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-sm text-center">
                  <div className="text-2xl font-bold text-sky-600">{myReturnedItems.length}</div>
                  <div className="text-xs text-slate-500 font-medium mt-1">Recovered Items</div>
                </div>
              </div>

              {/* Recent Active Reports */}
              <div className="bg-white rounded-3xl border border-slate-200/80 p-6 shadow-sm space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-base text-slate-900">Your Active Campus Reports</h3>
                  <button
                    onClick={() => onOpenReportModal('lost')}
                    className="text-xs font-semibold text-sky-600 hover:text-sky-700"
                  >
                    + Report Another Item
                  </button>
                </div>

                {myItems.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400">
                    You have not submitted any lost or found reports yet.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {myItems.map(item => (
                      <div
                        key={item.id}
                        className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 hover:bg-slate-100/70 transition"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                item.type === 'lost' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {item.type}
                              </span>
                              <span className="font-bold text-xs text-slate-900">{item.title}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                              <span>{item.location_name}</span>
                              <span>•</span>
                              <span>{new Date(item.date_occurred).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${
                            item.status === 'returned' ? 'bg-emerald-100 text-emerald-800' :
                            item.status === 'claimed' ? 'bg-amber-100 text-amber-800' :
                            'bg-slate-200 text-slate-700'
                          }`}>
                            {item.status}
                          </span>
                          <button
                            onClick={() => onViewItemDetails(item)}
                            className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 text-xs font-semibold rounded-lg transition"
                          >
                            Details
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'lost' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">My Lost Belongings</h3>
                  <p className="text-xs text-slate-500">Items you reported as lost on campus</p>
                </div>
                <button
                  onClick={() => onOpenReportModal('lost')}
                  className="px-3.5 py-2 bg-rose-600 text-white rounded-xl text-xs font-bold"
                >
                  + Report Lost
                </button>
              </div>

              {myLostItems.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  You haven't filed any lost reports.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {myLostItems.map(item => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      onViewDetails={onViewItemDetails}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'found' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Items I Found & Logged</h3>
                  <p className="text-xs text-slate-500">Belongings you turned in to help your campus peers</p>
                </div>
                <button
                  onClick={() => onOpenReportModal('found')}
                  className="px-3.5 py-2 bg-emerald-600 text-white rounded-xl text-xs font-bold"
                >
                  + Report Found
                </button>
              </div>

              {myFoundItems.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  You haven't filed any found reports yet.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {myFoundItems.map(item => (
                    <ItemCard
                      key={item.id}
                      item={item}
                      onViewDetails={onViewItemDetails}
                    />
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'claims' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div>
                <h3 className="font-bold text-base text-slate-900">My Ownership Claims</h3>
                <p className="text-xs text-slate-500">Track verification and recovery decisions by your college admin</p>
              </div>

              {myClaims.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  You haven't submitted any ownership claims yet.
                </div>
              ) : (
                <div className="space-y-4">
                  {myClaims.map(claim => {
                    const item = storage.getItemById(claim.item_id);
                    return (
                      <div
                        key={claim.id}
                        className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="text-[11px] font-bold text-sky-600 uppercase">Claim ID: {claim.id}</span>
                            <h4 className="font-bold text-slate-900 text-sm mt-0.5">{item?.title || 'Claimed Item'}</h4>
                            <p className="text-xs text-slate-500">{new Date(claim.created_at).toLocaleDateString()}</p>
                          </div>

                          <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize ${
                            claim.status === 'completed' ? 'bg-emerald-600 text-white' :
                            claim.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                            claim.status === 'rejected' ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                            'bg-amber-100 text-amber-800 border border-amber-300'
                          }`}>
                            {claim.status}
                          </span>
                        </div>

                        <div className="bg-white p-3 rounded-xl border border-slate-200 text-xs text-slate-700">
                          <strong>Your explanation:</strong> {claim.claim_reason}
                          {claim.proof_text && <div className="mt-1 text-slate-500"><strong>Proof details:</strong> {claim.proof_text}</div>}
                        </div>

                        {claim.admin_remarks && (
                          <div className="bg-sky-50 border border-sky-100 p-3 rounded-xl text-xs text-sky-900">
                            <strong>College Admin Note:</strong> {claim.admin_remarks}
                          </div>
                        )}

                        {claim.status === 'approved' && (
                          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-800 font-medium">
                            ✅ <strong>Ready for Collection!</strong> Please visit the designated security desk or student welfare office with your College ID card to pick up your belonging.
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-base text-slate-900">Notifications</h3>
                  <p className="text-xs text-slate-500">Real-time alerts, match detections, and claim updates</p>
                </div>
                <button
                  onClick={() => storage.markAllNotificationsAsRead(currentUser.id)}
                  className="text-xs font-semibold text-sky-600 hover:underline"
                >
                  Mark all as read
                </button>
              </div>

              {notifications.length === 0 ? (
                <div className="text-center py-12 text-xs text-slate-400">
                  No notifications yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {notifications.map(n => (
                    <div
                      key={n.id}
                      onClick={() => storage.markNotificationAsRead(n.id)}
                      className={`p-4 rounded-2xl border text-xs transition cursor-pointer ${
                        !n.is_read ? 'bg-sky-50 border-sky-200' : 'bg-slate-50 border-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between font-bold text-slate-900">
                        <span className="flex items-center gap-1.5">
                          {n.type === 'match' && <Sparkles className="w-3.5 h-3.5 text-amber-500" />}
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400 font-normal">
                          {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                      <p className="text-slate-600 mt-1 leading-relaxed">{n.message}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-6">
              <div>
                <h3 className="font-bold text-base text-slate-900">Student Profile Information</h3>
                <p className="text-xs text-slate-500">Authorized credentials tied to your college registration</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-400 font-semibold block">Full Name</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">{currentUser.name}</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-400 font-semibold block">College Email</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">{currentUser.email}</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-400 font-semibold block">Registered University</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">{currentCollege?.name || 'N/A'}</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-400 font-semibold block">Roll Number</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block font-mono">{currentUser.roll_number || 'N/A'}</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-400 font-semibold block">Department</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">{currentUser.department || 'Computer Engineering'}</span>
                </div>

                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200">
                  <span className="text-[11px] text-slate-400 font-semibold block">Academic Year</span>
                  <span className="font-bold text-slate-900 text-sm mt-0.5 block">{currentUser.academic_year || 'Third Year (TE)'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
