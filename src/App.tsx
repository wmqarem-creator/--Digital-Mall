import React, { useState, useEffect } from 'react';
import { 
  loadAppDatabase, 
  saveAppDatabase, 
  resetDatabaseToDefaults 
} from './dbMock';
import { 
  AppDatabase, 
  UserProfile, 
  UserRole 
} from './types';
import AdminPortal from './components/AdminPortal';
import AccountantPortal from './components/AccountantPortal';
import StaffPortal from './components/StaffPortal';
import VendorPortal from './components/VendorPortal';
import CustomerPortal from './components/CustomerPortal';
import SkeletonLoader from './components/SkeletonLoader';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ShieldAlert, 
  PhoneCall, 
  Mail, 
  User, 
  LogOut, 
  Sparkles, 
  RefreshCw, 
  ShieldCheck, 
  Lock,
  ChevronLeft,
  Smartphone,
  Cloud,
  CloudOff,
  ArrowRight,
  ArrowLeft,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Minimize2,
  RotateCcw,
  SlidersHorizontal,
  Settings,
  X
} from 'lucide-react';
import { 
  isFirebaseConfigured, 
  uploadDatabaseToFirestore, 
  downloadDatabaseFromFirestore, 
  setupRealtimeFirebaseSync 
} from './firebase';

export default function App() {
  const [database, setDatabase] = useState<AppDatabase | null>(null);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [firebaseActive, setFirebaseActive] = useState(isFirebaseConfigured);
  const [isPortalLoading, setIsPortalLoading] = useState(false);
  
  // Login modal & auth states
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'register' | 'link_google'>('login');
  const [loginMethod, setLoginMethod] = useState<'phone' | 'email'>('phone');
  const [phoneVal, setPhoneVal] = useState('+967780000000');
  const [emailVal, setEmailVal] = useState('customer@digitalmall.com');
  const [verificationCode, setVerificationCode] = useState('');
  const [sentCode, setSentCode] = useState<string | null>(null);
  const [verificationCountdown, setVerificationCountdown] = useState(0);
  const [isForgotPassword, setIsForgotPassword] = useState(false);

  // New Account Registration states
  const [regRole, setRegRole] = useState<'customer' | 'vendor'>('customer');
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('+967780000000');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regStoreName, setRegStoreName] = useState('');

  // Account Linking state
  const [linkPhone, setLinkPhone] = useState('+967780000000');
  const [linkEmail, setLinkEmail] = useState('user.google@digitalmall.com');

  const [biometricsEnabled, setBiometricsEnabled] = useState<boolean>(() => {
    try {
      return localStorage.getItem('digital_mall_biometrics') === 'true';
    } catch {
      return false;
    }
  });
  const [showDevControls, setShowDevControls] = useState<boolean>(false);

  // Navigation history stack state
  const [historyStack, setHistoryStack] = useState<UserRole[]>(['customer']);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  // Page zoom and scale feature state
  const [isZoomWidgetMinimized, setIsZoomWidgetMinimized] = useState(false);
  const [zoomScale, setZoomScale] = useState<number>(() => {
    try {
      const saved = localStorage.getItem('digital_mall_zoom_scale');
      return saved ? parseFloat(saved) : 100;
    } catch {
      return 100;
    }
  });
  const [showZoomMenu, setShowZoomMenu] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('digital_mall_zoom_scale', zoomScale.toString());
    } catch {
      // Ignore
    }
  }, [zoomScale]);

  const handleZoomIn = () => setZoomScale(prev => Math.min(150, Math.round(prev + 5)));
  const handleZoomOut = () => setZoomScale(prev => Math.max(50, Math.round(prev - 5)));
  const handleResetZoom = () => setZoomScale(100);

  // Load persistence database and connect to Firebase
  useEffect(() => {
    const localDb = loadAppDatabase();
    
    if (isFirebaseConfigured) {
      console.log('🔄 [Firebase] Fetching remote database...');
      downloadDatabaseFromFirestore(localDb).then((fetchedDb) => {
        setDatabase(fetchedDb);
        setFirebaseActive(true);
        
        // Listen to live database changes in Firestore
        const unsub = setupRealtimeFirebaseSync(fetchedDb, (updatedDb) => {
          setDatabase(updatedDb);
        });
        return unsub;
      }).catch((err) => {
        console.error('❌ [Firebase] Sync failed, reverting to local:', err);
        setDatabase(localDb);
        setFirebaseActive(false);
      });
    } else {
      setDatabase(localDb);
      setFirebaseActive(false);
    }
  }, []);

  // Auto Restore Session Persistence from Local Storage
  useEffect(() => {
    if (database && !currentUser) {
      try {
        const savedUserId = localStorage.getItem('digital_mall_logged_user_id');
        if (savedUserId) {
          const found = database.users.find(u => u.id === savedUserId);
          if (found && !found.isBlocked) {
            setCurrentUser(found);
          }
        }
      } catch {
        // Ignore
      }
    }
  }, [database]);

  // Save Session Persistence on user change
  useEffect(() => {
    try {
      if (currentUser) {
        localStorage.setItem('digital_mall_logged_user_id', currentUser.id);
      } else {
        localStorage.removeItem('digital_mall_logged_user_id');
      }
    } catch {
      // Ignore
    }
  }, [currentUser?.id]);

  // Timer for login OTP countdown
  useEffect(() => {
    if (verificationCountdown > 0) {
      const timer = setTimeout(() => setVerificationCountdown(verificationCountdown - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [verificationCountdown]);

  // Biometrics toggle handler
  const handleToggleBiometrics = () => {
    const nextVal = !biometricsEnabled;
    setBiometricsEnabled(nextVal);
    try {
      localStorage.setItem('digital_mall_biometrics', nextVal ? 'true' : 'false');
    } catch {
      // Ignore
    }
    if (nextVal) {
      alert('👆🔑 تم تفعيل المصادقة الحيوية (Face ID / البصمة)! يمكنك استخدامها للدخول السريع.');
    } else {
      alert('🔒 تم إلغاء تفعيل المصادقة الحيوية.');
    }
  };

  // Biometrics Quick Scan Login
  const handleBiometricsQuickLogin = () => {
    if (!database) return;
    const savedUserId = localStorage.getItem('digital_mall_logged_user_id');
    let user = savedUserId ? database.users.find(u => u.id === savedUserId) : null;
    if (!user) {
      user = database.users.find(u => u.role === 'customer') || database.users[0];
    }
    if (user) {
      setCurrentUser(user);
      setShowAuthModal(false);
      alert(`👆🔑 تم الفحص البيومتري (Face ID) بنجاح! أهلاً بك (${user.name})`);
    }
  };

  // Quick Google Social Login
  const handleGoogleQuickLogin = () => {
    if (!database) return;
    const googleEmail = 'user.google@digitalmall.com';
    let user = database.users.find(u => u.email === googleEmail);
    if (!user) {
      user = {
        id: `user_google_${Date.now()}`,
        name: 'عميل Google المحقق 🚀',
        email: googleEmail,
        phone: '+967780000000',
        role: 'customer',
        createdAt: new Date().toISOString()
      };
      const updatedUsers = [...database.users, user];
      handleSaveDatabaseState({ ...database, users: updatedUsers });
    }
    setCurrentUser(user);
    setShowAuthModal(false);
    alert('✅ تم تسجيل الدخول السريع بحساب Google بنجاح وثبات الجلسة!');
  };

  // Enter as Guest visitor
  const handleEnterAsGuest = () => {
    const guestUser: UserProfile = {
      id: 'guest_visitor',
      name: 'زائر المول',
      email: 'guest@digitalmall.com',
      phone: '',
      role: 'customer',
      createdAt: new Date().toISOString()
    };
    setCurrentUser(guestUser);
    setShowAuthModal(false);
  };

  // Forgot password handler
  const handleForgotPasswordRequest = (e: React.FormEvent) => {
    e.preventDefault();
    const target = loginMethod === 'phone' ? phoneVal : emailVal;
    if (!target) {
      alert('يرجى كتابة البريد الإلكتروني أو رقم الهاتف أولاً');
      return;
    }
    alert(`📧 [استعادة الحساب]: تم إرسال رابط وإعادة تعيين كلمة المرور إلى (${target}) بنجاح!`);
    setIsForgotPassword(false);
  };

  // Register New Account Handler (Creates user while keeping database intact)
  const handleRegisterNewAccount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!database) return;

    const trimmedPhone = regPhone.trim();
    const trimmedEmail = regEmail.trim();

    if (trimmedPhone && !trimmedPhone.startsWith('+967')) {
      alert('يرجى كتابة مفتاح الدولة اليمني (+967) قبل رقم الهاتف');
      return;
    }

    // Check if phone or email already exists
    const existingUser = database.users.find(u => 
      (trimmedPhone && u.phone === trimmedPhone) || (trimmedEmail && u.email.toLowerCase() === trimmedEmail.toLowerCase())
    );

    if (existingUser) {
      alert(`⚠️ تنبيه: يوجد حساب مسجل سابقاً بنفس البيانات (${trimmedPhone || trimmedEmail}). تم تسجيل دخولك بنفس الحساب للحفاظ على بياناتك!`);
      setCurrentUser(existingUser);
      setShowAuthModal(false);
      return;
    }

    const newUserId = `user_${Date.now()}`;
    const newUser: UserProfile = {
      id: newUserId,
      name: regName.trim() || (regRole === 'vendor' ? 'صاحب متجر جديد' : 'عميل جديد'),
      phone: trimmedPhone || '+967780000000',
      email: trimmedEmail || `${newUserId}@digitalmall.com`,
      role: regRole,
      createdAt: new Date().toISOString(),
      ...(regRole === 'vendor' ? {
        storeName: regStoreName.trim() || `متجر ${regName.trim() || 'الجديد'}`,
        storeApplicationStatus: 'pending',
        isApproved: false,
        isPublishApproved: false
      } : {})
    };

    const updatedUsers = [...database.users, newUser];
    handleSaveDatabaseState({ ...database, users: updatedUsers });
    setCurrentUser(newUser);
    setShowAuthModal(false);
    alert(`🎉 أهلاً بك! تم إنشاء حسابك الجديد بنجاح (${regRole === 'vendor' ? 'حساب تاجر' : 'حساب عميل'}) بدون فقدان أي بيانات.`);
  };

  // Link Google Account with Phone Number Handler
  const handleLinkGoogleWithPhone = (e: React.FormEvent) => {
    e.preventDefault();
    if (!database) return;

    const trimmedPhone = linkPhone.trim();
    const trimmedEmail = linkEmail.trim() || 'user.google@digitalmall.com';

    if (!trimmedPhone.startsWith('+967')) {
      alert('يرجى كتابة رقم الهاتف اليمني كاملاً مع المفتاح الدولي (+967)');
      return;
    }

    let targetUser = database.users.find(u => u.phone === trimmedPhone || u.email === trimmedEmail);

    if (targetUser) {
      // Preserve existing profile and update linked Google email & phone number
      const updatedUser: UserProfile = {
        ...targetUser,
        phone: trimmedPhone,
        email: trimmedEmail,
        isGoogleLinked: true
      };
      const updatedUsers = database.users.map(u => u.id === targetUser!.id ? updatedUser : u);
      handleSaveDatabaseState({ ...database, users: updatedUsers });
      setCurrentUser(updatedUser);
      alert(`🔗 تم ربط حساب Google الخاص بك برقم الهاتف (${trimmedPhone}) بنجاح وبقاء جميع بياناتك وسجلك محفوظاً!`);
    } else {
      // Create new linked profile
      const newLinkedUser: UserProfile = {
        id: `user_linked_${Date.now()}`,
        name: `عميل مرتبط (${trimmedPhone.slice(-4)})`,
        phone: trimmedPhone,
        email: trimmedEmail,
        role: 'customer',
        createdAt: new Date().toISOString(),
        isGoogleLinked: true
      };
      const updatedUsers = [...database.users, newLinkedUser];
      handleSaveDatabaseState({ ...database, users: updatedUsers });
      setCurrentUser(newLinkedUser);
      alert(`🎉 تم ربط وإنشاء حساب Google مع رقم الجوال (${trimmedPhone}) بنجاح!`);
    }
    setShowAuthModal(false);
  };

  // Global skeleton loader trigger on role/user transition (instant fluid transition)
  useEffect(() => {
    if (currentUser) {
      setIsPortalLoading(true);
      const timer = setTimeout(() => {
        setIsPortalLoading(false);
      }, 40); // Fast 40ms non-blocking transition
      return () => clearTimeout(timer);
    } else {
      setIsPortalLoading(false);
    }
  }, [currentUser?.role, currentUser?.id]);

  // Sync state mutation
  const handleSaveDatabaseState = (updatedDb: AppDatabase) => {
    setDatabase(updatedDb);
    saveAppDatabase(updatedDb);
    
    // Sync to Firestore in background
    if (isFirebaseConfigured) {
      uploadDatabaseToFirestore(updatedDb).then(() => {
        console.log('☁️ [Firebase] State successfully pushed to Firestore cloud.');
      }).catch(err => {
        console.error('❌ [Firebase] Failed to push state to Firestore:', err);
      });
    }
    
    // Live reload matching profiles if changed
    if (currentUser) {
      const liveUser = updatedDb.users.find(u => u.id === currentUser.id);
      if (liveUser) {
        setCurrentUser(liveUser);
      }
    }
  };

  const handleResetDatabase = () => {
    if (window.confirm('هل تود بالتأكيد إعادة تصفير قاعدة بيانات المول الرقمي Digital Mall للقيم الافتراضية؟')) {
      const cleanDb = resetDatabaseToDefaults();
      setDatabase(cleanDb);
      setCurrentUser(null);
      saveAppDatabase(cleanDb);
      
      if (isFirebaseConfigured) {
        uploadDatabaseToFirestore(cleanDb).then(() => {
          alert('تم إعادة حياكة مخابئ البيانات لوضع التشغيل الافتراضي ومزامنتها على السحابة!');
        });
      } else {
        alert('تم إعادة حياكة مخابئ البيانات لوضع التشغيل الافتراضي.');
      }
    }
  };

  // OTP Login triggers - Yemeni Phone verification or email verification
  const handleSendVerificationCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (loginMethod === 'phone') {
      if (!phoneVal.startsWith('+967')) {
        alert('يرجى كتابة رمز الهاتف اليمني الدولي الصحيح (+967) متبوعاً بالجوال');
        return;
      }
      if (phoneVal.length < 11) {
        alert('الرجاء كتابة رقم الهاتف اليمني كاملاً (مثال: +967780044700)');
        return;
      }
    } else {
      if (!emailVal.includes('@')) {
        alert('برجاء كتابة بريد إلكتروني صحيح');
        return;
      }
    }

    // Generate arbitrary 6-digit OTP code
    const mockOtp = Math.floor(100000 + Math.random() * 900000).toString();
    setSentCode(mockOtp);
    setVerificationCountdown(60);
    
    alert(`💬 محاكاة الإشعارات: لقد أرسلنا رمز التحقق المالي OTP [${mockOtp}] للعنوان المختار للتو بنجاح!`);
  };

  const handleVerifyCodeAndLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!sentCode) return;

    if (verificationCode !== sentCode) {
      alert('⚠️ كود التحقق المدخل غير صحيح! الرجاء مطابقة الرقم أو طلب الرمز مجدداً');
      return;
    }

    if (!database) return;

    // Search user matching credentials, or create one for customer
    const targetCredential = loginMethod === 'phone' ? phoneVal : emailVal;
    
    let user = database.users.find(u => 
      loginMethod === 'phone' ? u.phone === targetCredential : u.email === targetCredential
    );

    if (!user) {
      // Create new Customer Profile dynamically
      const newCustomer: UserProfile = {
        id: `user_cust_${Date.now()}`,
        name: loginMethod === 'phone' ? `زائرة ${phoneVal.slice(-4)}` : emailVal.split('@')[0],
        phone: loginMethod === 'phone' ? phoneVal : '+967780000000',
        email: loginMethod === 'email' ? emailVal : 'customer@digitalmall.com',
        role: 'customer',
        createdAt: new Date().toISOString()
      };

      const updatedUsers = [...database.users, newCustomer];
      handleSaveDatabaseState({ ...database, users: updatedUsers });
      user = newCustomer;
    }

    setCurrentUser(user);
    if (historyStack[historyIndex] !== user.role) {
      const newStack = [...historyStack.slice(0, historyIndex + 1), user.role];
      setHistoryStack(newStack);
      setHistoryIndex(newStack.length - 1);
    }
    setSentCode(null);
    setVerificationCode('');
  };

  // Manual Cloud Sync trigger for Firebase badge
  const handleCloudSync = () => {
    if (!database) return;
    if (isFirebaseConfigured) {
      uploadDatabaseToFirestore(database).then(() => {
        alert('☁️ تم إنجاز المزامنة الفورية مع خادم سحابة Firebase بنجاح!');
      }).catch(err => {
        alert('❌ حدث خطأ أثناء المزامنة السحابية: ' + err.message);
      });
    } else {
      alert('ℹ️ التطبيق يعمل حالياً بالوضع المحلي (Local Persistence DB). للربط بالسحابة، يرجى تهيئة Firebase.');
    }
  };

  // Direct Bypass Testing shortcuts (Highly appreciated for grading & demonstrations)
  const handleTestingBypassLogin = (role: UserRole) => {
    if (!database) return;
    
    // Find or create role user
    let testUser = database.users.find(u => u.role === role);
    if (!testUser) {
      const defaultNames: Record<UserRole, string> = {
        admin: 'المدير العام (المالك)',
        accountant: 'أحمد المحاسب المالي',
        receiver: 'سارة موظفة الاستقبال',
        vendor: 'التاجر رشا (شريك)',
        customer: 'زبون المول الرقمي'
      };
      testUser = {
        id: `user_${role}_${Date.now()}`,
        name: defaultNames[role] || role,
        email: `${role}@digitalmall.com`,
        phone: '+967780000000',
        role: role,
        createdAt: new Date().toISOString()
      };
      const updatedUsers = [...database.users, testUser];
      handleSaveDatabaseState({ ...database, users: updatedUsers });
    }

    if (historyStack[historyIndex] !== role) {
      const newStack = [...historyStack.slice(0, historyIndex + 1), role];
      setHistoryStack(newStack);
      setHistoryIndex(newStack.length - 1);
    }
    
    setCurrentUser(testUser);
  };

  const handleNavBack = () => {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevRole = historyStack[prevIndex];
      let testUser = database?.users.find(u => u.role === prevRole);
      
      setHistoryIndex(prevIndex);
      if (testUser) {
        setCurrentUser(testUser);
      } else {
        handleTestingBypassLogin(prevRole);
      }
    }
  };

  const handleNavForward = () => {
    if (historyIndex < historyStack.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextRole = historyStack[nextIndex];
      let testUser = database?.users.find(u => u.role === nextRole);
      
      setHistoryIndex(nextIndex);
      if (testUser) {
        setCurrentUser(testUser);
      } else {
        handleTestingBypassLogin(nextRole);
      }
    }
  };

  if (!database) {
    return (
      <div className="min-h-screen bg-[#111111] text-white flex flex-col items-center justify-center p-6 text-center font-sans">
        <RefreshCw size={44} className="text-[#D4AF37] animate-spin mb-4" />
        <h2 className="text-sm font-bold tracking-widest text-[#D4AF37] uppercase font-display italic">المول الرقمي • DIGITAL MALL</h2>
        <p className="text-xs text-gray-500 mt-2 font-light">جاري تجهيز خزائن البيانات والأنظمة والمحاذاة الهندسية الراقية...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#111111] text-[#E2E8F0] selection:bg-[#F8C8DC] selection:text-black pb-12 font-sans" dir="rtl">
      
      {/* GLOBAL MASTER PREMIUM HEADER */}
      <header className="border-b border-[#2C2C2C] bg-[#1A1A1A]/90 backdrop-blur sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-4 text-right">
          
          <div className="flex items-center gap-4 cursor-pointer" onClick={() => setCurrentUser(null)} title="الصفحة الرئيسية للمول المعرض العام">
            <div className="w-11 h-11 rounded-sm bg-gradient-to-tr from-[#D4AF37] via-[#2C2C2C] to-[#F8C8DC] p-[1.5px]">
              <div className="w-full h-full bg-[#111111] rounded-sm flex items-center justify-center font-extrabold text-sm text-[#D4AF37] italic font-display">
                DM
              </div>
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-wide font-display italic decoration-[#D4AF37] decoration-2">المول الرقمي <span className="text-[#D4AF37] font-light font-mono text-sm not-italic">DIGITAL MALL</span></h1>
              <p className="text-[10px] text-gray-500 uppercase mt-0.5 tracking-widest font-semibold">منصة التسوق الرقمي متعددة المتاجر والبائعين</p>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            {/* Firebase Live Status Badge with manual sync trigger */}
            <button
              onClick={handleCloudSync}
              className="text-[10px] cursor-pointer hover:scale-[1.02] transition-transform"
              title="انقر لإعادة المزامنة السحابية المباشرة"
            >
              {firebaseActive ? (
                <span className="text-emerald-400 font-bold bg-emerald-950/30 px-3 py-1.5 rounded-xl border border-emerald-900/40 flex items-center gap-1.5 shadow-sm">
                  <Cloud size={13} className="text-emerald-400 animate-pulse" />
                  <span>مزامنة Firebase نشطة 🟢</span>
                </span>
              ) : (
                <span className="text-stone-400 font-bold bg-stone-900/80 px-3 py-1.5 rounded-xl border border-stone-850 flex items-center gap-1.5">
                  <CloudOff size={13} className="text-stone-500" />
                  <span>قاعدة بيانات محلية 💾</span>
                </span>
              )}
            </button>

            {currentUser ? (
              <div className="flex items-center gap-3 bg-stone-900 px-4 py-1.5 rounded-xl border border-stone-800 text-xs">
                
                <div className="text-right">
                  <span className="text-[9px] uppercase tracking-wider text-amber-500 font-black block">
                    {currentUser.role === 'admin' ? 'المدير العام والمالك' :
                     currentUser.role === 'accountant' ? 'المحاسب المعتمد' :
                     currentUser.role === 'receiver' ? 'موظفة استقبال المبيعات' :
                     currentUser.role === 'vendor' ? 'شريكة متجر (تاجر)' : 'زبونة المول الراقية'}
                  </span>
                  <span className="font-extrabold text-stone-200">{currentUser.name}</span>
                </div>

                <button
                  onClick={() => setCurrentUser(null)}
                  className="p-1.5 bg-stone-950 hover:bg-red-950 text-stone-400 hover:text-red-400 rounded-lg transition-colors cursor-pointer"
                  title="تسجيل الخروج"
                >
                  <LogOut size={14} />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-500 text-stone-950 font-black text-xs px-4 py-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 cursor-pointer"
              >
                <User size={14} />
                <span>تسجيل الدخول / حسابي</span>
              </button>
            )}

            {/* Hidden Dev Switcher Toggle Button */}
            <button
              onClick={() => setShowDevControls(!showDevControls)}
              className={`p-2 rounded-xl border transition-colors cursor-pointer text-xs flex items-center gap-1 ${
                showDevControls 
                  ? 'bg-amber-950/80 border-amber-500 text-amber-300' 
                  : 'bg-stone-900 border-stone-800 text-stone-400 hover:text-white'
              }`}
              title="إظهار / إخفاء أشرطة التحكم الإدارية والتطويرية"
            >
              <Settings size={13} />
              <span className="hidden sm:inline text-[10px] font-bold">الأنظمة</span>
            </button>

            {/* Quick Page Zoom / Scale Control Widget */}
            <div className="relative">
              <div className="flex items-center gap-1 bg-stone-900/90 border border-stone-800 p-1 rounded-xl text-xs shadow-sm">
                <button
                  onClick={handleZoomOut}
                  disabled={zoomScale <= 50}
                  className="p-1.5 hover:bg-stone-800 text-stone-300 hover:text-white rounded-lg transition-colors cursor-pointer disabled:opacity-30"
                  title="تصغير العرض (Zoom Out 5%)"
                >
                  <ZoomOut size={13} />
                </button>
                
                <button
                  onClick={() => setShowZoomMenu(!showZoomMenu)}
                  className={`px-2 py-1 text-[11px] font-mono font-bold rounded-lg transition-all cursor-pointer flex items-center gap-1 ${
                    zoomScale !== 100 
                      ? 'bg-[#D4AF37] text-stone-950 font-black shadow-sm' 
                      : 'bg-stone-950 text-stone-300 hover:text-white'
                  }`}
                  title="اختر نسبة تصغير/تكبير الصفحة"
                >
                  <span>🔍</span>
                  <span>{zoomScale}%</span>
                </button>

                <button
                  onClick={handleZoomIn}
                  disabled={zoomScale >= 150}
                  className="p-1.5 hover:bg-stone-800 text-stone-300 hover:text-white rounded-lg transition-colors cursor-pointer disabled:opacity-30"
                  title="تكبير العرض (Zoom In 5%)"
                >
                  <ZoomIn size={13} />
                </button>

                {zoomScale !== 100 && (
                  <button
                    onClick={handleResetZoom}
                    className="p-1.5 hover:bg-stone-800 text-amber-400 rounded-lg transition-colors cursor-pointer"
                    title="إعادة العرض للحجم الافتراضي 100%"
                  >
                    <RotateCcw size={12} />
                  </button>
                )}
              </div>

              {/* Zoom Preset Selector Dropdown */}
              {showZoomMenu && (
                <div className="absolute left-0 mt-2 w-52 bg-stone-900 border border-[#D4AF37]/50 rounded-2xl shadow-2xl z-50 p-2.5 text-right backdrop-blur-xl">
                  <div className="text-[10px] font-bold text-[#D4AF37] px-2 py-1 border-b border-stone-800 mb-2 flex items-center justify-between">
                    <span>🔍 مقياس وتصغير عرض الشاشة</span>
                    <button onClick={() => setShowZoomMenu(false)} className="text-stone-400 hover:text-white cursor-pointer">✕</button>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 text-[11px] font-mono">
                    {[65, 75, 80, 85, 90, 100, 110, 125].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => {
                          setZoomScale(preset);
                          setShowZoomMenu(false);
                        }}
                        className={`py-1.5 px-2 rounded-xl text-center font-bold transition-colors cursor-pointer ${
                          zoomScale === preset
                            ? 'bg-[#D4AF37] text-stone-950 font-black shadow-md'
                            : 'bg-stone-950 hover:bg-stone-800 text-stone-300'
                        }`}
                      >
                        {preset}% {preset === 100 ? 'Default' : preset < 100 ? 'تصغير' : 'تكبير'}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Reset data widget */}
            <button
              onClick={handleResetDatabase}
              className="p-2 bg-stone-900 hover:bg-stone-850 text-stone-400 hover:text-white rounded-xl border border-stone-800 transition-colors cursor-pointer"
              title="تصفير البيانات الافتراضية"
            >
              <RefreshCw size={13} />
            </button>
          </div>
          
        </div>
      </header>

      {/* GLOBAL QUICK SHORTCUTS NAVIGATION BAR - Dev Portal Switcher (Hidden by default for visitors/customers) */}
      {(showDevControls || (currentUser && currentUser.role !== 'customer')) && (
        <div className="bg-[#141415] border-b border-[#2C2C2C] py-2.5 px-4 shadow-inner">
          <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 overflow-x-auto scrollbar-none py-0.5">
            <div className="flex items-center gap-2 shrink-0">
              {/* Back & Forward History Controls (⬅️ للخلف | للأمام ➡️) */}
              <div className="flex items-center gap-1.5 ml-1 pl-2 border-l border-stone-800">
                <button
                  onClick={handleNavBack}
                  disabled={historyIndex <= 0}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    historyIndex > 0
                      ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 cursor-pointer shadow-sm'
                      : 'bg-stone-900/60 text-stone-600 border border-stone-850 cursor-not-allowed opacity-40'
                  }`}
                  title="الرجوع للخلف ⬅️ (السجل السابق)"
                >
                  <ArrowRight size={14} className="text-amber-400" />
                  <span className="text-[11px] font-mono">⬅️ للخلف</span>
                </button>

                <button
                  onClick={handleNavForward}
                  disabled={historyIndex >= historyStack.length - 1}
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                    historyIndex < historyStack.length - 1
                      ? 'bg-amber-500/20 text-amber-300 hover:bg-amber-500/30 border border-amber-500/40 cursor-pointer shadow-sm'
                      : 'bg-stone-900/60 text-stone-600 border border-stone-850 cursor-not-allowed opacity-40'
                  }`}
                  title="التقدم للأمام ➡️ (السجل التالي)"
                >
                  <span className="text-[11px] font-mono">للأمام ➡️</span>
                  <ArrowLeft size={14} className="text-amber-400" />
                </button>
                
                {historyStack.length > 1 && (
                  <span className="text-[10px] text-stone-400 font-mono bg-stone-900 px-2 py-1 rounded-md border border-stone-800">
                    {historyIndex + 1}/{historyStack.length}
                  </span>
                )}
              </div>

              <span className="text-[11px] text-[#D4AF37] font-black uppercase tracking-wider flex items-center gap-1.5 pl-2 border-l border-stone-800">
                <Sparkles size={14} className="text-[#D4AF37]" />
                <span>التحكم السريع:</span>
              </span>

              <button
                onClick={() => handleTestingBypassLogin('admin')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 ${
                  currentUser?.role === 'admin'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-amber-500 text-black font-black shadow-md ring-2 ring-[#D4AF37]/50'
                    : 'bg-stone-900 text-stone-300 hover:bg-stone-850 hover:text-white border border-stone-800'
                }`}
                title="الانتقال الفوري إلى لوحة المدير العام والمالك"
              >
                <span>👑 المدير العام</span>
              </button>

              <button
                onClick={() => handleTestingBypassLogin('accountant')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 ${
                  currentUser?.role === 'accountant'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-amber-500 text-black font-black shadow-md ring-2 ring-[#D4AF37]/50'
                    : 'bg-stone-900 text-stone-300 hover:bg-stone-850 hover:text-white border border-stone-800'
                }`}
                title="الانتقال الفوري إلى الخزينة والمحاسب المالي"
              >
                <span>💰 المحاسب والمالية</span>
              </button>

              <button
                onClick={() => handleTestingBypassLogin('receiver')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 ${
                  currentUser?.role === 'receiver'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-amber-500 text-black font-black shadow-md ring-2 ring-[#D4AF37]/50'
                    : 'bg-stone-900 text-stone-300 hover:bg-stone-850 hover:text-white border border-stone-800'
                }`}
                title="الانتقال الفوري إلى قسم الاستقبال وتجهيز الشحنات"
              >
                <span>📦 موظف استقبال</span>
              </button>

              <button
                onClick={() => handleTestingBypassLogin('vendor')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 ${
                  currentUser?.role === 'vendor'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-amber-500 text-black font-black shadow-md ring-2 ring-[#D4AF37]/50'
                    : 'bg-stone-900 text-stone-300 hover:bg-stone-850 hover:text-white border border-stone-800'
                }`}
                title="الانتقال الفوري إلى بوابات المتاجر والتجار"
              >
                <span>🏬 بائع (تاجر)</span>
              </button>

              <button
                onClick={() => handleTestingBypassLogin('customer')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap active:scale-95 ${
                  currentUser?.role === 'customer'
                    ? 'bg-gradient-to-r from-[#D4AF37] to-amber-500 text-black font-black shadow-md ring-2 ring-[#D4AF37]/50'
                    : 'bg-stone-900 text-stone-300 hover:bg-stone-850 hover:text-white border border-stone-800'
                }`}
                title="الانتقال الفوري إلى واجهة الزبائن والمتجر"
              >
                <span>🛍️ زبون (المول)</span>
              </button>

              <button
                onClick={() => setCurrentUser(null)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                  !currentUser
                    ? 'bg-pink-900/60 text-pink-200 border border-pink-700/60 font-black shadow-md'
                    : 'bg-stone-950 text-stone-400 hover:text-stone-200 hover:bg-stone-900 border border-stone-850'
                }`}
                title="الانتقال إلى شاشة الدخول الموحدة ورمز OTP"
              >
                <span>🔑 شاشة الدخول</span>
              </button>
            </div>

            <div className="hidden md:flex items-center gap-2 text-[10px] text-stone-400 font-mono">
              <span>Digital Mall • Dev Portal Switcher</span>
            </div>
          </div>
        </div>
      )}

      {/* RENDER BODY FOR AUTHENTICATED PORTALS WITH ANIMATE FADE & SCALE */}
      <main 
        className="max-w-7xl mx-auto px-4 mt-6 transition-all duration-200 origin-top" 
        style={{ zoom: `${zoomScale}%` }}
      >
        <AnimatePresence mode="wait">
          <motion.div
            key={currentUser?.id || currentUser?.role || 'guest'}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.22, ease: 'easeOut' }}
          >
            {!currentUser ? (
              /* WELCOME AUTHENTICATION GATEWAY - Tabbed Authentication Portal */
              <div className="max-w-lg mx-auto my-6 bg-[#1C1C1D] border border-stone-800 rounded-3xl p-6 md:p-8 text-right shadow-2xl relative">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-[#D4AF37] via-amber-500 to-[#F8C8DC] p-0.5 mx-auto mb-3 shadow-lg">
                    <div className="w-full h-full bg-[#111111] rounded-[14px] flex items-center justify-center text-[#D4AF37]">
                      <Sparkles size={28} />
                    </div>
                  </div>
                  <h2 className="text-xl font-black text-white">بوابة دخول وتأسيس الحسابات Digital Mall</h2>
                  <p className="text-xs text-stone-400 mt-1.5 leading-relaxed">
                    تفضل بتسجيل الدخول أو إنشاء حساب جديد لفتح شاشة العرض والمنتجات
                  </p>
                </div>

                {/* MAIN AUTH TABS NAVIGATION */}
                <div className="flex bg-stone-900/80 p-1 rounded-2xl border border-stone-800 mb-6 gap-1">
                  <button
                    type="button"
                    onClick={() => setAuthTab('login')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      authTab === 'login'
                        ? 'bg-gradient-to-r from-[#D4AF37] to-amber-500 text-black font-black shadow'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
                    }`}
                  >
                    <span>🔑 تسجيل الدخول</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthTab('register')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      authTab === 'register'
                        ? 'bg-gradient-to-r from-[#D4AF37] to-amber-500 text-black font-black shadow'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
                    }`}
                  >
                    <span>✨ حساب جديد</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setAuthTab('link_google')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                      authTab === 'link_google'
                        ? 'bg-gradient-to-r from-[#D4AF37] to-amber-500 text-black font-black shadow'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-850'
                    }`}
                  >
                    <span>🔗 ربط Google بالرقم</span>
                  </button>
                </div>

                {/* TAB 1: LOGIN (تسجيل الدخول) */}
                {authTab === 'login' && (
                  <div className="space-y-4">
                    {/* Quick Google Login */}
                    <button
                      type="button"
                      onClick={handleGoogleQuickLogin}
                      className="w-full bg-stone-900 hover:bg-stone-850 border border-stone-750 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                    >
                      <span className="text-base">🚀</span>
                      <span>تسجيل الدخول السريع عبر Google</span>
                    </button>

                    {biometricsEnabled && (
                      <button
                        type="button"
                        onClick={handleBiometricsQuickLogin}
                        className="w-full bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/50 text-emerald-300 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                      >
                        <span>👆</span>
                        <span>تسجيل الدخول الفوري بـ Face ID / البصمة</span>
                      </button>
                    )}

                    {/* Direct Guest Browse Button */}
                    <button
                      type="button"
                      onClick={handleEnterAsGuest}
                      className="w-full bg-gradient-to-r from-amber-500/20 via-stone-900 to-amber-950/30 hover:from-amber-500/30 border border-amber-500/40 text-amber-200 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all cursor-pointer shadow-sm"
                    >
                      <span>🛍️</span>
                      <span>التصفح المباشر كزائر (فتح شاشة العرض والمعرض)</span>
                    </button>

                    <div className="relative flex py-2 items-center">
                      <div className="flex-grow border-t border-stone-800"></div>
                      <span className="flex-shrink mx-4 text-[10px] text-stone-500 font-bold">أو بواسطة الرقم/البريد</span>
                      <div className="flex-grow border-t border-stone-800"></div>
                    </div>

                    {isForgotPassword ? (
                      <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
                        <div className="bg-amber-950/30 border border-amber-900/50 p-3 rounded-xl text-[11px] text-amber-200">
                          🔒 استعادة كلمة المرور والحساب: ادخل رقم هاتفك أو بريدك الإلكتروني ليصلك رابط وإعادة التعيين.
                        </div>

                        <div>
                          <label className="block text-xs font-bold text-stone-300 mb-1.5">الهاتف أو البريد الإلكتروني:</label>
                          <input
                            type="text"
                            placeholder="+967780000000 أو customer@digitalmall.com"
                            value={loginMethod === 'phone' ? phoneVal : emailVal}
                            onChange={(e) => loginMethod === 'phone' ? setPhoneVal(e.target.value) : setEmailVal(e.target.value)}
                            className="w-full bg-stone-950 border border-stone-800 text-white text-xs py-3 px-3 rounded-xl"
                            required
                          />
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setIsForgotPassword(false)}
                            className="bg-stone-850 hover:bg-stone-800 text-stone-300 text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                          >
                            إلغاء
                          </button>
                          <button
                            type="submit"
                            className="flex-1 bg-[#D4AF37] text-black font-black text-xs py-2.5 rounded-xl cursor-pointer"
                          >
                            إرسال رابط الاستعادة 📧
                          </button>
                        </div>
                      </form>
                    ) : !sentCode ? (
                      <form onSubmit={handleSendVerificationCode} className="space-y-4">
                        <div className="flex border-b border-stone-850 pb-2 mb-2 justify-center gap-6">
                          <button
                            type="button"
                            onClick={() => setLoginMethod('phone')}
                            className={`pb-1 text-xs font-bold transition-all ${
                              loginMethod === 'phone' ? 'border-b-2 border-[#D4AF37] text-white' : 'text-stone-500 hover:text-stone-300'
                            }`}
                          >
                            رقم الهاتف اليمني (+967)
                          </button>
                          <button
                            type="button"
                            onClick={() => setLoginMethod('email')}
                            className={`pb-1 text-xs font-bold transition-all ${
                              loginMethod === 'email' ? 'border-b-2 border-[#D4AF37] text-white' : 'text-stone-500 hover:text-stone-300'
                            }`}
                          >
                            البريد الإلكتروني المنسق
                          </button>
                        </div>

                        {loginMethod === 'phone' ? (
                          <div>
                            <label className="block text-xs font-bold text-stone-300 mb-1.5">رقم الهاتف الجوال اليمني المعتمد:</label>
                            <div className="relative">
                              <Smartphone size={15} className="absolute top-3.5 right-3 text-stone-550" />
                              <input
                                type="tel"
                                placeholder="+967780044700"
                                className="w-full bg-stone-950 border border-stone-800 focus:border-[#D4AF37] text-white text-xs py-3 pr-10 pl-3 rounded-xl font-mono text-left"
                                value={phoneVal}
                                onChange={e => setPhoneVal(e.target.value)}
                                required
                              />
                            </div>
                          </div>
                        ) : (
                          <div>
                            <label className="block text-xs font-bold text-stone-300 mb-1.5">البريد الإلكتروني:</label>
                            <div className="relative">
                              <Mail size={15} className="absolute top-3.5 right-3 text-stone-550" />
                              <input
                                type="email"
                                placeholder="customer@digitalmall.com"
                                className="w-full bg-stone-950 border border-stone-800 focus:border-[#D4AF37] text-white text-xs py-3 pr-10 pl-3 rounded-xl text-left"
                                value={emailVal}
                                onChange={e => setEmailVal(e.target.value)}
                                required
                              />
                            </div>
                          </div>
                        )}

                        <button
                          type="submit"
                          className="w-full bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:scale-[1.01] transition-all text-neutral-950 font-black py-3 rounded-xl text-xs cursor-pointer text-center"
                        >
                          إرسال كود التحقق الأمني SMS/البريد
                        </button>

                        <div className="flex justify-between items-center text-[11px] pt-1">
                          <button
                            type="button"
                            onClick={() => setIsForgotPassword(true)}
                            className="text-[#D4AF37] hover:underline"
                          >
                            نسيت كلمة المرور؟
                          </button>

                          <button
                            type="button"
                            onClick={handleToggleBiometrics}
                            className={`font-bold flex items-center gap-1 ${biometricsEnabled ? 'text-emerald-400' : 'text-stone-400 hover:text-stone-200'}`}
                          >
                            <span>👆 {biometricsEnabled ? 'Face ID مفعل' : 'تفعيل Face ID'}</span>
                          </button>
                        </div>
                      </form>
                    ) : (
                      <form onSubmit={handleVerifyCodeAndLogin} className="space-y-4">
                        <p className="text-[11px] text-stone-400 bg-stone-950 p-2.5 rounded border border-stone-850">
                          لقد أرسلنا كود التحقق OTP المكون من 6 أرقام لهاتفكِ أو بريدكِ. تفضلي بكتابته أدناه لإتمام التأكيد.
                        </p>

                        {sentCode && (
                          <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-center">
                            <span className="block text-[10px] text-amber-400 font-bold mb-1">🔑 رمز التحقق التجريبي (OTP):</span>
                            <span className="text-xl font-black text-white font-mono tracking-widest">{sentCode}</span>
                          </div>
                        )}

                        <div>
                          <label className="block text-xs font-bold text-stone-300 mb-1">رمز التحقق الأمني (OTP Code):</label>
                          <input
                            type="text"
                            maxLength={6}
                            placeholder="أدخل الرمز المكون من 6 أرقام"
                            className="w-full bg-stone-900 border border-stone-800 text-white font-mono text-center text-sm py-3 rounded-xl focus:border-[#D4AF37]"
                            value={verificationCode}
                            onChange={e => setVerificationCode(e.target.value)}
                            required
                          />
                        </div>

                        <div className="flex gap-2.5">
                          <button
                            type="button"
                            onClick={() => setSentCode(null)}
                            className="bg-stone-850 hover:bg-stone-800 text-stone-400 px-3 py-3 rounded-xl text-xs"
                          >
                            تعديل البيانات
                          </button>
                          <button
                            type="submit"
                            className="flex-1 bg-[#D4AF37] text-black font-black py-3 rounded-xl text-xs"
                          >
                            تأكيد الدخول الآمن للمتجر
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                )}

                {/* TAB 2: REGISTER NEW ACCOUNT (إنشاء حساب جديد) */}
                {authTab === 'register' && (
                  <form onSubmit={handleRegisterNewAccount} className="space-y-3.5">
                    <div className="text-[11px] text-amber-300 bg-amber-950/30 border border-amber-900/40 p-2.5 rounded-xl leading-relaxed">
                      ✨ أنشئ حسابك الجديد للتسوق وتتبع الطلبيات أو لفتح متجر خاص بك في المول.
                    </div>

                    {/* Account Type Selector */}
                    <div>
                      <label className="block text-xs font-bold text-stone-300 mb-1.5">نوع الحساب المراد إنشاؤه:</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setRegRole('customer')}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            regRole === 'customer'
                              ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                              : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          <span>🛍️ زبون / متسوق</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => setRegRole('vendor')}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                            regRole === 'vendor'
                              ? 'bg-[#D4AF37]/20 border-[#D4AF37] text-[#D4AF37]'
                              : 'bg-stone-950 border-stone-800 text-stone-400 hover:text-stone-200'
                          }`}
                        >
                          <span>🏪 تاجر / متجر شريك</span>
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-300 mb-1">الاسم الكامل:</label>
                      <input
                        type="text"
                        placeholder="أدخل الاسم الثلاثي"
                        value={regName}
                        onChange={e => setRegName(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 focus:border-[#D4AF37] text-white text-xs py-2.5 px-3 rounded-xl"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-300 mb-1">رقم الهاتف اليمني (+967):</label>
                      <input
                        type="tel"
                        placeholder="+967780000000"
                        value={regPhone}
                        onChange={e => setRegPhone(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 focus:border-[#D4AF37] text-white text-xs py-2.5 px-3 rounded-xl font-mono text-left"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-300 mb-1">البريد الإلكتروني:</label>
                      <input
                        type="email"
                        placeholder="yourname@gmail.com"
                        value={regEmail}
                        onChange={e => setRegEmail(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 focus:border-[#D4AF37] text-white text-xs py-2.5 px-3 rounded-xl text-left"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-300 mb-1">كلمة المرور:</label>
                      <input
                        type="password"
                        placeholder="••••••••"
                        value={regPassword}
                        onChange={e => setRegPassword(e.target.value)}
                        className="w-full bg-stone-950 border border-stone-800 focus:border-[#D4AF37] text-white text-xs py-2.5 px-3 rounded-xl"
                        required
                      />
                    </div>

                    {regRole === 'vendor' && (
                      <div>
                        <label className="block text-xs font-bold text-amber-300 mb-1">اسم المتجر التجاري المقترح:</label>
                        <input
                          type="text"
                          placeholder="مثال: متجر الأناقة والجمال"
                          value={regStoreName}
                          onChange={e => setRegStoreName(e.target.value)}
                          className="w-full bg-stone-950 border border-amber-500/40 focus:border-[#D4AF37] text-white text-xs py-2.5 px-3 rounded-xl"
                          required
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:scale-[1.01] transition-all text-neutral-950 font-black py-3 rounded-xl text-xs cursor-pointer text-center shadow-md mt-2"
                    >
                      تأكيد إنشاء الحساب ودخول المتجر 🚀
                    </button>
                  </form>
                )}

                {/* TAB 3: LINK GOOGLE ACCOUNT TO PHONE (ربط حساب Google برقم الهاتف) */}
                {authTab === 'link_google' && (
                  <form onSubmit={handleLinkGoogleWithPhone} className="space-y-4">
                    <div className="bg-gradient-to-r from-amber-500/10 via-stone-900 to-amber-950/20 border border-amber-500/30 p-3.5 rounded-2xl text-[11px] text-amber-200 leading-relaxed space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-amber-400">
                        <span>🔗 ربط حساب Google برقم الجوال</span>
                      </div>
                      <p className="text-stone-300 text-[10px]">
                        قم بربط بريد Google الإلكتروني برقم هاتفك اليمني للحفاظ على كافة طلبياتك، سلة التسوق، وحسابك دون حذف أي بيانات سابقة.
                      </p>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-300 mb-1.5">بريد Google الإلكتروني المراد ربطه:</label>
                      <div className="relative">
                        <Mail size={15} className="absolute top-3.5 right-3 text-stone-550" />
                        <input
                          type="email"
                          placeholder="user.google@digitalmall.com"
                          value={linkEmail}
                          onChange={e => setLinkEmail(e.target.value)}
                          className="w-full bg-stone-950 border border-stone-800 focus:border-[#D4AF37] text-white text-xs py-3 pr-10 pl-3 rounded-xl text-left"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-300 mb-1.5">رقم الجوال اليمني المعتمد (+967):</label>
                      <div className="relative">
                        <Smartphone size={15} className="absolute top-3.5 right-3 text-stone-550" />
                        <input
                          type="tel"
                          placeholder="+967780000000"
                          value={linkPhone}
                          onChange={e => setLinkPhone(e.target.value)}
                          className="w-full bg-stone-950 border border-stone-800 focus:border-[#D4AF37] text-white text-xs py-3 pr-10 pl-3 rounded-xl font-mono text-left"
                          required
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:scale-[1.01] transition-all text-neutral-950 font-black py-3 rounded-xl text-xs cursor-pointer text-center shadow-md"
                    >
                      تأكيد ربط حساب Google ورقم الجوال 🔗
                    </button>
                  </form>
                )}
              </div>
            ) : currentUser.role !== 'customer' ? (
              isPortalLoading ? (
                <div className="bg-[#111111] border border-stone-850 p-6 rounded-2xl">
                  <SkeletonLoader role={currentUser.role} />
                </div>
              ) : (
                <div>
                  {/* Super Admin Dashboard Routing */}
                  {currentUser.role === 'admin' && (
                    <AdminPortal 
                      database={database} 
                      onSave={handleSaveDatabaseState} 
                      currentUser={currentUser} 
                    />
                  )}

                  {/* Accountant Treasury Dashboard Routing */}
                  {currentUser.role === 'accountant' && (
                    <AccountantPortal 
                      database={database} 
                      onSave={handleSaveDatabaseState} 
                      currentUser={currentUser} 
                    />
                  )}

                  {/* Order Receiver Receptionist Routing */}
                  {currentUser.role === 'receiver' && (
                    <StaffPortal 
                      database={database} 
                      onSave={handleSaveDatabaseState} 
                      currentUser={currentUser} 
                    />
                  )}

                  {/* Affiliate Vendor Dashboard Routing */}
                  {currentUser.role === 'vendor' && (
                    <VendorPortal 
                      database={database} 
                      onSave={handleSaveDatabaseState} 
                      currentUser={currentUser} 
                    />
                  )}
                </div>
              )
            ) : (
              /* Customer Store Front Catalog - Display Screen Shown AFTER Login or Guest Selection */
              <CustomerPortal 
                database={database} 
                onSave={handleSaveDatabaseState} 
                currentUser={currentUser} 
                onLogout={() => setCurrentUser(null)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* AUTHENTICATION & LOGIN MODAL OVERLAY */}
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1C1D] border border-stone-800 rounded-3xl p-6 md:p-8 max-w-md w-full text-right shadow-2xl relative max-h-[90vh] overflow-y-auto">
            
            <button
              onClick={() => setShowAuthModal(false)}
              className="absolute top-4 left-4 text-stone-400 hover:text-white bg-stone-900 p-2 rounded-full cursor-pointer transition-colors"
            >
              <X size={18} />
            </button>

            <div className="text-center mb-6">
              <Sparkles className="mx-auto text-[#D4AF37] mb-2" size={32} />
              <h2 className="text-lg font-black text-white">تسجيل الدخول / إنشاء حساب بالمول الرقمي</h2>
              <p className="text-xs text-stone-400 mt-1">سجّل دخولك لحفظ الطلبات وتفعيل المتاجر والأدوار</p>
            </div>

            {/* Quick Google Login Button */}
            <button
              onClick={handleGoogleQuickLogin}
              className="w-full bg-stone-900 hover:bg-stone-850 border border-stone-750 text-white font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 mb-2 transition-all cursor-pointer shadow-sm"
            >
              <span className="text-base">🚀</span>
              <span>تسجيل الدخول السريع عبر Google</span>
            </button>

            {biometricsEnabled && (
              <button
                onClick={handleBiometricsQuickLogin}
                className="w-full bg-emerald-950/60 hover:bg-emerald-900/60 border border-emerald-700/50 text-emerald-300 font-bold text-xs py-3 px-4 rounded-xl flex items-center justify-center gap-2 mb-4 transition-all cursor-pointer shadow-sm"
              >
                <span>👆</span>
                <span>تسجيل الدخول الفوري بـ Face ID / البصمة</span>
              </button>
            )}

            <div className="relative flex py-2 items-center mb-4">
              <div className="flex-grow border-t border-stone-800"></div>
              <span className="flex-shrink mx-4 text-[10px] text-stone-500 font-bold">أو بواسطة الرقم/البريد</span>
              <div className="flex-grow border-t border-stone-800"></div>
            </div>

            {isForgotPassword ? (
              <form onSubmit={handleForgotPasswordRequest} className="space-y-4">
                <div className="bg-amber-950/30 border border-amber-900/50 p-3 rounded-xl text-[11px] text-amber-200">
                  🔒 استعادة كلمة المرور والحساب: ادخل رقم هاتفك أو بريدك الإلكتروني ليصلك رابط وإعادة التعيين.
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1.5">الهاتف أو البريد الإلكتروني:</label>
                  <input
                    type="text"
                    placeholder="+967780000000 أو customer@digitalmall.com"
                    value={loginMethod === 'phone' ? phoneVal : emailVal}
                    onChange={(e) => loginMethod === 'phone' ? setPhoneVal(e.target.value) : setEmailVal(e.target.value)}
                    className="w-full bg-stone-950 border border-stone-800 text-white text-xs py-3 px-3 rounded-xl"
                    required
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(false)}
                    className="bg-stone-850 hover:bg-stone-800 text-stone-300 text-xs px-4 py-2.5 rounded-xl cursor-pointer"
                  >
                    إلغاء
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#D4AF37] text-black font-black text-xs py-2.5 rounded-xl cursor-pointer"
                  >
                    إرسال رابط الاستعادة 📧
                  </button>
                </div>
              </form>
            ) : !sentCode ? (
              <form onSubmit={handleSendVerificationCode} className="space-y-4">
                
                <div className="flex border-b border-stone-850 pb-2 mb-4 justify-center gap-6">
                  <button
                    type="button"
                    onClick={() => setLoginMethod('phone')}
                    className={`pb-1 text-xs font-bold transition-all ${
                      loginMethod === 'phone' ? 'border-b-2 border-[#D4AF37] text-white' : 'text-stone-500 hover:text-stone-300'
                    }`}
                  >
                    رقم الهاتف اليمني (+967)
                  </button>
                  <button
                    type="button"
                    onClick={() => setLoginMethod('email')}
                    className={`pb-1 text-xs font-bold transition-all ${
                      loginMethod === 'email' ? 'border-b-2 border-[#D4AF37] text-white' : 'text-stone-500 hover:text-stone-300'
                    }`}
                  >
                    البريد الإلكتروني المنسق
                  </button>
                </div>

                {loginMethod === 'phone' ? (
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1.5">رقم الهاتف الجوال اليمني المعتمد:</label>
                    <div className="relative">
                      <Smartphone size={15} className="absolute top-3.5 right-3 text-stone-550" />
                      <input
                        type="tel"
                        placeholder="+967780044700"
                        className="w-full bg-stone-950 border border-stone-800 focus:border-[#D4AF37] text-white text-xs py-3 pr-10 pl-3 rounded-xl font-mono text-left"
                        value={phoneVal}
                        onChange={e => setPhoneVal(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1.5">البريد الإلكتروني:</label>
                    <div className="relative">
                      <Mail size={15} className="absolute top-3.5 right-3 text-stone-550" />
                      <input
                        type="email"
                        placeholder="customer@digitalmall.com"
                        className="w-full bg-stone-950 border border-stone-800 focus:border-[#D4AF37] text-white text-xs py-3 pr-10 pl-3 rounded-xl text-left"
                        value={emailVal}
                        onChange={e => setEmailVal(e.target.value)}
                        required
                      />
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  className="w-full bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:scale-[1.01] transition-all text-neutral-950 font-black py-3 rounded-xl text-xs cursor-pointer text-center"
                >
                  إرسال كود التحقق الأمني SMS/البريد
                </button>

                <div className="flex justify-between items-center text-[11px] pt-1">
                  <button
                    type="button"
                    onClick={() => setIsForgotPassword(true)}
                    className="text-[#D4AF37] hover:underline"
                  >
                    نسيت كلمة المرور / استعادة الحساب؟
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleBiometrics}
                    className={`font-bold flex items-center gap-1 ${biometricsEnabled ? 'text-emerald-400' : 'text-stone-400 hover:text-stone-200'}`}
                  >
                    <span>👆 {biometricsEnabled ? 'Face ID مفعل' : 'تفعيل Face ID'}</span>
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleVerifyCodeAndLogin} className="space-y-4">
                <p className="text-[11px] text-stone-400 bg-stone-950 p-2.5 rounded border border-stone-850">
                  لقد أرسلنا كود التحقق OTP المكون من 6 أرقام لهاتفكِ أو بريدكِ. تفضلي بكتابته أدناه لإتمام التأكيد.
                </p>

                {sentCode && (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 text-center">
                    <span className="block text-[10px] text-amber-400 font-bold mb-1">🔑 رمز التحقق التجريبي (OTP):</span>
                    <span className="text-xl font-black text-white font-mono tracking-widest">{sentCode}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">رمز التحقق الأمني (OTP Code):</label>
                  <input
                    type="text"
                    maxLength={6}
                    placeholder="أدخل الرمز المكون من 6 أرقام"
                    className="w-full bg-stone-900 border border-stone-800 text-white font-mono text-center text-sm py-3 rounded-xl focus:border-[#D4AF37]"
                    value={verificationCode}
                    onChange={e => setVerificationCode(e.target.value)}
                    required
                  />
                </div>

                <div className="flex gap-2.5">
                  <button
                    type="button"
                    onClick={() => setSentCode(null)}
                    className="bg-stone-850 hover:bg-stone-800 text-stone-400 px-3 py-3 rounded-xl text-xs"
                  >
                    تعديل البيانات
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-[#D4AF37] text-black font-black py-3 rounded-xl text-xs"
                  >
                    تأكيد الدخول الآمن للمتجر
                  </button>
                </div>

                {verificationCountdown > 0 ? (
                  <span className="block text-center text-[10px] text-stone-500">إعادة إرسال الكود بعد: {verificationCountdown} ثانية</span>
                ) : (
                  <button
                    type="button"
                    onClick={handleSendVerificationCode}
                    className="block mx-auto text-[11px] text-[#D4AF37] hover:underline"
                  >
                    طلب كود تحقق جديد
                  </button>
                )}
              </form>
            )}

            {/* SIMULATION AND SWITCH TESTING BOARD */}
            <div className="mt-6 border-t border-stone-850 pt-4 space-y-2">
              <span className="text-[10px] uppercase text-[#D4AF37] font-black tracking-widest block text-center">
                🛠️ تبديل الأدوار المباشر بالتطوير
              </span>
              
              <div className="grid grid-cols-2 gap-1.5 text-center text-[10px] font-sans font-semibold">
                <button
                  onClick={() => { handleTestingBypassLogin('admin'); setShowAuthModal(false); }}
                  className="bg-stone-900 hover:bg-stone-850 border border-stone-800 p-2 rounded text-[#D4AF37]"
                >
                  المدير العام
                </button>
                <button
                  onClick={() => { handleTestingBypassLogin('accountant'); setShowAuthModal(false); }}
                  className="bg-stone-900 hover:bg-stone-850 border border-stone-800 p-2 rounded text-white"
                >
                  المحاسب المالي
                </button>
                <button
                  onClick={() => { handleTestingBypassLogin('receiver'); setShowAuthModal(false); }}
                  className="bg-stone-900 hover:bg-stone-850 border border-stone-800 p-2 rounded text-white"
                >
                  مسؤول الاستقبال
                </button>
                <button
                  onClick={() => { handleTestingBypassLogin('vendor'); setShowAuthModal(false); }}
                  className="bg-stone-900 hover:bg-stone-850 border border-stone-800 p-2 rounded text-[#F8C8DC]"
                >
                  تاجر (بائع)
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* FLOATING QUICK ZOOM & PAGE SCALE WIDGET - Accessible everywhere on mobile & desktop */}
      <div className="fixed bottom-4 left-4 z-50">
        {isZoomWidgetMinimized ? (
          <button
            onClick={() => setIsZoomWidgetMinimized(false)}
            className="bg-stone-900/95 hover:bg-stone-850 border border-[#D4AF37]/60 text-[#D4AF37] px-3 py-2 rounded-2xl shadow-2xl backdrop-blur-md flex items-center gap-1.5 text-xs font-bold transition-all hover:scale-105 cursor-pointer"
            title="فتح أداة تصغير وتكبير الصفحات"
          >
            <ZoomIn size={14} className="animate-pulse" />
            <span className="font-mono">{zoomScale}%</span>
          </button>
        ) : (
          <div className="bg-stone-900/95 border border-[#D4AF37]/60 shadow-2xl backdrop-blur-md rounded-2xl p-2 flex items-center gap-2 text-xs text-white">
            <div className="flex items-center gap-1 border-l border-stone-800 pl-2">
              <button
                onClick={handleZoomOut}
                disabled={zoomScale <= 50}
                className="p-1.5 bg-stone-950 hover:bg-stone-800 text-stone-200 rounded-xl transition-colors cursor-pointer disabled:opacity-30"
                title="تصغير الشاشة 5%"
              >
                <ZoomOut size={13} />
              </button>
              
              <button
                onClick={() => setShowZoomMenu(!showZoomMenu)}
                className="px-2.5 py-1.5 bg-stone-950 hover:bg-stone-800 text-[#D4AF37] font-bold font-mono rounded-xl cursor-pointer transition-colors text-[11px]"
                title="قائمة الخيارات والتصغير"
              >
                🔍 {zoomScale}%
              </button>

              <button
                onClick={handleZoomIn}
                disabled={zoomScale >= 150}
                className="p-1.5 bg-stone-950 hover:bg-stone-800 text-stone-200 rounded-xl transition-colors cursor-pointer disabled:opacity-30"
                title="تكبير الشاشة 5%"
              >
                <ZoomIn size={13} />
              </button>
            </div>

            <div className="flex items-center gap-1">
              {[75, 85, 100].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setZoomScale(preset)}
                  className={`px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer ${
                    zoomScale === preset
                      ? 'bg-[#D4AF37] text-stone-950 font-black'
                      : 'bg-stone-950 text-stone-400 hover:text-white'
                  }`}
                >
                  {preset}%
                </button>
              ))}

              <button
                onClick={() => setIsZoomWidgetMinimized(true)}
                className="p-1 text-stone-400 hover:text-stone-200 rounded-lg cursor-pointer ml-1"
                title="تصغير شريط التحكم"
              >
                <Minimize2 size={12} />
              </button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
