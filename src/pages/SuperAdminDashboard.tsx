import React, { useState } from 'react';
import { 
  ShieldCheck, 
  Building2, 
  Users, 
  Package, 
  CheckCircle, 
  XCircle, 
  Sparkles, 
  Clock, 
  Check, 
  X, 
  AlertTriangle, 
  ExternalLink,
  MessageSquare,
  BarChart3
} from 'lucide-react';
import { College, User, Complaint } from '../types';
import { storage } from '../services/storage';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';

export const SuperAdminDashboard: React.FC = () => {
  const { currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState<'colleges' | 'pending' | 'admins' | 'complaints'>('pending');
  const [rejectionModalCollege, setRejectionModalCollege] = useState<College | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  if (!currentUser || currentUser.role !== 'super_admin') {
    return (
      <div className="max-w-md mx-auto my-16 p-8 bg-white rounded-3xl border border-slate-200 text-center space-y-4">
        <ShieldCheck className="w-12 h-12 text-amber-500 mx-auto" />
        <h3 className="font-bold text-slate-800 text-lg">Super Admin Access Only</h3>
        <p className="text-xs text-slate-500">
          This portal oversees all university campuses. Switch to Vikramaditya Roy (Super Admin) using the top role switcher.
        </p>
      </div>
    );
  }

  const colleges = storage.getColleges();
  const pendingColleges = colleges.filter(c => c.status === 'pending');
  const approvedColleges = colleges.filter(c => c.status === 'approved');
  const stats = storage.getPlatformStats();
  const allUsers = storage.getUsers();
  const collegeAdmins = allUsers.filter(u => u.role === 'college_admin');
  const allComplaints = storage.getComplaints();

  const handleApproveCollege = (id: string) => {
    storage.updateCollegeStatus(id, 'approved');
    confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
    window.location.reload();
  };

  const handleRejectCollege = (e: React.FormEvent) => {
    e.preventDefault();
    if (rejectionModalCollege) {
      storage.updateCollegeStatus(rejectionModalCollege.id, 'rejected', rejectionReason.trim());
      setRejectionModalCollege(null);
      setRejectionReason('');
      window.location.reload();
    }
  };

  const handleToggleActive = (college: College) => {
    const nextStatus = college.status === 'approved' ? 'inactive' : 'approved';
    storage.updateCollegeStatus(college.id, nextStatus);
    window.location.reload();
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Super Admin Top Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-slate-900 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-amber-500/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-bold text-2xl shadow-lg">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-extrabold text-white">
                Super Administrator Central Console
              </h1>
              <span className="bg-amber-400 text-slate-950 text-xs px-2.5 py-0.5 rounded-full font-bold">
                Platform Master
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1">
              Central authority for all colleges, campus administrators, authorization rules, and recovery compliance.
            </p>
          </div>
        </div>

        <div className="bg-slate-800/80 px-4 py-2.5 rounded-2xl border border-slate-700 text-xs">
          <div className="text-slate-400">Recovery Rate Across System:</div>
          <div className="text-emerald-400 font-extrabold text-lg">{stats.recoveryRate}% Successful Handover</div>
        </div>
      </div>

      {/* 6 Platform Analytics Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="text-2xl font-bold text-sky-600">{stats.totalColleges}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">Active Campuses</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-amber-200 shadow-sm text-center bg-amber-50/40">
          <div className="text-2xl font-bold text-amber-600">{pendingColleges.length}</div>
          <div className="text-[11px] font-semibold text-amber-900 mt-1">Pending Approvals</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center">
          <div className="text-2xl font-bold text-indigo-600">{stats.totalStudents}</div>
          <div className="text-[11px] font-semibold text-slate-500 mt-1">Total Students</div>
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

      {/* Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveTab('pending')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'pending' ? 'bg-amber-500 text-slate-950 shadow font-extrabold' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Pending Approvals ({pendingColleges.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('colleges')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'colleges' ? 'bg-slate-900 text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building2 className="w-4 h-4" />
          <span>All Colleges ({colleges.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('admins')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'admins' ? 'bg-slate-900 text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>College Administrators ({collegeAdmins.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('complaints')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
            activeTab === 'complaints' ? 'bg-slate-900 text-white shadow' : 'bg-white text-slate-600 hover:bg-slate-100'
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Platform Complaints ({allComplaints.length})</span>
        </button>
      </div>

      {/* Tab: Pending Approvals */}
      {activeTab === 'pending' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">Pending College Registration Requests</h3>
            <p className="text-xs text-slate-500">Review university applications. Once approved, college administrators gain access.</p>
          </div>

          {pendingColleges.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-400 bg-slate-50 rounded-2xl">
              No pending college registrations. All colleges are reviewed!
            </div>
          ) : (
            <div className="space-y-4">
              {pendingColleges.map(c => (
                <div
                  key={c.id}
                  className="p-5 rounded-2xl bg-amber-50/70 border-2 border-amber-300 space-y-3"
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img src={c.logo_url} alt="" className="w-12 h-12 rounded-xl object-cover border border-amber-200" />
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="font-bold text-slate-900 text-base">{c.name}</h4>
                          <span className="font-mono text-xs bg-amber-200 text-amber-900 px-2 py-0.5 rounded font-bold">
                            {c.code}
                          </span>
                        </div>
                        <p className="text-xs text-slate-600">
                          {c.address}, {c.city}, {c.state} • Website: <a href={c.website} target="_blank" rel="noreferrer" className="text-sky-600 hover:underline">{c.website}</a>
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
                    <div><strong>Admin Name:</strong> {c.admin_name || 'Dr. Sunita Shinde'}</div>
                    <div><strong>Admin Email:</strong> {c.admin_email || c.email}</div>
                    <div><strong>Phone:</strong> {c.phone}</div>
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
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-base text-slate-900">All Registered Colleges Directory</h3>
              <p className="text-xs text-slate-500">Manage status, activate/deactivate participating university institutions</p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider">
                <tr>
                  <th className="p-3 rounded-l-xl">College Name</th>
                  <th className="p-3">Code</th>
                  <th className="p-3">City / State</th>
                  <th className="p-3">Admin</th>
                  <th className="p-3">Status</th>
                  <th className="p-3 rounded-r-xl text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {colleges.map(c => (
                  <tr key={c.id} className="hover:bg-slate-50 transition">
                    <td className="p-3 font-bold text-slate-900 flex items-center gap-2">
                      <img src={c.logo_url} alt="" className="w-7 h-7 rounded-lg object-cover" />
                      <span>{c.name}</span>
                    </td>
                    <td className="p-3 font-mono font-bold text-slate-700">{c.code}</td>
                    <td className="p-3 text-slate-600">{c.city}, {c.state}</td>
                    <td className="p-3 text-slate-600">{c.admin_name || c.admin_email}</td>
                    <td className="p-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        c.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                        c.status === 'pending' ? 'bg-amber-100 text-amber-800' :
                        c.status === 'inactive' ? 'bg-slate-200 text-slate-700' :
                        'bg-rose-100 text-rose-800'
                      }`}>
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
                      ) : null}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab: College Admins */}
      {activeTab === 'admins' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">Campus Administrators</h3>
            <p className="text-xs text-slate-500">Authorized personnel who oversee lost and found operations at their campus</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {collegeAdmins.map(admin => {
              const college = admin.college_id ? storage.getCollegeById(admin.college_id) : null;
              return (
                <div key={admin.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center gap-3 text-xs">
                  <img src={admin.avatar_url || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=80'} alt="" className="w-12 h-12 rounded-xl object-cover" />
                  <div className="flex-1">
                    <h4 className="font-bold text-slate-900 text-sm">{admin.name}</h4>
                    <p className="text-slate-500">{admin.email} • {admin.phone}</p>
                    <div className="mt-1 font-semibold text-sky-700">
                      🏛️ {college?.name || 'Assigned College'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab: Complaints */}
      {activeTab === 'complaints' && (
        <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-base text-slate-900">Platform Complaints & Audit Trail</h3>
            <p className="text-xs text-slate-500">Inter-college complaints, security disputes, and system feedback</p>
          </div>

          <div className="space-y-3">
            {allComplaints.map(c => {
              const college = storage.getCollegeById(c.college_id);
              const user = storage.getUserById(c.user_id);
              return (
                <div key={c.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-mono text-slate-400 text-[10px]">Campus: {college?.code}</span>
                      <h4 className="font-bold text-slate-900 text-sm">{c.subject}</h4>
                      <p className="text-slate-500">Reported by: {user?.name || 'User'} ({user?.email})</p>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-amber-100 text-amber-800">
                      {c.status}
                    </span>
                  </div>
                  <p className="text-slate-700 bg-white p-2.5 rounded-xl border border-slate-200">
                    {c.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rejection Modal */}
      {rejectionModalCollege && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <form onSubmit={handleRejectCollege} className="bg-white rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="font-bold text-base text-slate-900">
              Reject College Registration
            </h3>
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
    </div>
  );
};
