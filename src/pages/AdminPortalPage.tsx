import React, { useState } from 'react';
import {
  ShieldCheck,
  Building2,
  Users,
  Package,
  Clock,
  Check,
  X,
  MessageSquare,
  FileText,
  Tag,
  CheckCircle2,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  LogOut,
  Filter,
} from 'lucide-react';
import { College, Claim, Item, Complaint } from '../types';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

interface AdminPortalPageProps {
  onViewItemDetails: (item: Item) => void;
  onExitPortal?: () => void;
}

export const AdminPortalPage: React.FC<AdminPortalPageProps> = ({
  onViewItemDetails,
  onExitPortal,
}) => {
  const { currentUser, isAdmin, loginAdmin, logout } = useAuth();

  // Admin Login Form State
  const [adminId, setAdminId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');

  // Admin Dashboard State
  const [activeTab, setActiveTab] = useState<
    'pending' | 'colleges' | 'claims' | 'items' | 'students' | 'categories' | 'complaints'
  >('pending');
  const [selectedCollegeId, setSelectedCollegeId] = useState<string>('all');
  const [, setRefreshTick] = useState(0);
  const forceRefresh = () => setRefreshTick((t) => t + 1);

  // Modals & Forms
  const [rejectionModalCollege, setRejectionModalCollege] = useState<College | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [reviewingClaim, setReviewingClaim] = useState<Claim | null>(null);
  const [adminRemarks, setAdminRemarks] = useState('');
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
  const [resolvingComplaint, setResolvingComplaint] = useState<Complaint | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [complaintStatus, setComplaintStatus] = useState<Complaint['status']>('resolved');

  const handleAdminLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    const result = loginAdmin(adminId, password);
    if (!result.success) {
      setLoginError(result.error || 'Invalid Admin ID or Password.');
      return;
    }
    setAdminId('');
    setPassword('');
  };

  // Dedicated Separate Admin Portal Login Gate
  if (!isAdmin) {
    return (
      <div className="min-h-[calc(100vh-14rem)] bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-4 py-12">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden">
          <div className="bg-slate-900 text-white p-6 text-center space-y-2 border-b border-slate-800">
            <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center mx-auto shadow-lg shadow-amber-500/20">
              <ShieldCheck className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-extrabold tracking-tight">CampusFind Admin Portal</h1>
            <p className="text-xs text-slate-400">
              Restricted Control Center — Single Administrator Access Only
            </p>
          </div>

          <form onSubmit={handleAdminLogin} className="p-6 sm:p-8 space-y-4">
            {currentUser && currentUser.role === 'student' && (
              <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-900">
                Currently signed in as student <strong>{currentUser.name}</strong>. Entering administrator credentials will switch to the Admin Portal session.
              </div>
            )}

            {loginError && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Administrator ID
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type="text"
                  required
                  autoComplete="username"
                  value={adminId}
                  onChange={(e) => setAdminId(e.target.value)}
                  placeholder="Enter Admin ID"
                  className="w-full text-xs pl-10 pr-3 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter Admin Password"
                  className="w-full text-xs pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-amber-500"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                  title={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <span>Access Admin Portal</span>
            </button>

            {onExitPortal && (
              <button
                type="button"
                onClick={onExitPortal}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
              >
                ← Return to CampusFind Home
              </button>
            )}
          </form>
        </div>
      </div>
    );
  }

  // Authenticated Admin Data
  const colleges = storage.getColleges();
  const pendingColleges = colleges.filter((c) => c.status === 'pending');
  const stats = storage.getPlatformStats();
  const filterCollegeId = selectedCollegeId === 'all' ? undefined : selectedCollegeId;

  const claims = storage.getClaims(filterCollegeId);
  const pendingClaimsCount = claims.filter((c) => c.status === 'pending').length;
  const items = storage.getItems(filterCollegeId ? { collegeId: filterCollegeId } : undefined);
  const students = storage
    .getUsers()
    .filter((u) => u.role === 'student' && (!filterCollegeId || u.college_id === filterCollegeId));
  const categories = storage.getCategories();
  const complaints = storage.getComplaints(filterCollegeId);

  const handleApproveCollege = (id: string) => {
    storage.updateCollegeStatus(id, 'approved');
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    forceRefresh();
  };

  const handleRejectCollege = (e: React.FormEvent) => {
    e.preventDefault();
    if (rejectionModalCollege) {
      storage.updateCollegeStatus(rejectionModalCollege.id, 'rejected', rejectionReason.trim());
      setRejectionModalCollege(null);
      setRejectionReason('');
      forceRefresh();
    }
  };

  const handleToggleActive = (college: College) => {
    const nextStatus = college.status === 'approved' ? 'inactive' : 'approved';
    storage.updateCollegeStatus(college.id, nextStatus);
    forceRefresh();
  };

  const handleUpdateClaim = (claimId: string, status: Claim['status'], remarks: string) => {
    storage.updateClaimStatus(claimId, status, remarks, currentUser?.id);
    if (status === 'completed' || status === 'approved') {
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
    }
    setReviewingClaim(null);
    setAdminRemarks('');
    forceRefresh();
  };

  const handleDeleteItem = (itemId: string) => {
    storage.deleteItem(itemId);
    setDeleteConfirmId(null);
    forceRefresh();
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
      forceRefresh();
    }
  };

  const handleResolveComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    if (resolvingComplaint) {
      storage.updateComplaintStatus(resolvingComplaint.id, complaintStatus, resolutionNotes.trim());
      setResolvingComplaint(null);
      setResolutionNotes('');
      forceRefresh();
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Admin Portal Header */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-2xl shadow-lg">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                CampusFind Admin Portal
              </h1>
              <span className="bg-amber-400 text-slate-950 text-xs px-2.5 py-0.5 rounded-full font-bold">
                Central Administrator
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Single-access administrative console for college approvals, claims verification, item moderation, and complaints.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-slate-800/80 px-4 py-2 rounded-2xl border border-slate-700 text-xs">
            <div className="text-slate-400">System Recovery Rate</div>
            <div className="text-emerald-400 font-extrabold text-base">
              {stats.recoveryRate}% Returned
            </div>
          </div>
          <button
            onClick={() => {
              logout();
              if (onExitPortal) onExitPortal();
            }}
            className="flex items-center gap-1.5 bg-rose-600 hover:bg-rose-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition shadow"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out Admin</span>
          </button>
        </div>
      </div>

      {/* 6 Platform Analytics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="text-2xl font-bold text-sky-600">{stats.totalColleges}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">Active Campuses</div>
        </div>

        <div className="p-4 rounded-2xl border border-amber-200 shadow-sm text-center bg-amber-50/40">
          <div className="text-2xl font-bold text-amber-600">{pendingColleges.length}</div>
          <div className="text-[11px] font-semibold text-amber-900 mt-1">Pending Approvals</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="text-2xl font-bold text-indigo-600">{stats.totalStudents}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">Registered Students</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="text-2xl font-bold text-rose-600">{stats.lostItems}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">Total Lost Items</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="text-2xl font-bold text-emerald-600">{stats.foundItems}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">Total Found Items</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="text-2xl font-bold text-purple-600">{stats.returnedItems}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">Total Recoveries</div>
        </div>
      </div>

      {/* Tabs + Campus Filter */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-200 pb-3">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'pending'
                ? 'bg-amber-500 text-slate-950 shadow font-extrabold'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Pending Colleges ({pendingColleges.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('colleges')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'colleges'
                ? 'bg-slate-900 text-white shadow'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-4 h-4" />
            <span>All Colleges ({colleges.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('claims')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'claims'
                ? 'bg-slate-900 text-white shadow'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileText className="w-4 h-4" />
            <span>Claims ({pendingClaimsCount} Pending)</span>
          </button>

          <button
            onClick={() => setActiveTab('items')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'items'
                ? 'bg-slate-900 text-white shadow'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Items ({items.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('students')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'students'
                ? 'bg-slate-900 text-white shadow'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Students ({students.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'categories'
                ? 'bg-slate-900 text-white shadow'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Tag className="w-4 h-4" />
            <span>Categories</span>
          </button>

          <button
            onClick={() => setActiveTab('complaints')}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
              activeTab === 'complaints'
                ? 'bg-slate-900 text-white shadow'
                : 'bg-white text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-4 h-4" />
            <span>Complaints ({complaints.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={selectedCollegeId}
            onChange={(e) => setSelectedCollegeId(e.target.value)}
            className="text-xs px-3 py-2 rounded-xl border border-slate-300 bg-white font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">All Participating Colleges</option>
            {colleges.map((c) => (
              <option key={c.id} value={c.id}>
                {c.code} — {c.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tab: Pending Approvals */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">Pending College Registration Requests</h3>
            <p className="text-xs text-slate-500">
              Review university applications. Once approved, students from that institution can register and report items.
            </p>
          </div>

          {pendingColleges.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400 bg-slate-50 rounded-2xl">
              No pending college registrations. All colleges are reviewed!
            </div>
          ) : (
            <div className="space-y-4">
              {pendingColleges.map((c) => (
                <div
                  key={c.id}
                  className="p-5 rounded-2xl bg-amber-50/70 border-2 border-amber-300 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={c.logo_url}
                        alt=""
                        className="w-12 h-12 rounded-xl object-cover border border-amber-200"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-base">{c.name}</h4>
                          <span className="font-mono text-xs bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">
                            {c.code}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          {c.address}, {c.city}, {c.state} • Website:{' '}
                          <a href={c.website} target="_blank" rel="noreferrer" className="text-sky-600 hover:underline">
                            {c.website}
                          </a>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleApproveCollege(c.id)}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Approve College</span>
                      </button>
                      <button
                        onClick={() => setRejectionModalCollege(c)}
                        className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow transition flex items-center gap-1.5"
                      >
                        <X className="w-4 h-4" />
                        <span>Reject</span>
                      </button>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-amber-200 text-xs text-slate-700 grid grid-cols-1 sm:grid-cols-3 gap-2">
                    <div>
                      <strong>Contact Officer:</strong> {c.admin_name || 'Campus Coordinator'}
                    </div>
                    <div>
                      <strong>Email:</strong> {c.admin_email || c.email}
                    </div>
                    <div>
                      <strong>Phone:</strong> {c.phone}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: All Colleges */}
      {activeTab === 'colleges' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">All Registered Colleges Directory</h3>
            <p className="text-xs text-slate-500">
              Manage approval status and activate or deactivate participating institutions
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-xl">College Name</th>
                  <th className="p-3">Code</th>
                  <th className="p-3">City / State</th>
                  <th className="p-3">Contact</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {colleges.map((c) => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                      <img src={c.logo_url} alt="" className="w-7 h-7 rounded-lg object-cover" />
                      <span>{c.name}</span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-700">{c.code}</td>
                    <td className="p-3 text-slate-600">
                      {c.city}, {c.state}
                    </td>
                    <td className="p-3 text-slate-600">{c.admin_name || c.email}</td>
                    <td className="p-3">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800'
                            : c.status === 'pending'
                            ? 'bg-amber-100 text-amber-800'
                            : c.status === 'inactive'
                            ? 'bg-slate-200 text-slate-700'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {c.status}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {c.status === 'approved' ? (
                        <button
                          onClick={() => handleToggleActive(c)}
                          className="px-2.5 py-1 text-rose-600 hover:bg-rose-50 rounded font-semibold"
                        >
                          Deactivate
                        </button>
                      ) : c.status === 'inactive' ? (
                        <button
                          onClick={() => handleToggleActive(c)}
                          className="px-2.5 py-1 text-emerald-600 hover:bg-emerald-50 rounded font-semibold"
                        >
                          Activate
                        </button>
                      ) : c.status === 'pending' ? (
                        <button
                          onClick={() => handleApproveCollege(c.id)}
                          className="px-2.5 py-1 text-emerald-600 hover:bg-emerald-50 rounded font-semibold"
                        >
                          Approve
                        </button>
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Claims & Handovers */}
      {activeTab === 'claims' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">Ownership Claims Register</h3>
            <p className="text-xs text-slate-500">
              Examine proof of ownership, approve or reject claims, and confirm physical handovers
            </p>
          </div>

          {claims.length === 0 ? (
            <div className="text-center py-10 text-xs text-slate-400 bg-slate-50 rounded-2xl">
              No claims found for the selected filter.
            </div>
          ) : (
            <div className="space-y-3">
              {claims.map((claim) => {
                const item = storage.getItemById(claim.item_id);
                const student = storage.getUserById(claim.claimant_user_id);
                const college = storage.getCollegeById(claim.college_id);
                return (
                  <div
                    key={claim.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 text-xs"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-mono text-slate-400">ID: {claim.id}</span>
                          {college && (
                            <span className="text-[10px] font-mono bg-sky-100 text-sky-800 px-2 py-0.5 rounded font-bold">
                              {college.code}
                            </span>
                          )}
                        </div>
                        <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                          {item?.title || 'Item'}
                        </h4>
                        <div className="text-slate-600 mt-0.5">
                          Claimed by: <strong>{student?.name || 'Campus Student'}</strong>
                          {student?.roll_number ? ` (${student.roll_number})` : ''}
                          {student?.email ? ` • ${student.email}` : ''}
                        </div>
                      </div>

                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-bold capitalize ${
                          claim.status === 'completed'
                            ? 'bg-emerald-600 text-white'
                            : claim.status === 'approved'
                            ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                            : claim.status === 'rejected'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800 border border-amber-300'
                        }`}
                      >
                        {claim.status}
                      </span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-slate-200 text-slate-700">
                      <strong>Claim Statement:</strong> {claim.claim_reason}
                      {claim.proof_text && (
                        <div className="mt-1 text-slate-500">
                          <strong>Proof note:</strong> {claim.proof_text}
                        </div>
                      )}
                    </div>

                    {claim.admin_remarks && (
                      <div className="text-slate-600 bg-sky-50 p-2 rounded-lg border border-sky-100">
                        <strong>Admin note:</strong> {claim.admin_remarks}
                      </div>
                    )}

                    <div className="pt-2 flex flex-wrap gap-2 justify-end border-t border-slate-200">
                      {claim.status === 'pending' && (
                        <>
                          <button
                            onClick={() => {
                              setReviewingClaim(claim);
                              setAdminRemarks('');
                            }}
                            className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-lg transition"
                          >
                            Review with Note
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateClaim(
                                claim.id,
                                'approved',
                                'Verified by admin. Student notified to collect.'
                              )
                            }
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-lg transition"
                          >
                            Approve Claim
                          </button>
                          <button
                            onClick={() =>
                              handleUpdateClaim(
                                claim.id,
                                'rejected',
                                'Proof did not match item features.'
                              )
                            }
                            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg transition"
                          >
                            Reject
                          </button>
                        </>
                      )}

                      {claim.status === 'approved' && (
                        <button
                          onClick={() =>
                            handleUpdateClaim(
                              claim.id,
                              'completed',
                              'Item handed over in-person to verified student.'
                            )
                          }
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
          )}
        </div>
      )}

      {/* Tab: Items Moderation */}
      {activeTab === 'items' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">Campus Items Moderation</h3>
              <p className="text-xs text-slate-500">
                Inspect reported items or remove fake/inappropriate entries
              </p>
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
                  <th className="p-3">Campus</th>
                  <th className="p-3">Type</th>
                  <th className="p-3">Location</th>
                  <th className="p-3">Date</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {items.map((item) => {
                  const col = storage.getCollegeById(item.college_id);
                  return (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="p-3 flex items-center gap-2">
                        <img
                          src={item.image_url}
                          alt=""
                          className="w-8 h-8 rounded-lg object-cover shrink-0"
                        />
                        <div>
                          <span className="font-bold text-slate-900 block">{item.title}</span>
                          <span className="text-[10px] text-slate-400">ID: {item.id}</span>
                        </div>
                      </td>
                      <td className="p-3 font-mono font-bold text-slate-700">{col?.code || 'N/A'}</td>
                      <td className="p-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            item.type === 'lost'
                              ? 'bg-rose-100 text-rose-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {item.type}
                        </span>
                      </td>
                      <td className="p-3 text-slate-600">{item.location_name}</td>
                      <td className="p-3 text-slate-600">{item.date_occurred}</td>
                      <td className="p-3">
                        <span className="capitalize font-semibold text-slate-700">{item.status}</span>
                      </td>
                      <td className="p-3 text-right space-x-1 whitespace-nowrap">
                        <button
                          onClick={() => onViewItemDetails(item)}
                          className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded font-semibold"
                        >
                          Inspect
                        </button>
                        {deleteConfirmId === item.id ? (
                          <span className="inline-flex items-center gap-1">
                            <button
                              onClick={() => handleDeleteItem(item.id)}
                              className="px-2 py-1 bg-rose-600 text-white rounded font-bold"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setDeleteConfirmId(null)}
                              className="px-2 py-1 bg-slate-200 text-slate-700 rounded font-semibold"
                            >
                              Cancel
                            </button>
                          </span>
                        ) : (
                          <button
                            onClick={() => setDeleteConfirmId(item.id)}
                            className="px-2 py-1 bg-rose-50 hover:bg-rose-100 text-rose-600 rounded font-semibold"
                          >
                            Delete
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: Registered Students */}
      {activeTab === 'students' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">Registered Students Directory</h3>
            <p className="text-xs text-slate-500">
              Students who have created accounts across participating colleges
            </p>
          </div>

          {students.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400 bg-slate-50 rounded-2xl">
              No students have registered yet. New student registrations will appear here.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                  <tr>
                    <th className="p-3 rounded-l-xl">Student Name</th>
                    <th className="p-3">Campus</th>
                    <th className="p-3">Roll Number</th>
                    <th className="p-3">Department</th>
                    <th className="p-3">Academic Year</th>
                    <th className="p-3">Email</th>
                    <th className="p-3 rounded-r-xl">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {students.map((st) => {
                    const col = st.college_id ? storage.getCollegeById(st.college_id) : null;
                    return (
                      <tr key={st.id} className="hover:bg-slate-50 transition">
                        <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                          <img
                            src={
                              st.avatar_url ||
                              'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60'
                            }
                            alt=""
                            className="w-6 h-6 rounded-full"
                          />
                          <span>{st.name}</span>
                        </td>
                        <td className="p-3 font-mono font-semibold text-sky-700">{col?.code || 'N/A'}</td>
                        <td className="p-3 font-mono font-semibold text-slate-700">
                          {st.roll_number || 'N/A'}
                        </td>
                        <td className="p-3 text-slate-600">{st.department}</td>
                        <td className="p-3 text-slate-600">{st.academic_year}</td>
                        <td className="p-3 text-slate-600">{st.email}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 capitalize">
                            {st.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Tab: Categories */}
      {activeTab === 'categories' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
            <h3 className="font-bold text-base text-slate-900">Active Item Categories</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {categories.map((cat) => (
                <div key={cat.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs">
                  <div className="font-bold text-slate-900">{cat.name}</div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{cat.description}</div>
                </div>
              ))}
            </div>
          </div>

          <form
            onSubmit={handleAddCategory}
            className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-3 h-fit"
          >
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
            <h3 className="font-bold text-base text-slate-900">Platform Complaints & Audit Trail</h3>
            <p className="text-xs text-slate-500">
              Inter-college complaints, security desk disputes, and resolution tracking
            </p>
          </div>

          <div className="space-y-3">
            {complaints.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">No complaints reported.</div>
            ) : (
              complaints.map((c) => {
                const college = storage.getCollegeById(c.college_id);
                const user = storage.getUserById(c.user_id);
                return (
                  <div
                    key={c.id}
                    className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="font-mono text-slate-400 text-[10px]">
                          Campus: {college?.code || 'N/A'}
                        </span>
                        <h4 className="font-bold text-slate-900 text-sm">{c.subject}</h4>
                        <p className="text-slate-500">
                          Reported by: {user?.name || 'Campus Student'}
                          {user?.email ? ` (${user.email})` : ''}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                            c.status === 'resolved'
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {c.status}
                        </span>
                        <button
                          onClick={() => {
                            setResolvingComplaint(c);
                            setComplaintStatus(c.status);
                            setResolutionNotes(c.resolution_notes || '');
                          }}
                          className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-white rounded-lg font-semibold"
                        >
                          Update
                        </button>
                      </div>
                    </div>
                    <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200">
                      {c.description}
                    </p>
                    {c.resolution_notes && (
                      <div className="p-2 bg-emerald-50 text-emerald-900 rounded-lg border border-emerald-100">
                        <strong>Resolution Note:</strong> {c.resolution_notes}
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* College Rejection Modal */}
      {rejectionModalCollege && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <form
            onSubmit={handleRejectCollege}
            className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl"
          >
            <h3 className="font-bold text-base text-slate-900">Reject College Registration</h3>
            <p className="text-xs text-slate-600">
              State the reason for rejecting <strong>{rejectionModalCollege.name}</strong>.
            </p>
            <textarea
              required
              rows={3}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Could not verify college domain or security officer credentials..."
              className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
            />
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setRejectionModalCollege(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl"
              >
                Confirm Rejection
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Claim Review Modal */}
      {reviewingClaim && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-slate-900">Review Ownership Claim</h3>
            <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700">
              <strong>Statement:</strong> {reviewingClaim.claim_reason}
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Administrator Remarks
              </label>
              <textarea
                rows={3}
                value={adminRemarks}
                onChange={(e) => setAdminRemarks(e.target.value)}
                placeholder="Add verification remarks for the student..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setReviewingClaim(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() =>
                  handleUpdateClaim(
                    reviewingClaim.id,
                    'rejected',
                    adminRemarks.trim() || 'Proof did not match item features.'
                  )
                }
                className="px-4 py-2 text-xs font-bold text-white bg-rose-600 hover:bg-rose-500 rounded-xl"
              >
                Reject
              </button>
              <button
                type="button"
                onClick={() =>
                  handleUpdateClaim(
                    reviewingClaim.id,
                    'approved',
                    adminRemarks.trim() || 'Verified by admin. Student notified to collect.'
                  )
                }
                className="px-4 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-500 rounded-xl"
              >
                Approve Claim
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Complaint Update Modal */}
      {resolvingComplaint && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <form
            onSubmit={handleResolveComplaint}
            className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl"
          >
            <h3 className="font-bold text-base text-slate-900">Update Complaint Status</h3>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Status</label>
              <select
                value={complaintStatus}
                onChange={(e) => setComplaintStatus(e.target.value as Complaint['status'])}
                className="w-full text-xs p-2.5 rounded-xl border border-slate-300 bg-white"
              >
                <option value="pending">Pending</option>
                <option value="investigating">Investigating</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Resolution Notes
              </label>
              <textarea
                rows={3}
                value={resolutionNotes}
                onChange={(e) => setResolutionNotes(e.target.value)}
                placeholder="Enter action taken..."
                className="w-full text-xs p-3 rounded-xl border border-slate-300 focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>
            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setResolvingComplaint(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl"
              >
                Save Update
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
