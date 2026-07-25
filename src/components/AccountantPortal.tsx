import React, { useState } from 'react';
import { 
  AppDatabase, 
  Order, 
  UserProfile, 
  WithdrawalRequest, 
  ChatMessage,
  BankAccount 
} from '../types';
import { 
  CheckCircle, 
  XCircle, 
  MessageSquare, 
  FileText, 
  Clock, 
  DollarSign, 
  Send, 
  Image as ImageIcon, 
  User, 
  AlertCircle,
  TrendingUp,
  Inbox,
  Truck,
  FolderLock,
  ShoppingBag,
  Plus,
  Trash2,
  ShieldCheck,
  Building2,
  CreditCard,
  UserCheck,
  Wallet,
  Search,
  Download,
  ArrowUpRight,
  Edit3,
  Filter,
  Check,
  Sparkles,
  Printer
} from 'lucide-react';
import { logOperation, resetDatabaseToDefaults } from '../dbMock';

interface AccountantPortalProps {
  database: AppDatabase;
  onSave: (db: AppDatabase) => void;
  currentUser: UserProfile;
}

export default function AccountantPortal({ database, onSave, currentUser }: AccountantPortalProps) {
  // Permission Checks - Accountant or Admin holds full access
  const hasAuditPermission = currentUser.permissions?.auditTransfers || currentUser.role === 'accountant' || currentUser.role === 'admin';
  const hasWithdrawalsPermission = currentUser.permissions?.auditTransfers || currentUser.role === 'accountant' || currentUser.role === 'admin';
  const hasReportsPermission = currentUser.permissions?.viewReports || currentUser.role === 'accountant' || currentUser.role === 'admin';
  const hasOrdersPermission = currentUser.permissions?.manageOrders || currentUser.role === 'accountant' || currentUser.role === 'admin';
  const hasCatalogPermission = currentUser.permissions?.manageProducts || currentUser.permissions?.manageCategories || currentUser.role === 'accountant' || currentUser.role === 'admin';
  const hasBankPermission = currentUser.permissions?.manageBanks || currentUser.role === 'accountant' || currentUser.role === 'admin';

  // State Management
  const [activeTab, setActiveTab] = useState<string>('orders');
  const [selectedOrderForChat, setSelectedOrderForChat] = useState<Order | null>(null);
  const [chatMessageText, setChatMessageText] = useState('');
  const [chatImageBase64, setChatImageBase64] = useState('');
  const [verificationFilter, setVerificationFilter] = useState<'pending' | 'verified' | 'all'>('pending');
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Bank Accounts Form State
  const [newBank, setNewBank] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    notes: ''
  });
  const [editingBankId, setEditingBankId] = useState<string | null>(null);
  const [editBankForm, setEditBankForm] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    notes: ''
  });

  // Financial Drilldown Modals
  const [selectedFinancialModal, setSelectedFinancialModal] = useState<'commissions' | 'platformRevenue' | 'approvedWithdrawals' | 'pendingWithdrawals' | null>(null);

  // Search Filters
  const [merchantSearch, setMerchantSearch] = useState('');
  const [auditSearch, setAuditSearch] = useState('');

  // Manual Payout Modal for Vendor Ledger
  const [payoutVendorModal, setPayoutVendorModal] = useState<UserProfile | null>(null);
  const [manualPayoutAmount, setManualPayoutAmount] = useState<string>('');
  const [manualPayoutBank, setManualPayoutBank] = useState<string>('الكريمي اكسبرس');
  const [manualPayoutAccount, setManualPayoutAccount] = useState<string>('');

  // 1. Confirm Receipt of Payment (Accountant holds this release approval)
  const handleConfirmPayment = (orderId: string) => {
    const updatedOrders = database.orders.map(o => {
      if (o.id === orderId) {
        logOperation(
          currentUser.id,
          currentUser.name,
          currentUser.role,
          'تأكيد استلام حوالة مالية',
          `تم مطابقة وتعميد حوالة الطلب رقم #${o.id} لمبلغ ${o.totalAmount} ر.ي عبر ${o.bankName}`
        );

        const autoMsg: ChatMessage = {
          id: `msg_sys_${Date.now()}`,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderRole: currentUser.role,
          text: `🚨 نظام: قام المحاسب المالي بتأكيد استلام المبلغ بالكامل من البنك المختار. تم نقل الطلب إلى رعاية قسم التجهيز والشحن (قيد التجهيز الآن).`,
          timestamp: new Date().toISOString()
        };

        return {
          ...o,
          status: 'processing' as const,
          updatedAt: new Date().toISOString(),
          chatMessages: [...o.chatMessages, autoMsg]
        };
      }
      return o;
    });

    onSave({ ...database, orders: updatedOrders });
    if (selectedOrderForChat?.id === orderId) {
      setSelectedOrderForChat(updatedOrders.find(o => o.id === orderId) || null);
    }
  };

  // 2. Reject receipt / request extra invoice verification
  const handleRejectReceipt = (orderId: string, comments: string) => {
    if (!comments.trim()) {
      alert('يرجى كتابة سبب تعليق أو رفض الإيصال لمساعدة العميل على التصحيح');
      return;
    }
    const updatedOrders = database.orders.map(o => {
      if (o.id === orderId) {
        logOperation(
          currentUser.id,
          currentUser.name,
          currentUser.role,
          'طلب إثبات مالي إضافي / رفض الإيصال',
          `تم رفض إيصال الحوالة للطلب #${o.id} بسب: ${comments}`
        );

        const rejectMsg: ChatMessage = {
          id: `msg_reject_${Date.now()}`,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderRole: currentUser.role,
          text: `⚠️ ملاحظة ماليّة من التدقيق: ${comments}. يرجى رفع صورة واضحة للإيصال أو للتفاصيل هنا عبر شات التحقق.`,
          timestamp: new Date().toISOString()
        };

        return {
          ...o,
          updatedAt: new Date().toISOString(),
          chatMessages: [...o.chatMessages, rejectMsg]
        };
      }
      return o;
    });

    onSave({ ...database, orders: updatedOrders });
    if (selectedOrderForChat?.id === orderId) {
      setSelectedOrderForChat(updatedOrders.find(o => o.id === orderId) || null);
    }
    alert('تم إرسال الملاحظة وتوجيه الزبون عبر شات التحقق');
  };

  // 3. Approve vendor withdrawal request
  const handleApproveWithdrawal = (reqId: string) => {
    const updatedReqs = database.withdrawalRequests.map(r => {
      if (r.id === reqId) {
        logOperation(
          currentUser.id,
          currentUser.name,
          currentUser.role,
          'اعتماد طلب سداد أرباح تاجرة',
          `تم تحويل مبلغ ${r.amount} ر.ي للتاجرة ${r.vendorName} عبر ${r.bankName}`
        );
        return {
          ...r,
          status: 'approved' as const,
          processedAt: new Date().toISOString()
        };
      }
      return r;
    });

    onSave({ ...database, withdrawalRequests: updatedReqs });
    alert('تم تعميد التحويل وتسجيل أثر العملية البنكية بنجاح!');
  };

  const handleRejectWithdrawal = (reqId: string) => {
    const updatedReqs = database.withdrawalRequests.map(r => {
      if (r.id === reqId) {
        logOperation(
          currentUser.id,
          currentUser.name,
          currentUser.role,
          'رفض طلب سداد أرباح تاجرة',
          `تم إلغاء سداد الطلب بقيمة ${r.amount} ر.ي للتاجرة ${r.vendorName}`
        );
        return {
          ...r,
          status: 'rejected' as const,
          processedAt: new Date().toISOString()
        };
      }
      return r;
    });

    onSave({ ...database, withdrawalRequests: updatedReqs });
    alert('تم إلغاء واعتماد الرفض للغرفة المحاسبية');
  };

  // 4. Send message in verification chat
  const handleSendChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForChat) return;
    if (!chatMessageText.trim() && !chatImageBase64) return;

    const newMsg: ChatMessage = {
      id: `msg_chat_${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: 'accountant',
      text: chatMessageText,
      imageAttachment: chatImageBase64 || undefined,
      timestamp: new Date().toISOString()
    };

    const updatedOrders = database.orders.map(o => {
      if (o.id === selectedOrderForChat.id) {
        return {
          ...o,
          chatMessages: [...o.chatMessages, newMsg]
        };
      }
      return o;
    });

    onSave({ ...database, orders: updatedOrders });
    setChatMessageText('');
    setChatImageBase64('');
    setSelectedOrderForChat(updatedOrders.find(o => o.id === selectedOrderForChat.id) || null);
  };

  const handleImageAttached = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const r = new FileReader();
      r.onloadend = () => setChatImageBase64(r.result as string);
      r.readAsDataURL(file);
    }
  };

  // 5. Add / Delete / Edit Bank Accounts
  const handleAddBankAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newBank.bankName.trim() || !newBank.accountNumber.trim()) {
      alert('يرجى كتابة اسم البنك ورقم الحساب البنكي');
      return;
    }
    const createdBank: BankAccount = {
      id: `bank_${Date.now()}`,
      bankName: newBank.bankName.trim(),
      accountNumber: newBank.accountNumber.trim(),
      accountHolder: newBank.accountHolder.trim() || 'شركة المول الرقمي',
      notes: newBank.notes.trim() || undefined
    };

    const updatedAccounts = [...(database.bankAccounts || []), createdBank];
    logOperation(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'إضافة حساب بنكي جديد',
      `قام المحاسب المالي بإضافة حساب بنكي جديد: ${createdBank.bankName} (${createdBank.accountNumber})`
    );
    onSave({ ...database, bankAccounts: updatedAccounts });
    setNewBank({ bankName: '', accountNumber: '', accountHolder: '', notes: '' });
    alert('تمت إضافة الحساب البنكي المعتمد بنجاح!');
  };

  const handleDeleteBankAccount = (id: string) => {
    if (!window.confirm('هل أنت تأكد من إزالة هذا الحساب البنكي؟')) return;
    const updated = (database.bankAccounts || []).filter(b => b.id !== id);
    logOperation(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'حذف حساب بنكي',
      `تم حذف الحساب البنكي رقم ${id}`
    );
    onSave({ ...database, bankAccounts: updated });
  };

  const handleSaveEditBankAccount = (id: string) => {
    const updated = (database.bankAccounts || []).map(b => {
      if (b.id === id) {
        return {
          ...b,
          bankName: editBankForm.bankName,
          accountNumber: editBankForm.accountNumber,
          accountHolder: editBankForm.accountHolder,
          notes: editBankForm.notes
        };
      }
      return b;
    });
    logOperation(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'تعديل بيانات حساب بنكي',
      `تم تعديل الحساب البنكي ${editBankForm.bankName}`
    );
    onSave({ ...database, bankAccounts: updated });
    setEditingBankId(null);
  };

  // 6. Direct Manual Vendor Payout
  const handleExecuteManualPayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!payoutVendorModal) return;
    const amt = parseFloat(manualPayoutAmount);
    if (isNaN(amt) || amt <= 0) {
      alert('يرجى إدخال مبلغ صحيح لسداد الأرباح');
      return;
    }

    const newReq: WithdrawalRequest = {
      id: `w_manual_${Date.now()}`,
      vendorId: payoutVendorModal.id,
      vendorName: payoutVendorModal.name,
      amount: amt,
      bankName: manualPayoutBank,
      accountNumber: manualPayoutAccount || payoutVendorModal.bankAccountDetails || 'حساب حاسب/الكريمي',
      status: 'approved',
      requestedAt: new Date().toISOString(),
      processedAt: new Date().toISOString()
    };

    const updatedReqs = [...(database.withdrawalRequests || []), newReq];
    logOperation(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'سداد تسوية أرباح تاجرة مباشرة',
      `قام المحاسب بسداد مبلغ ${amt} ر.ي مباشرة للتاجرة (${payoutVendorModal.name}) عبر ${manualPayoutBank}`
    );

    onSave({ ...database, withdrawalRequests: updatedReqs });
    setPayoutVendorModal(null);
    setManualPayoutAmount('');
    setManualPayoutAccount('');
    alert(`🎉 تم قيد تحويل الأرباح بمبلغ ${amt} ر.ي للتاجرة (${payoutVendorModal.name}) بنجاح!`);
  };

  const pendingConfirmationOrders = database.orders.filter(o => o.status === 'pending_payment');
  const activeWithdrawalRequests = database.withdrawalRequests.filter(r => r.status === 'pending');
  const approvedWithdrawalRequests = database.withdrawalRequests.filter(r => r.status === 'approved');

  // Vendor Sales Ledger Computations
  const vendorsList = database.users.filter(u => u.role === 'vendor');
  const filteredVendors = vendorsList.filter(v => 
    v.name.toLowerCase().includes(merchantSearch.toLowerCase()) ||
    v.phone.includes(merchantSearch) ||
    (v.fullName && v.fullName.toLowerCase().includes(merchantSearch.toLowerCase()))
  );

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-screen">
      
      {/* Sidebar of Accountant & Financials */}
      <div className="xl:col-span-1 bg-[#1E1E1E] border border-stone-800 rounded-2xl p-4 flex flex-col gap-2.5">
        
        {/* Accountant Profile Badge */}
        <div className="flex items-center gap-3 px-3 py-4 mb-2 border-b border-stone-850">
          <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-[#D4AF37] to-amber-200 flex items-center justify-center text-stone-900 font-extrabold shadow-sm">
            📊
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[#D4AF37]">{currentUser.name}</h3>
            <span className="text-[11px] text-stone-400">الإدارة المالية والتدقيق المحاسبي</span>
          </div>
        </div>

        {/* Sidebar Navigation Options */}
        <div className="space-y-1.5">
          {/* Tab 1: Orders Audit */}
          <button
            onClick={() => setActiveTab('orders')}
            className={`w-full text-right px-4 py-3 rounded-xl text-xs flex justify-between items-center transition-all cursor-pointer ${
              activeTab === 'orders' 
                ? 'bg-gradient-to-l from-amber-950/40 to-stone-900 border-r-4 border-[#D4AF37] text-white font-bold shadow' 
                : 'text-stone-300 hover:bg-stone-850'
            }`}
          >
            <span className="flex items-center gap-2">
              <Clock size={16} className="text-amber-500" />
              <span>تدقيق إيصالات الحوالات</span>
            </span>
            {pendingConfirmationOrders.length > 0 && (
              <span className="bg-amber-500 text-stone-950 font-black text-[10px] px-2 py-0.5 rounded-full animate-bounce">
                {pendingConfirmationOrders.length}
              </span>
            )}
          </button>

          {/* Tab 2: Vendor Withdrawals */}
          <button
            onClick={() => setActiveTab('withdrawals')}
            className={`w-full text-right px-4 py-3 rounded-xl text-xs flex justify-between items-center transition-all cursor-pointer ${
              activeTab === 'withdrawals' 
                ? 'bg-gradient-to-l from-pink-950/40 to-stone-900 border-r-4 border-[#F8C8DC] text-white font-bold shadow' 
                : 'text-stone-300 hover:bg-stone-850'
            }`}
          >
            <span className="flex items-center gap-2">
              <DollarSign size={16} className="text-[#F8C8DC]" />
              <span>طلبات سحب التاجرات</span>
            </span>
            {activeWithdrawalRequests.length > 0 && (
              <span className="bg-[#F8C8DC] text-black font-black text-[10px] px-2 py-0.5 rounded-full">
                {activeWithdrawalRequests.length}
              </span>
            )}
          </button>

          {/* Tab 3: Bank Accounts & Wallets */}
          <button
            onClick={() => setActiveTab('banks')}
            className={`w-full text-right px-4 py-3 rounded-xl text-xs flex justify-between items-center transition-all cursor-pointer ${
              activeTab === 'banks' 
                ? 'bg-gradient-to-l from-emerald-950/40 to-stone-900 border-r-4 border-emerald-500 text-white font-bold shadow' 
                : 'text-stone-300 hover:bg-stone-850'
            }`}
          >
            <span className="flex items-center gap-2">
              <Building2 size={16} className="text-emerald-400" />
              <span>الحسابات والمحافظ البنكية</span>
            </span>
            <span className="text-[10px] bg-stone-800 text-stone-300 px-1.5 py-0.5 rounded font-mono">
              {(database.bankAccounts || []).length}
            </span>
          </button>

          {/* Tab 4: Vendor Balances & Ledger */}
          <button
            onClick={() => setActiveTab('merchantBalances')}
            className={`w-full text-right px-4 py-3 rounded-xl text-xs flex justify-between items-center transition-all cursor-pointer ${
              activeTab === 'merchantBalances' 
                ? 'bg-gradient-to-l from-purple-950/40 to-stone-900 border-r-4 border-purple-400 text-white font-bold shadow' 
                : 'text-stone-300 hover:bg-stone-850'
            }`}
          >
            <span className="flex items-center gap-2">
              <UserCheck size={16} className="text-purple-400" />
              <span>أرصدة ومحافظ التاجرات (دفتر الأستاذ)</span>
            </span>
          </button>

          {/* Tab 5: Store Verification & Documents */}
          <button
            onClick={() => setActiveTab('verification')}
            className={`w-full text-right px-4 py-3 rounded-xl text-xs flex justify-between items-center transition-all cursor-pointer ${
              activeTab === 'verification' 
                ? 'bg-gradient-to-l from-amber-950/40 to-stone-900 border-r-4 border-amber-500 text-white font-bold shadow' 
                : 'text-stone-300 hover:bg-stone-850'
            }`}
          >
            <span className="flex items-center gap-2">
              <ShieldCheck size={16} className="text-amber-500" />
              <span>التحقق واعتماد المتاجر</span>
            </span>
            {database.users.filter(u => u.role === 'vendor' && !u.isVerified && (u.idCardPhoto || u.idCardPhoto2 || u.passportPhoto || u.shopLicensePhoto)).length > 0 && (
              <span className="bg-amber-500 text-stone-950 font-black text-[10px] px-2 py-0.5 rounded-full animate-bounce">
                {database.users.filter(u => u.role === 'vendor' && !u.isVerified && (u.idCardPhoto || u.idCardPhoto2 || u.passportPhoto || u.shopLicensePhoto)).length}
              </span>
            )}
          </button>

          {/* Tab 6: Financial Reports & Analytics */}
          <button
            onClick={() => setActiveTab('payoutStats')}
            className={`w-full text-right px-4 py-3 rounded-xl text-xs flex justify-between items-center transition-all cursor-pointer ${
              activeTab === 'payoutStats' 
                ? 'bg-gradient-to-l from-teal-950/40 to-stone-900 border-r-4 border-teal-400 text-white font-bold shadow' 
                : 'text-stone-300 hover:bg-stone-850'
            }`}
          >
            <span className="flex items-center gap-2">
              <TrendingUp size={16} className="text-teal-400" />
              <span>التقارير المالية والعمولات</span>
            </span>
          </button>

          {/* Tab 7: Shipping Fulfillment */}
          <button
            onClick={() => setActiveTab('shipping')}
            className={`w-full text-right px-4 py-3 rounded-xl text-xs flex justify-between items-center transition-all cursor-pointer ${
              activeTab === 'shipping' 
                ? 'bg-gradient-to-l from-blue-950/40 to-stone-900 border-r-4 border-blue-400 text-white font-bold shadow' 
                : 'text-stone-300 hover:bg-stone-850'
            }`}
          >
            <span className="flex items-center gap-2">
              <Truck size={16} className="text-blue-400" />
              <span>تجهيز وشحن الطرود</span>
            </span>
            {database.orders.filter(o => o.status === 'processing').length > 0 && (
              <span className="bg-blue-400 text-black font-black text-[10px] px-2 py-0.5 rounded-full">
                {database.orders.filter(o => o.status === 'processing').length}
              </span>
            )}
          </button>

          {/* Tab 8: Catalog Review */}
          <button
            onClick={() => setActiveTab('products')}
            className={`w-full text-right px-4 py-3 rounded-xl text-xs flex justify-between items-center transition-all cursor-pointer ${
              activeTab === 'products' 
                ? 'bg-gradient-to-l from-indigo-950/40 to-stone-900 border-r-4 border-indigo-400 text-white font-bold shadow' 
                : 'text-stone-300 hover:bg-stone-850'
            }`}
          >
            <span className="flex items-center gap-2">
              <ShoppingBag size={16} className="text-indigo-400" />
              <span>أدوات المنتجات والأقسام</span>
            </span>
          </button>

          {/* Tab 9: Financial Audit Log */}
          <button
            onClick={() => setActiveTab('audit')}
            className={`w-full text-right px-4 py-3 rounded-xl text-xs flex justify-between items-center transition-all cursor-pointer ${
              activeTab === 'audit' 
                ? 'bg-gradient-to-l from-stone-800 to-stone-900 border-r-4 border-stone-400 text-white font-bold shadow' 
                : 'text-stone-300 hover:bg-stone-850'
            }`}
          >
            <span className="flex items-center gap-2">
              <FileText size={16} className="text-stone-400" />
              <span>سجل الرقابة التدقيقية</span>
            </span>
          </button>
        </div>

        {/* Treasury Quick Stats Box */}
        <div className="bg-stone-950/90 p-4 rounded-xl border border-stone-850 mt-4 space-y-3">
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#D4AF37]">
            <TrendingUp size={14} />
            <span>خزينة النظام والمبيعات</span>
          </div>
          
          <div className="text-[11px] text-stone-400 space-y-2">
            <div className="flex justify-between">
              <span>الفواتير بانتظار التدقيق:</span>
              <span className="font-bold text-amber-500">{pendingConfirmationOrders.length} طلبات</span>
            </div>
            <div className="flex justify-between">
              <span>إجمالي قيمة المبيعات المعتمدة:</span>
              <span className="font-bold text-emerald-400 font-mono">
                {database.orders.filter(o => o.status === 'processing' || o.status === 'shipped' || o.status === 'completed').reduce((sum, o) => sum + o.totalAmount, 0)} ر.ي
              </span>
            </div>
            <div className="flex justify-between">
              <span>أرباح التاجرات المحولة:</span>
              <span className="font-bold text-[#F8C8DC] font-mono">
                {approvedWithdrawalRequests.reduce((sum, r) => sum + r.amount, 0)} ر.ي
              </span>
            </div>
          </div>
        </div>

        {/* Reload Mock Test Data Button */}
        <div className="pt-2">
          <button
            onClick={() => {
              if (window.confirm('هل تريد إعادة تعبئة الحسابات البنكية، والطلبات، وطلبات السحب الوهمية المجهزة للتجربة؟')) {
                const freshDb = resetDatabaseToDefaults();
                onSave(freshDb);
                alert('🎉 تم إعداد وتنشيط الحسابات والبيانات الوهمية للتجربة بنجاح!');
              }
            }}
            className="w-full text-center px-3 py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/10 hover:from-amber-500/30 hover:to-amber-600/20 border border-amber-500/40 text-amber-300 font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
          >
            <Sparkles size={14} className="text-amber-400 animate-pulse" />
            <span>تعبئة / تجديد الحسابات والبيانات الوهمية</span>
          </button>
        </div>
      </div>

      {/* Primary Workstation */}
      <div className="xl:col-span-3 bg-[#1D1D1E] border border-stone-800 rounded-2xl p-6 relative">
        
        {/* TAB 1: Order Receipt Audit */}
        {activeTab === 'orders' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#D4AF37]">غرفة التدقيق والتحقق المالي</h2>
              <p className="text-xs text-stone-400 mt-1">مطابقة صور إيصالات الحوالات والتحقق من تحويلات البنوك اليمنية (الكريمي، البسيري، العمقي، بنك اليمن والكويت، النجم)</p>
            </div>

            {pendingConfirmationOrders.length === 0 ? (
              <div className="bg-stone-900 border border-stone-850 rounded-2xl p-12 text-center text-stone-500 flex flex-col items-center gap-3">
                <Inbox size={48} className="text-stone-700" />
                <p className="text-sm font-bold">لا توجد أي إيصالات حوالات قيد المراجعة حالياً.</p>
                <span className="text-xs text-stone-600">يمكنك محاكاة تسجيل طلب جديد من واجهة المول لتجربة تدقيق الإيصال</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {pendingConfirmationOrders.map(order => (
                  <div key={order.id} className="bg-stone-900 border border-stone-800 rounded-2xl p-5 flex flex-col justify-between hover:scale-[1.01] transition-transform">
                    <div>
                      <div className="flex justify-between items-start border-b border-stone-850 pb-3 mb-3">
                        <div>
                          <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 rounded-full font-bold">بانتظار تأكيد المحاسب</span>
                          <h4 className="font-black text-white text-sm mt-1.5">طلب رقم: #{order.id}</h4>
                        </div>
                        <span className="text-xs font-mono text-stone-400">
                          {new Date(order.createdAt).toLocaleDateString('ar-YE')}
                        </span>
                      </div>

                      <div className="space-y-1.5 text-xs text-stone-300 bg-stone-950 p-3 rounded-xl mb-4">
                        <div>البنك المختار: <span className="font-bold text-[#D4AF37]">{order.bankName}</span></div>
                        <div>رقم التحصيل: <span className="font-mono text-stone-400 select-all">{order.accountNumber}</span></div>
                        <div>هاتف العميل المودع: <span className="text-stone-400 font-bold">{order.customerPhone}</span></div>
                        <div className="border-t border-stone-800 pt-1.5 mt-2 flex justify-between font-bold text-[#F8C8DC]">
                          <span>قيمة الفاتورة الإجمالية:</span>
                          <span>{order.totalAmount} ر.ي</span>
                        </div>
                      </div>

                      {/* Receipt Picture */}
                      <div className="bg-stone-950 p-2 rounded-xl mb-4 text-center border border-stone-850">
                        <span className="block text-[10px] text-stone-500 font-bold mb-1.5">إيصال التحويل المرفوع من العميل:</span>
                        {order.receiptImage ? (
                          <img 
                            src={order.receiptImage} 
                            alt="Receipt" 
                            className="max-h-48 mx-auto object-contain rounded-lg border border-stone-850 cursor-pointer hover:opacity-90 max-w-full"
                            onClick={() => setSelectedOrderForChat(order)}
                          />
                        ) : (
                          <span className="text-xs text-red-400 flex items-center justify-center gap-1 min-h-[100px]">
                            <AlertCircle size={14} /> فاقد للإيصال المالي
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2 mt-auto">
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleConfirmPayment(order.id)}
                          className="flex-1 bg-gradient-to-l from-emerald-600 to-teal-700 hover:from-emerald-500 hover:to-teal-600 text-white font-extrabold py-2 px-3 rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-sm"
                        >
                          <CheckCircle size={14} />
                          <span>تأكيد استلام المبلغ وعماد الطلب</span>
                        </button>

                        <button
                          onClick={() => setSelectedOrderForChat(order)}
                          className="bg-stone-800 hover:bg-stone-750 text-[#F8C8DC] border border-stone-750 p-2 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer"
                          title="شات تحقق مالي"
                        >
                          <MessageSquare size={14} />
                          <span>تواصل مالي</span>
                        </button>
                      </div>

                      <div className="flex gap-1.5 mt-2 border-t border-stone-850 pt-2 text-xs">
                        <input
                          type="text"
                          placeholder="اكتب سبب الرفض/طلب تعميد إضافي..."
                          className="flex-1 bg-stone-950 border border-stone-800 rounded px-2 py-1 text-[11px] text-white"
                          id={`comment_${order.id}`}
                        />
                        <button
                          onClick={() => {
                            const val = (document.getElementById(`comment_${order.id}`) as HTMLInputElement)?.value;
                            handleRejectReceipt(order.id, val || '');
                            if (val) (document.getElementById(`comment_${order.id}`) as HTMLInputElement).value = '';
                          }}
                          className="bg-red-950 text-red-400 hover:bg-red-900 border border-red-900 px-2 rounded text-[10px] font-bold cursor-pointer"
                        >
                          رفض الإيصال
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 2: Vendor Withdrawals */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#F8C8DC]">طلبات سحب مستحقات التاجرات</h2>
              <p className="text-xs text-stone-400 mt-1">اعتماد سحب الأرباح المحررة والمثبتة للتاجرات عبر البنوك اليمنية المسجلة</p>
            </div>

            {activeWithdrawalRequests.length === 0 ? (
              <div className="bg-stone-900 border border-stone-850 rounded-2xl p-12 text-center text-stone-500">
                <FileText size={36} className="mx-auto text-stone-700 mb-2" />
                <p className="text-sm font-bold">لا تتوفر أي طلبات سحب أرباح قيد المراجعة للتاجرات حالياً.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {activeWithdrawalRequests.map(req => (
                  <div key={req.id} className="bg-stone-900 border border-stone-850 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] bg-pink-950 text-pink-400 border border-pink-900 px-2 rounded font-bold">سحب أرباح</span>
                        <span className="font-bold text-white text-sm">#{req.id}</span>
                      </div>
                      <h4 className="font-bold text-[#D4AF37] text-md mt-1.5">التاجرة: {req.vendorName}</h4>
                      
                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-xs text-stone-300 mt-2 font-light">
                        <div>وسيلة الاستلام المحددة: <span className="font-bold text-stone-200">{req.bankName}</span></div>
                        <div>الرصيد المطلوب سحبه: <span className="font-bold text-emerald-400 text-sm">{req.amount} ر.ي</span></div>
                        <div className="col-span-2">إحداثيات الحساب المصرفي للتاجرة: <span className="font-mono text-amber-400 font-bold select-all">{req.accountNumber}</span></div>
                      </div>
                    </div>

                    <div className="flex gap-2 w-full md:w-auto border-t md:border-t-0 border-stone-850 pt-3 md:pt-0">
                      <button
                        onClick={() => handleApproveWithdrawal(req.id)}
                        className="flex-1 md:flex-none bg-gradient-to-l from-emerald-600 to-teal-700 hover:from-emerald-500 text-white font-extrabold px-4 py-2 rounded-lg text-xs transition-colors cursor-pointer shadow"
                      >
                        موافقة وتحويل الأموال ✓
                      </button>
                      <button
                        onClick={() => handleRejectWithdrawal(req.id)}
                        className="flex-1 md:flex-none bg-stone-800 hover:bg-red-950 text-red-400 p-2 px-3 rounded-lg text-xs cursor-pointer border border-stone-700"
                      >
                        رفض السحب ✕
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: Bank Accounts & Wallets Management */}
        {activeTab === 'banks' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-emerald-400 flex items-center gap-2">
                  <Building2 size={24} />
                  <span>الحسابات والمحافظ البنكية المعتمدة</span>
                </h2>
                <p className="text-xs text-stone-400 mt-1">تحديد خيارات التحويل البنكي التي تظهر للعملاء عند إتمام الطلب (الكريمي، البسيري، العمقي، حاسب، النجم...)</p>
              </div>
            </div>

            {/* Add Bank Account Form */}
            <form onSubmit={handleAddBankAccount} className="bg-stone-900 border border-stone-800 rounded-2xl p-5 space-y-4">
              <h3 className="text-xs font-black text-[#D4AF37] uppercase tracking-wider flex items-center gap-1.5">
                <Plus size={16} />
                <span>إضافة حساب أو محفظة بنكية جديدة</span>
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-stone-400 block mb-1 font-bold">اسم البنك / المحفظة *</label>
                  <input
                    type="text"
                    placeholder="مثال: بنك الكريمي الإسلامي"
                    className="w-full bg-stone-950 border border-stone-800 text-white text-xs px-3 py-2 rounded-xl focus:border-[#D4AF37] outline-none"
                    value={newBank.bankName}
                    onChange={e => setNewBank({ ...newBank, bankName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[11px] text-stone-400 block mb-1 font-bold">رقم الحساب / المميز *</label>
                  <input
                    type="text"
                    placeholder="مثال: 300123456"
                    className="w-full bg-stone-950 border border-stone-800 text-white text-xs px-3 py-2 rounded-xl focus:border-[#D4AF37] outline-none font-mono"
                    value={newBank.accountNumber}
                    onChange={e => setNewBank({ ...newBank, accountNumber: e.target.value })}
                  />
                </div>

                <div>
                  <label className="text-[11px] text-stone-400 block mb-1 font-bold">اسم صاحب الحساب</label>
                  <input
                    type="text"
                    placeholder="مثال: المول الرقمي Digital Mall"
                    className="w-full bg-stone-950 border border-stone-800 text-white text-xs px-3 py-2 rounded-xl focus:border-[#D4AF37] outline-none"
                    value={newBank.accountHolder}
                    onChange={e => setNewBank({ ...newBank, accountHolder: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-stone-400 block mb-1 font-bold">ملاحظات أو إرشادات تحويل للعميل</label>
                <input
                  type="text"
                  placeholder="مثال: يرجى إرسال الإشعار بعد التحويل مباشرة برقم المودع"
                  className="w-full bg-stone-950 border border-stone-800 text-white text-xs px-3 py-2 rounded-xl focus:border-[#D4AF37] outline-none"
                  value={newBank.notes}
                  onChange={e => setNewBank({ ...newBank, notes: e.target.value })}
                />
              </div>

              <button
                type="submit"
                className="bg-gradient-to-l from-emerald-600 to-teal-700 hover:from-emerald-500 text-white font-black text-xs px-5 py-2.5 rounded-xl flex items-center gap-2 cursor-pointer shadow"
              >
                <Plus size={16} />
                <span>اعتماد الحساب البنكي الآن</span>
              </button>
            </form>

            {/* List of Active Bank Accounts */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">قائمة الحسابات المتاحة للزبائن ({database.bankAccounts?.length || 0})</h3>
              
              {(!database.bankAccounts || database.bankAccounts.length === 0) ? (
                <div className="bg-stone-900 p-8 rounded-2xl border border-stone-850 text-center text-stone-500 text-xs">
                  لا توجد حسابات بنكية مضافة حالياً. استخدم النموذج أعلاه لإضافة أول بنك.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {database.bankAccounts.map(bank => (
                    <div key={bank.id} className="bg-stone-900 border border-stone-800 rounded-2xl p-4 flex flex-col justify-between space-y-3">
                      {editingBankId === bank.id ? (
                        <div className="space-y-2">
                          <input
                            type="text"
                            value={editBankForm.bankName}
                            onChange={e => setEditBankForm({ ...editBankForm, bankName: e.target.value })}
                            className="w-full bg-stone-950 border border-stone-700 text-white text-xs p-2 rounded"
                          />
                          <input
                            type="text"
                            value={editBankForm.accountNumber}
                            onChange={e => setEditBankForm({ ...editBankForm, accountNumber: e.target.value })}
                            className="w-full bg-stone-950 border border-stone-700 text-white text-xs p-2 rounded font-mono"
                          />
                          <input
                            type="text"
                            value={editBankForm.accountHolder}
                            onChange={e => setEditBankForm({ ...editBankForm, accountHolder: e.target.value })}
                            className="w-full bg-stone-950 border border-stone-700 text-white text-xs p-2 rounded"
                          />
                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => handleSaveEditBankAccount(bank.id)}
                              className="bg-emerald-600 text-white px-3 py-1 rounded text-xs font-bold"
                            >
                              حفظ
                            </button>
                            <button
                              type="button"
                              onClick={() => setEditingBankId(null)}
                              className="bg-stone-800 text-stone-300 px-3 py-1 rounded text-xs"
                            >
                              إلغاء
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div>
                            <div className="flex justify-between items-start">
                              <span className="font-extrabold text-[#D4AF37] text-sm">{bank.bankName}</span>
                              <div className="flex gap-1.5">
                                <button
                                  type="button"
                                  onClick={() => {
                                    setEditingBankId(bank.id);
                                    setEditBankForm({
                                      bankName: bank.bankName,
                                      accountNumber: bank.accountNumber,
                                      accountHolder: bank.accountHolder,
                                      notes: bank.notes || ''
                                    });
                                  }}
                                  className="text-stone-400 hover:text-white p-1"
                                >
                                  <Edit3 size={14} />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleDeleteBankAccount(bank.id)}
                                  className="text-red-400 hover:text-red-300 p-1"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            </div>

                            <div className="mt-2 space-y-1 text-xs text-stone-300">
                              <div>رقم الحساب: <span className="font-mono text-emerald-400 font-bold select-all">{bank.accountNumber}</span></div>
                              <div>اسم المستفيد: <span className="text-stone-200">{bank.accountHolder}</span></div>
                              {bank.notes && <p className="text-[10px] text-stone-500 mt-1 italic">{bank.notes}</p>}
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: Merchant Balances & Ledger */}
        {activeTab === 'merchantBalances' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold text-purple-400 flex items-center gap-2">
                  <UserCheck size={24} />
                  <span>دفتر أستاذ أرصدة التاجرات</span>
                </h2>
                <p className="text-xs text-stone-400 mt-1">متابعة إجمالي مبيعات كل تاجرة، المسحوبات المعتمدة، والرصيد المتبقي المتاح للسحب</p>
              </div>

              <div className="relative">
                <Search size={14} className="absolute top-3 right-3 text-stone-500" />
                <input
                  type="text"
                  placeholder="ابحث باسم التاجرة أو الجوال..."
                  className="bg-stone-900 border border-stone-800 text-white text-xs pr-8 pl-3 py-2 rounded-xl w-60"
                  value={merchantSearch}
                  onChange={e => setMerchantSearch(e.target.value)}
                />
              </div>
            </div>

            <div className="bg-stone-900 border border-stone-850 rounded-2xl overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-stone-950 text-stone-400 font-bold border-b border-stone-800">
                  <tr>
                    <th className="p-3.5">التاجر / المتجر</th>
                    <th className="p-3.5">الهاتف</th>
                    <th className="p-3.5">إجمالي المبيعات</th>
                    <th className="p-3.5">المبالغ المسددة</th>
                    <th className="p-3.5">الطلبات المعلقة</th>
                    <th className="p-3.5">الرصيد المتاح</th>
                    <th className="p-3.5 text-center">إجراءات المحاسب</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-850">
                  {filteredVendors.map(vendor => {
                    // Compute total vendor item sales
                    let totalVendorSales = 0;
                    database.orders.filter(o => o.status === 'shipped' || o.status === 'completed').forEach(o => {
                      (o.items || []).forEach(item => {
                        if (item.product?.vendorId === vendor.id) {
                          totalVendorSales += item.product.price * item.quantity;
                        }
                      });
                    });

                    // Paid withdrawals
                    const paidWithdrawals = database.withdrawalRequests
                      .filter(r => r.vendorId === vendor.id && r.status === 'approved')
                      .reduce((s, r) => s + r.amount, 0);

                    // Pending withdrawals
                    const pendingWithdrawals = database.withdrawalRequests
                      .filter(r => r.vendorId === vendor.id && r.status === 'pending')
                      .reduce((s, r) => s + r.amount, 0);

                    const netAvailable = Math.max(0, totalVendorSales - paidWithdrawals - pendingWithdrawals);

                    return (
                      <tr key={vendor.id} className="hover:bg-stone-850/50 transition-colors">
                        <td className="p-3.5 font-bold text-white">
                          <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-purple-400"></span>
                            <span>{vendor.name}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-stone-400 font-mono">{vendor.phone}</td>
                        <td className="p-3.5 text-emerald-400 font-bold font-mono">{totalVendorSales} ر.ي</td>
                        <td className="p-3.5 text-[#F8C8DC] font-mono">{paidWithdrawals} ر.ي</td>
                        <td className="p-3.5 text-amber-400 font-mono">{pendingWithdrawals} ر.ي</td>
                        <td className="p-3.5 text-[#D4AF37] font-extrabold font-mono">{netAvailable} ر.ي</td>
                        <td className="p-3.5 text-center">
                          <button
                            type="button"
                            onClick={() => {
                              setPayoutVendorModal(vendor);
                              setManualPayoutAmount(netAvailable.toString());
                              setManualPayoutAccount(vendor.bankAccountDetails || '');
                            }}
                            className="bg-gradient-to-l from-emerald-600 to-teal-700 hover:from-emerald-500 text-white font-bold px-3 py-1.5 rounded-lg text-[11px] cursor-pointer"
                          >
                            سداد أرباح 💸
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 5: Store Verification & Document Auditing */}
        {activeTab === 'verification' && (
          <div className="space-y-6 text-right">
            <div>
              <h2 className="text-xl font-bold text-[#D4AF37] flex items-center gap-2">
                <ShieldCheck className="text-amber-500" size={24} />
                <span>غرفة التحقق ومطابقة وثائق التاجرات والمحلات</span>
              </h2>
              <p className="text-xs text-stone-400 mt-1">
                مراجعة الوثائق المرفوعة (الهوية الوطنية، جواز السفر، أو السجل التجاري) واعتماد شارة التوثيق للمتاجر.
              </p>
            </div>

            {/* Filter Controls */}
            <div className="flex gap-2 justify-start border-b border-stone-850 pb-4">
              <button
                type="button"
                onClick={() => setVerificationFilter('pending')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  verificationFilter === 'pending'
                    ? 'bg-amber-500 text-stone-950 font-black shadow'
                    : 'bg-stone-900 text-stone-400 hover:bg-stone-850'
                }`}
              >
                طلبات بانتظار التدقيق والاعتماد ({
                  database.users.filter(u => u.role === 'vendor' && !u.isVerified && (u.idCardPhoto || u.idCardPhoto2 || u.passportPhoto || u.shopLicensePhoto)).length
                })
              </button>
              <button
                type="button"
                onClick={() => setVerificationFilter('verified')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  verificationFilter === 'verified'
                    ? 'bg-emerald-600 text-white shadow'
                    : 'bg-stone-900 text-stone-400 hover:bg-stone-850'
                }`}
              >
                المتاجر الموثقة والمطابقة ({
                  database.users.filter(u => u.role === 'vendor' && u.isVerified).length
                })
              </button>
              <button
                type="button"
                onClick={() => setVerificationFilter('all')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  verificationFilter === 'all'
                    ? 'bg-stone-850 text-white shadow'
                    : 'bg-stone-900 text-stone-400 hover:bg-stone-850'
                }`}
              >
                الكل ({database.users.filter(u => u.role === 'vendor').length})
              </button>
            </div>

            {/* Vendor List */}
            {(() => {
              const vendors = database.users.filter(u => {
                if (u.role !== 'vendor') return false;
                if (verificationFilter === 'pending') {
                  return !u.isVerified && (u.idCardPhoto || u.idCardPhoto2 || u.passportPhoto || u.shopLicensePhoto);
                }
                if (verificationFilter === 'verified') {
                  return !!u.isVerified;
                }
                return true;
              });

              if (vendors.length === 0) {
                return (
                  <div className="bg-stone-900 border border-stone-850 rounded-2xl p-12 text-center text-stone-500 flex flex-col items-center gap-3">
                    <ShieldCheck size={48} className="text-stone-700 animate-pulse" />
                    <p className="text-sm font-bold">لا تتوفر متاجر في هذا القسم حالياً.</p>
                  </div>
                );
              }

              return (
                <div className="space-y-4">
                  {vendors.map(vendor => {
                    const hasAnyDocs = vendor.idCardPhoto || vendor.idCardPhoto2 || vendor.passportPhoto || vendor.shopLicensePhoto;
                    return (
                      <div key={vendor.id} className="bg-stone-900 border border-stone-800 rounded-2xl p-5 hover:scale-[1.005] transition-transform">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-stone-850 pb-4 mb-4">
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-full bg-stone-950 border border-stone-800 flex items-center justify-center overflow-hidden">
                              {vendor.logoImage ? (
                                <img src={vendor.logoImage} alt={vendor.name} className="w-full h-full object-cover" referrerPolicy="no-referrer" />
                              ) : (
                                <span className="text-md font-bold text-[#D4AF37]">{vendor.name ? vendor.name[0] : 'ت'}</span>
                              )}
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-extrabold text-white text-sm">{vendor.name || 'متجر شريك'}</h3>
                                {vendor.isVerified ? (
                                  <span className="text-emerald-400 bg-emerald-950/40 border border-emerald-900/50 text-[9px] px-1.5 py-0.5 rounded-full font-bold">✓ موثق ومعتمد</span>
                                ) : (
                                  <span className="text-amber-500 bg-amber-950/40 border border-amber-900/50 text-[9px] px-1.5 py-0.5 rounded-full font-bold">⏳ بانتظار المراجعة</span>
                                )}
                              </div>
                              <span className="text-xs text-stone-400 font-mono mt-0.5 block">{vendor.phone}</span>
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const updatedUsers = database.users.map(u => {
                                  if (u.id === vendor.id) {
                                    return { ...u, isVerified: true };
                                  }
                                  return u;
                                });
                                logOperation(
                                  currentUser.id,
                                  currentUser.name,
                                  currentUser.role,
                                  'اعتماد وتفعيل توثيق متجر',
                                  `تم توثيق وتعميد المتجر (${vendor.name}) من قبل المحاسب المالي.`
                                );
                                onSave({ ...database, users: updatedUsers });
                                alert(`🎉 تم تفعيل علامة التوثيق لـ (${vendor.name}) بنجاح!`);
                              }}
                              disabled={vendor.isVerified}
                              className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
                                vendor.isVerified
                                  ? 'bg-stone-950 text-stone-600 border border-stone-900 cursor-not-allowed'
                                  : 'bg-gradient-to-l from-emerald-600 to-teal-700 hover:from-emerald-500 text-white shadow'
                              }`}
                            >
                              موافقة واعتماد التوثيق ✓
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                const updatedUsers = database.users.map(u => {
                                  if (u.id === vendor.id) {
                                    return { ...u, isVerified: false };
                                  }
                                  return u;
                                });
                                logOperation(
                                  currentUser.id,
                                  currentUser.name,
                                  currentUser.role,
                                  'إلغاء/تعليق توثيق متجر',
                                  `تم تعليق توثيق المتجر (${vendor.name}) بقرار المحاسب.`
                                );
                                onSave({ ...database, users: updatedUsers });
                                alert(`⚠️ تم تعليق توثيق المتجر (${vendor.name}).`);
                              }}
                              disabled={!vendor.isVerified && !hasAnyDocs}
                              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                                !vendor.isVerified && !hasAnyDocs
                                  ? 'bg-stone-950 text-stone-600 border border-stone-900 cursor-not-allowed'
                                  : 'bg-red-950 hover:bg-red-900 text-red-400 border border-red-900'
                              }`}
                            >
                              رفض / إلغاء ✕
                            </button>
                          </div>
                        </div>

                        {/* Documents */}
                        <div className="space-y-2">
                          <span className="text-[10px] text-stone-400 font-bold block">مستندات الهوية والتحقق المرفوعة:</span>
                          {hasAnyDocs ? (
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                              {vendor.idCardPhoto && (
                                <div className="bg-stone-950 p-2 rounded-xl border border-stone-850 text-center">
                                  <span className="text-[9px] text-stone-400 block mb-1">الهوية الشخصية (1)</span>
                                  <img
                                    src={vendor.idCardPhoto}
                                    alt="ID Front"
                                    className="h-20 w-full object-cover rounded border border-stone-800 cursor-pointer"
                                    onClick={() => setPreviewImage(vendor.idCardPhoto || null)}
                                  />
                                </div>
                              )}
                              {vendor.idCardPhoto2 && (
                                <div className="bg-stone-950 p-2 rounded-xl border border-stone-850 text-center">
                                  <span className="text-[9px] text-[#F8C8DC] block mb-1">الهوية الشخصية (2)</span>
                                  <img
                                    src={vendor.idCardPhoto2}
                                    alt="ID Back"
                                    className="h-20 w-full object-cover rounded border border-stone-800 cursor-pointer"
                                    onClick={() => setPreviewImage(vendor.idCardPhoto2 || null)}
                                  />
                                </div>
                              )}
                              {vendor.passportPhoto && (
                                <div className="bg-stone-950 p-2 rounded-xl border border-stone-850 text-center">
                                  <span className="text-[9px] text-emerald-400 block mb-1">صورة جواز السفر</span>
                                  <img
                                    src={vendor.passportPhoto}
                                    alt="Passport"
                                    className="h-20 w-full object-cover rounded border border-stone-800 cursor-pointer"
                                    onClick={() => setPreviewImage(vendor.passportPhoto || null)}
                                  />
                                </div>
                              )}
                              {vendor.shopLicensePhoto && (
                                <div className="bg-stone-950 p-2 rounded-xl border border-stone-850 text-center">
                                  <span className="text-[9px] text-purple-400 block mb-1">رخصة المحل</span>
                                  <img
                                    src={vendor.shopLicensePhoto}
                                    alt="License"
                                    className="h-20 w-full object-cover rounded border border-stone-800 cursor-pointer"
                                    onClick={() => setPreviewImage(vendor.shopLicensePhoto || null)}
                                  />
                                </div>
                              )}
                            </div>
                          ) : (
                            <div className="bg-stone-950 p-3 rounded-xl border border-stone-850 text-center text-stone-500 text-xs">
                              ⚠️ لم تقم هذه التاجرة برفع أي مستندات ثبوتية بعد.
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* TAB 6: Financial Reports & Commission Breakdown */}
        {activeTab === 'payoutStats' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-teal-400 flex items-center gap-2">
                  <TrendingUp size={24} />
                  <span>التقارير المالية والعمولات المحصلة</span>
                </h2>
                <p className="text-xs text-stone-400 mt-1">كشف حركات الحسابات والمبالغ المتداولة وأرباح التاجرات والمنصة</p>
              </div>

              <button
                type="button"
                onClick={() => window.print()}
                className="bg-stone-850 hover:bg-stone-800 text-stone-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer border border-stone-750"
              >
                <Printer size={14} />
                <span>طباعة / تصدير التقرير</span>
              </button>
            </div>

            {/* Clickable Financial Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Card 1: Gross Sales */}
              <div 
                onClick={() => setSelectedFinancialModal('platformRevenue')}
                className="bg-stone-900 p-5 rounded-2xl border border-stone-800 hover:border-emerald-500 transition-all cursor-pointer relative group"
              >
                <span className="text-[10px] text-stone-400 font-bold block">إجمالي مبيعات المتجر</span>
                <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
                  {database.orders.filter(o => o.status === 'shipped' || o.status === 'completed' || o.status === 'processing').reduce((sum, o) => sum + o.totalAmount, 0)} <span className="text-xs">ر.ي</span>
                </div>
                <span className="text-[9px] text-stone-500 block mt-1.5 flex items-center gap-1 group-hover:text-emerald-300">
                  <span>انقري للاستعراض التفصيلي</span>
                  <ArrowUpRight size={12} />
                </span>
              </div>

              {/* Card 2: Platform Commission */}
              <div 
                onClick={() => setSelectedFinancialModal('commissions')}
                className="bg-stone-900 p-5 rounded-2xl border border-stone-800 hover:border-[#D4AF37] transition-all cursor-pointer relative group"
              >
                <span className="text-[10px] text-stone-400 font-bold block">عمولات المنصة المحصلة (10%)</span>
                <div className="text-2xl font-black text-[#D4AF37] mt-1 font-mono">
                  {Math.round(database.orders.filter(o => o.status === 'shipped' || o.status === 'completed' || o.status === 'processing').reduce((sum, o) => sum + o.totalAmount, 0) * 0.1)} <span className="text-xs">ر.ي</span>
                </div>
                <span className="text-[9px] text-stone-500 block mt-1.5 flex items-center gap-1 group-hover:text-amber-300">
                  <span>انقري لاستعراض عمولات المبيعات</span>
                  <ArrowUpRight size={12} />
                </span>
              </div>

              {/* Card 3: Approved Vendor Payouts */}
              <div 
                onClick={() => setSelectedFinancialModal('approvedWithdrawals')}
                className="bg-stone-900 p-5 rounded-2xl border border-stone-800 hover:border-[#F8C8DC] transition-all cursor-pointer relative group"
              >
                <span className="text-[10px] text-stone-400 font-bold block">مبالغ السحوبات المنفذة للتاجرات</span>
                <div className="text-2xl font-black text-[#F8C8DC] mt-1 font-mono">
                  {approvedWithdrawalRequests.reduce((sum, r) => sum + r.amount, 0)} <span className="text-xs">ر.ي</span>
                </div>
                <span className="text-[9px] text-stone-500 block mt-1.5 flex items-center gap-1 group-hover:text-pink-300">
                  <span>انقري لاستعراض الحوالات المسددة</span>
                  <ArrowUpRight size={12} />
                </span>
              </div>

              {/* Card 4: Pending Payout Requests */}
              <div 
                onClick={() => setSelectedFinancialModal('pendingWithdrawals')}
                className="bg-stone-900 p-5 rounded-2xl border border-stone-800 hover:border-amber-500 transition-all cursor-pointer relative group"
              >
                <span className="text-[10px] text-stone-400 font-bold block">طلبات سحب معلقة بانتظار التحويل</span>
                <div className="text-2xl font-black text-amber-500 mt-1 font-mono">
                  {activeWithdrawalRequests.reduce((sum, r) => sum + r.amount, 0)} <span className="text-xs">ر.ي</span>
                </div>
                <span className="text-[9px] text-stone-500 block mt-1.5 flex items-center gap-1 group-hover:text-amber-300">
                  <span>انقري لمراجعة الطلبات المعلقة</span>
                  <ArrowUpRight size={12} />
                </span>
              </div>
            </div>

            {/* Audit Log Box */}
            <div className="bg-stone-900 border border-stone-850 p-5 rounded-2xl space-y-4">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">📜 سجل الحركات المالية والعمليات المحاسبية</h3>
              
              <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                {database.auditLogs.filter(log => log.actionType.includes('حوالة') || log.actionType.includes('أرباح') || log.actionType.includes('بنك') || log.actionType.includes('سداد')).map(log => (
                  <div key={log.id} className="bg-stone-950 p-3 rounded-xl border border-stone-800/40 text-xs flex justify-between items-center text-right">
                    <div>
                      <div className="font-extrabold text-[#D4AF37]">{log.actionType}</div>
                      <p className="text-stone-400 text-[11px] mt-0.5">{log.details}</p>
                    </div>
                    <span className="text-[10px] font-mono text-stone-500">{new Date(log.timestamp).toLocaleString('ar-YE')}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 7: Shipping Fulfillment */}
        {activeTab === 'shipping' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-blue-400 flex items-center gap-2">
                <Truck size={24} />
                <span>تجهيز وشحن الطرود (إدارة استقبال المبيعات)</span>
              </h2>
              <p className="text-xs text-stone-400 mt-1">تجهيز المشتريات ومطابقة البيانات والربط الفوري مع شركات الشحن المحلية</p>
            </div>

            {database.orders.filter(o => o.status === 'processing').length === 0 ? (
              <div className="bg-stone-900 border border-stone-850 rounded-2xl p-12 text-center text-stone-500">
                <Truck size={36} className="mx-auto text-stone-700 mb-2" />
                <p className="text-sm font-bold">لا توجد طلبات معتمدة بالدفع وبانتظار التجهيز حالياً.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {database.orders.filter(o => o.status === 'processing').map(order => (
                  <div key={order.id} className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex flex-col justify-between space-y-3">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-white text-xs">رقم الطلب: #{order.id}</h4>
                          <span className="text-[10px] text-stone-400">جوال: {order.customerPhone}</span>
                        </div>
                        <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-800 px-2 py-0.5 rounded-full font-bold">جاهز للشحن</span>
                      </div>

                      {order.shippingCompanyName && (
                        <div className="bg-stone-950 p-2 rounded-lg border border-stone-850 text-[11px] mb-2 flex justify-between items-center">
                          <span className="text-stone-400">شركة/خيار الشحن: <b className="text-stone-200">{order.shippingCompanyName}</b></span>
                          {order.shippingFee && <span className="text-[#D4AF37] font-bold">{order.shippingFee.toLocaleString('ar-YE')} ر.ي</span>}
                        </div>
                      )}

                      <div className="border-t border-b border-stone-850 my-2 py-2 text-xs space-y-1 text-stone-300">
                        {(order.items || []).map((item, idx) => (
                          <div key={idx} className="flex justify-between">
                            <span>{item.product.name} × {item.quantity}</span>
                            <span className="text-[#D4AF37] font-bold">{item.product.price * item.quantity} ر.ي</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const updatedOrders = database.orders.map(o => {
                          if (o.id === order.id) {
                            logOperation(
                              currentUser.id,
                              currentUser.name,
                              currentUser.role,
                              'تحديث حالة الطلب إلى مشحون (عبر المحاسب)',
                              `قام الموظف المفوض ${currentUser.name} بتجهيز وشحن الطلب #${o.id}.`
                            );
                            const autoMsg: ChatMessage = {
                              id: `msg_ship_${Date.now()}`,
                              senderId: currentUser.id,
                              senderName: currentUser.name,
                              senderRole: currentUser.role,
                              text: `📦 إشعار شحن: تم تسليم مشترياتكِ لشركة الشحن المعتمدة بنجاح!`,
                              timestamp: new Date().toISOString()
                            };
                            return {
                              ...o,
                              status: 'shipped' as const,
                              updatedAt: new Date().toISOString(),
                              chatMessages: [...o.chatMessages, autoMsg]
                            };
                          }
                          return o;
                        });
                        onSave({ ...database, orders: updatedOrders });
                        alert('تم تحديث حالة الطلب وشحن الطرد بنجاح!');
                      }}
                      className="w-full bg-gradient-to-l from-blue-600 to-indigo-700 hover:from-blue-500 text-white font-bold py-2 rounded-lg text-xs flex items-center justify-center gap-1.5 cursor-pointer shadow"
                    >
                      <Truck size={14} />
                      <span>تسليم طرد الشحن المجهز الآن</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB 8: Products & Categories */}
        {activeTab === 'products' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-xl font-bold text-indigo-400 flex items-center gap-2">
                  <ShoppingBag size={24} />
                  <span>أدوات فهرسة الموديلات والأقسام</span>
                </h2>
                <p className="text-xs text-stone-400 mt-1">عرض السلع، التدقيق في الأسعار وإزالة أي منتجات مخالفة من المول</p>
              </div>
            </div>

            <div className="bg-stone-900 border border-stone-850 p-6 rounded-2xl space-y-4">
              <h3 className="text-sm font-bold text-[#D4AF37]">📋 قائمة المنتجات النشطة بالمول ({database.products.length} منتج)</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-96 overflow-y-auto pr-1">
                {database.products.map(p => {
                  const cat = database.categories.find(c => c.id === p.categoryId);
                  const categoryName = cat ? (cat.name_ar || cat.name) : p.categoryId;
                  return (
                    <div key={p.id} className="bg-stone-950 p-3 rounded-xl border border-stone-800 flex justify-between items-center">
                      <div className="flex items-center gap-3">
                        <img src={p.image || 'https://via.placeholder.com/60'} className="w-10 h-12 object-cover rounded border border-stone-800" alt="" referrerPolicy="no-referrer" />
                        <div>
                          <h4 className="font-bold text-white text-xs">{p.name}</h4>
                          <span className="text-[10px] text-stone-500">القسم: {categoryName}</span>
                          <div className="text-[10px] text-amber-500 font-bold mt-0.5">{p.price} ر.ي</div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const updated = database.products.filter(item => item.id !== p.id);
                          onSave({ ...database, products: updated });
                          alert('تم حذف المنتج من مستودع المتجر بنجاح!');
                        }}
                        className="p-1.5 bg-red-950/40 text-red-400 hover:bg-red-900/60 rounded border border-red-900/30 text-xs cursor-pointer"
                        title="حذف المنتج"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* TAB 9: Full Audit Log */}
        {activeTab === 'audit' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-3">
              <div>
                <h2 className="text-xl font-bold text-stone-300 flex items-center gap-2">
                  <FileText size={24} />
                  <span>سجل الرقابة التدقيقية الكامل للعمليات</span>
                </h2>
                <p className="text-xs text-stone-400 mt-1">تتبع كافة الإجراءات والقرارات الصادرة من المحاسبين والمدراء</p>
              </div>

              <input
                type="text"
                placeholder="تصفية السجل بالكلمة..."
                className="bg-stone-900 border border-stone-800 text-white text-xs px-3 py-1.5 rounded-xl w-52"
                value={auditSearch}
                onChange={e => setAuditSearch(e.target.value)}
              />
            </div>

            <div className="space-y-2 max-h-[500px] overflow-y-auto pr-1">
              {database.auditLogs
                .filter(log => !auditSearch || log.actionType.includes(auditSearch) || log.details.includes(auditSearch) || log.operatorName.includes(auditSearch))
                .map(log => (
                  <div key={log.id} className="bg-stone-900 p-3.5 rounded-xl border border-stone-850 text-xs space-y-1">
                    <div className="flex justify-between text-stone-400">
                      <span className="font-bold text-[#D4AF37]">{log.actionType}</span>
                      <span className="font-mono text-[10px]">{new Date(log.timestamp).toLocaleString('ar-YE')}</span>
                    </div>
                    <p className="text-stone-300 text-[11px]">{log.details}</p>
                    <div className="text-[10px] text-stone-500">المُنفذ: {log.operatorName} ({log.operatorRole})</div>
                  </div>
                ))}
            </div>
          </div>
        )}

      </div>

      {/* VERIFICATION CHAT POPUP MODAL */}
      {selectedOrderForChat && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#181819] border border-stone-800 rounded-2xl w-full max-w-xl h-[550px] flex flex-col overflow-hidden text-right">
            
            {/* Header */}
            <div className="bg-[#2B2326] px-6 py-4 border-b border-stone-850 flex justify-between items-center flex-row-reverse">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-amber-500 flex items-center justify-center text-stone-900 font-black">
                  {selectedOrderForChat.customerPhone.slice(-2)}
                </div>
                <div>
                  <h3 className="font-extrabold text-sm text-[#D4AF37]">قناة التدقيق المالي المباشر للطلب #{selectedOrderForChat.id}</h3>
                  <p className="text-[10px] text-stone-400">الزبون: {selectedOrderForChat.customerPhone}</p>
                </div>
              </div>
              <button 
                onClick={() => setSelectedOrderForChat(null)}
                className="text-stone-300 hover:text-white cursor-pointer font-bold"
              >
                إغلاق ✕
              </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 bg-stone-950 space-y-3 flex flex-col">
              
              <div className="bg-[#1C1C1D] border border-stone-800 rounded-xl p-3 mb-2 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-400 block font-bold">تفاصيل الحوالة المبدئية:</span>
                  <span className="font-bold text-amber-500 text-xs">مبلغ: {selectedOrderForChat.totalAmount} ريال يمني</span>
                  <p className="text-[10px] text-stone-400">البنك المختار: {selectedOrderForChat.bankName}</p>
                </div>
                {selectedOrderForChat.receiptImage && (
                  <img src={selectedOrderForChat.receiptImage} alt="Preview inline" className="w-14 h-18 object-contain rounded border border-stone-800" />
                )}
              </div>

              {selectedOrderForChat.chatMessages.map(msg => {
                const isMyMessage = msg.senderId === currentUser.id;
                return (
                  <div 
                    key={msg.id} 
                    className={`max-w-[80%] rounded-xl p-3 text-xs leading-relaxed ${
                      isMyMessage 
                        ? 'bg-gradient-to-l from-[#3C2D32] to-pink-950/20 text-white mr-auto' 
                        : 'bg-stone-900 text-stone-200 ml-auto'
                    }`}
                  >
                    <div className="flex justify-between items-center gap-4 mb-1">
                      <span className="font-bold text-[10px] text-[#D4AF37]">{isMyMessage ? 'أنت (المحاسب المالي)' : msg.senderName}</span>
                      <span className="text-[9px] text-stone-500">
                        {new Date(msg.timestamp).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    {msg.imageAttachment && (
                      <img src={msg.imageAttachment} alt="Inline attach" className="max-h-40 rounded mt-2 cursor-pointer border border-stone-800" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Form Input */}
            <form onSubmit={handleSendChatMessage} className="p-4 bg-[#1E1E1F] border-t border-stone-850 flex items-center gap-2">
              <input
                type="text"
                placeholder="اكتب رسالة للزبون لطلب إثبات مالي..."
                className="flex-1 bg-stone-950 border border-stone-800 text-stone-200 text-xs px-3 py-2 rounded-lg focus:outline-none focus:border-[#D4AF37]"
                value={chatMessageText}
                onChange={e => setChatMessageText(e.target.value)}
              />

              <label className="p-2 bg-stone-800 hover:bg-stone-750 rounded-lg cursor-pointer text-[#F8C8DC]">
                <ImageIcon size={16} />
                <input 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleImageAttached} 
                />
              </label>

              <button
                type="submit"
                className="bg-[#D4AF37] hover:bg-amber-500 text-black p-2 rounded-lg font-bold cursor-pointer"
              >
                <Send size={16} />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MANUAL PAYOUT VENDOR MODAL */}
      {payoutVendorModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1C1D] border border-stone-800 rounded-2xl w-full max-w-md p-6 text-right space-y-4">
            <div className="flex justify-between items-center border-b border-stone-850 pb-3">
              <h3 className="font-extrabold text-[#D4AF37] text-sm">تسوية وسداد أرباح للتاجرة</h3>
              <button onClick={() => setPayoutVendorModal(null)} className="text-stone-400 hover:text-white">✕</button>
            </div>

            <p className="text-xs text-stone-300">
              تسجيل تحويل وتصفية أرباح للتاجر: <span className="font-bold text-white">{payoutVendorModal.name}</span>
            </p>

            <form onSubmit={handleExecuteManualPayout} className="space-y-3">
              <div>
                <label className="text-[11px] text-stone-400 block mb-1 font-bold">المبلغ المطلوب سداده (ريال يمني) *</label>
                <input
                  type="number"
                  className="w-full bg-stone-950 border border-stone-800 text-emerald-400 font-extrabold text-sm p-2.5 rounded-xl font-mono"
                  value={manualPayoutAmount}
                  onChange={e => setManualPayoutAmount(e.target.value)}
                  placeholder="0.00"
                />
              </div>

              <div>
                <label className="text-[11px] text-stone-400 block mb-1 font-bold">وسيلة التحويل المصرفي *</label>
                <select
                  value={manualPayoutBank}
                  onChange={e => setManualPayoutBank(e.target.value)}
                  className="w-full bg-stone-950 border border-stone-800 text-white text-xs p-2.5 rounded-xl"
                >
                  <option value="الكريمي اكسبرس">الكريمي اكسبرس / حاسب</option>
                  <option value="البسيري للصرافة">البسيري للصرافة</option>
                  <option value="العمقي وإخوانه">العمقي وإخوانه</option>
                  <option value="محفظة كاش">محفظة كاش / جوالي</option>
                  <option value="بنك اليمن والكويت">بنك اليمن والكويت</option>
                  <option value="حوالة شبكة موحدة">حوالة شبكة موحدة</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] text-stone-400 block mb-1 font-bold">رقم الحساب / هاتف المستلم *</label>
                <input
                  type="text"
                  className="w-full bg-stone-950 border border-stone-800 text-white text-xs p-2.5 rounded-xl font-mono"
                  value={manualPayoutAccount}
                  onChange={e => setManualPayoutAccount(e.target.value)}
                  placeholder="رقم الحساب أو الهاتف"
                />
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-gradient-to-l from-emerald-600 to-teal-700 hover:from-emerald-500 text-white font-black text-xs py-2.5 rounded-xl cursor-pointer"
                >
                  تأكيد سداد الأرباح الآن ✓
                </button>
                <button
                  type="button"
                  onClick={() => setPayoutVendorModal(null)}
                  className="bg-stone-800 hover:bg-stone-750 text-stone-300 text-xs px-4 rounded-xl"
                >
                  إلغاء
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* FINANCIAL BREAKDOWN MODAL */}
      {selectedFinancialModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1A1A1B] border border-stone-800 rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col p-6 text-right space-y-4">
            <div className="flex justify-between items-center border-b border-stone-850 pb-3">
              <h3 className="font-extrabold text-[#D4AF37] text-sm flex items-center gap-2">
                <TrendingUp size={18} />
                <span>
                  {selectedFinancialModal === 'commissions' && 'تفاصيل عمولات المنصة المحصلة من المبيعات'}
                  {selectedFinancialModal === 'platformRevenue' && 'تفاصيل إجمالي المبيعات والفواتير المعتمدة'}
                  {selectedFinancialModal === 'approvedWithdrawals' && 'سجل سحوبات التاجرات المسددة بالفعل'}
                  {selectedFinancialModal === 'pendingWithdrawals' && 'طلبات السحب المعلقة بانتظار التحويل'}
                </span>
              </h3>
              <button onClick={() => setSelectedFinancialModal(null)} className="text-stone-400 hover:text-white font-bold cursor-pointer">✕</button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs">
              {selectedFinancialModal === 'commissions' && (
                <div className="space-y-2">
                  <p className="text-stone-400 text-[11px]">يتم احتساب عمولة المنصة البالغة (10%) تلقائياً على كل قطعة مباعة في الطلبات المعالجة والمشحونة:</p>
                  {database.orders.filter(o => o.status === 'shipped' || o.status === 'completed' || o.status === 'processing').map(o => (
                    <div key={o.id} className="bg-stone-950 p-3 rounded-xl border border-stone-850 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-white">طلب #{o.id}</span>
                        <div className="text-[10px] text-stone-400">إجمالي الطلب: {o.totalAmount} ر.ي</div>
                      </div>
                      <div className="text-left font-mono">
                        <span className="text-[10px] text-stone-500 block">عمولة المنصة:</span>
                        <span className="text-[#D4AF37] font-bold text-sm">+{Math.round(o.totalAmount * 0.1)} ر.ي</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {selectedFinancialModal === 'platformRevenue' && (
                <div className="space-y-2">
                  {database.orders.filter(o => o.status === 'shipped' || o.status === 'completed' || o.status === 'processing').map(o => (
                    <div key={o.id} className="bg-stone-950 p-3 rounded-xl border border-stone-850 flex justify-between items-center">
                      <div>
                        <span className="font-bold text-white">فاتورة طلب #{o.id} ({o.bankName})</span>
                        <p className="text-[10px] text-stone-400">جوال العميل: {o.customerPhone}</p>
                      </div>
                      <span className="text-emerald-400 font-bold font-mono text-sm">{o.totalAmount} ر.ي</span>
                    </div>
                  ))}
                </div>
              )}

              {selectedFinancialModal === 'approvedWithdrawals' && (
                <div className="space-y-2">
                  {approvedWithdrawalRequests.length === 0 ? (
                    <div className="text-center text-stone-500 py-8">لا توجد سحوبات مسددة سابقة</div>
                  ) : (
                    approvedWithdrawalRequests.map(r => (
                      <div key={r.id} className="bg-stone-950 p-3 rounded-xl border border-stone-850 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-[#D4AF37]">{r.vendorName}</span>
                          <p className="text-[10px] text-stone-400">{r.bankName} - {r.accountNumber}</p>
                        </div>
                        <span className="text-[#F8C8DC] font-bold font-mono text-sm">{r.amount} ر.ي</span>
                      </div>
                    ))
                  )}
                </div>
              )}

              {selectedFinancialModal === 'pendingWithdrawals' && (
                <div className="space-y-2">
                  {activeWithdrawalRequests.length === 0 ? (
                    <div className="text-center text-stone-500 py-8">لا توجد طلبات سحب معلقة حالياً</div>
                  ) : (
                    activeWithdrawalRequests.map(r => (
                      <div key={r.id} className="bg-stone-950 p-3 rounded-xl border border-stone-850 flex justify-between items-center">
                        <div>
                          <span className="font-bold text-[#D4AF37]">{r.vendorName}</span>
                          <p className="text-[10px] text-stone-400">{r.bankName} - {r.accountNumber}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-amber-400 font-bold font-mono">{r.amount} ر.ي</span>
                          <button
                            onClick={() => {
                              handleApproveWithdrawal(r.id);
                              setSelectedFinancialModal(null);
                            }}
                            className="bg-emerald-600 text-white font-bold px-2.5 py-1 rounded text-[10px] cursor-pointer"
                          >
                            اعتماد وتحويل
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <div className="pt-2 border-t border-stone-850 text-left">
              <button onClick={() => setSelectedFinancialModal(null)} className="bg-stone-800 text-stone-300 px-4 py-1.5 rounded-xl text-xs font-bold">
                إغلاق
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ZOOM LIGHTBOX MODAL */}
      {previewImage && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-md z-50 flex flex-col items-center justify-center p-4 cursor-zoom-out" onClick={() => setPreviewImage(null)}>
          <div className="relative max-w-4xl max-h-[85vh] w-full flex justify-center items-center" onClick={e => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setPreviewImage(null)}
              className="absolute -top-12 right-0 bg-stone-900 text-white font-bold px-4 py-2 rounded-xl hover:bg-stone-800 transition-all border border-stone-850 flex items-center justify-center cursor-pointer text-xs"
            >
              ✕ إغلاق المعاينة
            </button>
            <img
              src={previewImage}
              alt="Scan"
              className="max-w-full max-h-[80vh] object-contain rounded-xl border border-stone-800 shadow-2xl"
              referrerPolicy="no-referrer"
            />
          </div>
        </div>
      )}

    </div>
  );
}
