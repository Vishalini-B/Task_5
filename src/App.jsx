import React, { useState, useEffect } from 'react';
import { Sidebar } from './components/Sidebar';
import { SummaryCards } from './components/SummaryCards';
import { TransactionList } from './components/TransactionList';
import { TransactionForm } from './components/TransactionForm';
import { Charts } from './components/Charts';
import { BillReminder } from './components/BillReminder';
import { BudgetManager } from './components/BudgetManager';
import { TransactionsPage } from './components/TransactionsPage';
import { BillsPage } from './components/BillsPage';
import { AnalyticsPage } from './components/AnalyticsPage';
import { SettingsPage } from './components/SettingsPage';
import { NotificationDropdown } from './components/NotificationDropdown';
import { useFinanceData } from './hooks/useFinanceData';
import { Plus, Download, Search, Bell, User, LogOut, Settings } from 'lucide-react';
import { auth, signInWithGoogle, logout } from './firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { cn } from './lib/utils';

export default function App() {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setAuthLoading(false);
    });
    return unsub;
  }, []);

  const { 
    data, 
    loading: dataLoading,
    addTransaction, 
    deleteTransaction, 
    addBill, 
    toggleBillPaid, 
    deleteBill, 
    updateBudget,
    updateNotificationSettings,
    markNotificationAsRead,
    deleteNotification
  } = useFinanceData(user?.uid || null);

  const unreadNotificationsCount = data.notifications.filter(n => !n.isRead).length;

  if (authLoading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
          <p className="text-slate-500 font-medium">Loading your finances...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full space-y-8 text-center">
          <div className="space-y-2">
            <div className="w-20 h-20 bg-indigo-600 rounded-3xl flex items-center justify-center mx-auto mb-6 shadow-xl shadow-indigo-200 rotate-3">
              <Plus className="text-white" size={40} />
            </div>
            <h1 className="text-4xl font-black text-slate-900 tracking-tight">FinTrack</h1>
            <p className="text-slate-500 text-lg">Master your money, one transaction at a time.</p>
          </div>
          
          <div className="card p-8 space-y-6">
            <div className="space-y-2">
              <h2 className="text-xl font-bold text-slate-900">Welcome back</h2>
              <p className="text-sm text-slate-500">Sign in to access your dashboard and manage your finances securely.</p>
            </div>
            
            <button 
              onClick={signInWithGoogle}
              className="w-full flex items-center justify-center gap-3 bg-white border border-slate-200 py-3 px-4 rounded-xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
            >
              <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-5 h-5" />
              Continue with Google
            </button>
            
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              Securely powered by Firebase
            </p>
          </div>
        </div>
      </div>
    );
  }

  const totalIncome = data.transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = data.transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalIncome - totalExpenses;

  const filteredTransactions = data.transactions.filter(t => 
    (t.description || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const exportToCSV = () => {
    const headers = ['Type', 'Amount', 'Category', 'Date', 'Description'];
    const rows = data.transactions.map(t => [
      t.type,
      t.amount,
      t.category,
      t.date,
      t.description
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', 'transactions.csv');
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="flex h-screen bg-slate-50 overflow-hidden">
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} onLogout={logout} />
      
      <main className="flex-1 flex flex-col min-w-0 overflow-y-auto">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
          <div className="px-6 py-4 flex items-center justify-between">
            <div className="flex items-center gap-4 flex-1 max-w-xl">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input 
                  type="text" 
                  placeholder="Search transactions..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 bg-slate-100 border-transparent rounded-xl text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
                />
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <button 
                  onClick={() => setShowNotifications(!showNotifications)}
                  className={cn(
                    "p-2 rounded-full transition-all relative",
                    showNotifications ? "bg-indigo-50 text-indigo-600" : "text-slate-500 hover:bg-slate-100"
                  )}
                >
                  <Bell size={20} />
                  {unreadNotificationsCount > 0 && (
                    <span className="absolute top-2 right-2 w-2 h-2 bg-rose-500 rounded-full border-2 border-white"></span>
                  )}
                </button>
                
                {showNotifications && (
                  <NotificationDropdown 
                    notifications={data.notifications}
                    onMarkAsRead={markNotificationAsRead}
                    onDelete={deleteNotification}
                    onClose={() => setShowNotifications(false)}
                  />
                )}
              </div>
              <div className="h-8 w-px bg-slate-200"></div>
              <div className="flex items-center gap-3">
                <div className="text-right hidden sm:block">
                  <p className="text-sm font-bold text-slate-900">{data.profile.displayName || user.displayName || 'User'}</p>
                  <p className="text-xs text-slate-500">{data.profile.email || user.email}</p>
                </div>
                <div className="group relative">
                  <button className="w-10 h-10 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center overflow-hidden border-2 border-transparent hover:border-indigo-600 transition-all">
                    {(data.profile.photoURL || user.photoURL) ? (
                      <img src={data.profile.photoURL || user.photoURL || ''} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <User size={20} />
                    )}
                  </button>
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-slate-100 py-1 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                    <button 
                      onClick={logout}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <LogOut size={16} />
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="p-6 pb-24 md:pb-6 space-y-6 max-w-7xl mx-auto w-full">
          {dataLoading ? (
            <div className="flex flex-col items-center justify-center py-20 gap-4">
              <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-slate-400 text-sm">Syncing with cloud...</p>
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h1 className="text-2xl font-bold text-slate-900">
                    {activeTab === 'dashboard' ? `Welcome back, ${(data.profile.displayName || user.displayName || 'User').split(' ')[0]}!` : 
                     activeTab === 'transactions' ? 'Transactions' :
                     activeTab === 'bills' ? 'Bills & Reminders' :
                     activeTab === 'analytics' ? 'Financial Analytics' : 
                     activeTab === 'settings' ? 'Settings' : 'Page'}
                  </h1>
                  <p className="text-slate-500">
                    {activeTab === 'dashboard' ? "Here's what's happening with your money today." :
                     activeTab === 'transactions' ? "View and manage your income and expenses separately." :
                     activeTab === 'bills' ? "Keep track of your upcoming payments and never miss a due date." :
                     activeTab === 'analytics' ? "Deep dive into your spending habits and financial trends." : 
                     activeTab === 'settings' ? "Manage your profile and notification preferences." : ""}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {activeTab !== 'settings' && (
                    <>
                      <button 
                        onClick={exportToCSV}
                        className="btn-secondary flex items-center gap-2"
                      >
                        <Download size={18} />
                        Export CSV
                      </button>
                      <button 
                        onClick={() => setShowAddForm(true)}
                        className="btn-primary flex items-center gap-2"
                      >
                        <Plus size={18} />
                        Add Transaction
                      </button>
                    </>
                  )}
                </div>
              </div>

              {activeTab === 'dashboard' ? (
                <>
                  <SummaryCards 
                    totalIncome={totalIncome} 
                    totalExpenses={totalExpenses} 
                    balance={balance}
                    budget={data.budget.monthlyLimit}
                  />

                  <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    <div className="xl:col-span-2 space-y-6">
                      <Charts transactions={data.transactions} />
                      <TransactionList 
                        transactions={filteredTransactions.slice(0, 5)} 
                        onDelete={deleteTransaction} 
                      />
                    </div>
                    <div className="space-y-6">
                      <BudgetManager 
                        budget={data.budget.monthlyLimit} 
                        onUpdate={updateBudget} 
                        totalExpenses={totalExpenses}
                        budgetWarnings={data.notificationSettings.budgetWarnings}
                      />
                      <BillReminder 
                        bills={data.bills} 
                        onAdd={addBill} 
                        onToggle={toggleBillPaid} 
                        onDelete={deleteBill} 
                      />
                    </div>
                  </div>
                </>
              ) : activeTab === 'transactions' ? (
                <TransactionsPage 
                  transactions={filteredTransactions} 
                  onDelete={deleteTransaction} 
                  onAdd={() => setShowAddForm(true)}
                />
              ) : activeTab === 'bills' ? (
                <BillsPage 
                  bills={data.bills}
                  onAdd={addBill}
                  onToggle={toggleBillPaid}
                  onDelete={deleteBill}
                />
              ) : activeTab === 'analytics' ? (
                <AnalyticsPage 
                  transactions={data.transactions}
                />
              ) : activeTab === 'settings' ? (
                <SettingsPage 
                  settings={data.notificationSettings}
                  profile={data.profile}
                  onUpdate={updateNotificationSettings}
                  onLogout={logout}
                />
              ) : (
                <div className="card p-12 flex flex-col items-center justify-center text-center">
                  <h3 className="text-lg font-semibold text-slate-900">Coming Soon</h3>
                  <p className="text-slate-500">This page is currently under development.</p>
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {showAddForm && (
        <TransactionForm 
          onAdd={addTransaction} 
          onClose={() => setShowAddForm(false)} 
        />
      )}

      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 px-6 py-3 flex items-center justify-between z-40">
        <button 
          onClick={() => setActiveTab('dashboard')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'dashboard' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <Plus size={20} className={activeTab === 'dashboard' ? 'rotate-45' : ''} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Home</span>
        </button>
        <button 
          onClick={() => setActiveTab('transactions')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'transactions' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <Download size={20} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Trans</span>
        </button>
        <button 
          onClick={() => setShowAddForm(true)}
          className="w-12 h-12 bg-indigo-600 text-white rounded-full flex items-center justify-center shadow-lg shadow-indigo-200 -mt-8 border-4 border-slate-50"
        >
          <Plus size={24} />
        </button>
        <button 
          onClick={() => setActiveTab('bills')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'bills' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <Bell size={20} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Bills</span>
        </button>
        <button 
          onClick={() => setActiveTab('settings')}
          className={`flex flex-col items-center gap-1 ${activeTab === 'settings' ? 'text-indigo-600' : 'text-slate-400'}`}
        >
          <Settings size={20} />
          <span className="text-[10px] font-bold uppercase tracking-tighter">Set</span>
        </button>
      </div>
    </div>
  );
}
