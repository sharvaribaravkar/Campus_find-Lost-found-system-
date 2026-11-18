import React, { useState } from 'react';
import {
  MapPin,
  Search,
  Bell,
  LogOut,
  PlusCircle,
  ShieldCheck,
  Building2,
  Menu,
  X,
  FileCode,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { storage } from '../services/storage';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenReportModal: (type: 'lost' | 'found') => void;
  onOpenXamppExport: () => void;
  onOpenAuthModal: (mode: 'login' | 'register') => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentTab,
  setCurrentTab,
  onOpenReportModal,
  onOpenXamppExport,
  onOpenAuthModal,
}) => {
  const { currentUser, currentCollege, isAdmin, logout } = useAuth();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notifications = currentUser ? storage.getNotifications(currentUser.id) : [];
  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const handleMarkAsRead = (id: string) => {
    storage.markNotificationAsRead(id);
  };

  const handleMarkAllRead = () => {
    if (currentUser) {
      storage.markAllNotificationsAsRead(currentUser.id);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-slate-900 border-b border-slate-800 text-white shadow-lg">
      {/* Top micro-bar for Multi-College indicator & Admin Portal / PHP Code links */}
      <div className="bg-slate-950/80 px-4 py-1.5 text-xs border-b border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-slate-300">
          <span className="flex items-center gap-1 text-sky-400 font-semibold tracking-wide uppercase text-[11px]">
            <Building2 className="w-3.5 h-3.5 text-sky-400" />
            {currentCollege ? currentCollege.name : 'Central Multi-Campus Network'}
          </span>
          {currentCollege && (
            <span className="hidden sm:inline bg-sky-950 text-sky-300 border border-sky-800/60 px-1.5 py-0.5 rounded text-[10px] font-mono">
              {currentCollege.code}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {/* Separate Admin Portal Button */}
          <button
            onClick={() => setCurrentTab('admin-portal')}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border transition ${
              currentTab === 'admin-portal' || isAdmin
                ? 'bg-amber-500 text-slate-950 border-amber-400'
                : 'bg-slate-800 hover:bg-slate-700 text-amber-300 border-slate-700'
            }`}
            title="Access the separate Administrator Portal"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin Portal</span>
          </button>

          {/* PHP & XAMPP Source Code export button */}
          <button
            onClick={onOpenXamppExport}
            className="flex items-center gap-1 bg-emerald-600 hover:bg-emerald-500 text-white px-2.5 py-1 rounded-md text-xs font-semibold shadow-sm transition"
          >
            <FileCode className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">PHP & MySQL Code</span>
            <span className="sm:hidden">PHP/SQL</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo with combination of location pin and search icon */}
          <div
            onClick={() => setCurrentTab('home')}
            className="flex items-center gap-3 cursor-pointer group select-none"
          >
            <div className="relative flex items-center justify-center w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-600 via-sky-500 to-emerald-400 p-0.5 shadow-md shadow-sky-500/20 group-hover:scale-105 transition transform">
              <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center relative">
                <MapPin className="w-6 h-6 text-sky-400 drop-shadow-sm" />
                <Search className="w-3.5 h-3.5 text-emerald-400 absolute top-2 right-2 drop-shadow" />
              </div>
            </div>
            <div>
              <div className="text-xl font-bold tracking-tight text-white flex items-center gap-1.5">
                Campus<span className="text-sky-400">Find</span>
              </div>
              <p className="text-[10px] text-slate-400 font-medium tracking-wide">
                One Platform, Every Campus.
              </p>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1 text-sm font-medium">
            <button
              onClick={() => setCurrentTab('home')}
              className={`px-3 py-2 rounded-lg transition ${
                currentTab === 'home'
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Home
            </button>
            <button
              onClick={() => setCurrentTab('lost-items')}
              className={`px-3 py-2 rounded-lg transition ${
                currentTab === 'lost-items'
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Lost Items
            </button>
            <button
              onClick={() => setCurrentTab('found-items')}
              className={`px-3 py-2 rounded-lg transition ${
                currentTab === 'found-items'
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Found Items
            </button>
            <button
              onClick={() => setCurrentTab('how-it-works')}
              className={`px-3 py-2 rounded-lg transition ${
                currentTab === 'how-it-works'
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              How It Works
            </button>
            <button
              onClick={() => setCurrentTab('about')}
              className={`px-3 py-2 rounded-lg transition ${
                currentTab === 'about'
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              About Us
            </button>
            <button
              onClick={() => setCurrentTab('college-register')}
              className={`px-3 py-2 rounded-lg transition ${
                currentTab === 'college-register'
                  ? 'bg-slate-800 text-sky-400 font-semibold'
                  : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              Register College
            </button>
          </nav>

          {/* Right Action buttons */}
          <div className="hidden lg:flex items-center gap-3">
            {/* Quick Report CTAs */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onOpenReportModal('lost')}
                className="flex items-center gap-1.5 bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition shadow-sm hover:shadow"
              >
                <PlusCircle className="w-4 h-4" />
                Report Lost
              </button>
              <button
                onClick={() => onOpenReportModal('found')}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition shadow-sm hover:shadow"
              >
                <PlusCircle className="w-4 h-4" />
                Report Found
              </button>
            </div>

            {/* Notification Bell with Badge */}
            {currentUser && (
              <div className="relative">
                <button
                  onClick={() => setShowNotifications(!showNotifications)}
                  className="relative p-2 text-slate-300 hover:text-white hover:bg-slate-800 rounded-lg transition"
                  title="Notifications"
                >
                  <Bell className="w-5 h-5" />
                  {unreadCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-slate-900 animate-pulse">
                      {unreadCount}
                    </span>
                  )}
                </button>

                {showNotifications && (
                  <div className="absolute right-0 mt-2 w-80 bg-slate-900 rounded-xl shadow-2xl border border-slate-700 overflow-hidden z-50">
                    <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                      <div className="font-semibold text-xs text-white flex items-center gap-1.5">
                        <Bell className="w-4 h-4 text-sky-400" /> Notifications ({notifications.length})
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={handleMarkAllRead}
                          className="text-[11px] text-sky-400 hover:underline"
                        >
                          Mark all read
                        </button>
                      )}
                    </div>

                    <div className="max-h-72 overflow-y-auto divide-y divide-slate-800/60">
                      {notifications.length === 0 ? (
                        <div className="p-4 text-center text-xs text-slate-400">
                          No notifications yet.
                        </div>
                      ) : (
                        notifications.map((n) => (
                          <div
                            key={n.id}
                            onClick={() => handleMarkAsRead(n.id)}
                            className={`p-3 text-xs transition cursor-pointer hover:bg-slate-800/80 ${
                              !n.is_read ? 'bg-sky-950/40 border-l-2 border-sky-400' : ''
                            }`}
                          >
                            <div className="font-semibold text-white flex items-center justify-between">
                              <span>{n.title}</span>
                              <span className="text-[10px] text-slate-400 font-normal">
                                {new Date(n.created_at).toLocaleTimeString([], {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })}
                              </span>
                            </div>
                            <p className="text-slate-300 mt-1 leading-relaxed text-[11px]">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* User Dashboard / Portal Button */}
            {currentUser ? (
              <div className="flex items-center gap-2">
                {isAdmin ? (
                  <button
                    onClick={() => setCurrentTab('admin-portal')}
                    className="flex items-center gap-2 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 px-3 py-1.5 rounded-lg text-xs font-semibold transition"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    <span>Admin Console</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setCurrentTab('student-dashboard')}
                    className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white px-3 py-1.5 rounded-lg text-xs font-medium transition"
                  >
                    <img
                      src={
                        currentUser.avatar_url ||
                        'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=60'
                      }
                      alt={currentUser.name}
                      className="w-6 h-6 rounded-full object-cover border border-sky-400"
                    />
                    <div className="text-left">
                      <span className="block text-xs font-semibold leading-none">
                        {currentUser.name.split(' ')[0]}
                      </span>
                      <span className="text-[10px] text-sky-400 uppercase tracking-wider">
                        Student
                      </span>
                    </div>
                  </button>
                )}

                <button
                  onClick={() => {
                    logout();
                    if (currentTab === 'student-dashboard' || currentTab === 'admin-portal') {
                      setCurrentTab('home');
                    }
                  }}
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                  title="Logout"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenAuthModal('login')}
                  className="text-xs font-medium text-slate-200 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-800 transition"
                >
                  Student Log In
                </button>
                <button
                  onClick={() => onOpenAuthModal('register')}
                  className="text-xs font-semibold bg-sky-500 hover:bg-sky-400 text-white px-3.5 py-1.5 rounded-lg shadow transition"
                >
                  Register
                </button>
              </div>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => onOpenReportModal('lost')}
              className="bg-rose-600 text-white p-1.5 rounded-md text-xs"
              title="Report Lost"
            >
              <PlusCircle className="w-4 h-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-slate-300 hover:text-white p-2 rounded-lg"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-slate-900 px-4 pt-3 pb-5 space-y-2">
          <button
            onClick={() => {
              setCurrentTab('home');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-sm text-slate-200 hover:text-white font-medium"
          >
            Home
          </button>
          <button
            onClick={() => {
              setCurrentTab('lost-items');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-sm text-slate-200 hover:text-white font-medium"
          >
            Lost Items
          </button>
          <button
            onClick={() => {
              setCurrentTab('found-items');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-sm text-slate-200 hover:text-white font-medium"
          >
            Found Items
          </button>
          <button
            onClick={() => {
              setCurrentTab('how-it-works');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-sm text-slate-200 hover:text-white font-medium"
          >
            How It Works
          </button>
          <button
            onClick={() => {
              setCurrentTab('about');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-sm text-slate-200 hover:text-white font-medium"
          >
            About Us
          </button>
          <button
            onClick={() => {
              setCurrentTab('college-register');
              setMobileMenuOpen(false);
            }}
            className="w-full text-left py-2 text-sm text-slate-200 hover:text-white font-medium"
          >
            Register College
          </button>

          <div className="pt-2 border-t border-slate-800 flex flex-col gap-2">
            {currentUser ? (
              <>
                <button
                  onClick={() => {
                    setCurrentTab(isAdmin ? 'admin-portal' : 'student-dashboard');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-sky-600 text-white py-2 rounded-lg text-xs font-semibold text-center"
                >
                  {isAdmin ? 'Open Admin Portal' : 'My Student Dashboard'}
                </button>
                <button
                  onClick={() => {
                    logout();
                    setCurrentTab('home');
                    setMobileMenuOpen(false);
                  }}
                  className="w-full bg-slate-800 text-rose-400 py-2 rounded-lg text-xs font-semibold text-center"
                >
                  Logout
                </button>
              </>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onOpenAuthModal('login');
                    setMobileMenuOpen(false);
                  }}
                  className="bg-slate-800 text-white py-2 rounded-lg text-xs font-semibold text-center"
                >
                  Student Log In
                </button>
                <button
                  onClick={() => {
                    onOpenAuthModal('register');
                    setMobileMenuOpen(false);
                  }}
                  className="bg-sky-500 text-white py-2 rounded-lg text-xs font-semibold text-center"
                >
                  Register
                </button>
              </div>
            )}
            <button
              onClick={() => {
                setCurrentTab('admin-portal');
                setMobileMenuOpen(false);
              }}
              className="w-full bg-amber-500/20 border border-amber-500/40 text-amber-300 py-2 rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-1.5"
            >
              <ShieldCheck className="w-4 h-4" />
              Separate Admin Portal
            </button>
            <button
              onClick={() => {
                onOpenReportModal('lost');
                setMobileMenuOpen(false);
              }}
              className="w-full bg-rose-600 text-white py-2 rounded-lg text-xs font-semibold text-center"
            >
              Report Lost Item
            </button>
            <button
              onClick={() => {
                onOpenReportModal('found');
                setMobileMenuOpen(false);
              }}
              className="w-full bg-emerald-600 text-white py-2 rounded-lg text-xs font-semibold text-center"
            >
              Report Found Item
            </button>
            <button
              onClick={() => {
                onOpenXamppExport();
                setMobileMenuOpen(false);
              }}
              className="w-full bg-slate-800 border border-slate-700 text-sky-400 py-2 rounded-lg text-xs font-semibold text-center flex items-center justify-center gap-1.5"
            >
              <FileCode className="w-4 h-4" />
              Download PHP & MySQL (XAMPP)
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
