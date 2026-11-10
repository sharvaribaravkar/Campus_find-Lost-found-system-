import React, { useState } from 'react';
import { 
  Building2, 
  Users, 
  Package, 
  CheckCircle, 
  FileText, 
  Tag, 
  MessageSquare, 
  ShieldCheck, 
  PlusCircle, 
  Check, 
  X, 
  Trash2, 
  Eye, 
  AlertCircle,
  HelpCircle,
  Search,
  CheckCircle2
} from 'lucide-react';
import { Item, Claim, User, Category, Complaint } from '../types';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

interface CollegeAdminDashboardProps {
  onViewItemDetails: (item: Item) => void;
}

export const CollegeAdminDashboard: React.FC<CollegeAdminDashboardProps> = ({
  onViewItemDetails,
}) => {
  const { currentUser, currentCollege } = useAuth();
  const [activeTab, setActiveTab] = useState<'overview' | 'claims' | 'items' | 'students' | 'categories' | 'complaints'>('overview');

  // Claim review modal state
  const [reviewingClaim, setReviewingClaim] = useState<Claim | null>(null);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  if (!currentUser || currentUser.role !== 'college_admin' || !currentUser.college_id) {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <Building2 className="w-12 h-12 text-slate-400 mx-auto" />
        <h3 className="font-bold text-slate-800 text-lg">College Admin Access Restricted</h3>
        <p className="text-xs text-slate-500">
          This portal is reserved for authorized College Administrators. Use the Role Switcher at the top to switch to Dr. Suresh Kulkarni (DY Patil Admin) or Prof. Anjali Deshmukh (PCCOE Admin).
        </p>
      </div>
    );
  }

  const collegeId = currentUser.college_id;
  const collegeStats = storage.getCollegeStats(collegeId);

  // College-isolated records (Backend enforcement)
  const students = storage.getUsersByCollege(collegeId);
  const items = storage.getItems({ collegeId });
  const claims = storage.getClaims(collegeId);
  const categories = storage.getCategories();
  const complaints = storage.getComplaints(collegeId);

  const pendingClaims = claims.filter(c => c.status === 'pending');

  const handleUpdateClaim = (claimId: string, status: Claim['status'], remarks: string) => {
    storage.updateClaimStatus(claimId, status, remarks, currentUser.id);
    if (status === 'completed' || status === 'approved') {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }
    setReviewingClaim(null);
    setAdminRemarks('');
  };

  const handleDeleteItem = (itemId: string) => {
    if (confirm('Delete this report as fake/inappropriate?')) {
      storage.deleteItem(itemId);
      window.location.reload();
    }
  };

  const handleAddCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (newCatName.trim()) {
      storage.addCategory({
        name: newCatName.trim(),
        icon: 'Package',
        description: newCatDesc.trim() || 'General campus items',
      });
      setNewCatName('');
      setNewCatDesc('');
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* College Admin Header */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-emerald-600 flex items-center justify-center font-bold text-xl text-white shadow-md">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                {currentCollege?.name || 'College Administration'}
              </h1>
              <span className="bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-xs px-2.5 py-0.5 rounded-full font-bold">
                College Admin Portal
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Administrator: <strong>{currentUser.name}</strong> • Campus Code: <span className="font-mono text-sky-400">{currentCollege?.code}</span> • {currentCollege?.city}, {currentCollege?.state}
            </p>
          </div>
        </div>

        <div className="bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700 text-xs text-right">
          <div className="text-slate-400">Database College Scope:</div>
          <div className="font-mono text-sky-400 font-bold">{collegeId} (Strictly Isolated)</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'overview' ? 'bg-sky-600 text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>Overview & Stats</span>
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'claims' ? 'bg-sky-600 text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Manage Claims ({pendingClaims.length} Pending)</span>
        </button>

        <button
          onClick={() => setActiveTab('items')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'items' ? 'bg-sky-600 text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Items Moderation ({items.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'students' ? 'bg-sky-600 text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Registered Students ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('categories')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'categories' ? 'bg-sky-600 text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Tag className="w-4 h-4" />
          <span>Categories</span>
        </button>

        <button
          onClick={() => setActiveTab('complaints')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'complaints' ? 'bg-sky-600 text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Complaints ({complaints.length})</span>
        </button>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm text-center">
              <div className="text-2xl font-bold text-indigo-600">{collegeStats.totalStudents}</div>
              <div className="text-xs text-slate-500 font-semibold mt-1">Enrolled Students</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm text-center">
              <div className="text-2xl font-bold text-rose-600">{collegeStats.lostItems}</div>
              <div className="text-xs text-slate-500 font-semibold mt-1">Lost Reports</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm text-center">
              <div className="text-2xl font-bold text-emerald-600">{collegeStats.foundItems}</div>
              <div className="text-xs text-slate-500 font-semibold mt-1">Found Belongings</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm text-center">
              <div className="text-2xl font-bold text-amber-600">{collegeStats.pendingClaims}</div>
              <div className="text-xs text-slate-500 font-semibold mt-1">Pending Claims</div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm text-center col-span-2 lg:col-span-1">
              <div className="text-2xl font-bold text-sky-600">{collegeStats.returnedItems}</div>
              <div className="text-xs text-slate-500 font-semibold mt-1">Returned to Owners</div>
            </div>
          </div>

          {/* Pending Claims Review Box */}
          <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-base text-slate-900">Urgent: Ownership Claims Awaiting Review</h3>
                <p className="text-xs text-slate-500">Students waiting for verification to collect deposited belongings</p>
              </div>
              <button
                onClick={() => setActiveTab('claims')}
                className="text-xs font-bold text-sky-600 hover:underline"
              >
                View All Claims →
              </button>
            </div>

            {pendingClaims.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400 bg-slate-50 rounded-2xl">
                All claims reviewed! No pending claims right now.
              </div>
            ) : (
              <div className="space-y-3">
                {pendingClaims.map(claim => {
                  const item = storage.getItemById(claim.item_id);
                  const student = storage.getUserById(claim.claimant_user_id);
                  return (
                    <div
                      key={claim.id}
                      className="p-4 rounded-2xl bg-amber-50/60 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-amber-900">Claim on: {item?.title}</span>
                          <span className="text-[10px] bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold uppercase">Pending</span>
                        </div>
                        <p className="text-xs text-slate-600 mt-1">
                          <strong>Claimant:</strong> {student?.name} ({student?.roll_number} • {student?.department})
                        </p>
                        <p className="text-xs text-slate-700 mt-1 bg-white p-2 rounded-lg border border-amber-200">
                          "{claim.claim_reason}"
                        </p>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => { setReviewingClaim(claim); setAdminRemarks(''); }}
                          className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition shadow"
                        >
                          Review & Decide
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Manage Claims */}
      {activeTab === 'claims' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">College Claims Register</h3>
            <p className="text-xs text-slate-500">Examine proof of ownership, approve or reject claims, and log physical handovers</p>
          </div>

          <div className="space-y-3">
            {claims.map(claim => {
              const item = storage.getItemById(claim.item_id);
              const student = storage.getUserById(claim.claimant_user_id);
              return (
                <div key={claim.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-mono text-slate-400">ID: {claim.id}</span>
                      <h4 className="font-bold text-slate-900 text-sm">{item?.title || 'Item'}</h4>
                      <div className="text-slate-600 mt-0.5">
                        Claimed by: <strong>{student?.name}</strong> ({student?.roll_number}) • {student?.email}
                      </div>
                    </div>

                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                      claim.status === 'completed' ? 'bg-emerald-600 text-white' :
                      claim.status === 'approved' ? 'bg-emerald-100 text-emerald-800 border border-emerald-300' :
                      claim.status === 'rejected' ? 'bg-rose-100 text-rose-800' :
                      'bg-amber-100 text-amber-800 border border-amber-300'
                    }`}>
                      {claim.status}
                    </span>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200 text-slate-700">
                    <strong>Claim Statement:</strong> {claim.claim_reason}
                    {claim.proof_text && <div className="mt-1 text-slate-500"><strong>Proof note:</strong> {claim.proof_text}</div>}
                  </div>

                  {claim.admin_remarks && (
                    <div className="text-slate-600 bg-sky-50 p-2 rounded-lg border border-sky-100">
                      <strong>Admin note:</strong> {claim.admin_remarks}
                    </div>
                  )}

                  {/* Admin Actions */}
                  <div className="pt-2 flex flex-wrap gap-2 justify-end border-t border-slate-200">
                    {claim.status === 'pending' && (
                      <>
                        <button
                          onClick={() => handleUpdateClaim(claim.id, 'approved', 'Verified by admin. Student notified to collect.')}
                          className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition"
                        >
                          Approve Claim
                        </button>
                        <button
                          onClick={() => handleUpdateClaim(claim.id, 'rejected', 'Proof did not match item features.')}
                          className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition"
                        >
                          Reject
                        </button>
                      </>
                    )}

                    {claim.status === 'approved' && (
                      <button
                        onClick={() => handleUpdateClaim(claim.id, 'completed', 'Item handed over in-person to verified student.')}
                        className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-600 text-white font-bold rounded-lg transition flex items-center gap-1.5 shadow"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm In-Person Handover (Mark Returned)</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Items Moderation */}
      {activeTab === 'items' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Campus Items Moderation</h3>
              <p className="text-xs text-slate-500">Review all lost and found reports filed at {currentCollege?.name}</p>
            </div>
            <span className="text-xs bg-slate-100 text-slate-600 px-3 py-1 rounded-xl font-mono">
              Total: {items.length}
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-xl">Item</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map(item => (
                  <tr key={item.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 flex items-center gap-2">
                      <img src={item.image_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                      <div>
                        <span className="font-bold text-slate-900 block">{item.title}</span>
                        <span className="text-[10px] text-slate-400">ID: {item.id}</span>
                      </div>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.type === 'lost' ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                      }`}>
                        {item.type}
                      </span>
                    </td>
                    <td className="p-3 text-slate-600">{item.location_name}</td>
                    <td className="p-3 text-slate-600">{item.date_occurred}</td>
                    <td className="p-3">
                      <span className="capitalize font-semibold text-slate-700">{item.status}</span>
                    </td>
                    <td className="p-3 text-right space-x-1">
                      <button
                        onClick={() => onViewItemDetails(item)}
                        className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold"
                      >
                        Inspect
                      </button>
                      <button
                        onClick={() => handleDeleteItem(item.id)}
                        className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded font-semibold"
                        title="Remove fake or inappropriate"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Registered Students */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">Enrolled Students Roster</h3>
            <p className="text-xs text-slate-500">Students registered under {currentCollege?.name}</p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-xl">Student Name</th>
                  <th className="p-3">Roll Number</th>
                  <th className="p-3">Department</th>
                  <th className="p-3">Academic Year</th>
                  <th className="p-3">Email</th>
                  <th className="p-3 rounded-r-xl">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map(st => (
                  <tr key={st.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                      <img src={st.avatar_url || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60'} alt="" className="w-6 h-6 rounded-full" />
                      <span>{st.name}</span>
                    </td>
                    <td className="p-3 font-mono font-semibold text-slate-700">{st.roll_number || 'N/A'}</td>
                    <td className="p-3 text-slate-600">{st.department}</td>
                    <td className="p-3 text-slate-600">{st.academic_year}</td>
                    <td className="p-3 text-slate-600">{st.email}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 capitalize">
                        {st.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Categories */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900">Active Item Categories</h3>
            <div className="grid grid-cols-2 gap-3">
              {categories.map(cat => (
                <div key={cat.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="font-bold text-slate-900">{cat.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{cat.description}</div>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleAddCategory} className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3">
            <h3 className="font-bold text-sm text-slate-900">Add New Category</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category Name</label>
              <input
                type="text"
                required
                value={newCatName}
                onChange={(e) => setNewCatName(e.target.value)}
                placeholder="e.g. Laboratory Equipment"
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Description</label>
              <textarea
                rows={2}
                value={newCatDesc}
                onChange={(e) => setNewCatDesc(e.target.value)}
                placeholder="Short description..."
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <button
              type="submit"
              className="w-full py-2 bg-sky-600 hover:bg-sky-500 text-white text-xs font-bold rounded-xl transition"
            >
              Add Category
            </button>
          </form>
        </div>
      )}

      {/* Tab: Complaints */}
      {activeTab === 'complaints' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">Campus Complaints & Inquiries</h3>
            <p className="text-xs text-slate-500">Student reports regarding security desks or lost item disputes</p>
          </div>

          <div className="space-y-3">
            {complaints.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">No complaints reported.</div>
            ) : (
              complaints.map(c => (
                <div key={c.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm">{c.subject}</h4>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                      {c.status}
                    </span>
                  </div>
                  <p className="text-slate-600">{c.description}</p>
                  {c.resolution_notes && (
                    <div className="p-2 bg-emerald-50 text-emerald-900 rounded-lg">
                      <strong>Resolution:</strong> {c.resolution_notes}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};
