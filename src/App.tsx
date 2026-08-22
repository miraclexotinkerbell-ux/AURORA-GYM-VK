import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { MemberManagementView } from './components/MemberManagementView';
import { POSView } from './components/POSView';
import { InventoryView } from './components/InventoryView';
import { TrainerManagementView } from './components/TrainerManagementView';
import { FinancialReportsView } from './components/FinancialReportsView';
import { SettingsView } from './components/SettingsView';
import { QuickCheckInModal } from './components/QuickCheckInModal';
import { MemberCardModal } from './components/MemberCardModal';
import { LoginScreen } from './components/LoginScreen';
import { AuthUser, Member, UserRole } from './types/gym';
import { gymStorage } from './utils/gymStorage';
import { ROLE_PERMISSIONS } from './utils/helpers';
import { soundFx } from './utils/audio';

export default function App() {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(null);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [activeRole, setActiveRole] = useState<UserRole>('owner');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  
  // Modals
  const [showCheckInModal, setShowCheckInModal] = useState<boolean>(false);
  const [cardModalMember, setCardModalMember] = useState<Member | null>(null);
  const [preselectedRenewMemberId, setPreselectedRenewMemberId] = useState<string | null>(null);

  // Initialize auth & role
  useEffect(() => {
    const checkAuth = () => {
      const user = gymStorage.getCurrentUser();
      setCurrentUser(user);
      if (user) {
        setActiveRole(user.role);
        // Cashiers start directly at POS terminal for quick shift start
        if (user.role === 'cashier' && activeTab === 'dashboard') {
          setActiveTab('pos');
        }
      }
    };

    checkAuth();
    window.addEventListener('aurora_auth_changed', checkAuth);
    return () => window.removeEventListener('aurora_auth_changed', checkAuth);
  }, []);

  const handleLoginSuccess = (user: AuthUser) => {
    setCurrentUser(user);
    setActiveRole(user.role);
    if (user.role === 'cashier') {
      setActiveTab('pos');
    } else {
      setActiveTab('dashboard');
    }
  };

  const handleLogout = () => {
    soundFx.playScanBeep();
    gymStorage.logout();
    setCurrentUser(null);
  };

  const handleRoleChange = (role: UserRole) => {
    setActiveRole(role);
    gymStorage.setActiveRole(role);

    // If current tab is forbidden for this new role, redirect to pos or dashboard
    const perm = ROLE_PERMISSIONS[role];
    if (activeTab === 'reports' && !perm.canAccessReports) {
      setActiveTab(role === 'cashier' ? 'pos' : 'dashboard');
    }
    if (activeTab === 'settings' && !perm.canAccessSettings) {
      setActiveTab('dashboard');
    }
  };

  const handleRenewMember = (member: Member) => {
    setPreselectedRenewMemberId(member.id);
    setActiveTab('pos');
  };

  // If user is not logged in, screen user with Login / Position Screening Screen
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="min-h-screen bg-[#F1F5F9] text-slate-900 flex flex-col font-sans selection:bg-teal-400 selection:text-slate-950">
      
      {/* Top Application Header */}
      <Header
        activeTab={activeTab}
        activeRole={activeRole}
        currentUser={currentUser}
        onRoleChange={handleRoleChange}
        onLogout={handleLogout}
        onOpenScanner={() => setShowCheckInModal(true)}
        onToggleMobileSidebar={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}
      />

      {/* Main App Workspace */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Sidebar Navigation */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={(tab) => {
            setActiveTab(tab);
            setIsMobileSidebarOpen(false);
          }}
          activeRole={activeRole}
          currentUser={currentUser}
          onLogout={handleLogout}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
          onOpenCheckIn={() => setShowCheckInModal(true)}
        />

        {/* Dynamic Main View Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-5 lg:p-6">
          <div className="max-w-7xl mx-auto space-y-4">
            
            {activeTab === 'dashboard' && (
              <DashboardView
                activeRole={activeRole}
                onOpenScanner={() => setShowCheckInModal(true)}
                onNavigateTo={setActiveTab}
                onSelectMemberForCard={(m) => setCardModalMember(m)}
              />
            )}

            {activeTab === 'members' && (
              <MemberManagementView
                activeRole={activeRole}
                onSelectMemberForCard={(m) => setCardModalMember(m)}
                onSelectMemberForRenew={handleRenewMember}
              />
            )}

            {activeTab === 'pos' && (
              <POSView
                activeRole={activeRole}
                preselectedRenewMemberId={preselectedRenewMemberId}
              />
            )}

            {activeTab === 'inventory' && (
              <InventoryView activeRole={activeRole} />
            )}

            {activeTab === 'trainers' && (
              <TrainerManagementView activeRole={activeRole} />
            )}

            {activeTab === 'reports' && (
              <FinancialReportsView activeRole={activeRole} />
            )}

            {activeTab === 'settings' && (
              <SettingsView activeRole={activeRole} />
            )}

          </div>
        </main>

      </div>

      {/* Global Quick Check-In Terminal Modal (Scanner / RFID / Gate controller) */}
      <QuickCheckInModal
        isOpen={showCheckInModal}
        onClose={() => setShowCheckInModal(false)}
        onSelectMemberForCard={(m) => {
          setShowCheckInModal(false);
          setCardModalMember(m);
        }}
      />

      {/* Digital Member Card Pass Modal */}
      <MemberCardModal
        member={cardModalMember}
        isOpen={!!cardModalMember}
        onClose={() => setCardModalMember(null)}
      />

    </div>
  );
}
