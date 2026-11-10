/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Footer } from './components/Footer';
import { HomePage } from './pages/HomePage';
import { LostItemsPage } from './pages/LostItemsPage';
import { FoundItemsPage } from './pages/FoundItemsPage';
import { HowItWorksPage } from './pages/HowItWorksPage';
import { AboutPage } from './pages/AboutPage';
import { ContactPage } from './pages/ContactPage';
import { CollegeRegisterPage } from './pages/CollegeRegisterPage';
import { StudentDashboard } from './pages/StudentDashboard';
import { CollegeAdminDashboard } from './pages/CollegeAdminDashboard';
import { SuperAdminDashboard } from './pages/SuperAdminDashboard';
import { ReportItemModal } from './components/ReportItemModal';
import { ItemDetailsModal } from './components/ItemDetailsModal';
import { SmartMatchModal } from './components/SmartMatchModal';
import { XamppExportModal } from './components/XamppExportModal';
import { AuthModal } from './components/AuthModal';
import { Item } from './types';
import { storage } from './services/storage';

function MainAppContent() {
  const { currentUser, currentCollege } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('home');

  // Modal States
  const [reportModalOpen, setReportModalOpen] = useState(false);
  const [reportModalType, setReportModalType] = useState<'lost' | 'found'>('lost');
  const [xamppModalOpen, setXamppModalOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  
  // Item details modal
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);

  // Smart match modal
  const [smartMatchData, setSmartMatchData] = useState<{ lostItem: Item; foundItem: Item } | null>(null);

  const handleOpenReportModal = (type: 'lost' | 'found') => {
    if (!currentUser) {
      setAuthModalMode('login');
      setAuthModalOpen(true);
      return;
    }
    setReportModalType(type);
    setReportModalOpen(true);
  };

  const handleOpenAuthModal = (mode: 'login' | 'register') => {
    setAuthModalMode(mode);
    setAuthModalOpen(true);
  };

  const handleViewItemDetails = (item: Item) => {
    setSelectedItem(item);
  };

  const handleSmartMatchClick = (lost: Item, found: Item) => {
    setSmartMatchData({ lostItem: lost, foundItem: found });
  };

  const handleClaimFoundItem = (foundItem: Item) => {
    setSelectedItem(foundItem);
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800">
      {/* Responsive Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenReportModal={handleOpenReportModal}
        onOpenXamppExport={() => setXamppModalOpen(true)}
        onOpenAuthModal={handleOpenAuthModal}
      />

      {/* Main View Router */}
      <main className="flex-1">
        {currentTab === 'home' && (
          <HomePage
            setCurrentTab={setCurrentTab}
            onOpenReportModal={handleOpenReportModal}
            onViewItemDetails={handleViewItemDetails}
            onOpenXamppExport={() => setXamppModalOpen(true)}
            onSmartMatchClick={handleSmartMatchClick}
          />
        )}

        {currentTab === 'lost-items' && (
          <LostItemsPage
            onViewDetails={handleViewItemDetails}
            onOpenReportModal={handleOpenReportModal}
            onSmartMatchClick={handleSmartMatchClick}
          />
        )}

        {currentTab === 'found-items' && (
          <FoundItemsPage
            onViewDetails={handleViewItemDetails}
            onOpenReportModal={handleOpenReportModal}
            onClaimItem={handleClaimFoundItem}
          />
        )}

        {currentTab === 'how-it-works' && (
          <HowItWorksPage
            onOpenReportModal={handleOpenReportModal}
            setCurrentTab={setCurrentTab}
          />
        )}

        {currentTab === 'about' && (
          <AboutPage
            setCurrentTab={setCurrentTab}
            onOpenXamppExport={() => setXamppModalOpen(true)}
          />
        )}

        {currentTab === 'contact' && (
          <ContactPage />
        )}

        {currentTab === 'college-register' && (
          <CollegeRegisterPage
            onSuccess={() => setCurrentTab('home')}
          />
        )}

        {currentTab === 'student-dashboard' && (
          <StudentDashboard
            onOpenReportModal={handleOpenReportModal}
            onViewItemDetails={handleViewItemDetails}
            onSmartMatchClick={handleSmartMatchClick}
          />
        )}

        {currentTab === 'college-admin' && (
          <CollegeAdminDashboard
            onViewItemDetails={handleViewItemDetails}
          />
        )}

        {currentTab === 'super-admin' && (
          <SuperAdminDashboard />
        )}
      </main>

      {/* Footer */}
      <Footer
        setCurrentTab={setCurrentTab}
        onOpenXamppExport={() => setXamppModalOpen(true)}
      />

      {/* Report Modal */}
      <ReportItemModal
        isOpen={reportModalOpen}
        initialType={reportModalType}
        onClose={() => setReportModalOpen(false)}
        onSuccess={(id) => {
          const created = storage.getItemById(id);
          if (created) setSelectedItem(created);
        }}
      />

      {/* Item Details & Claim Modal */}
      <ItemDetailsModal
        item={selectedItem}
        onClose={() => setSelectedItem(null)}
        onOpenReportModal={handleOpenReportModal}
        onSmartMatchClick={handleSmartMatchClick}
      />

      {/* Smart Match Side-by-Side Modal */}
      <SmartMatchModal
        lostItem={smartMatchData?.lostItem || null}
        foundItem={smartMatchData?.foundItem || null}
        onClose={() => setSmartMatchData(null)}
        onClaimFoundItem={handleClaimFoundItem}
      />

      {/* XAMPP & PHP 8+ / MySQL Export Modal */}
      <XamppExportModal
        isOpen={xamppModalOpen}
        onClose={() => setXamppModalOpen(false)}
      />

      {/* Auth / Register Modal */}
      <AuthModal
        isOpen={authModalOpen}
        initialMode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSuccess={() => {
          if (currentUser?.role === 'super_admin') setCurrentTab('super-admin');
          else if (currentUser?.role === 'college_admin') setCurrentTab('college-admin');
          else setCurrentTab('student-dashboard');
        }}
      />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}
