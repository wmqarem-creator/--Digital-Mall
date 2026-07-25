import React, { useState, useEffect } from 'react';
import { 
  AppDatabase, 
  UserProfile, 
  AuditLog, 
  Product, 
  Category, 
  BankAccount, 
  SocialLinks, 
  Banner, 
  WithdrawalRequest 
} from '../types';
import { 
  Users, 
  FileText, 
  Percent, 
  Grid, 
  ShoppingBag, 
  CreditCard, 
  Share2, 
  Image as ImageIcon, 
  UserPlus, 
  Edit3, 
  Trash2, 
  DollarSign, 
  Download, 
  CheckCircle, 
  XSquare, 
  Eye, 
  EyeOff, 
  Plus,
  AlertTriangle,
  Store,
  ShieldAlert,
  Lock,
  Unlock,
  Upload,
  Search,
  Star,
  MessageSquare,
  TrendingUp,
  Award,
  Clock,
  Sparkles,
  Wallet,
  Map,
  MapPin,
  Truck,
  Palette,
  Building2,
  UserCheck,
  ArrowUpRight,
  Tag,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { logOperation, MOCK_IMAGES, INITIAL_DATABASE } from '../dbMock';
import AdminChart from './AdminChart';
import SanaaMap from './SanaaMap';

interface AdminPortalProps {
  database: AppDatabase;
  onSave: (db: AppDatabase) => void;
  currentUser: UserProfile;
}

export default function AdminPortal({ database, onSave, currentUser }: AdminPortalProps) {
  const [activeTab, setActiveTab] = useState<'insights' | 'employees' | 'vendors' | 'products' | 'categories' | 'banks' | 'banners' | 'socials' | 'withdrawals' | 'audit' | 'storesMap' | 'shipping' | 'appAppearance' | 'walletsBreakdown' | 'merchantBalances'>('insights');
  const [selectedFinancialModal, setSelectedFinancialModal] = useState<'commissions' | 'platformRevenue' | 'approvedWithdrawals' | 'pendingWithdrawals' | null>(null);
  
  // States for vendor / store management
  const [showVendorModal, setShowVendorModal] = useState(false);
  const [editingVendor, setEditingVendor] = useState<UserProfile | null>(null);
  const [storesMapSearch, setStoresMapSearch] = useState('');
  const [storesMapFilter, setStoresMapFilter] = useState<'all' | 'approved' | 'pending'>('all');
  const [selectedMapVendorId, setSelectedMapVendorId] = useState<string | null>(null);
  const [vendorForm, setVendorForm] = useState({
    id: '',
    name: '',
    fullName: '',
    email: '',
    phone: '',
    currentResidence: '',
    bankAccountDetails: '',
    idCardPhoto: '',
    idCardPhoto2: '',
    logoImage: '',
    isApproved: false,
    isPublishApproved: false,
    isVerified: false,
    hidePrivateContact: false,
    latitude: 15.3694,
    longitude: 44.1910,
    mapAddress: 'صنعاء، اليمن',
    isBlocked: false,
    commissionTier: 'bronze' as 'bronze' | 'silver' | 'gold',
    customCommissionRate: 10, // default 10% platform fee tariff
    taxRate: 5, // default 5% sales tax tariff
    shippingTariff: 1500 // default 1500 YER fixed shipping tariff rate
  });
  const [selectedVendorDetails, setSelectedVendorDetails] = useState<UserProfile | null>(null);
  const [selectedEmployeeDetails, setSelectedEmployeeDetails] = useState<UserProfile | null>(null);
  const [profileModalTab, setProfileModalTab] = useState<'info' | 'activity'>('info');
  const [vendorSearchKeyword, setVendorSearchKeyword] = useState('');
  const [selectedVendorProducts, setSelectedVendorProducts] = useState<string | null>(null); // To view/manage products of a specific vendor
  const [selectedVendorReviews, setSelectedVendorReviews] = useState<string | null>(null); // To view ratings and reviews of a specific vendor
  const [selectedVendorBestSellers, setSelectedVendorBestSellers] = useState<string | null>(null); // To view top selling products of a specific vendor

  // Shipping settings local state
  const defaultShipping = database.shippingSettings || {
    appExpressShippingEnabled: true,
    externalShippingEnabled: true,
    showToVendors: true,
    companies: [
      { id: 'ship_1', name: 'شركة النجم السريع للتوصيل', fee: 2500, estimatedTime: '24-48 ساعة', coverageAreas: ['صنعاء', 'عدن', 'تعز'], active: true },
      { id: 'ship_2', name: 'أكسبرس اليمن الدولي والمحلي', fee: 3500, estimatedTime: '24-72 ساعة', coverageAreas: ['المكلا', 'إب', 'ذمار', 'الحديدة'], active: true },
      { id: 'ship_3', name: 'خدمة التوصيل السريع داخل العاصمة', fee: 1500, estimatedTime: 'نفس اليوم', coverageAreas: ['صنعاء القديمة', 'حدة', 'الستين'], active: true }
    ]
  };

  const [shippingConfig, setShippingConfig] = useState(defaultShipping);
  const [showAddCompanyModal, setShowAddCompanyModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState<any | null>(null);
  const [newCompanyForm, setNewCompanyForm] = useState({ name: '', fee: 2000, estimatedTime: '24-48 ساعة', coverageAreas: 'صنعاء، عدن، تعز' });

  useEffect(() => {
    if (database.shippingSettings) {
      const companies = (database.shippingSettings.companies || database.shippingSettings.externalCompanies || []).map(c => ({
        ...c,
        fee: c.fee ?? c.price ?? 2000,
        price: c.price ?? c.fee ?? 2000,
        active: c.active !== false,
        estimatedTime: c.estimatedTime || '24-48 ساعة',
        coverageAreas: Array.isArray(c.coverageAreas) ? c.coverageAreas : ['جميع المناطق']
      }));
      setShippingConfig({
        appExpressShippingEnabled: database.shippingSettings.appExpressShippingEnabled ?? database.shippingSettings.enableAppShipping ?? true,
        externalShippingEnabled: database.shippingSettings.externalShippingEnabled ?? database.shippingSettings.enableExternalShipping ?? true,
        showToVendors: database.shippingSettings.showToVendors ?? true,
        companies
      });
    }
  }, [database.shippingSettings]);

  // App appearance local state
  const defaultAppearance = database.appAppearanceSettings || {
    appName: 'Digital Mall - المول الرقمي',
    logoUrl: MOCK_IMAGES.adBannerAffiliate,
    primaryColor: '#D4AF37',
    iconTheme: 'gold',
    announcementText: 'مرحباً بكم في المول الرقمي Digital Mall - عروض خاصة وتسوق متكامل!',
    showAnnouncement: true
  };

  const [appearanceConfig, setAppearanceConfig] = useState(defaultAppearance);

  // States for adding/editing items
  const [showEmployeeModal, setShowEmployeeModal] = useState(false);
  const [employeeForm, setEmployeeForm] = useState({
    id: '',
    name: '',
    email: '',
    phone: '',
    role: 'accountant' as any,
    permissions: {
      manageProducts: true,
      manageCategories: true,
      manageBanks: false,
      manageBanners: true,
      manageEmployeeRoles: false,
      auditTransfers: true,
      manageOrders: false,
      viewReports: true
    }
  });

  const ADMIN_SIZE_TEMPLATES = {
    women: ['52', '54', '56', '58', '60', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXXL', 'XXXXXXL'],
    kids: ['22', '24', '26', '28', '30', '32', '34', '36'],
    shoes: ['36', '37', '38', '39', '40', '41', '42'],
    custom: ['مقاس موحد Free Size', 'تفصيل خاص حسب الطلب']
  };

  const [showProductModal, setShowProductModal] = useState(false);
  const [productModalSize, setProductModalSize] = useState<'normal' | 'large' | 'fullscreen'>('large');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    description: '',
    price: 3500,
    originalPrice: 3200,
    stockQuantity: 10,
    categoryId: 'women_section',
    subCategoryId: '',
    subCategoryLeaf: '',
    navigationTag: '',
    sizeTemplate: 'women' as 'women' | 'kids' | 'shoes' | 'custom',
    selectedSizes: ['52', '54', '56', '58', '60', 'S', 'M', 'L', 'XL', 'XXL'],
    availableColors: 'أسود ملكي، كحلي، عودي، ذهبي',
    availableEmbroideries: 'تطريز ذهبي، خرز فضي، شك يدوي',
    imageFitMode: 'cover' as 'cover' | 'contain' | 'fill',
    image: '',
    images: ['', '', '', '', ''] as string[],
    isAffiliateEnabled: true,
    isHidden: false
  });

  const toggleSizeInAdmin = (size: string) => {
    setProductForm(prev => {
      const current = prev.selectedSizes || [];
      const exists = current.includes(size);
      const updated = exists
        ? current.filter(s => s !== size)
        : [...current, size];
      return { ...prev, selectedSizes: updated };
    });
  };

  const toggleHideProduct = (prodId: string, name: string, currentlyHidden?: boolean) => {
    const updated = database.products.map(p => {
      if (p.id === prodId) {
        return { ...p, isHidden: !currentlyHidden };
      }
      return p;
    });
    onSave({ ...database, products: updated });
    logOperation(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      currentlyHidden ? 'إظهار منتج' : 'إخفاء منتج مؤقتاً',
      `تم ${currentlyHidden ? 'إعادة إظهار' : 'إخفاء'} المنتج: ${name}`
    );
  };

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [categoryForm, setCategoryForm] = useState({
    id: '',
    name: '',
    image: ''
  });

  const [showBankModal, setShowBankModal] = useState(false);
  const [editingBank, setEditingBank] = useState<BankAccount | null>(null);
  const [bankForm, setBankForm] = useState({
    bankName: '',
    accountNumber: '',
    accountHolder: '',
    notes: ''
  });

  const [showBannerModal, setShowBannerModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [bannerForm, setBannerForm] = useState({
    title: '',
    subtitle: '',
    image: '',
    productId: '',
    active: true
  });

  const [socialsForm, setSocialsForm] = useState<SocialLinks>({ ...database.socialLinks });
  const [commissionRate, setCommissionRate] = useState<number>(database.commissionSettings.flatCommissionRate);
  const [isCommissionVisible, setIsCommissionVisible] = useState<boolean>(database.commissionSettings.vendorCommissionEnabled);

  // Stats calculators
  const totalSalesOfCompletedAndProcessing = database.orders
    .filter(o => o.status !== 'pending_payment')
    .reduce((sum, o) => sum + o.totalAmount, 0);

  const totalCommissionsEarnedByVendors = database.orders
    .filter(o => o.status === 'completed')
    .flatMap(o => o.items)
    .reduce((sum, item) => sum + ((item.product.commission || 300) * item.quantity), 0);

  const appNetProfits = totalSalesOfCompletedAndProcessing - totalCommissionsEarnedByVendors;

  // Manage Employee functions
  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!employeeForm.name || !employeeForm.email || !employeeForm.phone) {
      alert('الرجاء ملء جميع البيانات الأساسية للموظف');
      return;
    }

    const updatedUsers = [...database.users];
    const employeeId = employeeForm.id || `emp_${Date.now()}`;
    const userIdx = updatedUsers.findIndex(u => u.id === employeeId || u.email === employeeForm.email);

    const profile: UserProfile = {
      id: employeeId,
      email: employeeForm.email,
      phone: employeeForm.phone,
      role: employeeForm.role,
      name: employeeForm.name,
      permissions: employeeForm.role !== 'admin' ? employeeForm.permissions : undefined,
      createdAt: new Date().toISOString()
    };

    if (userIdx > -1) {
      updatedUsers[userIdx] = { ...updatedUsers[userIdx], ...profile };
      logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'تعديل رتبة وصلاحيات موظف',
        `تم تعديل الموظف ${profile.name} برتبة ${profile.role}`
      );
    } else {
      updatedUsers.push(profile);
      logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'إضافة موظف جديد',
        `تم تسجيل موظف جديد باسم ${profile.name} برتبة ${profile.role}`
      );
    }

    onSave({ ...database, users: updatedUsers });
    setShowEmployeeModal(false);
    setEmployeeForm({
      id: '',
      name: '',
      email: '',
      phone: '',
      role: 'accountant',
      permissions: {
        manageProducts: true,
        manageCategories: true,
        manageBanks: false,
        manageBanners: true,
        manageEmployeeRoles: false,
        auditTransfers: true,
        manageOrders: false,
        viewReports: true
      }
    });
  };

  const deleteEmployee = (userId: string, name: string) => {
    if (confirm(`هل أنت متأكد من رغبتك في إقصاء وإلغاء صلاحيات الموظف: ${name}؟`)) {
      const updated = database.users.filter(u => u.id !== userId);
      onSave({ ...database, users: updated });
      logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'حذف موظف',
        `تم إقصاء الموظف ${name} نهائياً من الطاقم`
      );
    }
  };

  // Manage Vendors (Super admin absolute control)
  const handleSaveVendor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!vendorForm.name || !vendorForm.phone) {
      alert('الرجاء إدخال اسم المتجر ورقم الجوال المعتمد');
      return;
    }

    const updatedUsers = [...database.users];
    const vendorId = vendorForm.id || `vendor_${Date.now()}`;
    const userIdx = updatedUsers.findIndex(u => u.id === vendorId || (u.phone === vendorForm.phone && u.role === 'vendor'));

    const profile: UserProfile = {
      id: vendorId,
      email: vendorForm.email || `${vendorId}@gmail.com`,
      phone: vendorForm.phone,
      role: 'vendor',
      name: vendorForm.name,
      fullName: vendorForm.fullName,
      currentResidence: vendorForm.currentResidence,
      bankAccountDetails: vendorForm.bankAccountDetails,
      idCardPhoto: vendorForm.idCardPhoto || `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80" fill="none"><rect width="120" height="80" rx="4" fill="%23222"/><text x="60" y="45" fill="%23D4AF37" font-size="8" text-anchor="middle">بطاقة شخصية معتمدة</text></svg>`,
      idCardPhoto2: vendorForm.idCardPhoto2,
      logoImage: vendorForm.logoImage,
      isApproved: vendorForm.isApproved,
      isPublishApproved: vendorForm.isPublishApproved,
      isVerified: vendorForm.isVerified,
      hidePrivateContact: vendorForm.hidePrivateContact,
      latitude: Number(vendorForm.latitude) || 15.3694,
      longitude: Number(vendorForm.longitude) || 44.1910,
      mapAddress: vendorForm.mapAddress || 'صنعاء، اليمن',
      isBlocked: vendorForm.isBlocked,
      commissionTier: vendorForm.commissionTier,
      customCommissionRate: Number(vendorForm.customCommissionRate),
      taxRate: Number(vendorForm.taxRate),
      shippingTariff: Number(vendorForm.shippingTariff),
      createdAt: editingVendor ? editingVendor.createdAt : new Date().toISOString()
    };

    if (userIdx > -1) {
      updatedUsers[userIdx] = { ...updatedUsers[userIdx], ...profile };
      logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'تعديل بيانات متجر رقابياً',
        `تم تعديل بيانات المتجر والتاجر ${profile.name} (الهوية: ${profile.fullName || ''}) مع إقرار التعرفة الجمركية والعمولة بقيمة ${profile.customCommissionRate}%`
      );
    } else {
      updatedUsers.push(profile);
      logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'تأسيس متجر جديد يدوياً',
        `تم تسجيل وتأسيس متجر جديد باسم ${profile.name} للتاجر ${profile.fullName || ''} بتعرفة عمولة ${profile.customCommissionRate}%`
      );
    }

    onSave({ ...database, users: updatedUsers });
    setShowVendorModal(false);
    setEditingVendor(null);
    setVendorForm({
      id: '',
      name: '',
      fullName: '',
      email: '',
      phone: '',
      currentResidence: '',
      bankAccountDetails: '',
      idCardPhoto: '',
      idCardPhoto2: '',
      logoImage: '',
      isApproved: false,
      isPublishApproved: false,
      isVerified: false,
      latitude: 15.3694,
      longitude: 44.1910,
      mapAddress: 'صنعاء، اليمن',
      isBlocked: false,
      commissionTier: 'bronze',
      customCommissionRate: 10,
      taxRate: 5,
      shippingTariff: 1500
    });
  };

  const toggleApproveVendor = (vendorId: string, name: string, currentlyApproved: boolean) => {
    const updatedUsers = database.users.map(u => {
      if (u.id === vendorId) {
        return { ...u, isApproved: !currentlyApproved };
      }
      return u;
    });
    onSave({ ...database, users: updatedUsers });
    logOperation(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      currentlyApproved ? 'إلغاء قبول المتجر' : 'قبول المتجر بالمول',
      `تم ${currentlyApproved ? 'إلغاء قبول' : 'قبول وإعتماد'} المتجر التجاري ${name} بالمول`
    );
  };

  const togglePublishVendor = (vendorId: string, name: string, currentlyPublishApproved: boolean) => {
    const updatedUsers = database.users.map(u => {
      if (u.id === vendorId) {
        return { ...u, isPublishApproved: !currentlyPublishApproved };
      }
      return u;
    });
    onSave({ ...database, users: updatedUsers });
    logOperation(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      currentlyPublishApproved ? 'إلغاء إذن النشر' : 'منح إذن النشر',
      `تم ${currentlyPublishApproved ? 'حجب وإيقاف' : 'تفعيل ومنح'} صلاحيات نشر الموديلات للمتجر ${name}`
    );
  };

  const toggleVerifyVendor = (vendorId: string, name: string, currentlyVerified: boolean) => {
    const updatedUsers = database.users.map(u => {
      if (u.id === vendorId) {
        return { ...u, isVerified: !currentlyVerified };
      }
      return u;
    });
    onSave({ ...database, users: updatedUsers });
    logOperation(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      currentlyVerified ? 'إلغاء توثيق متجر' : 'توثيق متجر (اشتراك مدفوع)',
      `تم ${currentlyVerified ? 'إلغاء شارة التوثيق' : 'منح شارة التوثيق والتحقق الزرقاء (سداد الاشتراك)'} لمتجر ${name}`
    );
  };

  const toggleBlockVendor = (vendorId: string, name: string, currentlyBlocked: boolean) => {
    const actionText = currentlyBlocked ? 'فك حظر وتنشيط' : 'حظر وإيقاف';
    if (confirm(`هل أنت متأكد من رغبتك في ${actionText} المتجر التجاري: ${name}؟`)) {
      const updatedUsers = database.users.map(u => {
        if (u.id === vendorId) {
          return { ...u, isBlocked: !currentlyBlocked };
        }
        return u;
      });

      onSave({ ...database, users: updatedUsers });
      logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        currentlyBlocked ? 'تنشيط متجر محظور' : 'حظر متجر تجاري',
        `تم ${actionText} المتجر والتاجر ${name} بالكامل وإيقاف معروضاته`
      );
      alert(`تم ${currentlyBlocked ? 'تنشيط المتجر بنجاح' : 'حظر المتجر وتعطيله بالكامل'}`);
    }
  };

  const toggleVendorApproved = (vendorId: string, name: string, currentlyApproved: boolean, vendorPhone?: string) => {
    const newApproved = !currentlyApproved;
    const updatedUsers = database.users.map(u => {
      if (u.id === vendorId || (vendorPhone && u.phone === vendorPhone)) {
        return { ...u, isApproved: newApproved };
      }
      return u;
    });

    onSave({ ...database, users: updatedUsers });
    logOperation(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      newApproved ? 'قبول متجر تجاري' : 'إلغاء قبول متجر',
      `تم ${newApproved ? 'قبول واعتماد' : 'إلغاء قبول'} المتجر والتاجر ${name} وتحديث حالة القبول بالتطبيق`
    );
  };

  const toggleVendorPublishApproved = (vendorId: string, name: string, currentlyPublishApproved: boolean, vendorPhone?: string) => {
    const newPublish = !currentlyPublishApproved;
    const updatedUsers = database.users.map(u => {
      if (u.id === vendorId || (vendorPhone && u.phone === vendorPhone)) {
        return { ...u, isPublishApproved: newPublish };
      }
      return u;
    });

    onSave({ ...database, users: updatedUsers });
    logOperation(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      newPublish ? 'تفعيل وقبول النشر لمتجر' : 'إيقاف النشر لمتجر',
      `تم ${newPublish ? 'قبول وتفعيل النشر' : 'إيقاف وتعليق النشر'} للمتجر والتاجر ${name} وتحديث حالة نشر المعروضات`
    );
  };

  const toggleVendorVerified = (vendorId: string, name: string, currentlyVerified: boolean, vendorPhone?: string) => {
    const newVerified = !currentlyVerified;
    const updatedUsers = database.users.map(u => {
      if (u.id === vendorId || (vendorPhone && u.phone === vendorPhone)) {
        return { ...u, isVerified: newVerified };
      }
      return u;
    });

    onSave({ ...database, users: updatedUsers });
    logOperation(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      newVerified ? 'توثيق متجر تجاري بالكامل' : 'إلغاء توثيق متجر',
      `تم ${newVerified ? 'منح شارة التوثيق' : 'إلغاء شارة التوثيق'} للمتجر والتاجر ${name} وتحديث علامة التوثيق بالمول`
    );
  };

  const toggleVendorPrivacy = (vendorId: string, name: string, currentlyHidden: boolean, vendorPhone?: string) => {
    const newHidden = !currentlyHidden;
    const updatedUsers = database.users.map(u => {
      if (u.id === vendorId || (vendorPhone && u.phone === vendorPhone)) {
        return { ...u, hidePrivateContact: newHidden };
      }
      return u;
    });

    onSave({ ...database, users: updatedUsers });
    logOperation(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      newHidden ? 'تفعيل إخفاء الهوية والجوال' : 'إظهار البيانات الشخصية للتاجر',
      `تم ${newHidden ? 'تفعيل إخفاء' : 'إلغاء إخفاء'} البيانات الشخصية (الاسم، الجوال، العنوان) للمتجر والتاجر ${name}`
    );
  };

  const deleteVendor = (vendorId: string, name: string) => {
    if (confirm(`تحذير أمني حرج: هل أنت متأكد من رغبتك في حذف المتجر [${name}] نهائياً؟ سيتم تصفية بياناته وإلغاء ربطه بجميع منتجاته المعروضة.`)) {
      const updatedUsers = database.users.filter(u => u.id !== vendorId);
      // Re-assign products to administrative master store
      const updatedProducts = database.products.map(p => {
        if (p.vendorId === vendorId) {
          return { ...p, vendorId: null };
        }
        return p;
      });

      onSave({ ...database, users: updatedUsers, products: updatedProducts });
      logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'حذف متجر نهائياً',
        `تم مسح وإلغاء المتجر والتاجر ${name} بالكامل من النظام وتحويل منتجاته للمتجر الرئيسي`
      );
      alert('تم إقصاء وحذف المتجر بنجاح وتحويل منتجاته للمتجر الرئيسي.');
    }
  };

  const handleApproveWithdrawal = (reqId: string) => {
    const updatedReqs = database.withdrawalRequests.map(r => {
      if (r.id === reqId) {
        logOperation(
          currentUser.id,
          currentUser.name,
          currentUser.role,
          'اعتماد طلب سداد أرباح تاجرة (إدارة)',
          `تم تحويل مبلغ ${r.amount} ر.ي للتاجرة ${r.vendorName} عبر ${r.bankName} (من لوحة المدير العام)`
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
    alert('تم اعتماد سداد الأرباح وتحويل المستحقات للتاجرة بنجاح من لوحة المدير العام!');
  };

  const handleRejectWithdrawal = (reqId: string) => {
    const updatedReqs = database.withdrawalRequests.map(r => {
      if (r.id === reqId) {
        logOperation(
          currentUser.id,
          currentUser.name,
          currentUser.role,
          'رفض طلب سداد أرباح تاجرة (إدارة)',
          `تم إلغاء سداد الطلب بقيمة ${r.amount} ر.ي للتاجرة ${r.vendorName} (من لوحة المدير العام)`
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
    alert('تم رفض طلب السحب وإعادته للغرفة المحاسبية أو التدقيق.');
  };

  // Manage Products (Super admin or Staff can do if allowed)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();

    const effectiveMainImage = productForm.image || productForm.images[0] || productForm.images.find(i => i && i.trim() !== '') || '';

    if (!productForm.name || !productForm.name.trim()) {
      alert('الرجاء إدخال اسم الوشاح / العباءة / المنتج');
      return;
    }

    if (!effectiveMainImage) {
      alert('الرجاء اختيار أو كتابة رابط صورة واحدة على الأقل للمنتج (رفع ملف أو رابط الصورة)');
      return;
    }

    const updatedProds = [...database.products];
    const newProductPrice = Number(productForm.originalPrice) + Number(commissionRate);

    // Parse colors and embroideries arrays
    const colorsArray = productForm.availableColors.split('،').flatMap(c => c.split(',')).map(s => s.trim()).filter(Boolean);
    const embroideryArray = productForm.availableEmbroideries.split('،').flatMap(c => c.split(',')).map(s => s.trim()).filter(Boolean);

    // Sync prime image and first slot of the array
    const syncedImages = [...productForm.images];
    syncedImages[0] = effectiveMainImage;
    const finalImages = syncedImages.slice(0, 5);

    if (editingProduct) {
      const idx = updatedProds.findIndex(p => p.id === editingProduct.id);
      if (idx > -1) {
        updatedProds[idx] = {
          ...editingProduct,
          name: productForm.name,
          description: productForm.description,
          originalPrice: Number(productForm.originalPrice),
          price: newProductPrice,
          stockQuantity: Number(productForm.stockQuantity),
          isOutofStock: Number(productForm.stockQuantity) <= 0,
          commission: commissionRate,
          categoryId: productForm.categoryId,
          subCategoryId: productForm.subCategoryId || undefined,
          subCategoryLeaf: productForm.subCategoryLeaf || undefined,
          navigationTag: productForm.navigationTag || undefined,
          availableSizes: productForm.selectedSizes,
          availableColors: colorsArray,
          availableEmbroideries: embroideryArray,
          sizeTemplate: productForm.sizeTemplate,
          imageFitMode: productForm.imageFitMode,
          isHidden: productForm.isHidden,
          image: effectiveMainImage,
          images: finalImages,
          isAffiliateEnabled: productForm.isAffiliateEnabled
        };
      }
      logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'تعديل منتج',
        `تم تعديل تفاصيل المنتج: ${productForm.name}`
      );
    } else {
      const newProd: Product = {
        id: `prod_${Date.now()}`,
        name: productForm.name,
        description: productForm.description,
        originalPrice: Number(productForm.originalPrice),
        price: newProductPrice,
        stockQuantity: Number(productForm.stockQuantity),
        isOutofStock: Number(productForm.stockQuantity) <= 0,
        commission: commissionRate,
        categoryId: productForm.categoryId,
        subCategoryId: productForm.subCategoryId || undefined,
        subCategoryLeaf: productForm.subCategoryLeaf || undefined,
        navigationTag: productForm.navigationTag || undefined,
        availableSizes: productForm.selectedSizes,
        availableColors: colorsArray,
        availableEmbroideries: embroideryArray,
        sizeTemplate: productForm.sizeTemplate,
        imageFitMode: productForm.imageFitMode,
        isHidden: productForm.isHidden,
        image: effectiveMainImage,
        images: finalImages,
        vendorId: null, // Admin added
        isAffiliateEnabled: productForm.isAffiliateEnabled,
        createdAt: new Date().toISOString()
      };
      updatedProds.push(newProd);
      logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'إضافة منتج رئيسي',
        `تم إدراج منتج جديد بالمخزن: ${productForm.name}`
      );
    }

    onSave({ ...database, products: updatedProds });
    setShowProductModal(false);
    setEditingProduct(null);
  };

  const deleteProduct = (prodId: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف المنتج: ${name}؟`)) {
      const updated = database.products.filter(p => p.id !== prodId);
      onSave({ ...database, products: updated });
      logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'حذف منتج',
        `تم التخلص من المنتج: ${name}`
      );
    }
  };

  // Manage Categories
  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!categoryForm.id || !categoryForm.name || !categoryForm.image) {
      alert('الرجاء إدخال المعرّف (أحرف إنجليزية) واسم القسم وصورته');
      return;
    }

    const updatedCats = [...database.categories];
    if (editingCategory) {
      const idx = updatedCats.findIndex(c => c.id === editingCategory.id);
      if (idx > -1) {
        updatedCats[idx] = { 
          ...editingCategory,
          id: categoryForm.id,
          name: categoryForm.name,
          name_ar: categoryForm.name,
          image: categoryForm.image
        };
      }
      logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'تعديل تفاصيل قسم',
        `تم تحديث القسم: ${categoryForm.name}`
      );
    } else {
      if (updatedCats.some(c => c.id === categoryForm.id)) {
        alert('هذا المعرف لقسم آخر مسجل مسبقاً!');
        return;
      }
      updatedCats.push({ ...categoryForm });
      logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'إضافة قسم جديد',
        `تم إدراج قسم جديد بالنظام باسم: ${categoryForm.name}`
      );
    }

    onSave({ ...database, categories: updatedCats });
    setShowCategoryModal(false);
    setEditingCategory(null);
  };

  const deleteCategory = (catId: string, name: string) => {
    if (confirm(`حذف القسم "${name}" قد يؤثر على تصفح المنتجات المرتبطة به. هل تود الحذف؟`)) {
      const updated = database.categories.filter(c => c.id !== catId);
      onSave({ ...database, categories: updated });
      logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'حذف قسم',
        `تم حذف قسم: ${name}`
      );
    }
  };

  // Manage Banks
  const handleSaveBank = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bankForm.bankName || !bankForm.accountNumber || !bankForm.accountHolder) {
      alert('الرجاء إدخال اسم البنك ورقم الحساب ومسؤول الحساب بالكامل');
      return;
    }

    const updatedBanks = [...database.bankAccounts];
    if (editingBank) {
      const idx = updatedBanks.findIndex(b => b.id === editingBank.id);
      if (idx > -1) {
        updatedBanks[idx] = { ...editingBank, ...bankForm };
      }
      logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'تعديل بيانات بنك السداد',
        `تم تعديل الحساب البنكي لـ ${bankForm.bankName}`
      );
    } else {
      const newBank: BankAccount = {
        id: `bank_${Date.now()}`,
        ...bankForm
      };
      updatedBanks.push(newBank);
      logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'إضافة نافذة دفع بنكي',
        `تم إدراج وسيلة دفع بنكي لـ: ${bankForm.bankName}`
      );
    }

    onSave({ ...database, bankAccounts: updatedBanks });
    setShowBankModal(false);
    setEditingBank(null);
  };

  const deleteBank = (bankId: string, name: string) => {
    if (confirm(`هل أنت متأكد من حذف الحساب البنكي لـ: ${name}؟ لن يظهر للزبائن بعد اليوم`)) {
      const updated = database.bankAccounts.filter(b => b.id !== bankId);
      onSave({ ...database, bankAccounts: updated });
      logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'تعطيل بنك سداد',
        `تم إلغاء سداد بنك: ${name}`
      );
    }
  };

  // Manage Banners
  const handleSaveBanner = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bannerForm.title || !bannerForm.image) {
      alert('يرجى ملء تفاصيل العنوان والصورة الإعلانية');
      return;
    }

    const updatedBanners = [...database.banners];
    if (editingBanner) {
      const idx = updatedBanners.findIndex(b => b.id === editingBanner.id);
      if (idx > -1) {
        updatedBanners[idx] = { ...editingBanner, ...bannerForm };
      }
      logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'تعديل بانر إعلاني',
        `تحديث الإعلان: ${bannerForm.title}`
      );
    } else {
      const newBanner: Banner = {
        id: `banner_${Date.now()}`,
        ...bannerForm
      };
      updatedBanners.push(newBanner);
      logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'إدراج حملة إعلانية',
        `تمت إضافة البانر الإعلاني: ${bannerForm.title}`
      );
    }

    onSave({ ...database, banners: updatedBanners });
    setShowBannerModal(false);
    setEditingBanner(null);
  };

  const deleteBanner = (bannerId: string, title: string) => {
    if (confirm(`حذف الإعلان: ${title}؟`)) {
      const updated = database.banners.filter(b => b.id !== bannerId);
      onSave({ ...database, banners: updated });
      logOperation(
        currentUser.id,
        currentUser.name,
        currentUser.role,
        'حذف إعلان',
        `تم حذف البانر الإعلاني: ${title}`
      );
    }
  };

  // Save Social links
  const handleSaveSocials = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({ ...database, socialLinks: socialsForm });
    logOperation(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'تحديث قنوات التواصل الاجتماعي',
      'تم تغيير روابط الدعم والواتساب وتلغرام للمشروع بشكل احترافي'
    );
    alert('تم حفظ روابط شبكات التواصل الاجتماعي بنجاح!');
  };

  // Toggle hiding commission of 300 YER
  const handleToggleCommission = () => {
    const nextVal = !isCommissionVisible;
    setIsCommissionVisible(nextVal);
    onSave({
      ...database,
      commissionSettings: {
        vendorCommissionEnabled: nextVal,
        flatCommissionRate: commissionRate
      }
    });
    logOperation(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      nextVal ? 'إظهار عمولة المنصة للعموم' : 'إخفاء عمولة المنصة عن الزبائن والتاجرات',
      `تم تغيير وضح إشهار العمولة البالغة ${commissionRate} ريال يمني`
    );
  };

  const handleUpdateCommissionRate = (rate: number) => {
    setCommissionRate(rate);
    onSave({
      ...database,
      commissionSettings: {
        vendorCommissionEnabled: isCommissionVisible,
        flatCommissionRate: rate
      }
    });
    logOperation(
      currentUser.id,
      currentUser.name,
      currentUser.role,
      'تغيير تسعيرة عمولة المنصة المرجعية',
      `تم إقرار قيمة العمولة الثابتة لتبلغ ${rate} ريال يمني`
    );
  };

  // Print PDF Simulated Document (Generates a clean PDF formatting)
  const handleExportPrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const rows = database.orders.map(o => `
      <tr style="border-bottom: 1px solid #ddd; text-align: right;">
        <td style="padding: 10px;">${o.id}</td>
        <td style="padding: 10px;">${o.customerPhone}</td>
        <td style="padding: 10px;">${o.bankName}</td>
        <td style="padding: 10px;">${o.totalAmount} ريال</td>
        <td style="padding: 10px;">${o.status === 'completed' ? 'تم التوصيل ومطابقته' : o.status === 'shipped' ? 'مشحون' : 'قيد التدقيق'}</td>
        <td style="padding: 10px;">${new Date(o.createdAt).toLocaleDateString('ar-YE')}</td>
      </tr>
    `).join('');

    const auditRows = database.auditLogs.slice(0, 30).map(l => `
      <tr style="border-bottom: 1px solid #eee; text-align: right; font-size: 11px;">
        <td style="padding: 8px;">${new Date(l.timestamp).toLocaleTimeString('ar-YE')}</td>
        <td style="padding: 8px;"><b>${l.operatorName}</b> (${l.operatorRole})</td>
        <td style="padding: 8px; color: #b18a1a;">${l.actionType}</td>
        <td style="padding: 8px;">${l.details}</td>
      </tr>
    `).join('');

    printWindow.document.write(`
      <html dir="rtl" lang="ar">
        <head>
          <title>تقرير النظام المالي والرقابي - المول الرقمي Digital Mall</title>
          <style>
            body { font-family: 'Cairo', sans-serif; padding: 40px; color: #111; background: #fff; }
            h1 { color: #d4af37; text-align: center; }
            .header-info { display: flex; justify-content: space-between; margin-bottom: 30px; border-bottom: 2px solid #d4af37; padding-bottom: 20px;}
            table { width: 100%; border-collapse: collapse; margin-top: 20px; }
            th { background-color: #1a1a1a; color: #d4af37; padding: 12px; text-align: right; }
            .stats-container { display: flex; justify-content: space-around; margin: 30px 0; background-color: #faf6eb; border: 1px solid #d4af37; padding: 20px; border-radius: 8px; }
            .stat-box { text-align: center; }
            .stat-val { font-size: 24px; font-weight: bold; color: #1a1a1a; margin-top: 5px; }
          </style>
        </head>
        <body onload="window.print()">
          <h1>تقرير المحاسبة وسجل العمليات النهائي - المول الرقمي Digital Mall</h1>
          <p style="text-anchor: middle; text-align: center; color: #666;">تاريخ طباعة المستند المالي: ${new Date().toLocaleString('ar-YE')}</p>
          
          <div class="stats-container">
            <div class="stat-box">
              <div>إجمالي المبيعات المؤكدة والنشطة</div>
              <div class="stat-val">${totalSalesOfCompletedAndProcessing} ريال يمني</div>
            </div>
            <div class="stat-box">
              <div>عمولات التاجرات المستحقة</div>
              <div class="stat-val">${totalCommissionsEarnedByVendors} ريال يمني</div>
            </div>
            <div class="stat-box">
              <div>صافي أرباح منصة المول الرقمي Digital Mall</div>
              <div class="stat-val" style="color: #059669;">${appNetProfits} ريال يمني</div>
            </div>
          </div>

          <h3>جدول تفصيلي بالطلبات والعمليات المسجلة</h3>
          <table>
            <thead>
              <tr>
                <th style="padding: 10px;">رقم الطلب</th>
                <th style="padding: 10px;">هاتف الزبون</th>
                <th style="padding: 10px;">بنك السداد المختار</th>
                <th style="padding: 10px;">مجموع الفاتورة</th>
                <th style="padding: 10px;">الحالة التشغيلية</th>
                <th style="padding: 10px;">تاريخ الطلب</th>
              </tr>
            </thead>
            <tbody>
              ${rows}
            </tbody>
          </table>

          <h3 style="margin-top: 40px;">مستخرج سجل الرقابة المالي المباشر (Audit Log)</h3>
          <table>
            <thead>
              <tr>
                <th style="padding: 8px;">التوقيت</th>
                <th style="padding: 8px;">المنفذ</th>
                <th style="padding: 8px;">العملية الأيضية</th>
                <th style="padding: 8px;">التفاصيل والأطراف المشتركة</th>
              </tr>
            </thead>
            <tbody>
              ${auditRows}
            </tbody>
          </table>

          <div style="margin-top: 60px; display: flex; justify-content: space-between;">
            <div>توطيد وتوثيق: <b>المفتش الأمني العام</b></div>
            <div>تعميد واستلام: <b>المدير العام (Digital Mall)</b></div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Convert files / Capture preview images helper
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        callback(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div id="admin_dashboard" className="grid grid-cols-1 lg:grid-cols-5 gap-6 min-h-screen">
      
      {/* Sidebar Command Controls */}
      <div className="lg:col-span-1 bg-[#1E1E1E] border border-stone-800 rounded-2xl p-4 flex flex-col gap-2">
        <div className="flex items-center gap-3 px-3 py-4 mb-4 border-b border-stone-800">
          <div className="w-10 h-10 rounded-full bg-[#D4AF37] fill-amber-300 flex items-center justify-center text-black font-bold text-lg">
            مدير
          </div>
          <div>
            <h3 className="font-bold text-sm text-[#D4AF37]">المدير العام الموفق</h3>
            <span className="text-[11px] text-stone-400">تحكم مطلق ورقابي</span>
          </div>
        </div>

        {[
          { id: 'insights', label: 'لوحة القيادة والمبيعات', icon: DollarSign },
          { id: 'employees', label: 'طاقم العمل والصلاحيات', icon: Users },
          { id: 'vendors', label: 'إدارة المتاجر والتجار', icon: Store },
          { id: 'storesMap', label: 'خريطة مواقع المتاجر', icon: Map },
          { id: 'products', label: 'مستودع المنتجات الملكي', icon: ShoppingBag },
          { id: 'categories', label: 'تبويبات وأقسام المول', icon: Grid },
          { id: 'banks', label: 'الحسابات البنكية المحلية', icon: CreditCard },
          { id: 'walletsBreakdown', label: 'أرصدة المحافظ والبنوك', icon: Building2 },
          { id: 'merchantBalances', label: 'مستحقات وأرصدة التجار', icon: UserCheck },
          { id: 'shipping', label: 'إدارة خيارات الشحن', icon: Truck },
          { id: 'appAppearance', label: 'مظهر وهوية التطبيق', icon: Palette },
          { id: 'banners', label: 'الحملات والبنرات الإعلانية', icon: ImageIcon },
          { id: 'socials', label: 'روابط اتصالات السوشيال', icon: Share2 },
          { id: 'withdrawals', label: 'طلبات سحب الأرباح', icon: Wallet },
          { id: 'audit', label: 'سجل العمليات والرقابة', icon: FileText }
        ].map(btn => {
          const Icon = btn.icon;
          return (
            <button
              key={btn.id}
              onClick={() => setActiveTab(btn.id as any)}
              className={`w-full text-right px-4 py-3 rounded-xl text-sm flex items-center gap-3 transition-all ${
                activeTab === btn.id 
                  ? 'bg-gradient-to-l from-[#352B2E] to-[#1E1E1E] text-[#D4AF37] border-r-4 border-[#D4AF37] font-bold shadow-md shadow-[#231a1e]' 
                  : 'text-stone-300 hover:bg-stone-800 hover:text-[#F8C8DC]'
              }`}
            >
              <Icon size={18} className="text-stone-400" />
              <span>{btn.label}</span>
            </button>
          );
        })}

        <div className="mt-8 p-3 rounded-xl bg-orange-950/20 border border-orange-500/20 text-orange-200 text-xs flex flex-col gap-2">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle size={14} className="text-orange-400" />
            <span>عمولة المنصة الثابتة</span>
          </div>
          <p className="text-[10px] leading-relaxed text-stone-300">
            تتم إضافة هذه العمولة تلقائياً بسعر أي منتج تضيفه التاجرة عبر لوحتها ليرى الزبون السعر الإجمالي شاملاً ربح المنصة.
          </p>
          <div className="flex items-center gap-2 mt-1">
            <input 
              type="number" 
              value={commissionRate}
              className="w-20 bg-stone-900 border border-stone-700 text-amber-400 text-xs text-center py-1 rounded"
              onChange={(e) => handleUpdateCommissionRate(Number(e.target.value))}
            />
            <span className="text-[10px]">ريال يمني</span>
          </div>

          <button 
            onClick={handleToggleCommission}
            className={`mt-2 py-1.5 px-2 rounded font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all ${
              isCommissionVisible 
                ? 'bg-[#F8C8DC] text-black hover:bg-pink-200' 
                : 'bg-stone-800 text-stone-400 border border-stone-700'
            }`}
          >
            {isCommissionVisible ? <Eye size={13} /> : <EyeOff size={13} />}
            <span>{isCommissionVisible ? 'العمولة معروضة للعام' : 'العمولة مخبأة بالمحفظة'}</span>
          </button>
        </div>

        {/* Verbatim Request: Free beginning setup toggle */}
        <div className="mt-4 p-3 rounded-xl bg-purple-950/20 border border-purple-500/20 text-purple-200 text-xs flex flex-col gap-2">
          <div className="flex items-center gap-1.5 font-bold">
            <Sparkles size={14} className="text-purple-400" />
            <span>فترة مجانية لبداية المشروع</span>
          </div>
          <p className="text-[10px] leading-relaxed text-stone-300">
            تفعيل هذا الخيار يعفي المتاجر من الرسوم والعمولات تلقائياً لتشجيعهم في بداية تشغيل المنصة.
          </p>
          <div className="flex items-center gap-2 mt-1">
            <input 
              type="checkbox" 
              id="is_free_beginning_chk"
              checked={database.commissionSettings?.isFreeBeginning || false}
              className="rounded border-stone-700 text-purple-500 focus:ring-purple-500"
              onChange={(e) => {
                const updatedSettings = {
                  ...database.commissionSettings,
                  isFreeBeginning: e.target.checked
                };
                onSave({
                  ...database,
                  commissionSettings: updatedSettings
                });
                logOperation(
                  currentUser.id,
                  currentUser.name,
                  currentUser.role,
                  e.target.checked ? 'تنشيط الفترة المجانية' : 'إلغاء الفترة المجانية',
                  e.target.checked ? 'تم تفعيل الفترة المجانية للمشروع وإعفاء المتاجر من الرسوم والعمولات بنجاح' : 'تم إنهاء الفترة المجانية وإعادة تطبيق الرسوم والعمولات القياسية للمنصة'
                );
              }}
            />
            <label htmlFor="is_free_beginning_chk" className="text-[10px] cursor-pointer select-none">
              {database.commissionSettings?.isFreeBeginning ? '🟢 الفترة المجانية نشطة الآن' : '🔴 الرسوم مفعلة قياسياً'}
            </label>
          </div>
        </div>
      </div>

      {/* Main Tab View Port */}
      <div className="lg:col-span-4 bg-[#1E1E1E] border border-stone-800 rounded-2xl p-6 relative">
        
        {/* Insights / Financial Overview */}
        {activeTab === 'insights' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h2 className="text-2xl font-black text-[#D4AF37]">التقارير المحاسبية والمبيعات المتقدمة</h2>
                <p className="text-xs text-stone-400 mt-1">متابعة دقيقة لتدفق الأرصدة عبر محافظ التاجرات وصافي عائدات منصة المول الرقمي Digital Mall</p>
              </div>

              <button
                onClick={handleExportPrint}
                className="bg-stone-800 border border-[#D4AF37] hover:bg-[#D4AF37]/10 text-[#D4AF37] font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
              >
                <Download size={14} />
                <span>تحميل وتصدير PDF / Excel للطباعة</span>
              </button>
            </div>

            {/* Quick Interactive Financial Summary Cards with Drill-down Modals */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Card 1: Net Commissions */}
              <div 
                onClick={() => setSelectedFinancialModal('commissions')}
                className="bg-stone-900 hover:bg-stone-850 border border-amber-500/30 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] shadow-lg group"
              >
                <div className="flex justify-between items-center text-xs text-stone-400 mb-2">
                  <span>صافي العمولات المقتطعة</span>
                  <Percent size={16} className="text-[#D4AF37]" />
                </div>
                <div className="text-xl font-black text-[#D4AF37]">
                  {database.orders
                    .filter(o => o.status === 'completed')
                    .flatMap(o => o.items)
                    .reduce((sum, item) => sum + ((item.product.commission || 300) * item.quantity), 0)
                    .toLocaleString('ar-YE')} <span className="text-xs">ر.ي</span>
                </div>
                <p className="text-[10px] text-stone-500 mt-2 flex items-center gap-1 group-hover:text-amber-400">
                  <span>اضغط لعرض تفاصيل العمولات حسب المتاجر</span>
                  <ArrowUpRight size={10} />
                </p>
              </div>

              {/* Card 2: Platform Revenue */}
              <div 
                onClick={() => setSelectedFinancialModal('platformRevenue')}
                className="bg-stone-900 hover:bg-stone-850 border border-emerald-500/30 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] shadow-lg group"
              >
                <div className="flex justify-between items-center text-xs text-stone-400 mb-2">
                  <span>إجمالي إيرادات المبيعات</span>
                  <DollarSign size={16} className="text-emerald-400" />
                </div>
                <div className="text-xl font-black text-emerald-400">
                  {database.orders
                    .filter(o => o.status !== 'pending_payment')
                    .reduce((sum, o) => sum + o.totalAmount, 0)
                    .toLocaleString('ar-YE')} <span className="text-xs">ر.ي</span>
                </div>
                <p className="text-[10px] text-stone-500 mt-2 flex items-center gap-1 group-hover:text-emerald-400">
                  <span>اضغط لعرض كشف الفواتير وإجمالي العائدات</span>
                  <ArrowUpRight size={10} />
                </p>
              </div>

              {/* Card 3: Approved Withdrawals */}
              <div 
                onClick={() => setSelectedFinancialModal('approvedWithdrawals')}
                className="bg-stone-900 hover:bg-stone-850 border border-blue-500/30 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] shadow-lg group"
              >
                <div className="flex justify-between items-center text-xs text-stone-400 mb-2">
                  <span>سحوبات التجار الناجحة</span>
                  <CheckCircle size={16} className="text-blue-400" />
                </div>
                <div className="text-xl font-black text-blue-400">
                  {database.withdrawalRequests
                    .filter(w => w.status === 'approved')
                    .reduce((sum, w) => sum + w.amount, 0)
                    .toLocaleString('ar-YE')} <span className="text-xs">ر.ي</span>
                </div>
                <p className="text-[10px] text-stone-500 mt-2 flex items-center gap-1 group-hover:text-blue-400">
                  <span>اضغط لمراجعة الحوالات المسددة للتجار</span>
                  <ArrowUpRight size={10} />
                </p>
              </div>

              {/* Card 4: Pending Withdrawals */}
              <div 
                onClick={() => setSelectedFinancialModal('pendingWithdrawals')}
                className="bg-stone-900 hover:bg-stone-850 border border-orange-500/30 rounded-2xl p-4 cursor-pointer transition-all hover:scale-[1.02] shadow-lg group"
              >
                <div className="flex justify-between items-center text-xs text-stone-400 mb-2">
                  <span>سحوبات التجار المعلقة</span>
                  <Clock size={16} className="text-orange-400 animate-pulse" />
                </div>
                <div className="text-xl font-black text-orange-400">
                  {database.withdrawalRequests
                    .filter(w => w.status === 'pending')
                    .reduce((sum, w) => sum + w.amount, 0)
                    .toLocaleString('ar-YE')} <span className="text-xs">ر.ي</span>
                </div>
                <p className="text-[10px] text-stone-500 mt-2 flex items-center gap-1 group-hover:text-orange-400">
                  <span>اضغط للاعتماد أو الرفض السريع</span>
                  <ArrowUpRight size={10} />
                </p>
              </div>
            </div>

            {/* Admin Summary Dashboard & Interactive Chart Component */}
            <AdminChart database={database} />

            {/* Live Chart/Status Mock Layout */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
              <h4 className="font-bold text-[#F8C8DC] text-sm mb-4">التدقيق المالي للطلبات المحققة بالمتجر</h4>
              <div className="overflow-x-auto">
                <table className="w-full text-right text-xs">
                  <thead>
                    <tr className="border-b border-stone-800 text-stone-400 font-bold">
                      <th className="py-3 px-2">رقم الفاتورة</th>
                      <th className="py-3 px-2">هاتف الزبون والتحويل</th>
                      <th className="py-3 px-2">بنك السداد المعتد</th>
                      <th className="py-3 px-2">العمولة المقتطعة</th>
                      <th className="py-3 px-2">مجموع الفاتورة</th>
                      <th className="py-3 px-2">الحالة التشغيلية</th>
                    </tr>
                  </thead>
                  <tbody>
                    {database.orders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center py-8 text-stone-500">لا توجد بمستندات المتجر فواتير مدفوعة بالوقت الراهن</td>
                      </tr>
                    ) : (
                      database.orders.map(order => {
                        const hasLowRating = order.reviews && (order.reviews.productRating < 3 || order.reviews.storeRating < 3);
                        return (
                          <tr key={order.id} className="border-b border-stone-850 hover:bg-stone-850 transition-colors">
                            <td className="py-3 px-2 font-bold text-stone-300 flex items-center gap-1.5">
                              <span>#{order.id}</span>
                              {hasLowRating && (
                                <span className="bg-red-950 text-red-400 px-1.5 py-0.5 rounded text-[9px] flex items-center gap-0.5 border border-red-950 font-black animate-pulse">
                                  <AlertTriangle size={8} /> تقييم منخفض
                                </span>
                              )}
                            </td>
                            <td className="py-3 px-2">{order.customerPhone}</td>
                            <td className="py-3 px-2">{order.bankName}</td>
                            <td className="py-3 px-2 text-amber-500 font-bold">300 ريال</td>
                            <td className="py-3 px-2 text-[#D4AF37] font-semibold">{order.totalAmount} ريال</td>
                            <td className="py-3 px-2">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] ${
                                order.status === 'completed' ? 'bg-emerald-950 text-emerald-400' :
                                order.status === 'shipped' ? 'bg-blue-950 text-blue-400' :
                                order.status === 'processing' ? 'bg-amber-950 text-amber-400' : 'bg-stone-800 text-stone-400'
                              }`}>
                                {order.status === 'completed' ? 'تم ومطابقته' :
                                 order.status === 'shipped' ? 'قيد الشحن' :
                                 order.status === 'processing' ? 'قيد التجهيز' : 'بانتظار التحويل'}
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- Tab: Wallets & Banks Funds Breakdown --- */}
        {activeTab === 'walletsBreakdown' && (
          <div className="space-y-6">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
              <h3 className="text-lg font-extrabold text-[#D4AF37] mb-1">توزيع السيولة النقدية في البنوك والمحافظ اليمنية</h3>
              <p className="text-xs text-stone-400 mb-6">تقرير تحليلي بالأرصدة الميدانية المتاحة لتسوية مستحقات التاجرات والشحن بالريال اليمني YER</p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-stone-950 border border-amber-500/30 rounded-xl p-4">
                  <span className="text-xs text-stone-400 font-bold block mb-1">🏦 بنك الكريمي للتمويل الأصغر</span>
                  <span className="text-2xl font-black text-[#D4AF37]">485,000 <span className="text-xs">ر.ي</span></span>
                  <p className="text-[10px] text-stone-500 mt-1">حساب مميز رقم: 31102938</p>
                </div>

                <div className="bg-stone-950 border border-emerald-500/30 rounded-xl p-4">
                  <span className="text-xs text-stone-400 font-bold block mb-1">🏦 بنك البسيري والتضامن</span>
                  <span className="text-2xl font-black text-emerald-400">310,000 <span className="text-xs">ر.ي</span></span>
                  <p className="text-[10px] text-stone-500 mt-1">تحويلات تجار عدن وحضرموت</p>
                </div>

                <div className="bg-stone-950 border border-blue-500/30 rounded-xl p-4">
                  <span className="text-xs text-stone-400 font-bold block mb-1">📲 شبكة النجم والامتياز ومحفظة جيب</span>
                  <span className="text-2xl font-black text-blue-400">195,000 <span className="text-xs">ر.ي</span></span>
                  <p className="text-[10px] text-stone-500 mt-1">حوالات مباشرة وقيد الصرف</p>
                </div>
              </div>

              <div className="border border-stone-800 rounded-xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-stone-950 text-stone-400 border-b border-stone-800 font-bold">
                    <tr>
                      <th className="py-3 px-4">اسم المؤسسة / البنك</th>
                      <th className="py-3 px-4">رقم الحساب / المحفظة</th>
                      <th className="py-3 px-4">إجمالي الإيداعات</th>
                      <th className="py-3 px-4">السحوبات المسددة</th>
                      <th className="py-3 px-4">الرصيد الصافي المتاح</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-850">
                    <tr className="hover:bg-stone-850/50">
                      <td className="py-3 px-4 font-bold text-stone-200">بنك الكريمي المميز</td>
                      <td className="py-3 px-4 font-mono text-amber-500">31102938</td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">620,000 ر.ي</td>
                      <td className="py-3 px-4 text-red-400 font-bold">135,000 ر.ي</td>
                      <td className="py-3 px-4 text-[#D4AF37] font-black">485,000 ر.ي</td>
                    </tr>
                    <tr className="hover:bg-stone-850/50">
                      <td className="py-3 px-4 font-bold text-stone-200">بنك البسيري للتمويل</td>
                      <td className="py-3 px-4 font-mono text-amber-500">90821200</td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">400,000 ر.ي</td>
                      <td className="py-3 px-4 text-red-400 font-bold">90,000 ر.ي</td>
                      <td className="py-3 px-4 text-[#D4AF37] font-black">310,000 ر.ي</td>
                    </tr>
                    <tr className="hover:bg-stone-850/50">
                      <td className="py-3 px-4 font-bold text-stone-200">شبكة النجم السريع الموحدة</td>
                      <td className="py-3 px-4 font-mono text-amber-500">773322110</td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">250,000 ر.ي</td>
                      <td className="py-3 px-4 text-red-400 font-bold">55,000 ر.ي</td>
                      <td className="py-3 px-4 text-[#D4AF37] font-black">195,000 ر.ي</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- Tab: Merchant Balances & Holds --- */}
        {activeTab === 'merchantBalances' && (
          <div className="space-y-6">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
              <h3 className="text-lg font-extrabold text-[#D4AF37] mb-1">تفاصيل مستحقات وأرصدة المتاجر (التجار)</h3>
              <p className="text-xs text-stone-400 mb-6">كشف حساب تفصيلي بالمبيعات، الأمانات المعلقة، والرصيد الجاهز للسحب بالريال اليمني YER</p>

              <div className="border border-stone-800 rounded-xl overflow-hidden">
                <table className="w-full text-right text-xs">
                  <thead className="bg-stone-950 text-stone-400 border-b border-stone-800 font-bold">
                    <tr>
                      <th className="py-3 px-4">المتجر وصاحبته</th>
                      <th className="py-3 px-4">إجمالي مبيعات المتجر</th>
                      <th className="py-3 px-4">عدد الطلبات المنفذة</th>
                      <th className="py-3 px-4">الرصيد المعلق (أمانات)</th>
                      <th className="py-3 px-4">الرصيد المتاح للسحب</th>
                      <th className="py-3 px-4">الإجراءات التسوية</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-850">
                    {database.users.filter(u => u.role === 'vendor').map(v => {
                      const vendorOrders = database.orders.filter(o => 
                        (o.items || []).some(item => item.product?.vendorId === v.id) && o.status !== 'pending_payment'
                      );
                      const vendorTotalSales = vendorOrders.reduce((sum, o) => sum + o.totalAmount, 0);
                      
                      return (
                        <tr key={v.id} className="hover:bg-stone-850/50">
                          <td className="py-3 px-4 flex items-center gap-2">
                            {v.logoImage ? (
                              <img src={v.logoImage} className="w-8 h-8 rounded-lg object-cover border border-[#D4AF37]" alt="Logo" />
                            ) : (
                              <div className="w-8 h-8 rounded-lg bg-pink-950 text-[#F8C8DC] flex items-center justify-center font-bold">
                                {v.name[0]}
                              </div>
                            )}
                            <div>
                              <div className="font-bold text-stone-200">{v.name}</div>
                              <div className="text-[10px] text-stone-400">{v.fullName || v.phone}</div>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-bold text-emerald-400">{vendorTotalSales.toLocaleString('ar-YE')} ر.ي</td>
                          <td className="py-3 px-4 text-stone-300 font-mono">{vendorOrders.length} طلبات</td>
                          <td className="py-3 px-4 text-orange-400 font-bold font-mono">15,000 ر.ي</td>
                          <td className="py-3 px-4 text-[#D4AF37] font-black font-mono">35,000 ر.ي</td>
                          <td className="py-3 px-4">
                            <button
                              onClick={() => {
                                alert(`تم إرسال طلب تسوية وتسديد رصيد متجر (${v.name}) إلى الغرفة المصرفية.`);
                              }}
                              className="bg-[#D4AF37]/20 hover:bg-[#D4AF37] text-[#D4AF37] hover:text-black border border-[#D4AF37]/40 px-3 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer"
                            >
                              صرف وتسوية
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- Tab: Shipping Management --- */}
        {activeTab === 'shipping' && (
          <div className="space-y-6">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-extrabold text-[#D4AF37]">إدارة خيارات الشحن والتوصيل بالمول</h3>
                  <p className="text-xs text-stone-400 mt-1">التحكم في الشحن المباشر عبر التطبيق، مكاتب الشحن الخارجية، وتخصيص أسعار التوصيل</p>
                </div>

                <button
                  onClick={() => setShowAddCompanyModal(true)}
                  className="bg-[#D4AF37] text-black hover:bg-amber-500 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
                >
                  <Plus size={16} />
                  <span>إضافة شركة شحن جديدة</span>
                </button>
              </div>

              {/* Toggles */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-stone-200 block">الشحن المباشر بالتطبيق</span>
                    <span className="text-[10px] text-stone-400">توصيل مناديب المنصة المباشر</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={shippingConfig.appExpressShippingEnabled}
                    onChange={e => {
                      const updated = { ...shippingConfig, appExpressShippingEnabled: e.target.checked };
                      setShippingConfig(updated);
                      onSave({ ...database, shippingSettings: updated });
                    }}
                    className="w-5 h-5 accent-[#D4AF37] cursor-pointer"
                  />
                </div>

                <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-stone-200 block">شركات الشحن الخارجية</span>
                    <span className="text-[10px] text-stone-400">مكاتب وشركات النقل بالمحافظات</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={shippingConfig.externalShippingEnabled}
                    onChange={e => {
                      const updated = { ...shippingConfig, externalShippingEnabled: e.target.checked };
                      setShippingConfig(updated);
                      onSave({ ...database, shippingSettings: updated });
                    }}
                    className="w-5 h-5 accent-[#D4AF37] cursor-pointer"
                  />
                </div>

                <div className="bg-stone-950 p-4 rounded-xl border border-stone-800 flex justify-between items-center">
                  <div>
                    <span className="text-xs font-bold text-stone-200 block">إظهار الخيارات للتجار</span>
                    <span className="text-[10px] text-stone-400">سماح للتجار باختيار شركة التوصيل</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={shippingConfig.showToVendors}
                    onChange={e => {
                      const updated = { ...shippingConfig, showToVendors: e.target.checked };
                      setShippingConfig(updated);
                      onSave({ ...database, shippingSettings: updated });
                    }}
                    className="w-5 h-5 accent-[#D4AF37] cursor-pointer"
                  />
                </div>
              </div>

              {/* Companies List */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs text-stone-300">شركات ومكاتب الشحن المسجلة:</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {shippingConfig.companies.map(c => {
                    const companyFee = c.fee ?? c.price ?? 2000;
                    return (
                      <div key={c.id} className={`bg-stone-950 border p-4 rounded-xl flex justify-between items-center transition-all ${c.active ? 'border-stone-800' : 'border-red-900/40 opacity-60'}`}>
                        <div className="space-y-1">
                          <div className="font-bold text-stone-200 text-sm flex items-center gap-2">
                            <Truck size={16} className="text-[#D4AF37]" />
                            <span>{c.name}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${c.active ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-red-950 text-red-400 border border-red-800'}`}>
                              {c.active ? 'مفعلة' : 'معطلة'}
                            </span>
                          </div>
                          <div className="text-[11px] text-stone-400">
                            رسوم التوصيل: <span className="text-[#D4AF37] font-bold">{(companyFee || 0).toLocaleString('ar-YE')} ر.ي</span> • الوقت: {c.estimatedTime || '24-48 ساعة'}
                          </div>
                          <div className="text-[10px] text-stone-500">
                            التغطية: {Array.isArray(c.coverageAreas) ? c.coverageAreas.join('، ') : 'جميع المناطق'}
                          </div>
                        </div>

                        <div className="flex items-center gap-1.5">
                          {/* Active toggle */}
                          <button
                            type="button"
                            onClick={() => {
                              const updatedCompanies = shippingConfig.companies.map(x => x.id === c.id ? { ...x, active: !x.active } : x);
                              const updated = { ...shippingConfig, companies: updatedCompanies };
                              setShippingConfig(updated);
                              onSave({ ...database, shippingSettings: updated });
                            }}
                            className={`p-2 rounded-lg text-xs font-bold transition-colors cursor-pointer ${c.active ? 'bg-amber-950/40 text-amber-400 hover:bg-amber-900/50' : 'bg-emerald-950/40 text-emerald-400 hover:bg-emerald-900/50'}`}
                            title={c.active ? 'تعطيل الشركة' : 'تفعيل الشركة'}
                          >
                            {c.active ? 'إيقاف' : 'تفعيل'}
                          </button>

                          {/* Edit button */}
                          <button
                            type="button"
                            onClick={() => setEditingCompany({
                              ...c,
                              fee: c.fee ?? c.price ?? 2000,
                              coverageAreasText: Array.isArray(c.coverageAreas) ? c.coverageAreas.join('، ') : 'جميع المناطق'
                            })}
                            className="text-stone-300 hover:text-white p-2 rounded-lg bg-stone-850 hover:bg-stone-800 cursor-pointer"
                            title="تعديل تفاصيل الشركة"
                          >
                            <Edit3 size={15} />
                          </button>

                          {/* Delete button */}
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm(`هل أنت متاكد من حذف شركة الشحن "${c.name}"؟`)) {
                                const updatedCompanies = shippingConfig.companies.filter(x => x.id !== c.id);
                                const updated = { ...shippingConfig, companies: updatedCompanies };
                                setShippingConfig(updated);
                                onSave({ ...database, shippingSettings: updated });
                              }
                            }}
                            className="text-red-400 hover:text-red-300 p-2 rounded-lg bg-red-950/30 hover:bg-red-950/60 cursor-pointer"
                            title="حذف الشركة"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- Tab: App Appearance Settings --- */}
        {activeTab === 'appAppearance' && (
          <div className="space-y-6">
            <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6">
              <h3 className="text-lg font-extrabold text-[#D4AF37] mb-1">إعدادات مظهر وهوية التطبيق</h3>
              <p className="text-xs text-stone-400 mb-6">تعديل اسم التطبيق، الألوان الملكية الرئيسية، الشعار والإعلانات الفوقية</p>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onSave({ ...database, appAppearanceSettings: appearanceConfig });
                  logOperation(
                    currentUser.id,
                    currentUser.name,
                    currentUser.role,
                    'تعديل مظهر التطبيق',
                    `تم تحديث ألوان وهوية التطبيق بنجاح.`
                  );
                  alert('✨ تم حفظ وتطبيق المظهر والهوية الجديدة للتطبيق بنجاح!');
                }}
                className="space-y-4 max-w-2xl"
              >
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">اسم التطبيق والمول</label>
                  <input
                    type="text"
                    className="w-full bg-stone-950 border border-stone-800 text-stone-100 text-xs py-2.5 px-3 rounded-xl focus:border-[#D4AF37]"
                    value={appearanceConfig.appName}
                    onChange={e => setAppearanceConfig({ ...appearanceConfig, appName: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">اللون الملكي الرئيسي للمواضيع</label>
                  <div className="flex gap-3 items-center">
                    {[
                      { name: 'ذهبي فاخر (Gold)', code: '#D4AF37' },
                      { name: 'زمردي يمني (Emerald)', code: '#00A86B' },
                      { name: 'وردي ملكي (Royal Rose)', code: '#F8C8DC' },
                      { name: 'عنبري دافئ (Deep Amber)', code: '#F59E0B' },
                      { name: 'ياقوتي أزرق (Sapphire)', code: '#2563EB' }
                    ].map(col => (
                      <button
                        key={col.code}
                        type="button"
                        onClick={() => setAppearanceConfig({ ...appearanceConfig, primaryColor: col.code })}
                        className={`w-8 h-8 rounded-full border-2 transition-transform ${
                          appearanceConfig.primaryColor === col.code ? 'scale-125 border-white shadow-lg' : 'border-transparent opacity-80'
                        }`}
                        style={{ backgroundColor: col.code }}
                        title={col.name}
                      />
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">
                    رابط الشعار الرئيسي (Logo URL) - من استديو أو معرض أو مدير ملفات الهاتف 🖼️
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      placeholder="رابط الشعار أو كود base64"
                      className="flex-1 bg-stone-950 border border-stone-800 text-stone-100 text-xs py-2.5 px-3 rounded-xl focus:border-[#D4AF37] font-mono text-left"
                      value={appearanceConfig.logoUrl}
                      onChange={e => setAppearanceConfig({ ...appearanceConfig, logoUrl: e.target.value })}
                    />
                    <label className="bg-[#D4AF37] hover:bg-amber-400 text-stone-950 font-black text-xs px-3.5 py-2.5 rounded-xl cursor-pointer transition-colors shrink-0 flex items-center gap-1.5 shadow-md">
                      <span>📸 رفع من المعرض / الهاتف</span>
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="hidden" 
                        onChange={(e) => handleImageUpload(e, (base64) => setAppearanceConfig(prev => ({ ...prev, logoUrl: base64 })))} 
                      />
                    </label>
                  </div>

                  {appearanceConfig.logoUrl && (
                    <div className="mt-2.5 bg-stone-950 p-2.5 rounded-xl border border-[#D4AF37]/50 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <img src={appearanceConfig.logoUrl} className="w-10 h-10 object-cover rounded-lg border border-[#D4AF37]" alt="Main Logo Preview" />
                        <div>
                          <span className="text-xs text-[#D4AF37] font-bold block">✓ الشعار الرئيسي المعين حالياً للتطبيق</span>
                          <span className="text-[10px] text-stone-400">جاهز للعرض أعلى شريط الهيدر والتطبيق</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <label className="bg-stone-900 hover:bg-stone-850 text-amber-300 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-amber-800/50 cursor-pointer transition-colors">
                          ✏️ تعديل وتغيير
                          <input 
                            type="file" 
                            accept="image/*" 
                            className="hidden" 
                            onChange={(e) => handleImageUpload(e, (base64) => setAppearanceConfig(prev => ({ ...prev, logoUrl: base64 })))} 
                          />
                        </label>
                        <button
                          type="button"
                          onClick={() => setAppearanceConfig(prev => ({ ...prev, logoUrl: '' }))}
                          className="bg-stone-900 hover:bg-stone-850 text-stone-400 hover:text-red-400 text-[10px] font-bold px-2 py-1.5 rounded-lg border border-stone-800 transition-colors cursor-pointer"
                          title="حذف الشعار"
                        >
                          ✕
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">نص الشريط الإعلاني الأعلى</label>
                  <input
                    type="text"
                    className="w-full bg-stone-950 border border-stone-800 text-stone-100 text-xs py-2.5 px-3 rounded-xl focus:border-[#D4AF37]"
                    value={appearanceConfig.announcementText}
                    onChange={e => setAppearanceConfig({ ...appearanceConfig, announcementText: e.target.value })}
                  />
                </div>

                <div className="flex items-center gap-2 pt-2">
                  <input
                    type="checkbox"
                    id="show_ann"
                    checked={appearanceConfig.showAnnouncement}
                    onChange={e => setAppearanceConfig({ ...appearanceConfig, showAnnouncement: e.target.checked })}
                    className="w-4 h-4 accent-[#D4AF37]"
                  />
                  <label htmlFor="show_ann" className="text-xs text-stone-300 cursor-pointer font-bold">إظهار الشريط الإعلاني أعلى التطبيق</label>
                </div>

                <div className="pt-4 border-t border-stone-800">
                  <button
                    type="submit"
                    className="bg-[#D4AF37] hover:bg-amber-500 text-black font-black text-xs px-6 py-2.5 rounded-xl cursor-pointer"
                  >
                    حفظ وتطبيق المظهر العام ✓
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
        {activeTab === 'employees' && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center bg-stone-900/60 p-4 rounded-xl border border-stone-800">
              <div>
                <h3 className="text-lg font-bold text-[#D4AF37]">تعديل الصلاحيات وإضافة الموظفين</h3>
                <p className="text-xs text-stone-400 mt-1">تحديد الأدوار للطاقم (محاسب مالي، موظف استقبال، مجهز الشريحة)</p>
              </div>
              <button
                onClick={() => {
                  setEmployeeForm({
                    id: '',
                    name: '',
                    email: '',
                    phone: '',
                    role: 'accountant',
                    permissions: {
                      manageProducts: true,
                      manageCategories: true,
                      manageBanks: false,
                      manageBanners: true,
                      manageEmployeeRoles: false,
                      auditTransfers: true,
                      manageOrders: false,
                      viewReports: true
                    }
                  });
                  setShowEmployeeModal(true);
                }}
                className="bg-[#D4AF37] text-black hover:bg-amber-500 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-[#2d2214]"
              >
                <UserPlus size={16} />
                <span>إدراج موظف ومسؤول جديد</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {database.users.filter(u => u.role !== 'customer' && u.role !== 'vendor').map(emp => (
                <div key={emp.id} className="bg-stone-900 border border-stone-800 rounded-xl p-5 flex flex-col gap-3 relative hover:scale-[1.01] transition-transform">
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-pink-100 flex items-center justify-center text-brown-900 font-black">
                        {emp.name.charAt(0)}
                      </div>
                      <div>
                        <h4 className="font-bold text-[#F8C8DC] text-sm">{emp.name}</h4>
                        <p className="text-[10px] text-stone-400 mt-0.5">{emp.email}</p>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg border uppercase ${
                      emp.role === 'admin' ? 'bg-red-950/40 text-red-400 border-red-900' :
                      emp.role === 'accountant' ? 'bg-amber-950/40 text-[#D4AF37] border-[#d4af37]' :
                      'bg-blue-950/40 text-blue-400 border-blue-900'
                    }`}>
                      {emp.role === 'admin' ? 'مدير عام مقتدر' : emp.role === 'accountant' ? 'محاسب عام' : 'موظف استقبال'}
                    </span>
                  </div>

                  <div className="text-[11px] text-stone-300 bg-stone-950/60 p-3 rounded-lg flex flex-col gap-1">
                    <div>هاتف العمل: <span className="text-amber-500 font-bold">{emp.phone}</span></div>
                    {emp.permissions && (
                      <div className="mt-1 flex flex-wrap gap-1.5">
                        {emp.permissions.manageProducts && <span className="bg-stone-800 text-[9px] px-1.5 rounded text-stone-200">📦 مستودعات</span>}
                        {emp.permissions.manageCategories && <span className="bg-stone-800 text-[9px] px-1.5 rounded text-stone-200">📁 أقسام</span>}
                        {emp.permissions.manageBanks && <span className="bg-stone-800 text-[9px] px-1.5 rounded text-stone-200">🏦 حسابات بنكية</span>}
                        {emp.permissions.manageBanners && <span className="bg-stone-800 text-[9px] px-1.5 rounded text-stone-200">🖼️ إعلانات</span>}
                        {emp.permissions.auditTransfers && <span className="bg-amber-900/40 text-[#D4AF37] text-[9px] px-1.5 rounded border border-amber-850">💰 تدقيق مالي</span>}
                        {emp.permissions.manageOrders && <span className="bg-blue-900/40 text-blue-400 text-[9px] px-1.5 rounded border border-blue-850">🚚 شحن وتجهيز</span>}
                        {emp.permissions.viewReports && <span className="bg-emerald-900/40 text-emerald-400 text-[9px] px-1.5 rounded border border-emerald-850">📊 تقارير مالية</span>}
                        {emp.permissions.manageEmployeeRoles && <span className="bg-purple-900/40 text-purple-400 text-[9px] px-1.5 rounded border border-purple-850">👥 إدارة موظفين</span>}
                      </div>
                    )}
                  </div>

                  {emp.role !== 'admin' && (
                    <div className="flex gap-2 justify-end border-t border-stone-850 pt-3 mt-1">
                       <button 
                        onClick={() => {
                          setSelectedEmployeeDetails(emp);
                          setProfileModalTab('activity');
                        }}
                        className="text-stone-400 hover:text-emerald-400 p-1 rounded hover:bg-stone-800 transition-colors"
                        title="سجل العمليات والنشاط"
                      >
                        <FileText size={15} />
                      </button>
                      <button 
                        onClick={() => {
                          setEmployeeForm({
                            id: emp.id,
                            name: emp.name,
                            email: emp.email,
                            phone: emp.phone,
                            role: emp.role,
                            permissions: emp.permissions || {
                              manageProducts: true,
                              manageCategories: true,
                              manageBanks: false,
                              manageBanners: true,
                              manageEmployeeRoles: false,
                              auditTransfers: emp.role === 'accountant',
                              manageOrders: emp.role === 'receiver',
                              viewReports: emp.role === 'accountant'
                            }
                          });
                          setShowEmployeeModal(true);
                        }}
                        className="text-stone-400 hover:text-[#D4AF37] p-1 rounded hover:bg-stone-800 transition-colors"
                        title="تعديل"
                      >
                        <Edit3 size={15} />
                      </button>
                      <button 
                        onClick={() => deleteEmployee(emp.id, emp.name)}
                        className="text-stone-450 hover:text-red-500 p-1 rounded hover:bg-stone-800 transition-colors"
                        title="حذف وإقصاء"
                      >
                        <Trash2 size={15} />
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Tab: Vendors / Stores Management (إدارة المتاجر والتجار) --- */}
        {activeTab === 'vendors' && (
          <div className="flex flex-col gap-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-stone-900/60 p-4 rounded-xl border border-stone-800">
              <div>
                <h3 className="text-lg font-bold text-[#D4AF37] flex items-center gap-2">
                  <Store className="text-[#D4AF37]" size={20} />
                  <span>إدارة المتاجر والشركاء (التجار والتاجهات)</span>
                </h3>
                <p className="text-xs text-stone-400 mt-1">
                  صلاحيات مطلقة للتحكم بالمتاجر، تتبع المبيعات، ومراجعة الهويات والبيانات البنكية
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setEditingVendor(null);
                    setVendorForm({
                      id: '',
                      name: '',
                      fullName: '',
                      email: '',
                      phone: '',
                      currentResidence: '',
                      bankAccountDetails: '',
                      idCardPhoto: '',
                      idCardPhoto2: '',
                      logoImage: '',
                      isApproved: false,
                      isPublishApproved: false,
                      isVerified: false,
                      latitude: 15.3694,
                      longitude: 44.1910,
                      mapAddress: 'صنعاء، اليمن',
                      isBlocked: false,
                      commissionTier: 'bronze',
                      customCommissionRate: 10,
                      taxRate: 5,
                      shippingTariff: 1500
                    });
                    setShowVendorModal(true);
                  }}
                  className="bg-[#D4AF37] text-black hover:bg-amber-500 font-black text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer shadow-md shadow-[#2d2214]"
                >
                  <Plus size={16} />
                  <span>تأسيس متجر تجاري جديد يدوياً</span>
                </button>
              </div>
            </div>

            {/* Vendors Summary Statistics */}
            {(() => {
              const vendors = database.users.filter(u => u.role === 'vendor');
              const activeCount = vendors.filter(v => !v.isBlocked).length;
              const blockedCount = vendors.filter(v => v.isBlocked).length;
              const totalVendorProductsCount = database.products.filter(p => p.vendorId !== null).length;
              const pendingApplications = database.users.filter(u => u.storeApplicationStatus === 'pending');

              return (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="bg-stone-900/80 border border-stone-850 p-4 rounded-xl">
                      <span className="text-stone-400 text-[10px] block font-bold">إجمالي المتاجر الشريكة</span>
                      <span className="text-xl font-bold text-[#D4AF37] font-mono">{vendors.length} متاجر</span>
                    </div>
                    <div className="bg-stone-900/80 border border-stone-850 p-4 rounded-xl">
                      <span className="text-stone-400 text-[10px] block font-bold">المتاجر النشطة حالياً</span>
                      <span className="text-xl font-bold text-emerald-400 font-mono">{activeCount} نشط</span>
                    </div>
                    <div className="bg-stone-900/80 border border-stone-850 p-4 rounded-xl">
                      <span className="text-stone-400 text-[10px] block font-bold">طلبات جديدة قيد المراجعة</span>
                      <span className="text-xl font-bold text-amber-400 font-mono">{pendingApplications.length} طلب</span>
                    </div>
                    <div className="bg-stone-900/80 border border-stone-850 p-4 rounded-xl">
                      <span className="text-stone-400 text-[10px] block font-bold">معروضات الشركاء بالمول</span>
                      <span className="text-xl font-bold text-blue-400 font-mono">{totalVendorProductsCount} موديل</span>
                    </div>
                  </div>

                  {/* PENDING APPLICATIONS REVIEW BLOCK */}
                  {pendingApplications.length > 0 && (
                    <div className="bg-amber-950/20 border border-amber-800/50 rounded-2xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                        <Clock size={16} className="animate-pulse text-amber-400" />
                        <span>طلبات تأسيس متاجر جديدة تنتظر اعتماد وتأشيرة الإدارة ({pendingApplications.length})</span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {pendingApplications.map(req => (
                          <div key={req.id} className="bg-stone-900 border border-amber-900/40 rounded-xl p-3.5 space-y-2">
                            <div className="flex justify-between items-start">
                              <div>
                                <h5 className="font-extrabold text-white text-xs">{req.storeName || req.name}</h5>
                                <p className="text-[11px] text-stone-400">المالك: {req.fullName || req.name} | {req.phone}</p>
                              </div>
                              <span className="bg-amber-500/10 text-amber-400 text-[9px] font-mono px-2 py-0.5 rounded border border-amber-500/20">
                                قيد الدراسة ⏳
                              </span>
                            </div>

                            <p className="text-[10px] text-stone-400">
                              العنوان: {req.currentResidence || 'اليمن - صنعاء'} | البنك: {req.bankAccountDetails || 'غير محدد'}
                            </p>

                            <div className="flex gap-2 pt-1">
                              <button
                                onClick={() => {
                                  const updatedUsers = database.users.map(u => u.id === req.id ? {
                                    ...u,
                                    role: 'vendor' as const,
                                    isApproved: true,
                                    isPublishApproved: true,
                                    storeApplicationStatus: 'approved' as const
                                  } : u);
                                  onSave({ ...database, users: updatedUsers });
                                }}
                                className="bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-[10px] px-3 py-1.5 rounded-lg transition-all cursor-pointer"
                              >
                                ✓ قبول وتنشيط المتجر
                              </button>

                              <button
                                onClick={() => {
                                  const reason = prompt('يرجى ذكر سبب الرفض:') || 'بيانات متجر غير مستوفية الشروط';
                                  const updatedUsers = database.users.map(u => u.id === req.id ? {
                                    ...u,
                                    storeApplicationStatus: 'rejected' as const,
                                    storeApplicationRejectReason: reason
                                  } : u);
                                  onSave({ ...database, users: updatedUsers });
                                }}
                                className="bg-stone-850 hover:bg-red-950 text-stone-300 hover:text-red-300 font-bold text-[10px] px-3 py-1.5 rounded-lg border border-stone-800 transition-all cursor-pointer"
                              >
                                ✕ رفض الطلب
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Filter Search Bar */}
            <div className="relative">
              <input
                type="text"
                placeholder="البحث عن متجر بالاسم، اسم التاجر، رقم الجوال أو عنوان الإقامة..."
                value={vendorSearchKeyword}
                onChange={(e) => setVendorSearchKeyword(e.target.value)}
                className="w-full bg-stone-900 border border-stone-800 rounded-xl py-3 px-10 text-xs text-white placeholder-stone-500 focus:border-[#D4AF37] focus:outline-none"
              />
              <Search size={16} className="absolute right-3.5 top-3.5 text-stone-500" />
            </div>

            {/* Active Store Showcase and Actions */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {database.users
                .filter(u => u.role === 'vendor')
                .filter(u => {
                  if (!vendorSearchKeyword.trim()) return true;
                  const kw = vendorSearchKeyword.toLowerCase();
                  return (
                    u.name.toLowerCase().includes(kw) ||
                    (u.fullName || '').toLowerCase().includes(kw) ||
                    u.phone.includes(kw) ||
                    (u.email || '').toLowerCase().includes(kw) ||
                    (u.currentResidence || '').toLowerCase().includes(kw)
                  );
                })
                .map(vendor => {
                  const vendorProducts = database.products.filter(p => p.vendorId === vendor.id);
                  // Calculate vendor sales stats
                  const vendorOrders = database.orders.filter(o => 
                    o.status === 'completed' && 
                    (o.items || []).some(item => item.product?.vendorId === vendor.id)
                  );
                  const totalEarnedCommissions = vendorOrders.reduce((sum, o) => {
                    const vendorItems = (o.items || []).filter(item => item.product?.vendorId === vendor.id);
                    return sum + vendorItems.reduce((s, item) => s + ((item.product?.originalPrice || item.product?.price || 0) * item.quantity), 0);
                  }, 0);

                  // Calculate payout details
                  const vendorPayouts = database.withdrawalRequests.filter(w => w.vendorId === vendor.id);
                  const completedPayouts = vendorPayouts.filter(w => w.status === 'approved').reduce((sum, w) => sum + w.amount, 0);
                  const pendingPayouts = vendorPayouts.filter(w => w.status === 'pending').reduce((sum, w) => sum + w.amount, 0);

                  return (
                    <div key={vendor.id} className={`bg-stone-900 border ${vendor.isBlocked ? 'border-red-900/60' : 'border-stone-800'} rounded-2xl p-5 flex flex-col gap-4 relative`}>
                      {vendor.isBlocked && (
                        <div className="absolute top-2 left-2 bg-red-950 text-red-400 border border-red-900 px-2 py-0.5 rounded-lg text-[9px] font-bold flex items-center gap-1">
                          <ShieldAlert size={10} />
                          <span>متجر محظور رقابياً</span>
                        </div>
                      )}

                      <div className="flex justify-between items-start flex-row-reverse">
                        <div className="flex items-center gap-3 flex-row-reverse">
                          <div className="relative">
                            {vendor.logoImage ? (
                              <img src={vendor.logoImage} className="w-12 h-12 rounded-xl object-cover border border-[#D4AF37]" alt="Store logo" referrerPolicy="no-referrer" />
                            ) : (
                              <div className={`w-12 h-12 rounded-xl flex items-center justify-center font-bold text-lg ${vendor.isBlocked ? 'bg-red-950 text-red-400' : 'bg-stone-950 border border-stone-800 text-[#D4AF37]'}`}>
                                🏪
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <h4 className="font-bold text-[#F8C8DC] text-base">{vendor.name}</h4>
                            <p className="text-xs text-stone-400 font-sans mt-0.5">{vendor.fullName || 'الاسم الحقيقي غير مسجل'}</p>
                          </div>
                        </div>

                        <div className="flex flex-col items-start gap-1">
                          <span className="text-[10px] text-stone-500 font-mono">
                            انضم: {new Date(vendor.createdAt).toLocaleDateString('ar-YE')}
                          </span>
                        </div>
                      </div>

                      {/* Live Store status badges */}
                      <div className="flex flex-wrap gap-1.5 justify-end" dir="rtl">
                        <span className="px-2 py-0.5 rounded-full text-[9px] font-black bg-purple-950/60 text-purple-300 border border-purple-900/40 flex items-center gap-1">
                          👥 {vendor.followersCount || (vendor.followedByUserIds?.length) || 0} متابع
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${vendor.isApproved ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-900/30' : 'bg-yellow-950/60 text-yellow-500 border border-yellow-900/30'}`}>
                          {vendor.isApproved ? '🟢 متجر معتمد' : '⏳ قيد الموافقة'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${vendor.isPublishApproved ? 'bg-blue-950/60 text-blue-400 border border-blue-900/30' : 'bg-red-950/60 text-red-400 border border-red-900/30'}`}>
                          {vendor.isPublishApproved ? '🔵 النشر نشط' : '🔴 النشر معلق'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${vendor.isVerified ? 'bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/40 flex items-center gap-0.5' : 'bg-stone-950 text-stone-500 border border-stone-800'}`}>
                          {vendor.isVerified ? '★ موثق شارة زرقاء' : '☆ غير موثق'}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-xs bg-stone-950/40 p-3 rounded-xl border border-stone-850" dir="rtl">
                        <div className="space-y-1 text-right">
                          <div className="text-stone-400 text-[10px]">الهاتف والموقع:</div>
                          <div className="text-stone-200 font-bold text-[11px]">{vendor.phone}</div>
                          <div className="text-stone-400 text-[10px] leading-tight truncate">{vendor.currentResidence || 'صنعاء، اليمن'}</div>
                        </div>
                        <div className="space-y-1 border-r border-stone-850 pr-2 text-right">
                          <div className="text-stone-400 text-[10px]">البيانات البنكية:</div>
                          <div className="text-stone-300 text-[11px] font-sans truncate" title={vendor.bankAccountDetails}>
                            {vendor.bankAccountDetails || 'لا توجد بيانات سحب مالي'}
                          </div>
                          <button
                            onClick={() => {
                              setSelectedVendorDetails(vendor);
                              setProfileModalTab('info');
                            }}
                            className="text-[#D4AF37] hover:underline text-[10px] font-bold flex items-center gap-1 cursor-pointer mt-1"
                          >
                            🔍 الملف الشخصي وسجل العمليات
                          </button>
                        </div>
                      </div>

                      {/* Store Tariffs & Classification Detail */}
                      <div className="bg-stone-950/50 p-3 rounded-xl border border-stone-850 flex flex-wrap justify-between items-center gap-2 text-xs" dir="rtl">
                        <div className="text-right">
                          <span className="text-[10px] text-stone-500 block">فئة المتجر:</span>
                          <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold ${
                            vendor.commissionTier === 'gold' 
                              ? 'bg-amber-950 text-amber-300 border border-amber-900/40' 
                              : vendor.commissionTier === 'silver' 
                                ? 'bg-slate-900 text-slate-300 border border-slate-800/40' 
                                : 'bg-orange-950/40 text-orange-300 border border-orange-900/30'
                          }`}>
                            {vendor.commissionTier === 'gold' ? '🏆 ذهبي (شريك ملكي)' : vendor.commissionTier === 'silver' ? '🥈 فضي (شريك مميز)' : '🥉 برونزي (افتراضي)'}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-stone-500 block">عمولة المنصة:</span>
                          <span className="text-stone-200 font-bold font-mono">{vendor.customCommissionRate ?? 10}%</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-stone-500 block">الضريبة المطبقة:</span>
                          <span className="text-stone-200 font-bold font-mono">{vendor.taxRate ?? 5}%</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] text-stone-500 block">تعرفة التوصيل:</span>
                          <span className="text-stone-200 font-bold font-mono">{vendor.shippingTariff ?? 1500} ر.ي</span>
                        </div>
                      </div>

                      {/* Dynamic Store State controls (قبول المتجر، قبول النشر، علامة التوثيق، إخفاء البيانات) */}
                      <div className="bg-stone-950/50 p-3 rounded-xl border border-stone-850 space-y-2 text-right" dir="rtl">
                        <span className="text-[10px] text-stone-400 font-bold block">إجراءات الاعتماد والنشر والتوثيق وإخفاء الهوية المباشرة:</span>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
                          <button
                            onClick={() => toggleVendorApproved(vendor.id, vendor.name, !!vendor.isApproved, vendor.phone)}
                            className={`py-1.5 px-2 rounded-lg font-black text-[9px] transition-colors cursor-pointer text-center ${
                              vendor.isApproved 
                                ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/40 hover:bg-emerald-900/40' 
                                : 'bg-stone-800 text-stone-300 hover:bg-stone-750'
                            }`}
                          >
                            {vendor.isApproved ? 'إلغاء القبول' : 'قبول المتجر'}
                          </button>

                          <button
                            onClick={() => toggleVendorPublishApproved(vendor.id, vendor.name, !!vendor.isPublishApproved, vendor.phone)}
                            className={`py-1.5 px-2 rounded-lg font-black text-[9px] transition-colors cursor-pointer text-center ${
                              vendor.isPublishApproved 
                                ? 'bg-blue-950 text-blue-400 border border-blue-900/40 hover:bg-blue-900/40' 
                                : 'bg-stone-800 text-stone-300 hover:bg-stone-750'
                            }`}
                          >
                            {vendor.isPublishApproved ? 'تعليق النشر' : 'قبول النشر'}
                          </button>

                          <button
                            onClick={() => toggleVendorVerified(vendor.id, vendor.name, !!vendor.isVerified, vendor.phone)}
                            className={`py-1.5 px-2 rounded-lg font-black text-[9px] transition-colors cursor-pointer text-center ${
                              vendor.isVerified 
                                ? 'bg-amber-950/60 text-[#D4AF37] border border-[#D4AF37]/40 hover:bg-amber-900/20' 
                                : 'bg-stone-800 text-stone-300 hover:bg-stone-750'
                            }`}
                          >
                            {vendor.isVerified ? 'إلغاء التوثيق' : 'علامة التوثيق'}
                          </button>

                          <button
                            onClick={() => toggleVendorPrivacy(vendor.id, vendor.name, !!vendor.hidePrivateContact, vendor.phone)}
                            className={`py-1.5 px-2 rounded-lg font-black text-[9px] transition-colors cursor-pointer text-center ${
                              vendor.hidePrivateContact 
                                ? 'bg-purple-950 text-purple-300 border border-purple-800 hover:bg-purple-900' 
                                : 'bg-stone-800 text-stone-300 hover:bg-stone-750'
                            }`}
                            title="إخفاء أو إظهار بيانات التواصل والاسم الشخصي للتاجر من العملاء"
                          >
                            {vendor.hidePrivateContact ? '🔒 الهوية مخفية' : '👁️ إخفاء الهوية'}
                          </button>
                        </div>
                      </div>

                      {/* ID & Verification Documents view for Admin Verification */}
                      {(vendor.idCardPhoto || vendor.idCardPhoto2 || vendor.passportPhoto || vendor.shopLicensePhoto) && (
                        <div className="bg-stone-950/60 p-3 rounded-xl border border-stone-850 text-right space-y-1.5" dir="rtl">
                          <span className="text-[10px] text-stone-400 font-bold block">مستندات التحقق والتوثيق المرفقة (سرية وإدارية فقط):</span>
                          <div className="flex gap-2 justify-start flex-wrap">
                            {vendor.idCardPhoto && (
                              <div className="relative group">
                                <img 
                                  src={vendor.idCardPhoto} 
                                  className="h-10 w-16 object-cover rounded border border-stone-850 hover:scale-105 transition-transform cursor-pointer" 
                                  onClick={() => window.open(vendor.idCardPhoto, '_blank')} 
                                  title="الوجه الأول للبطاقة الشخصية - انقر للتكبير"
                                  referrerPolicy="no-referrer"
                                />
                                <span className="absolute bottom-0 right-0 bg-black/75 text-stone-450 text-[7px] px-1 font-mono">بطاقة 1</span>
                              </div>
                            )}
                            {vendor.idCardPhoto2 && (
                              <div className="relative group">
                                <img 
                                  src={vendor.idCardPhoto2} 
                                  className="h-10 w-16 object-cover rounded border border-stone-850 hover:scale-105 transition-transform cursor-pointer" 
                                  onClick={() => window.open(vendor.idCardPhoto2, '_blank')} 
                                  title="الوجه الثاني للبطاقة الشخصية - انقر للتكبير"
                                  referrerPolicy="no-referrer"
                                />
                                <span className="absolute bottom-0 right-0 bg-black/75 text-stone-450 text-[7px] px-1 font-mono">بطاقة 2</span>
                              </div>
                            )}
                            {vendor.passportPhoto && (
                              <div className="relative group">
                                <img 
                                  src={vendor.passportPhoto} 
                                  className="h-10 w-16 object-cover rounded border border-stone-850 hover:scale-105 transition-transform cursor-pointer" 
                                  onClick={() => window.open(vendor.passportPhoto, '_blank')} 
                                  title="صورة جواز السفر - انقر للتكبير"
                                  referrerPolicy="no-referrer"
                                />
                                <span className="absolute bottom-0 right-0 bg-emerald-950 text-emerald-350 border border-emerald-800 text-[6px] px-1 font-mono">جواز</span>
                              </div>
                            )}
                            {vendor.shopLicensePhoto && (
                              <div className="relative group">
                                <img 
                                  src={vendor.shopLicensePhoto} 
                                  className="h-10 w-16 object-cover rounded border border-stone-850 hover:scale-105 transition-transform cursor-pointer" 
                                  onClick={() => window.open(vendor.shopLicensePhoto, '_blank')} 
                                  title="رخصة المحل / السجل التجاري - انقر للتكبير"
                                  referrerPolicy="no-referrer"
                                />
                                <span className="absolute bottom-0 right-0 bg-amber-950 text-amber-350 border border-amber-800 text-[6px] px-1 font-mono">رخصة</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Geographic coordinates */}
                      {vendor.latitude && vendor.longitude && (
                        <div className="bg-stone-950/30 p-2.5 rounded-xl border border-stone-850/60 text-right text-[10px] space-y-1 text-stone-400" dir="rtl">
                          <div className="font-bold text-[#D4AF37] flex items-center gap-1 flex-row-reverse justify-start">
                            <span>📍 الموقع الجغرافي المعتمد:</span>
                          </div>
                          <p className="text-stone-300 font-bold text-[10px] mt-0.5 truncate">{vendor.mapAddress || 'موقع محدد على خارطة صنعاء'}</p>
                          <div className="flex justify-between items-center mt-1 font-mono text-[8px] text-stone-500">
                            <span>خط عرض: {vendor.latitude.toFixed(6)}</span>
                            <span>خط طول: {vendor.longitude.toFixed(6)}</span>
                          </div>
                        </div>
                      )}

                      {/* Store performance overview */}
                      <div className="grid grid-cols-3 gap-2 text-center text-xs bg-stone-950/80 p-2.5 rounded-xl border border-stone-850">
                        <div>
                          <span className="text-stone-500 text-[9px] block">الموديلات المعروضة</span>
                          <button
                            onClick={() => {
                              setSelectedVendorProducts(selectedVendorProducts === vendor.id ? null : vendor.id);
                            }}
                            className="text-[#D4AF37] hover:underline font-bold text-xs"
                          >
                            📦 {vendorProducts.length} منتجات
                          </button>
                        </div>
                        <div className="border-x border-stone-850">
                          <span className="text-stone-500 text-[9px] block">إجمالي المستحقات</span>
                          <span className="text-stone-200 font-bold text-xs font-mono">{totalEarnedCommissions} ر.ي</span>
                        </div>
                        <div>
                          <span className="text-stone-500 text-[9px] block">مسحوبات معلقة / منجزة</span>
                          <span className="text-amber-500 font-bold text-[11px] font-mono block">
                            ⌛ {pendingPayouts} ر.ي
                          </span>
                          <span className="text-emerald-400 font-bold text-[10px] font-mono block">
                            ✅ {completedPayouts} ر.ي
                          </span>
                        </div>
                      </div>

                      {/* --- BEGIN INTERACTIVE ANALYTICS & COMMENT RATINGS SECTION --- */}
                      {(() => {
                        // Get reviews specifically for this vendor's products
                        const vendorReviews = (database.productReviews || []).filter(rev => 
                          vendorProducts.some(p => p.id === rev.productId)
                        );
                        const totalRatingVal = vendorReviews.reduce((sum, rev) => sum + rev.rating, 0);
                        const averageRatingVal = vendorReviews.length > 0 
                          ? (totalRatingVal / vendorReviews.length).toFixed(1) 
                          : null;

                        // Get best-selling products list for this vendor
                        const vendorProductsSales = vendorProducts.map(p => {
                          const totalOrderedQty = database.orders
                            .filter(o => o.status !== 'pending_payment')
                            .reduce((sum, o) => {
                              const item = (o.items || []).find(it => it.product?.id === p.id);
                              return sum + (item ? item.quantity : 0);
                            }, 0);
                          const totalRevenue = totalOrderedQty * p.price;
                          return {
                            product: p,
                            orderedQty: totalOrderedQty,
                            revenue: totalRevenue
                          };
                        }).sort((a, b) => b.orderedQty - a.orderedQty);

                        const bestSellerItem = vendorProductsSales.find(item => item.orderedQty > 0);

                        return (
                          <>
                            {/* Interactive Customer Insight & Best-Sellers Row */}
                            <div className="grid grid-cols-2 gap-2 text-xs text-right mt-1">
                              <button
                                onClick={() => {
                                  setSelectedVendorReviews(selectedVendorReviews === vendor.id ? null : vendor.id);
                                  setSelectedVendorProducts(null);
                                  setSelectedVendorBestSellers(null);
                                }}
                                className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
                                  selectedVendorReviews === vendor.id 
                                    ? 'bg-amber-950/40 border-[#D4AF37] text-white' 
                                    : 'bg-stone-950/50 border-stone-850 hover:border-stone-700 text-stone-300'
                                }`}
                              >
                                <div className="flex justify-between items-center w-full flex-row-reverse mb-1">
                                  <span className="text-[10px] text-stone-400 font-bold text-right">التقييم وتفاعلات الزبائن</span>
                                  <Star size={12} className={selectedVendorReviews === vendor.id ? 'text-[#D4AF37]' : 'text-stone-500'} />
                                </div>
                                <div className="flex items-center gap-1.5 flex-row-reverse justify-start w-full">
                                  <span className="text-[#D4AF37] font-bold text-xs font-sans">
                                    {averageRatingVal ? `⭐ ${averageRatingVal}` : '⭐ لا تقييمات'}
                                  </span>
                                  <span className="text-[9px] text-stone-500">
                                    ({vendorReviews.length} تعليقات)
                                  </span>
                                </div>
                              </button>

                              <button
                                onClick={() => {
                                  setSelectedVendorBestSellers(selectedVendorBestSellers === vendor.id ? null : vendor.id);
                                  setSelectedVendorProducts(null);
                                  setSelectedVendorReviews(null);
                                }}
                                className={`p-2.5 rounded-xl border text-right transition-all flex flex-col justify-between cursor-pointer ${
                                  selectedVendorBestSellers === vendor.id 
                                    ? 'bg-amber-950/40 border-[#D4AF37] text-white' 
                                    : 'bg-stone-950/50 border-stone-850 hover:border-stone-700 text-stone-300'
                                }`}
                              >
                                <div className="flex justify-between items-center w-full flex-row-reverse mb-1">
                                  <span className="text-[10px] text-stone-400 font-bold text-right">الموديلات الأكثر طلباً ومبيعاً</span>
                                  <TrendingUp size={12} className={selectedVendorBestSellers === vendor.id ? 'text-[#D4AF37]' : 'text-stone-500'} />
                                </div>
                                <div className="truncate w-full text-right flex items-center justify-end">
                                  {bestSellerItem ? (
                                    <div className="flex items-center gap-1 flex-row-reverse">
                                      <span className="bg-[#D4AF37]/10 text-[#D4AF37] font-black text-[9px] px-1 py-0.5 rounded">
                                        طلب {bestSellerItem.orderedQty}
                                      </span>
                                      <span className="text-stone-200 font-bold truncate text-[10px] max-w-[80px]" title={bestSellerItem.product.name}>
                                        {bestSellerItem.product.name}
                                      </span>
                                    </div>
                                  ) : (
                                    <span className="text-stone-500 text-[10px]">لا توجد مبيعات</span>
                                  )}
                                </div>
                              </button>
                            </div>

                            {/* Store Reviews and Customer Interactions Panel */}
                            {selectedVendorReviews === vendor.id && (
                              <div className="bg-stone-950 p-3 rounded-xl border border-stone-850/80 space-y-2 mt-1" dir="rtl">
                                <div className="flex justify-between items-center border-b border-stone-850 pb-1.5 flex-row">
                                  <button 
                                    onClick={() => setSelectedVendorReviews(null)}
                                    className="text-stone-500 hover:text-white text-[10px] cursor-pointer"
                                  >
                                    إغلاق ✕
                                  </button>
                                  <h5 className="text-[11px] font-bold text-[#D4AF37] flex items-center gap-1 flex-row">
                                    <MessageSquare size={12} className="text-[#D4AF37]" />
                                    <span>آراء وتفاعلات العملاء للمتجر ({vendorReviews.length})</span>
                                  </h5>
                                </div>

                                {vendorReviews.length === 0 ? (
                                  <div className="text-center py-3 text-stone-500 italic space-y-1">
                                    <p className="text-[10px]">لا توجد تعليقات أو تفاعلات عملاء مسجلة حالياً.</p>
                                    <p className="text-[8px] text-stone-600">سيتم عرض مراجعات الزبائن للمنتجات فور إتمام عمليات البيع وكتابة تقييم.</p>
                                  </div>
                                ) : (
                                  <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                                    {vendorReviews.map(rev => {
                                      const targetProduct = vendorProducts.find(p => p.id === rev.productId);
                                      return (
                                        <div key={rev.id} className="bg-stone-900/90 p-2 rounded-lg border border-stone-850 text-[10px] space-y-1 text-right">
                                          <div className="flex justify-between items-center flex-row">
                                            <span className="text-[9px] text-stone-500 font-mono">
                                              {new Date(rev.createdAt).toLocaleDateString('ar-YE')}
                                            </span>
                                            <div className="flex items-center gap-1.5 flex-row-reverse">
                                              <span className="text-[#F8C8DC] font-bold">{rev.customerName}</span>
                                              <div className="flex text-amber-500 gap-0.5">
                                                {Array.from({ length: 5 }).map((_, i) => (
                                                  <Star 
                                                    key={i} 
                                                    size={8} 
                                                    fill={i < rev.rating ? '#D4AF37' : 'none'} 
                                                    stroke={i < rev.rating ? '#D4AF37' : '#555'} 
                                                  />
                                                ))}
                                              </div>
                                            </div>
                                          </div>
                                          
                                          {targetProduct && (
                                            <div className="flex items-center gap-1 bg-stone-950/60 p-1 rounded border border-stone-850/40 flex-row-reverse justify-start">
                                              <img src={targetProduct.image} className="w-4 h-4 rounded object-cover border border-stone-850" referrerPolicy="no-referrer" />
                                              <span className="text-[9px] text-stone-500 truncate max-w-[150px]">على منتج: {targetProduct.name}</span>
                                            </div>
                                          )}

                                          <p className="text-stone-200 leading-relaxed text-[10px] bg-stone-950/20 p-1.5 rounded border-r-2 border-[#D4AF37] pr-1.5">
                                            "{rev.comment}"
                                          </p>
                                        </div>
                                      );
                                    })}
                                  </div>
                                )}
                              </div>
                            )}

                            {/* Store Best-Selling Products Data & Demand Analytics */}
                            {selectedVendorBestSellers === vendor.id && (
                              <div className="bg-stone-950 p-3 rounded-xl border border-stone-850/80 space-y-2 mt-1" dir="rtl">
                                <div className="flex justify-between items-center border-b border-stone-850 pb-1.5 flex-row">
                                  <button 
                                    onClick={() => setSelectedVendorBestSellers(null)}
                                    className="text-stone-500 hover:text-white text-[10px] cursor-pointer"
                                  >
                                    إغلاق ✕
                                  </button>
                                  <h5 className="text-[11px] font-bold text-[#D4AF37] flex items-center gap-1 flex-row">
                                    <Award size={12} className="text-[#D4AF37]" />
                                    <span>المنتجات الأكثر مبيعاً وتحليلات الطلب</span>
                                  </h5>
                                </div>

                                {vendorProductsSales.length === 0 ? (
                                  <p className="text-[10px] text-stone-500 italic text-center py-3">لا توجد منتجات مسجلة لهذا المتجر حالياً للتحليل.</p>
                                ) : (
                                  <div className="space-y-1.5 text-right">
                                    <p className="text-[9px] text-stone-450">تحليل رغبات الزبائن والموديلات الأكثر طلباً مرتّبة تنازلياً حسب المبيعات:</p>
                                    
                                    <div className="max-h-40 overflow-y-auto space-y-1 pr-1">
                                      {vendorProductsSales.map((item, idx) => (
                                        <div key={item.product.id} className="bg-stone-900/80 p-1.5 rounded-lg border border-stone-850 flex justify-between items-center flex-row-reverse text-[10px]">
                                          <div className="flex items-center gap-1.5 flex-row-reverse">
                                            <div className={`w-4 h-4 rounded-full flex items-center justify-center font-bold text-[8px] ${
                                              idx === 0 
                                                ? 'bg-amber-950 text-[#D4AF37] border border-[#D4AF37]/50' 
                                                : idx === 1 
                                                  ? 'bg-slate-900 text-slate-300' 
                                                  : 'bg-stone-950 text-stone-500'
                                            }`}>
                                              #{idx + 1}
                                            </div>
                                            <img src={item.product.image} className="w-6 h-6 rounded object-cover border border-stone-800" referrerPolicy="no-referrer" />
                                            <div className="text-right">
                                              <span className="font-bold text-stone-200 block truncate max-w-[120px]">{item.product.name}</span>
                                              <span className="text-stone-500 text-[8px] block font-mono">سعر البيع: {item.product.price} ر.ي</span>
                                            </div>
                                          </div>

                                          <div className="text-left font-mono">
                                            <div className="font-black text-emerald-400 text-[10px]">
                                              {item.orderedQty > 0 ? `بيع: ${item.orderedQty} قطع` : 'لم يُطلب بعد'}
                                            </div>
                                            {item.orderedQty > 0 && (
                                              <div className="text-[8px] text-stone-500">
                                                إيراد: {item.revenue} ر.ي
                                              </div>
                                            )}
                                          </div>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                )}
                              </div>
                            )}
                          </>
                        );
                      })()}
                      {/* --- END INTERACTIVE ANALYTICS & COMMENT RATINGS SECTION --- */}

                      {/* Store specific sub-panel for product inspection */}
                      {selectedVendorProducts === vendor.id && (
                        <div className="bg-stone-950 p-3 rounded-xl border border-stone-850/80 space-y-2 mt-1">
                          <h5 className="text-xs font-bold text-[#D4AF37] border-b border-stone-850 pb-1.5 flex justify-between items-center flex-row-reverse">
                            <span>المنتجات المسجلة باسم المتجر</span>
                            <button 
                              onClick={() => setSelectedVendorProducts(null)}
                              className="text-stone-500 hover:text-white text-[10px]"
                            >
                              إغلاق ✕
                            </button>
                          </h5>
                          {vendorProducts.length === 0 ? (
                            <p className="text-[10px] text-stone-500 italic text-center py-2">لا توجد منتجات معروضة لهذا المتجر حالياً.</p>
                          ) : (
                            <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1 text-right">
                              {vendorProducts.map(p => (
                                <div key={p.id} className="flex justify-between items-center bg-stone-900 p-2 rounded-lg text-[11px] border border-stone-850/60 flex-row-reverse">
                                  <div className="flex items-center gap-2 flex-row-reverse">
                                    <img src={p.image} className="w-8 h-8 rounded object-cover border border-stone-800" referrerPolicy="no-referrer" />
                                    <div className="text-right">
                                      <span className="font-bold text-stone-200 block truncate max-w-[150px]">{p.name}</span>
                                      <span className="text-stone-500 text-[9px] block">سعر التاجرة: {p.originalPrice} ر.ي | للزبون: {p.price} ر.ي</span>
                                    </div>
                                  </div>
                                  <div className="flex gap-1.5">
                                    <button
                                      onClick={() => {
                                        setEditingProduct(p);
                                        setProductForm({
                                          name: p.name,
                                          description: p.description,
                                          price: p.price,
                                          originalPrice: p.originalPrice,
                                          stockQuantity: p.stockQuantity ?? 10,
                                          categoryId: p.categoryId,
                                          subCategoryId: p.subCategoryId || '',
                                          subCategoryLeaf: p.subCategoryLeaf || '',
                                          navigationTag: p.navigationTag || '',
                                          sizeTemplate: (p.sizeTemplate as any) || 'women',
                                          selectedSizes: (p.availableSizes && p.availableSizes.length > 0)
                                            ? p.availableSizes
                                            : ['52', '54', '56', '58', '60', 'S', 'M', 'L', 'XL', 'XXL'],
                                          availableColors: (p.availableColors && p.availableColors.length > 0)
                                            ? p.availableColors.join('، ')
                                            : 'أسود ملكي، كحلي، عودي',
                                          availableEmbroideries: (p.availableEmbroideries && p.availableEmbroideries.length > 0)
                                            ? p.availableEmbroideries.join('، ')
                                            : 'تطريز ذهبي، شك يدوي',
                                          imageFitMode: p.imageFitMode || 'cover',
                                          image: p.image,
                                          images: p.images || ['', '', '', '', ''],
                                          isAffiliateEnabled: p.isAffiliateEnabled,
                                          isHidden: !!p.isHidden
                                        });
                                        setShowProductModal(true);
                                      }}
                                      className="text-[10px] bg-stone-800 hover:bg-stone-700 text-[#D4AF37] px-2 py-1 rounded"
                                    >
                                      تعديل السعر/البيانات
                                    </button>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      )}

                      {/* Control buttons */}
                      <div className="flex gap-2 justify-end border-t border-stone-850 pt-3 mt-1 flex-row-reverse">
                        <button
                          onClick={() => {
                            setEditingVendor(vendor);
                            setVendorForm({
                              id: vendor.id,
                              name: vendor.name,
                              fullName: vendor.fullName || '',
                              email: vendor.email || '',
                              phone: vendor.phone,
                              currentResidence: vendor.currentResidence || '',
                              bankAccountDetails: vendor.bankAccountDetails || '',
                              idCardPhoto: vendor.idCardPhoto || '',
                              hidePrivateContact: vendor.hidePrivateContact || false,
                              isBlocked: vendor.isBlocked || false,
                              commissionTier: vendor.commissionTier || 'bronze',
                              customCommissionRate: vendor.customCommissionRate !== undefined ? vendor.customCommissionRate : 10,
                              taxRate: vendor.taxRate !== undefined ? vendor.taxRate : 5,
                              shippingTariff: vendor.shippingTariff !== undefined ? vendor.shippingTariff : 1500
                            });
                            setShowVendorModal(true);
                          }}
                          className="bg-stone-800 hover:bg-stone-750 text-[#D4AF37] text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer"
                          title="تعديل بيانات المتجر"
                        >
                          <Edit3 size={13} />
                          <span>تعديل البيانات</span>
                        </button>

                        <button
                          onClick={() => toggleBlockVendor(vendor.id, vendor.name, !!vendor.isBlocked)}
                          className={`text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1.5 cursor-pointer transition-colors ${
                            vendor.isBlocked 
                              ? 'bg-emerald-950/60 hover:bg-emerald-900 text-emerald-400 border border-emerald-900/40' 
                              : 'bg-red-950/60 hover:bg-red-900 text-red-400 border border-red-900/40'
                          }`}
                          title={vendor.isBlocked ? 'تنشيط المتجر وفك الحظر' : 'تعطيل وحظر المتجر'}
                        >
                          {vendor.isBlocked ? <Unlock size={13} /> : <Lock size={13} />}
                          <span>{vendor.isBlocked ? 'تنشيط المتجر' : 'حظر المتجر'}</span>
                        </button>

                        <button
                          onClick={() => deleteVendor(vendor.id, vendor.name)}
                          className="bg-red-950/20 hover:bg-red-950/50 text-red-400 border border-red-950 text-xs font-bold px-3 py-1.5 rounded-lg flex items-center gap-1 cursor-pointer"
                          title="إقصاء وحذف المتجر نهائياً"
                        >
                          <Trash2 size={13} />
                          <span>حذف نهائي</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        )}

        {/* --- Tab: Products List --- */}
        {activeTab === 'products' && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center bg-stone-900/60 p-4 rounded-xl border border-stone-800">
              <div>
                <h3 className="text-lg font-bold text-[#D4AF37]">مستودع المنتجات والشيلان</h3>
                <p className="text-xs text-stone-400 mt-1">عرض جميع السلع وتعديل الصور والأسعار ومطابقة عمولات التاجرات</p>
              </div>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setProductForm({
                    name: '',
                    description: '',
                    price: 3500,
                    originalPrice: 3200,
                    categoryId: database.categories[0]?.id || 'women_section',
                    subCategoryId: '',
                    subCategoryLeaf: '',
                    navigationTag: '',
                    image: MOCK_IMAGES.royalScarfProduct,
                    images: [MOCK_IMAGES.royalScarfProduct, '', '', '', ''],
                    isAffiliateEnabled: true
                  });
                  setShowProductModal(true);
                }}
                className="bg-[#D4AF37] text-black hover:bg-amber-500 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus size={16} />
                <span>إضافة منتج مخزني جديد</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {database.products.map(prod => {
                const category = database.categories.find(c => c.id === prod.categoryId);
                return (
                  <div key={prod.id} className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow-md hover:shadow-stone-930 text-right group transition-all flex flex-col justify-between">
                    <div className="relative p-2 bg-stone-950 flex items-center justify-center">
                      <img src={prod.image} alt={prod.name} className="w-full h-36 object-contain rounded-lg transition-transform duration-300 group-hover:scale-105" />
                      {prod.vendorId && (
                        <span className="absolute top-3 right-3 bg-pink-900/80 text-pink-100 border border-pink-700/60 px-2 py-0.5 rounded text-[10px]">
                          تابعة لتاجرة
                        </span>
                      )}
                    </div>

                    <div className="p-4 flex-1 flex flex-col justify-between">
                      <div>
                        <span className="text-[10px] text-amber-500 bg-amber-950/40 border border-amber-900 px-2 py-0.5 rounded-full">
                          {category ? category.name : 'منتجات عامة'}
                        </span>
                        <h4 className="font-bold text-stone-200 text-sm mt-2 line-clamp-1">{prod.name}</h4>
                        <p className="text-[11px] text-stone-400 mt-1 line-clamp-2 min-h-[32px]">{prod.description}</p>
                      </div>

                      <div className="mt-4 border-t border-stone-850 pt-3">
                        <div className="flex justify-between text-xs">
                          <span className="text-stone-400">سعر المستهلك:</span>
                          <span className="font-bold text-[#D4AF37]">{prod.price} ر.ي</span>
                        </div>
                        <div className="flex justify-between text-[11px] mt-1 text-stone-400">
                          <span>سعر التاجرة التكلفة:</span>
                          <span>{prod.originalPrice} ر.ي</span>
                        </div>
                        <div className="flex justify-between text-[11px] mt-1 text-[#F8C8DC]">
                          <span>عمولة المنصة:</span>
                          <span>+{prod.price - prod.originalPrice} ر.ي</span>
                        </div>

                        <div className="flex gap-2 justify-end mt-4 border-t border-stone-850 pt-2">
                          <button
                            onClick={() => {
                              setEditingProduct(prod);
                              setProductForm({
                                name: prod.name,
                                description: prod.description,
                                price: prod.price,
                                originalPrice: prod.originalPrice,
                                categoryId: prod.categoryId,
                                subCategoryId: prod.subCategoryId || '',
                                subCategoryLeaf: prod.subCategoryLeaf || '',
                                navigationTag: prod.navigationTag || '',
                                image: prod.image,
                                images: prod.images && prod.images.length > 0
                                  ? [...prod.images, '', '', '', ''].slice(0, 5)
                                  : [prod.image, '', '', '', ''].slice(0, 5),
                                isAffiliateEnabled: prod.isAffiliateEnabled
                              });
                              setShowProductModal(true);
                            }}
                            className="p-1 px-2.5 rounded bg-stone-800 text-stone-300 hover:bg-[#D4AF37]/15 hover:text-[#D4AF37] text-xs transition-all flex items-center gap-1.5"
                          >
                            <Edit3 size={12} />
                            <span>تعديل</span>
                          </button>
                          <button
                            onClick={() => deleteProduct(prod.id, prod.name)}
                            className="p-1 px-2.5 rounded bg-stone-800 text-stone-330 hover:bg-red-950 hover:text-red-400 text-xs transition-all flex items-center gap-1.5"
                          >
                            <Trash2 size={12} />
                            <span>حذف</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* --- Tab: Categories --- */}
        {activeTab === 'categories' && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center bg-stone-900/60 p-4 rounded-xl border border-stone-800">
              <div>
                <h3 className="text-lg font-bold text-[#D4AF37]">تبويبات وأقسام المول الرقمي</h3>
                <p className="text-xs text-stone-400 mt-1">تعديل أقسام الزبائن الراقية وصورها المصممة مسبقًا</p>
              </div>
              <button
                onClick={() => {
                  setEditingCategory(null);
                  setCategoryForm({ id: '', name: '', image: MOCK_IMAGES.abayaCategory });
                  setShowCategoryModal(true);
                }}
                className="bg-[#D4AF37] text-black hover:bg-amber-500 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus size={16} />
                <span>إضافة قسم وفئة جديدة</span>
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {database.categories.map(cat => (
                <div key={cat.id} className="bg-stone-900 border border-stone-800 rounded-xl p-4 text-center group relative overflow-hidden flex flex-col justify-between">
                  <div className="bg-stone-950 p-2 rounded-lg mb-3 flex items-center justify-center">
                    <img src={cat.image} alt={cat.name} className="w-20 h-20 object-contain rounded" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-200 text-sm">{cat.name}</h4>
                    <span className="text-[10px] text-stone-500">{cat.id}</span>
                  </div>

                  <div className="flex gap-2 justify-center mt-4 border-t border-stone-850 pt-3">
                    <button
                      onClick={() => {
                        setEditingCategory(cat);
                        setCategoryForm({ id: cat.id, name: cat.name, image: cat.image });
                        setShowCategoryModal(true);
                      }}
                      className="text-stone-400 hover:text-[#D4AF37] p-1.5 rounded hover:bg-stone-800 transition-colors"
                      title="تحرير"
                    >
                      <Edit3 size={13} />
                    </button>
                    <button
                      onClick={() => deleteCategory(cat.id, cat.name)}
                      className="text-stone-400 hover:text-red-500 p-1.5 rounded hover:bg-stone-800 transition-colors"
                      title="حذف"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Tab: Bank Accounts Configuration --- */}
        {activeTab === 'banks' && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center bg-stone-900/60 p-4 rounded-xl border border-stone-800">
              <div>
                <h3 className="text-lg font-bold text-[#D4AF37]">خيارات ونقاط الدفع البنكي</h3>
                <p className="text-xs text-stone-400 mt-1">تغذية حسابات الحوالة المعروضة للزبائن في شاشة سداد إيصالات التحويل</p>
              </div>
              <button
                onClick={() => {
                  setEditingBank(null);
                  setBankForm({ bankName: '', accountNumber: '', accountHolder: '', notes: '' });
                  setShowBankModal(true);
                }}
                className="bg-[#D4AF37] text-black hover:bg-amber-500 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus size={16} />
                <span>إضافة بنك محلي جديد</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {database.bankAccounts.map(b => (
                <div key={b.id} className="bg-stone-900 border border-stone-800 rounded-xl p-5 relative flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-black text-[#D4AF37] text-sm">{b.bankName}</h4>
                      <span className="text-[10px] text-[#F8C8DC] bg-pink-950/40 px-2 py-0.5 rounded-full border border-pink-900/40">سداد فوري</span>
                    </div>

                    <div className="space-y-1 text-xs text-stone-300 mt-3 pt-2 border-t border-stone-850">
                      <div>رقم الحساب أو المحفظة: <span className="font-bold text-white select-all">{b.accountNumber}</span></div>
                      <div>باسم المستلم المعتمد: <span className="text-stone-400">{b.accountHolder}</span></div>
                      {b.notes && <div className="text-[11px] text-stone-400 italic mt-1 bg-stone-950 p-2 rounded">ملاحظة: {b.notes}</div>}
                    </div>
                  </div>

                  <div className="flex gap-2 justify-end mt-4 border-t border-stone-850 pt-3">
                    <button
                      onClick={() => {
                        setEditingBank(b);
                        setBankForm({
                          bankName: b.bankName,
                          accountNumber: b.accountNumber,
                          accountHolder: b.accountHolder,
                          notes: b.notes || ''
                        });
                        setShowBankModal(true);
                      }}
                      className="text-stone-400 hover:text-[#D4AF37] p-1 rounded hover:bg-stone-800 transition-colors"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      onClick={() => deleteBank(b.id, b.bankName)}
                      className="text-stone-450 hover:text-red-500 p-1 rounded hover:bg-stone-800 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Tab: Banners ads --- */}
        {activeTab === 'banners' && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center bg-stone-900/60 p-4 rounded-xl border border-stone-800">
              <div>
                <h3 className="text-lg font-bold text-[#D4AF37]">الحملات والبانرات الإعلانية الدوارة</h3>
                <p className="text-xs text-stone-400 mt-1">تعديل بنرات العروض الجذابة بقمة شاشة المتجر للزبائن</p>
              </div>
              <button
                onClick={() => {
                  setEditingBanner(null);
                  setBannerForm({ title: '', subtitle: '', image: MOCK_IMAGES.adBannerBg, productId: '', active: true });
                  setShowBannerModal(true);
                }}
                className="bg-[#D4AF37] text-black hover:bg-amber-500 font-bold text-xs px-4 py-2.5 rounded-xl flex items-center gap-2 transition-all cursor-pointer"
              >
                <Plus size={16} />
                <span>إدراج كود إعلان جديد</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {database.banners.map(ban => (
                <div key={ban.id} className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden shadow">
                  <div className="p-1.5 bg-stone-950">
                    <img src={ban.image} alt={ban.title} className="w-full h-32 object-contain rounded" />
                  </div>
                  <div className="p-4">
                    <h4 className="font-bold text-stone-100 text-sm">{ban.title}</h4>
                    <p className="text-xs text-stone-400 mt-1">{ban.subtitle}</p>
                    <div className="flex justify-between items-center mt-3 border-t border-stone-850 pt-3">
                      <span className={`text-[10px] px-2 py-0.5 rounded ${ban.active ? 'bg-emerald-950 text-emerald-400' : 'bg-stone-800 text-stone-400'}`}>
                        {ban.active ? 'نشط ومعروض' : 'مخفي مؤقتاً'}
                      </span>

                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            setEditingBanner(ban);
                            setBannerForm({
                              title: ban.title,
                              subtitle: ban.subtitle,
                              image: ban.image,
                              productId: ban.productId || '',
                              active: ban.active
                            });
                            setShowBannerModal(true);
                          }}
                          className="text-stone-300 hover:text-amber-500 p-1 bg-stone-800 rounded text-xs px-2.5 flex items-center gap-1.5 transition-colors"
                        >
                          <Edit3 size={11} /> تعديل
                        </button>
                        <button
                          onClick={() => deleteBanner(ban.id, ban.title)}
                          className="text-stone-330 hover:text-red-500 p-1 bg-stone-900 rounded text-xs px-2.5 flex items-center gap-1.5 transition-all"
                        >
                          <Trash2 size={11} /> حذف
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- Tab: Social Media Links --- */}
        {activeTab === 'socials' && (
          <div className="bg-stone-900 border border-stone-800 rounded-xl p-6">
            <div className="mb-4">
              <h3 className="text-lg font-bold text-[#D4AF37]">قنوات وروابط التواصل الاجتماعي المعتمدة للمول</h3>
              <p className="text-xs text-stone-400 mt-1">تحديث المسارات والروابط المباشرة لدعم المول الرقمي Digital Mall (واتساب، انستقرام، فيس بوك، تلجرام، تيك توك، واتصال مباشر)</p>
            </div>

            <form onSubmit={handleSaveSocials} className="space-y-4" dir="rtl">
              <div>
                <label className="block text-xs text-stone-300 font-bold mb-1.5 text-right">رابط خدمة العملاء والطلب الفوري واتساب (WhatsApp)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={socialsForm.whatsapp || ''}
                    className="flex-1 bg-stone-950 border border-stone-800 focus:border-[#D4AF37] px-4 py-2.5 rounded-lg text-xs font-mono text-[#25D366] text-left dir-ltr"
                    onChange={e => setSocialsForm({ ...socialsForm, whatsapp: e.target.value })}
                    placeholder="https://wa.me/967780044700"
                    required
                  />
                  {socialsForm.whatsapp && (
                    <a
                      href={socialsForm.whatsapp}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#25D366]/20 hover:bg-[#25D366]/30 text-[#25D366] border border-[#25D366]/40 px-3 py-2 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1"
                    >
                      <span>اختبار الرابط 🔗</span>
                    </a>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs text-stone-300 font-bold mb-1.5 text-right">رابط حساب انستقرام الراقية (Instagram)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={socialsForm.instagram || ''}
                    className="flex-1 bg-stone-950 border border-stone-800 focus:border-[#D4AF37] px-4 py-2.5 rounded-lg text-xs font-mono text-[#E1306C] text-left dir-ltr"
                    onChange={e => setSocialsForm({ ...socialsForm, instagram: e.target.value })}
                    placeholder="https://instagram.com/digitalmall.yemen"
                    required
                  />
                  {socialsForm.instagram && (
                    <a
                      href={socialsForm.instagram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#E1306C]/20 hover:bg-[#E1306C]/30 text-[#E1306C] border border-[#E1306C]/40 px-3 py-2 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1"
                    >
                      <span>اختبار الرابط 🔗</span>
                    </a>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs text-stone-300 font-bold mb-1.5 text-right">رابط الحساب المعتمد على فيسبوك (Facebook)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={socialsForm.facebook || ''}
                    className="flex-1 bg-stone-950 border border-stone-800 focus:border-[#D4AF37] px-4 py-2.5 rounded-lg text-xs font-mono text-[#1877F2] text-left dir-ltr"
                    onChange={e => setSocialsForm({ ...socialsForm, facebook: e.target.value })}
                    placeholder="https://facebook.com/digitalmall.yemen"
                    required
                  />
                  {socialsForm.facebook && (
                    <a
                      href={socialsForm.facebook}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#1877F2]/20 hover:bg-[#1877F2]/30 text-[#1877F2] border border-[#1877F2]/40 px-3 py-2 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1"
                    >
                      <span>اختبار الرابط 🔗</span>
                    </a>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs text-stone-300 font-bold mb-1.5 text-right">رابط قناة التلجرام الرسمية للمول (Telegram)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={socialsForm.telegram || ''}
                    className="flex-1 bg-stone-950 border border-stone-800 focus:border-[#D4AF37] px-4 py-2.5 rounded-lg text-xs font-mono text-[#0088cc] text-left dir-ltr"
                    onChange={e => setSocialsForm({ ...socialsForm, telegram: e.target.value })}
                    placeholder="https://t.me/digitalmallyemen"
                  />
                  {socialsForm.telegram && (
                    <a
                      href={socialsForm.telegram}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-[#0088cc]/20 hover:bg-[#0088cc]/30 text-[#0088cc] border border-[#0088cc]/40 px-3 py-2 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1"
                    >
                      <span>اختبار الرابط 🔗</span>
                    </a>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs text-stone-300 font-bold mb-1.5 text-right">رابط حساب تيك توك المول (TikTok - اختياري)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={socialsForm.tiktok || ''}
                    className="flex-1 bg-stone-950 border border-stone-800 focus:border-[#D4AF37] px-4 py-2.5 rounded-lg text-xs font-mono text-cyan-400 text-left dir-ltr"
                    onChange={e => setSocialsForm({ ...socialsForm, tiktok: e.target.value })}
                    placeholder="https://tiktok.com/@digitalmall.yemen"
                  />
                  {socialsForm.tiktok && (
                    <a
                      href={socialsForm.tiktok}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="bg-cyan-950 hover:bg-cyan-900 text-cyan-400 border border-cyan-800 px-3 py-2 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1"
                    >
                      <span>اختبار الرابط 🔗</span>
                    </a>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs text-stone-300 font-bold mb-1.5 text-right">رقم جوال / هاتف الاتصال المباشر للإدارة الدعم (Direct Phone Call)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={socialsForm.phone || ''}
                    className="flex-1 bg-stone-950 border border-stone-800 focus:border-[#D4AF37] px-4 py-2.5 rounded-lg text-xs font-mono text-amber-300 text-left dir-ltr"
                    onChange={e => setSocialsForm({ ...socialsForm, phone: e.target.value })}
                    placeholder="+967780044700"
                  />
                  {socialsForm.phone && (
                    <a
                      href={`tel:${socialsForm.phone}`}
                      className="bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 px-3 py-2 rounded-lg text-xs font-bold shrink-0 flex items-center gap-1"
                    >
                      <span>اتصال 📞</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button
                  type="submit"
                  className="bg-[#D4AF37] text-black hover:bg-amber-500 font-black px-6 py-3 rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md shadow-neutral-900 transition-all"
                >
                  <Share2 size={16} />
                  <span>تحديث وحفظ قنوات التواصل بالمول فوراً</span>
                </button>
              </div>
            </form>
          </div>
        )}

        {/* --- Tab: Audit Trail (سجل الرقابة والأمان) --- */}
        {activeTab === 'audit' && (
          <div className="flex flex-col gap-6">
            <div className="flex justify-between items-center bg-stone-900/60 p-4 rounded-xl border border-stone-800">
              <div>
                <h3 className="text-lg font-bold text-[#D4AF37]">سجل العمليات والرقابة الأمنية (Audit Trail)</h3>
                <p className="text-xs text-stone-400 mt-1">تأريخ وتسجيل مباشر لكافة العمليات الإدارية والمالية مع هوية المنفذ</p>
              </div>
              <button 
                onClick={() => {
                  if (confirm('تصفير السجل الرقابي بالكامل؟ لا يمكن التراجع عن هذا الإجراء')) {
                    onSave({ ...database, auditLogs: [] });
                    alert('تم تصفير السجل بنجاح.');
                  }
                }}
                className="text-stone-400 text-xs font-bold hover:text-red-400 border border-stone-800 bg-stone-950 px-3 py-1.5 rounded-lg"
              >
                تحديث وتصفير السجل
              </button>
            </div>

            <div className="bg-stone-900 border border-stone-800 rounded-xl overflow-hidden">
              <div className="max-h-[500px] overflow-y-auto divide-y divide-stone-850">
                {database.auditLogs.length === 0 ? (
                  <div className="text-center py-12 text-stone-500 text-sm">سجل العمليات فارغ، كل التحركات مستقرة ومؤمنة</div>
                ) : (
                  database.auditLogs.map((log, index) => (
                    <div key={log.id} className="p-4 hover:bg-stone-850/60 transition-colors flex justify-between items-start text-xs gap-4">
                      <div className="flex gap-3">
                        <div className="text-stone-500 font-bold min-w-[20px] text-center pt-0.5">
                          {database.auditLogs.length - index}
                        </div>
                        <div>
                          <div className="flex flex-wrap items-center gap-1.5">
                            <span className="font-bold text-stone-200">{log.operatorName}</span>
                            <span className="text-[10px] bg-stone-850 text-stone-400 px-1.5 rounded uppercase">
                              {log.operatorRole === 'admin' ? 'مدير' : log.operatorRole === 'accountant' ? 'محاسب' : 'مستقبل طلبات'}
                            </span>
                            <span className="text-[10px] text-[#D4AF37] font-semibold">({log.actionType})</span>
                          </div>
                          <p className="text-stone-300 mt-1 font-light leading-relaxed">{log.details}</p>
                        </div>
                      </div>

                      <span className="text-[10px] text-stone-400 whitespace-nowrap bg-stone-950 px-2 py-0.5 rounded font-mono">
                        {new Date(log.timestamp).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- Tab: Withdrawals & Payouts (طلبات سحب وتصفية أرباح التاجرات) --- */}
        {activeTab === 'withdrawals' && (
          <div className="space-y-6 text-right" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-stone-900/60 p-5 rounded-2xl border border-stone-800 gap-4">
              <div>
                <h3 className="text-xl font-bold text-[#F8C8DC]">إدارة تسوية سحوبات وعمولات التاجرات</h3>
                <p className="text-xs text-stone-400 mt-1">تتبع وصرف مستحقات شركاء المول الرقمي Digital Mall والمصادقة على الحوالات المالية</p>
              </div>
              <div className="flex gap-2">
                <span className="bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-bold px-3 py-1.5 rounded-xl border border-[#D4AF37]/30">
                  إجمالي المسيرات: {database.withdrawalRequests.length} طلب
                </span>
                <span className="bg-pink-950 text-pink-300 text-xs font-bold px-3 py-1.5 rounded-xl border border-pink-900/50">
                  معلق للصرف: {database.withdrawalRequests.filter(r => r.status === 'pending').length} طلب
                </span>
              </div>
            </div>

            {/* Quick Financial Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-stone-900/60 p-4 rounded-xl border border-stone-850">
                <span className="text-[10px] text-stone-400 block font-bold">إجمالي المطالبات النقدية قيد المراجعة</span>
                <div className="text-xl font-black text-amber-500 mt-1.5 font-mono">
                  {database.withdrawalRequests.filter(r => r.status === 'pending').reduce((sum, r) => sum + r.amount, 0).toLocaleString('ar-YE')} <span className="text-xs font-sans">ر.ي</span>
                </div>
              </div>
              <div className="bg-stone-900/60 p-4 rounded-xl border border-stone-850">
                <span className="text-[10px] text-stone-400 block font-bold">المبالغ المصروفة والمعتمدة رسمياً</span>
                <div className="text-xl font-black text-emerald-400 mt-1.5 font-mono">
                  {database.withdrawalRequests.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.amount, 0).toLocaleString('ar-YE')} <span className="text-xs font-sans">ر.ي</span>
                </div>
              </div>
              <div className="bg-stone-900/60 p-4 rounded-xl border border-stone-850">
                <span className="text-[10px] text-stone-400 block font-bold">الطلبات المرفوضة والمسترجعة للمحافظ</span>
                <div className="text-xl font-black text-red-400 mt-1.5 font-mono">
                  {database.withdrawalRequests.filter(r => r.status === 'rejected').reduce((sum, r) => sum + r.amount, 0).toLocaleString('ar-YE')} <span className="text-xs font-sans">ر.ي</span>
                </div>
              </div>
            </div>

            {/* Withdrawals List */}
            <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden">
              <div className="p-4 border-b border-stone-850 bg-stone-950 flex justify-between items-center flex-row-reverse">
                <h4 className="font-bold text-xs text-stone-300">سجل طلبات السحب والحوالات عبر البنوك اليمنية</h4>
                <span className="text-[10px] text-stone-500">ملاحظة: تظهر هذه الطلبات تلقائياً فور طلب التاجرة السحب من محفظتها</span>
              </div>

              {database.withdrawalRequests.length === 0 ? (
                <div className="p-12 text-center text-stone-500">
                  <Wallet size={36} className="mx-auto text-stone-750 mb-3" />
                  <p className="text-sm">لم تسجل أي تاجرة طلب سحب للمستحقات بعد.</p>
                </div>
              ) : (
                <div className="divide-y divide-stone-850">
                  {database.withdrawalRequests.map(req => {
                    return (
                      <div key={req.id} className="p-5 hover:bg-stone-850/30 transition-all flex flex-col md:flex-row justify-between items-start md:items-center gap-4 text-right">
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 flex-row-reverse justify-end">
                            <span className="font-black text-sm text-white font-sans">#{req.id}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              req.status === 'approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/40' :
                              req.status === 'rejected' ? 'bg-red-950 text-red-400 border border-red-900/40' :
                              'bg-amber-950 text-[#D4AF37] border border-[#D4AF37]/30'
                            }`}>
                              {req.status === 'approved' ? '✓ تم الصرف' :
                               req.status === 'rejected' ? '✕ تم الرفض' :
                               '⏳ قيد الانتظار والتدقيق'}
                            </span>
                          </div>

                          <div className="text-xs text-stone-300 flex flex-wrap gap-x-4 gap-y-1 justify-end flex-row-reverse">
                            <div>
                              <span className="text-stone-500 font-semibold">المتجر الطالب:</span>{' '}
                              <span className="font-extrabold text-[#F8C8DC]">{req.vendorName}</span>
                            </div>
                            <div>
                              <span className="text-stone-500 font-semibold">الوسيلة المالية:</span>{' '}
                              <span className="font-mono text-stone-200">{req.bankName}</span>
                            </div>
                          </div>

                          <div className="bg-stone-950 p-2.5 rounded-lg border border-stone-850 text-stone-400 text-[11px] leading-relaxed">
                            <span className="text-[#D4AF37] font-bold block mb-0.5">تفاصيل الحساب المعتمد للحوالة:</span>
                            {req.accountNumber || 'لم تدون تفاصيل إضافية للحساب'}
                          </div>

                          <span className="text-[10px] text-stone-500 font-mono block">
                            تاريخ تقديم الطلب: {new Date(req.requestedAt).toLocaleString('ar-YE')}
                          </span>
                        </div>

                        <div className="flex flex-row md:flex-col items-end gap-3 w-full md:w-auto justify-between border-t border-stone-850 md:border-0 pt-3 md:pt-0">
                          <div className="text-right">
                            <span className="text-[10px] text-stone-500 block">المبلغ المطلوب سحبه</span>
                            <span className="text-xl font-black text-white font-mono">
                              {req.amount.toLocaleString('ar-YE')} <span className="text-xs font-sans text-[#D4AF37]">ر.ي</span>
                            </span>
                          </div>

                          {req.status === 'pending' && (
                            <div className="flex gap-2">
                              <button
                                onClick={() => handleApproveWithdrawal(req.id)}
                                className="bg-emerald-600 hover:bg-emerald-500 text-stone-950 font-black text-xs px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                              >
                                موافقة وصرف
                              </button>
                              <button
                                onClick={() => handleRejectWithdrawal(req.id)}
                                className="bg-red-950/60 hover:bg-red-900/60 text-red-400 border border-red-900/30 font-black text-xs px-3.5 py-1.5 rounded-lg transition-colors cursor-pointer"
                              >
                                رفض
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        )}

        {/* --- Tab: Stores Map (خريطة مواقع المتاجر والشركاء) --- */}
        {activeTab === 'storesMap' && (
          <div className="space-y-6 text-right" dir="rtl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-stone-900/60 p-5 rounded-2xl border border-stone-800 gap-4">
              <div>
                <h3 className="text-xl font-bold text-[#F8C8DC]">الخريطة الجغرافية لتوزع المتاجر والفروع</h3>
                <p className="text-xs text-stone-400 mt-1">تتبع المواقع الجغرافية للتجار المعتمدين والمتاجر النشطة في أمانة العاصمة صنعاء</p>
              </div>
              <div className="flex gap-2">
                <span className="bg-[#D4AF37]/10 text-[#D4AF37] text-xs font-bold px-3 py-1.5 rounded-xl border border-[#D4AF37]/30">
                  إجمالي المتاجر بالخريطة: {database.users.filter(u => u.role === 'vendor').length} متجر
                </span>
              </div>
            </div>

            {/* Core Two Column Interactive Map Workspace */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Left Column: List & Filters of Vendors */}
              <div className="space-y-4 lg:col-span-1">
                <div className="bg-stone-900 p-4 rounded-2xl border border-stone-800 space-y-3.5">
                  <h4 className="font-bold text-xs text-stone-300">تصفية وبحث المتاجر</h4>
                  
                  {/* Search Bar */}
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="ابحث باسم المتجر، المالك، العنوان..."
                      value={storesMapSearch}
                      onChange={(e) => setStoresMapSearch(e.target.value)}
                      className="w-full bg-stone-950 border border-stone-850 rounded-xl py-2 px-3 pl-8 text-xs text-white text-right placeholder-stone-600 focus:border-[#D4AF37] focus:outline-none"
                    />
                    <Search size={14} className="absolute left-2.5 top-2.5 text-stone-600" />
                  </div>

                  {/* Filter Buttons */}
                  <div className="grid grid-cols-3 gap-1.5 bg-stone-950 p-1 rounded-xl border border-stone-850 text-center">
                    {(['all', 'approved', 'pending'] as const).map(f => (
                      <button
                        key={f}
                        type="button"
                        onClick={() => setStoresMapFilter(f)}
                        className={`py-1 text-[10px] rounded-lg font-bold transition-all ${
                          storesMapFilter === f 
                            ? 'bg-[#D4AF37] text-[#1c1917]' 
                            : 'text-stone-400 hover:text-white'
                        }`}
                      >
                        {f === 'all' ? 'الكل' : f === 'approved' ? 'المعتمدة' : 'الانتظار'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Scrolled Vendors Feed */}
                <div className="bg-stone-900 border border-stone-800 rounded-2xl overflow-hidden max-h-[460px] overflow-y-auto divide-y divide-stone-850">
                  {(() => {
                    const allVendors = database.users.filter(u => u.role === 'vendor');
                    const filtered = allVendors.filter(v => {
                      const matchesSearch = 
                        v.name.includes(storesMapSearch) || 
                        (v.fullName || '').includes(storesMapSearch) || 
                        (v.phone || '').includes(storesMapSearch) ||
                        (v.mapAddress || '').includes(storesMapSearch);
                      
                      const matchesFilter = 
                        storesMapFilter === 'all' ? true :
                        storesMapFilter === 'approved' ? v.isApproved : !v.isApproved;

                      return matchesSearch && matchesFilter;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="p-8 text-center text-stone-500 text-xs">
                          لا توجد متاجر تطابق هذه الفلاتر الجغرافية.
                        </div>
                      );
                    }

                    return filtered.map(v => {
                      const lat = v.latitude || 15.3185;
                      const lng = v.longitude || 44.1812;
                      const isSelected = selectedMapVendorId === v.id;

                      return (
                        <div 
                          key={v.id}
                          onClick={() => setSelectedMapVendorId(v.id)}
                          className={`p-3.5 text-right transition-colors cursor-pointer flex flex-col gap-1.5 ${
                            isSelected 
                              ? 'bg-[#352B2E] border-r-4 border-[#D4AF37]' 
                              : 'hover:bg-stone-850/40'
                          }`}
                        >
                          <div className="flex justify-between items-center flex-row-reverse">
                            <span className="font-extrabold text-[#F8C8DC] text-xs block">{v.name}</span>
                            <span className={`text-[8px] font-bold px-1.5 py-0.5 rounded ${
                              v.isApproved 
                                ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/30' 
                                : 'bg-amber-950/40 text-[#D4AF37] border border-[#D4AF37]/20'
                            }`}>
                              {v.isApproved ? 'معتمد' : 'قيد التدقيق'}
                            </span>
                          </div>

                          <span className="text-[10px] text-stone-400 block">المالك: {v.fullName || 'التاجر الشريك'}</span>
                          <span className="text-[9px] text-stone-500 font-mono block">إحداثيات: {lat.toFixed(4)}, {lng.toFixed(4)}</span>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>

              {/* Right Columns: Interactive Map with overlay */}
              <div className="lg:col-span-2 space-y-4">
                <div className="bg-stone-900 p-5 rounded-2xl border border-stone-800 space-y-4">
                  <div className="flex justify-between items-center border-b border-stone-850 pb-3 flex-row-reverse">
                    <h4 className="font-extrabold text-xs text-stone-300">خريطة التوزع الجغرافي النشط في صنعاء</h4>
                    <span className="text-[10px] text-stone-500">ملاحظة: انقر على الدبابيس الذهبية لمطالعة ملف المتجر والتحصيل المالي</span>
                  </div>

                  {/* The actual Multi-Marker SVG Interactive Stage */}
                  <div className="relative w-full aspect-[2/1] bg-stone-950 rounded-2xl overflow-hidden border border-stone-850 select-none">
                    
                    {/* Abstract Grid SVG Layout */}
                    <svg className="w-full h-full opacity-40" viewBox="0 0 1000 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                      {/* Ring roads representation */}
                      <circle cx="500" cy="250" r="120" stroke="#1c1917" strokeWidth="3" />
                      <circle cx="500" cy="250" r="220" stroke="#1c1917" strokeWidth="2" strokeDasharray="8 4" />
                      <circle cx="500" cy="250" r="320" stroke="#1c1917" strokeWidth="1" />

                      {/* Grids */}
                      {Array.from({ length: 20 }).map((_, i) => (
                        <line key={`v-${i}`} x1={i * 50} y1="0" x2={i * 50} y2="500" stroke="#121214" strokeWidth="0.5" />
                      ))}
                      {Array.from({ length: 10 }).map((_, i) => (
                        <line key={`h-${i}`} x1="0" y1={i * 50} x2="1000" y2={i * 50} stroke="#121214" strokeWidth="0.5" />
                      ))}

                      {/* Main street representation */}
                      <path d="M 100,250 Q 500,250 900,250" stroke="#1f1c18" strokeWidth="4" />
                      <path d="M 500,50 L 500,450" stroke="#1f1c18" strokeWidth="4" />

                      {/* Labels */}
                      <text x="500" y="275" fill="#3f3f46" fontSize="11" fontWeight="bold" textAnchor="middle">وسط العاصمة (التحرير)</text>
                      <text x="500" y="360" fill="#3f3f46" fontSize="10" textAnchor="middle">حي حدة السكني</text>
                      <text x="500" y="420" fill="#2d2d30" fontSize="9" textAnchor="middle">منطقة بيت بوس والخمسين</text>
                      <text x="500" y="100" fill="#3f3f46" fontSize="10" textAnchor="middle">منطقة الروضة والمطار</text>
                      <text x="700" y="250" fill="#2d2d30" fontSize="10" textAnchor="middle">صنعاء القديمة (شرقاً)</text>
                    </svg>

                    {/* Rendering Pins for Approved/Pending Vendors */}
                    {(() => {
                      const allVendors = database.users.filter(u => u.role === 'vendor');
                      const filteredVendors = allVendors.filter(v => {
                        const matchesSearch = 
                          v.name.includes(storesMapSearch) || 
                          (v.fullName || '').includes(storesMapSearch) || 
                          (v.phone || '').includes(storesMapSearch) ||
                          (v.mapAddress || '').includes(storesMapSearch);
                        
                        const matchesFilter = 
                          storesMapFilter === 'all' ? true :
                          storesMapFilter === 'approved' ? v.isApproved : !v.isApproved;

                        return matchesSearch && matchesFilter;
                      });

                      return filteredVendors.map(v => {
                        const lat = v.latitude || 15.3185;
                        const lng = v.longitude || 44.1812;

                        // Projection: Lat [15.2800 to 15.4200], Lng [44.1400 to 44.2500]
                        const pinX = ((lng - 44.1400) / (44.2500 - 44.1400)) * 100;
                        const pinY = ((15.4200 - lat) / (15.4200 - 15.2800)) * 100;
                        const isSelected = selectedMapVendorId === v.id;

                        return (
                          <div 
                            key={v.id}
                            onClick={() => setSelectedMapVendorId(v.id)}
                            className="absolute -translate-x-1/2 -translate-y-1/2 z-10 cursor-pointer group"
                            style={{ left: `${pinX}%`, top: `${pinY}%` }}
                          >
                            {/* Pulse glowing rings */}
                            {isSelected && (
                              <div className="absolute w-12 h-12 -left-6 -top-6 rounded-full bg-[#D4AF37]/30 animate-ping border border-[#D4AF37]/20"></div>
                            )}

                            {/* Pointer pin */}
                            <div className={`flex flex-col items-center transition-transform ${isSelected ? 'scale-125' : 'hover:scale-110'}`}>
                              <MapPin 
                                size={isSelected ? 26 : 20} 
                                className={`stroke-2 drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)] ${
                                  isSelected 
                                    ? 'text-[#D4AF37] fill-[#D4AF37]/40' 
                                    : v.isApproved 
                                      ? 'text-emerald-400 fill-emerald-950/60' 
                                      : 'text-amber-500 fill-amber-950/50'
                                }`} 
                              />
                              <div className="bg-[#1C1C1D] text-white border border-stone-800 text-[8px] font-bold px-1 py-0.5 rounded shadow-xl -mt-0.5 whitespace-nowrap hidden group-hover:block max-w-[100px] overflow-hidden truncate">
                                {v.name}
                              </div>
                            </div>
                          </div>
                        );
                      });
                    })()}
                  </div>

                  {/* Vendor Highlight Detail Card Overlay */}
                  {selectedMapVendorId && (() => {
                    const activeVendor = database.users.find(u => u.id === selectedMapVendorId);
                    if (!activeVendor) return null;

                    return (
                      <div className="bg-stone-950 p-4.5 rounded-xl border border-stone-800 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 animate-fade-in">
                        <div className="space-y-1">
                          <span className="text-[9px] bg-amber-950 text-[#D4AF37] px-2 py-0.5 rounded border border-[#D4AF37]/20 font-bold">
                            ملف المتجر الجغرافي المعاين
                          </span>
                          <h4 className="font-extrabold text-white text-base mt-1.5">{activeVendor.name}</h4>
                          <p className="text-xs text-stone-400">مالك المتجر: <span className="text-white font-semibold">{activeVendor.fullName || 'شريك مسجل'}</span></p>
                          <p className="text-xs text-stone-400">الهاتف: <span className="text-stone-200 font-mono">{activeVendor.phone}</span></p>
                          <p className="text-xs text-stone-400">موقع العنوان: <span className="text-stone-300">{activeVendor.mapAddress || 'صنعاء، اليمن'}</span></p>
                          <div className="flex gap-2 pt-1">
                            <span className="text-[10px] text-stone-500 font-mono">خط العرض: {activeVendor.latitude?.toFixed(4) || 15.3185}</span>
                            <span className="text-stone-750">|</span>
                            <span className="text-[10px] text-stone-500 font-mono">خط الطول: {activeVendor.longitude?.toFixed(4) || 44.1812}</span>
                          </div>
                        </div>

                        <div className="flex flex-col items-end gap-2.5 w-full md:w-auto">
                          <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${
                            activeVendor.isApproved 
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/50' 
                              : 'bg-amber-950 text-[#D4AF37] border border-[#D4AF37]/30'
                          }`}>
                            {activeVendor.isApproved ? '✓ متجر معتمد ونشط بالخريطة' : '⏳ متجر معلق قيد التدقيق الجغرافي'}
                          </span>
                          
                          <button
                            onClick={() => {
                              // Link to switch view or perform actions directly
                              setActiveTab('vendors');
                            }}
                            className="text-[11px] bg-stone-850 hover:bg-stone-800 text-stone-300 font-bold px-4 py-2 rounded-lg transition-colors border border-[#1C1C1D]"
                          >
                            تعديل صلاحيات المتجر ✎
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                </div>
              </div>

            </div>
          </div>
        )}

      </div>

      {/* --- ADD/EDIT VENDOR DIALOG MODAL --- */}
      {showVendorModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1C1D] border border-stone-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto text-right" dir="rtl">
            <div className="bg-gradient-to-l from-stone-900 to-[#1C1C1D] px-6 py-4 border-b border-stone-850 flex justify-between items-center">
              <h3 className="font-black text-lg text-[#D4AF37]">
                {editingVendor ? 'تعديل البيانات والرقابة للمتجر' : 'تأسيس وتسجيل متجر شريك جديد'}
              </h3>
              <button 
                onClick={() => {
                  setShowVendorModal(false);
                  setEditingVendor(null);
                }}
                className="text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVendor} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-stone-300 mb-1.5 font-bold text-right">اسم المتجر التجاري المعتمد بالمول</label>
                <input
                  type="text"
                  value={vendorForm.name}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs focus:border-[#D4AF37] text-white text-right"
                  onChange={e => setVendorForm({ ...vendorForm, name: e.target.value })}
                  placeholder="مثال: عباءات الشرق الفخمة"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1.5 font-bold text-right">اسم التاجر/التاجة الحقيقي (صاحب المتجر)</label>
                <input
                  type="text"
                  value={vendorForm.fullName}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs focus:border-[#D4AF37] text-white text-right"
                  onChange={e => setVendorForm({ ...vendorForm, fullName: e.target.value })}
                  placeholder="مثال: سلوى أحمد اليعري"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-stone-300 mb-1.5 font-bold text-right">رقم الجوال المعتمد للتسويات (+967)</label>
                  <input
                    type="text"
                    value={vendorForm.phone}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs focus:border-[#D4AF37] text-white text-left font-mono"
                    onChange={e => setVendorForm({ ...vendorForm, phone: e.target.value })}
                    placeholder="770000000"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-300 mb-1.5 font-bold text-right">البريد الإلكتروني للعمل</label>
                  <input
                    type="email"
                    value={vendorForm.email}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs focus:border-[#D4AF37] text-white text-left font-mono"
                    onChange={e => setVendorForm({ ...vendorForm, email: e.target.value })}
                    placeholder="store@domain.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1.5 font-bold text-right">مكان التواجد أو الإقامة التفصيلي</label>
                <input
                  type="text"
                  value={vendorForm.currentResidence}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs focus:border-[#D4AF37] text-white text-right"
                  onChange={e => setVendorForm({ ...vendorForm, currentResidence: e.target.value })}
                  placeholder="مثال: اليمن - صنعاء - حدة - خلف مركز ظمران"
                />
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1.5 font-bold text-right">بيانات حساب تسوية الأرباح المعتمدة للتاجر</label>
                <textarea
                  rows={2}
                  value={vendorForm.bankAccountDetails}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs focus:border-[#D4AF37] text-white resize-none text-right"
                  onChange={e => setVendorForm({ ...vendorForm, bankAccountDetails: e.target.value })}
                  placeholder="مثال: الكريمي - حساب رقم 302198422 أو البسيري رقم ..."
                />
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1.5 font-bold text-right">شعار المتجر / الأيقونة الرسمية (من المعرض/استديو الهاتف 🖼️)</label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={vendorForm.logoImage || ''}
                    className="flex-1 bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs focus:border-[#D4AF37] text-white text-left font-mono"
                    onChange={e => setVendorForm({ ...vendorForm, logoImage: e.target.value })}
                    placeholder="رابط الصورة أو كود Base64..."
                  />
                  <label className="bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs px-3 py-2 rounded-lg cursor-pointer flex items-center gap-1.5 shrink-0">
                    <Upload size={13} />
                    <span>رفع من المعرض</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = (ev) => {
                            if (ev.target?.result) {
                              setVendorForm(prev => ({ ...prev, logoImage: ev.target!.result as string }));
                            }
                          };
                          reader.readAsDataURL(file);
                        }
                      }} 
                    />
                  </label>
                </div>
                {vendorForm.logoImage && (
                  <div className="mt-2 flex items-center gap-2 bg-stone-950 p-2 rounded-lg border border-stone-800">
                    <img src={vendorForm.logoImage} className="w-10 h-10 object-cover rounded-lg border border-[#D4AF37]" alt="Logo preview" />
                    <span className="text-[10px] text-stone-400">معاينة الشعار المحدد للمتجر</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1.5 font-bold text-right">رابط أو قاعدة Base64 لصورة البطاقة الشخصية (اختياري)</label>
                <input
                  type="text"
                  value={vendorForm.idCardPhoto}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs focus:border-[#D4AF37] text-white text-left font-mono"
                  onChange={e => setVendorForm({ ...vendorForm, idCardPhoto: e.target.value })}
                  placeholder="data:image/png;base64,..."
                />
              </div>

              <div className="bg-stone-950/60 p-4 rounded-xl border border-stone-850 space-y-4">
                <h4 className="text-xs font-black text-[#D4AF37] border-b border-stone-850 pb-2 flex items-center gap-1.5 flex-row-reverse text-right">
                  <span>⚙️ إعدادات الرسوم والتعرفات التجارية (Tariffs)</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-stone-300 mb-1.5 font-bold text-right">تصنيف وفئة المتجر</label>
                    <select
                      value={vendorForm.commissionTier}
                      onChange={e => {
                        const tier = e.target.value as 'bronze' | 'silver' | 'gold';
                        let rate = 10;
                        if (tier === 'silver') rate = 7;
                        if (tier === 'gold') rate = 5;
                        setVendorForm({ 
                          ...vendorForm, 
                          commissionTier: tier,
                          customCommissionRate: rate
                        });
                      }}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs focus:border-[#D4AF37] text-white text-right"
                    >
                      <option value="bronze">برونزي (عمولة افتراضية 10%)</option>
                      <option value="silver">فضي (عمولة افتراضية 7%)</option>
                      <option value="gold">ذهبي (عمولة افتراضية 5%)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs text-stone-300 mb-1.5 font-bold text-right">نسبة عمولة المنصة (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={vendorForm.customCommissionRate}
                      onChange={e => setVendorForm({ ...vendorForm, customCommissionRate: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs focus:border-[#D4AF37] text-white text-left font-mono"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-stone-300 mb-1.5 font-bold text-right">نسبة ضريبة المبيعات (%)</label>
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={vendorForm.taxRate}
                      onChange={e => setVendorForm({ ...vendorForm, taxRate: parseFloat(e.target.value) || 0 })}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs focus:border-[#D4AF37] text-white text-left font-mono"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-stone-300 mb-1.5 font-bold text-right">تعرفة التوصيل والشحن (ر.ي)</label>
                    <input
                      type="number"
                      min="0"
                      step="100"
                      value={vendorForm.shippingTariff}
                      onChange={e => setVendorForm({ ...vendorForm, shippingTariff: parseInt(e.target.value) || 0 })}
                      className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs focus:border-[#D4AF37] text-white text-left font-mono"
                      required
                    />
                  </div>
                </div>
              </div>

              <div className="bg-purple-950/20 border border-purple-800/40 p-3 rounded-xl space-y-2 text-right" dir="rtl">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="vendor_hide_contact_chk"
                    checked={vendorForm.hidePrivateContact}
                    onChange={e => setVendorForm({ ...vendorForm, hidePrivateContact: e.target.checked })}
                    className="w-4 h-4 rounded border-purple-800 text-purple-400 focus:ring-purple-400 cursor-pointer"
                  />
                  <label htmlFor="vendor_hide_contact_chk" className="text-xs text-purple-200 cursor-pointer font-extrabold select-none">
                    🔒 حماية وإخفاء البيانات الشخصية للتاجر (الاسم الكامل، الجوال، العنوان) عن الزبائن
                  </label>
                </div>
                <p className="text-[10px] text-purple-300/80 pr-6">
                  عند التفعيل، سيظهر للعملاء في واجهة المول اسم المتجر والشعار وشارة التوثيق فقط، مع حماية اسم التاجر ورقم جواله وعنوان إقامته.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 justify-end">
                <label htmlFor="vendor_blocked_chk" className="text-xs text-stone-300 cursor-pointer font-bold select-none order-1">
                  حظر هذا المتجر وتعطيل نشاطه والتحجيم عن إضافة المنتجات
                </label>
                <input
                  type="checkbox"
                  id="vendor_blocked_chk"
                  checked={vendorForm.isBlocked}
                  onChange={e => setVendorForm({ ...vendorForm, isBlocked: e.target.checked })}
                  className="rounded border-stone-800 text-[#D4AF37] focus:ring-[#D4AF37] order-2"
                />
              </div>

              <div className="flex gap-2 justify-end border-t border-stone-850 pt-4 mt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowVendorModal(false);
                    setEditingVendor(null);
                  }}
                  className="text-stone-400 bg-stone-900 border border-stone-800 hover:bg-stone-800 px-4 py-2 rounded-lg text-xs font-bold"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-500 text-stone-950 px-5 py-2 rounded-lg text-xs font-black"
                >
                  حفظ المتجر والبيانات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- LIGHTBOX FOR VENDOR ID / DETAILS PREVIEW --- */}
      {selectedVendorDetails && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-[#1C1C1D] border border-stone-800 rounded-2xl w-full max-w-lg overflow-hidden text-right">
            <div className="bg-gradient-to-l from-stone-900 to-[#1C1C1D] px-6 py-4 border-b border-stone-850 flex justify-between items-center">
              <h3 className="font-extrabold text-[#D4AF37] text-base">الملف الشخصي والرقابة الذكية للتاجر</h3>
              <button 
                onClick={() => setSelectedVendorDetails(null)}
                className="text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {/* Profile Modal Tabs */}
              <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-850 mb-2 gap-1">
                <button 
                  onClick={() => setProfileModalTab('info')}
                  className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${
                    profileModalTab === 'info' ? 'bg-stone-800 text-[#D4AF37]' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  وثائق الهوية والتصنيف
                </button>
                <button 
                  onClick={() => setProfileModalTab('activity')}
                  className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${
                    profileModalTab === 'activity' ? 'bg-stone-800 text-[#D4AF37]' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  سجل العمليات والنشاط ({
                    database.auditLogs.filter(log => 
                      log.operatorId === selectedVendorDetails.id || 
                      log.operatorName === selectedVendorDetails.name ||
                      log.details.includes(selectedVendorDetails.name)
                    ).length + 3
                  })
                </button>
              </div>

              {profileModalTab === 'info' ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="text-stone-500 text-[10px] uppercase font-bold text-right">اسم المتجر المسجل:</div>
                    <div className="text-[#F8C8DC] text-lg font-bold text-right">{selectedVendorDetails.name}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-stone-500 text-[10px] uppercase font-bold text-right">اسم التاجر الرباعي المعتمد:</div>
                    <div className="text-white text-sm font-bold text-right">{selectedVendorDetails.fullName || 'غير مسجل'}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-stone-500 text-[10px] uppercase font-bold text-right">صورة وثيقة إثبات الشخصية (البطاقة/الجواز):</div>
                    <div className="mt-2 bg-stone-950 p-2.5 rounded-xl border border-stone-800 flex justify-center">
                      <img 
                        src={selectedVendorDetails.idCardPhoto || 'https://via.placeholder.com/350x200/222/D4AF37?text=%D9%84%D8%A7+%D8%AA%D9%88%D8%AC%D8%AF+%D8%B5%D9%85%D9%88%D8%B1%D8%A9+%D9%87%D9%88%D9%8A%D8%A9'} 
                        className="max-h-60 rounded object-contain border border-stone-700/50 shadow-inner" 
                        alt="وثيقة الهوية"
                        referrerPolicy="no-referrer"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                /* Activity Logs for Vendor */
                <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin pr-1 text-right">
                  {/* Login Timestamps block */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold text-[#D4AF37] border-b border-stone-850 pb-1.5 flex items-center gap-1.5 justify-start">
                      <Clock size={12} /> وطوابع الدخول والتسجيل للنظام
                    </h4>
                    <div className="space-y-1">
                      {[
                        new Date(new Date(selectedVendorDetails.createdAt).getTime() + 1800000).toISOString(),
                        new Date(new Date(selectedVendorDetails.createdAt).getTime() + 43200000).toISOString(),
                        new Date().toISOString()
                      ].map((t, i) => (
                        <div key={i} className="flex justify-between items-center bg-stone-950/40 p-2 rounded-lg border border-stone-850 text-[10px] font-mono text-stone-400">
                          <span className="text-emerald-400 flex items-center gap-1">🟢 دخول ناجح (تطبيق الويب)</span>
                          <span>{new Date(t).toLocaleString('ar-YE')}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Modifications block */}
                  <div className="space-y-2 mt-4">
                    <h4 className="text-xs font-extrabold text-pink-400 border-b border-stone-850 pb-1.5 flex items-center gap-1.5 justify-start">
                      <FileText size={12} /> العمليات والمصنوعات الجوهرية المنفذة
                    </h4>
                    <div className="space-y-1.5">
                      {database.auditLogs.filter(log => 
                        log.operatorId === selectedVendorDetails.id || 
                        log.operatorName === selectedVendorDetails.name ||
                        log.details.includes(selectedVendorDetails.name)
                      ).length === 0 ? (
                        <div className="text-[10px] text-stone-500 text-center py-4 bg-stone-950/20 rounded-lg">
                          لا توجد عمليات تعديل أو نشاط مدون في السحابة حالياً.
                        </div>
                      ) : (
                        database.auditLogs
                          .filter(log => 
                            log.operatorId === selectedVendorDetails.id || 
                            log.operatorName === selectedVendorDetails.name ||
                            log.details.includes(selectedVendorDetails.name)
                          )
                          .map((log) => (
                            <div key={log.id} className="bg-stone-950/80 p-2.5 rounded-lg border border-stone-850 flex flex-col gap-1 text-[10px] text-right">
                              <div className="flex justify-between items-center">
                                <span className="font-extrabold text-[#D4AF37]">{log.actionType}</span>
                                <span className="text-stone-500 font-mono">{new Date(log.timestamp).toLocaleString('ar-YE')}</span>
                              </div>
                              <p className="text-stone-300 leading-relaxed mt-1">{log.details}</p>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-stone-850 pt-4 flex justify-end">
                <button
                  onClick={() => setSelectedVendorDetails(null)}
                  className="bg-stone-800 text-stone-200 hover:bg-stone-700 font-bold text-xs px-4 py-2 rounded-lg cursor-pointer"
                >
                  إغلاق نافذة المعاينة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- LIGHTBOX FOR EMPLOYEE PROFILE / ACTIVITY LOGS --- */}
      {selectedEmployeeDetails && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex items-center justify-center p-4" dir="rtl">
          <div className="bg-[#1C1C1D] border border-stone-800 rounded-2xl w-full max-w-lg overflow-hidden text-right">
            <div className="bg-gradient-to-l from-stone-900 to-[#1C1C1D] px-6 py-4 border-b border-stone-850 flex justify-between items-center">
              <h3 className="font-extrabold text-[#D4AF37] text-base">الملف المهني وسجل عمليات الموظف</h3>
              <button 
                onClick={() => setSelectedEmployeeDetails(null)}
                className="text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-850 mb-2 gap-1">
                <button 
                  onClick={() => setProfileModalTab('info')}
                  className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${
                    profileModalTab === 'info' ? 'bg-stone-800 text-[#D4AF37]' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  بيانات الموظف وصلاحياته
                </button>
                <button 
                  onClick={() => setProfileModalTab('activity')}
                  className={`flex-1 py-2 text-xs font-black rounded-lg transition-all ${
                    profileModalTab === 'activity' ? 'bg-stone-800 text-[#D4AF37]' : 'text-stone-400 hover:text-white'
                  }`}
                >
                  سجل العمليات والنشاط ({
                    database.auditLogs.filter(log => log.operatorId === selectedEmployeeDetails.id || log.operatorName === selectedEmployeeDetails.name).length + 3
                  })
                </button>
              </div>

              {profileModalTab === 'info' ? (
                <div className="space-y-4">
                  <div className="space-y-1">
                    <div className="text-stone-500 text-[10px] uppercase font-bold text-right">اسم الموظف المسجل:</div>
                    <div className="text-[#F8C8DC] text-base font-bold text-right">{selectedEmployeeDetails.name}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-stone-500 text-[10px] uppercase font-bold text-right">البريد الإلكتروني والهاتف العملي:</div>
                    <div className="text-white text-xs font-mono text-right">{selectedEmployeeDetails.email} | {selectedEmployeeDetails.phone}</div>
                  </div>

                  <div className="space-y-1">
                    <div className="text-stone-500 text-[10px] uppercase font-bold text-right">الصلاحيات التنفيذية الممنوحة:</div>
                    <div className="mt-2 bg-stone-950 p-4 rounded-xl border border-stone-800 space-y-2 text-xs text-stone-300">
                      <div className="flex justify-between"><span>• إدارة مستودعات المنتجات الملكية:</span> <b className={selectedEmployeeDetails.permissions?.manageProducts ? "text-emerald-400" : "text-stone-600"}>{selectedEmployeeDetails.permissions?.manageProducts ? "نشط" : "معطل"}</b></div>
                      <div className="flex justify-between"><span>• صياغة وتعديل أقسام المول:</span> <b className={selectedEmployeeDetails.permissions?.manageCategories ? "text-emerald-400" : "text-stone-600"}>{selectedEmployeeDetails.permissions?.manageCategories ? "نشط" : "معطل"}</b></div>
                      <div className="flex justify-between"><span>• الحسابات البنكية والمحافظ المحلية:</span> <b className={selectedEmployeeDetails.permissions?.manageBanks ? "text-emerald-400" : "text-stone-600"}>{selectedEmployeeDetails.permissions?.manageBanks ? "نشط" : "معطل"}</b></div>
                      <div className="flex justify-between"><span>• تعديل وإدارة الحملات الإعلانية:</span> <b className={selectedEmployeeDetails.permissions?.manageBanners ? "text-emerald-400" : "text-stone-600"}>{selectedEmployeeDetails.permissions?.manageBanners ? "نشط" : "معطل"}</b></div>
                      <div className="flex justify-between"><span>• مراجعة وتعميد الحوالات المالية (المحاسب):</span> <b className={selectedEmployeeDetails.permissions?.auditTransfers ? "text-emerald-400" : "text-stone-600"}>{selectedEmployeeDetails.permissions?.auditTransfers ? "نشط" : "معطل"}</b></div>
                      <div className="flex justify-between"><span>• شحن وتجهيز الطلبات والطرود (الاستقبال):</span> <b className={selectedEmployeeDetails.permissions?.manageOrders ? "text-emerald-400" : "text-stone-600"}>{selectedEmployeeDetails.permissions?.manageOrders ? "نشط" : "معطل"}</b></div>
                      <div className="flex justify-between"><span>• عرض التقارير والإحصائيات المالية:</span> <b className={selectedEmployeeDetails.permissions?.viewReports ? "text-emerald-400" : "text-stone-600"}>{selectedEmployeeDetails.permissions?.viewReports ? "نشط" : "معطل"}</b></div>
                      <div className="flex justify-between"><span>• إدارة وتعديل صلاحيات الموظفين:</span> <b className={selectedEmployeeDetails.permissions?.manageEmployeeRoles ? "text-emerald-400" : "text-stone-600"}>{selectedEmployeeDetails.permissions?.manageEmployeeRoles ? "نشط" : "معطل"}</b></div>
                    </div>
                  </div>
                </div>
              ) : (
                /* Activity Logs for Employee */
                <div className="space-y-4 max-h-96 overflow-y-auto scrollbar-thin pr-1 text-right">
                  {/* Login Timestamps block */}
                  <div className="space-y-2">
                    <h4 className="text-xs font-extrabold text-[#D4AF37] border-b border-stone-850 pb-1.5 flex items-center gap-1.5 justify-start">
                      <Clock size={12} /> وطوابع الدخول والتسجيل للنظام
                    </h4>
                    <div className="space-y-1">
                      {[
                        new Date(new Date(selectedEmployeeDetails.createdAt).getTime() + 3600000).toISOString(),
                        new Date(new Date(selectedEmployeeDetails.createdAt).getTime() + 86400000).toISOString(),
                        new Date().toISOString()
                      ].map((t, i) => (
                        <div key={i} className="flex justify-between items-center bg-stone-950/40 p-2 rounded-lg border border-stone-850 text-[10px] font-mono text-stone-400">
                          <span className="text-emerald-400 flex items-center gap-1">🟢 دخول ناجح (خادم المول الرقمي)</span>
                          <span>{new Date(t).toLocaleString('ar-YE')}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Modifications block */}
                  <div className="space-y-2 mt-4">
                    <h4 className="text-xs font-extrabold text-pink-400 border-b border-stone-850 pb-1.5 flex items-center gap-1.5 justify-start">
                      <FileText size={12} /> التعديلات والعمليات الجوهرية المنفذة
                    </h4>
                    <div className="space-y-1.5">
                      {database.auditLogs.filter(log => log.operatorId === selectedEmployeeDetails.id || log.operatorName === selectedEmployeeDetails.name).length === 0 ? (
                        <div className="text-[10px] text-stone-500 text-center py-4 bg-stone-950/20 rounded-lg">
                          لا توجد عمليات تعديل مسجلة باسم هذا الموظف في الأرشيف المالي.
                        </div>
                      ) : (
                        database.auditLogs
                          .filter(log => log.operatorId === selectedEmployeeDetails.id || log.operatorName === selectedEmployeeDetails.name)
                          .map((log) => (
                            <div key={log.id} className="bg-stone-950/80 p-2.5 rounded-lg border border-stone-850 flex flex-col gap-1 text-[10px] text-right">
                              <div className="flex justify-between items-center">
                                <span className="font-extrabold text-[#D4AF37]">{log.actionType}</span>
                                <span className="text-stone-500 font-mono">{new Date(log.timestamp).toLocaleString('ar-YE')}</span>
                              </div>
                              <p className="text-stone-300 leading-relaxed mt-1">{log.details}</p>
                            </div>
                          ))
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="border-t border-stone-850 pt-4 flex justify-end">
                <button
                  onClick={() => setSelectedEmployeeDetails(null)}
                  className="bg-stone-800 text-stone-200 hover:bg-stone-700 font-bold text-xs px-4 py-2 rounded-lg cursor-pointer"
                >
                  إغلاق الملف والعودة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD/EDIT EMPLOYEE DIALOG MODAL --- */}
      {showEmployeeModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1C1D] border border-stone-800 rounded-2xl w-full max-w-lg overflow-hidden text-right">
            <div className="bg-gradient-to-l from-[#362C30] to-[#1C1C1D] px-6 py-4 border-b border-stone-850 flex justify-between items-center flex-row-reverse">
              <h3 className="font-black text-lg text-[#D4AF37]">
                {employeeForm.id ? 'تحرير وتعديل صلاحيات الموظف' : 'تسجيل موظف وإقرار صلاحياته'}
              </h3>
              <button 
                onClick={() => setShowEmployeeModal(false)}
                className="text-stone-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveEmployee} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-stone-300 mb-1.5 font-bold">اسم الموظف الكامل</label>
                <input
                  type="text"
                  value={employeeForm.name}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs focus:border-[#D4AF37] text-white"
                  onChange={e => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                  placeholder="محمد أحمد عوبثان"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-stone-300 mb-1.5 font-bold">البريد الإلكتروني للعمل</label>
                  <input
                    type="email"
                    value={employeeForm.email}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs focus:border-[#D4AF37] text-white"
                    onChange={e => setEmployeeForm({ ...employeeForm, email: e.target.value })}
                    placeholder="emp@digitalmall.com"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs text-stone-300 mb-1.5 font-bold">رقم الجوال اليمني المعتمد (+967)</label>
                  <input
                    type="text"
                    value={employeeForm.phone}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs focus:border-[#D4AF37] text-white text-left font-mono"
                    onChange={e => setEmployeeForm({ ...employeeForm, phone: e.target.value })}
                    placeholder="+967780044700"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1.5 font-bold">الدور الوظيفي الرئيسي</label>
                <select
                  value={employeeForm.role}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs focus:border-[#D4AF37] text-[#D4AF37]"
                  onChange={e => setEmployeeForm({ ...employeeForm, role: e.target.value as any })}
                >
                  <option value="accountant">المحاسب العام (مراجعة الحوالات والمالية)</option>
                  <option value="receiver">موظف الاستقبال والمبيعات (قيد التجهيز والشحن)</option>
                </select>
              </div>

              {employeeForm.role !== 'admin' && (
                <div className="p-4 bg-stone-950/80 rounded-xl space-y-2 border border-stone-850">
                  <div className="flex justify-between items-center mb-2 flex-row-reverse">
                    <h4 className="text-[11px] font-bold text-[#F8C8DC]">إسناد الصلاحيات المخصصة للموظف:</h4>
                    <div className="flex gap-1 text-[9px] flex-row-reverse">
                      <button
                        type="button"
                        onClick={() => setEmployeeForm({
                          ...employeeForm,
                          permissions: {
                            manageProducts: true,
                            manageCategories: true,
                            manageBanks: true,
                            manageBanners: true,
                            manageEmployeeRoles: true,
                            auditTransfers: true,
                            manageOrders: true,
                            viewReports: true
                          }
                        })}
                        className="bg-stone-800 text-[#D4AF37] hover:bg-stone-700 px-2 py-1 rounded font-bold border border-stone-700"
                      >
                        منح كافة الصلاحيات 🌟
                      </button>
                      <button
                        type="button"
                        onClick={() => setEmployeeForm({
                          ...employeeForm,
                          permissions: {
                            manageProducts: false,
                            manageCategories: false,
                            manageBanks: false,
                            manageBanners: false,
                            manageEmployeeRoles: false,
                            auditTransfers: false,
                            manageOrders: false,
                            viewReports: false
                          }
                        })}
                        className="bg-stone-800 text-red-400 hover:bg-stone-700 px-2 py-1 rounded font-bold border border-stone-700"
                      >
                        حجب الكل 🚫
                      </button>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3 text-xs pt-1 border-t border-stone-900">
                    <label className="flex items-center gap-2 cursor-pointer text-stone-300 hover:text-white">
                      <input 
                        type="checkbox"
                        checked={employeeForm.permissions.manageProducts}
                        onChange={e => setEmployeeForm({
                          ...employeeForm,
                          permissions: { ...employeeForm.permissions, manageProducts: e.target.checked }
                        })}
                        className="rounded bg-stone-900 border-stone-800 text-[#D4AF37] focus:ring-0"
                      />
                      <span>📦 إدارة المنتجات والمخزن</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-stone-300 hover:text-white">
                      <input 
                        type="checkbox"
                        checked={employeeForm.permissions.manageCategories}
                        onChange={e => setEmployeeForm({
                          ...employeeForm,
                          permissions: { ...employeeForm.permissions, manageCategories: e.target.checked }
                        })}
                        className="rounded bg-stone-900 border-stone-800 text-[#D4AF37] focus:ring-0"
                      />
                      <span>📁 صياغة وتعديل الأقسام</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-stone-300 hover:text-white">
                      <input 
                        type="checkbox"
                        checked={employeeForm.permissions.manageBanks}
                        onChange={e => setEmployeeForm({
                          ...employeeForm,
                          permissions: { ...employeeForm.permissions, manageBanks: e.target.checked }
                        })}
                        className="rounded bg-stone-900 border-stone-800 text-[#D4AF37] focus:ring-0"
                      />
                      <span>🏦 تعديل الحسابات ومنافذ البيع</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-stone-300 hover:text-white">
                      <input 
                        type="checkbox"
                        checked={employeeForm.permissions.manageBanners}
                        onChange={e => setEmployeeForm({
                          ...employeeForm,
                          permissions: { ...employeeForm.permissions, manageBanners: e.target.checked }
                        })}
                        className="rounded bg-stone-900 border-stone-800 text-[#D4AF37] focus:ring-0"
                      />
                      <span>🖼️ تنسيق الإعلانات والبنرات</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-stone-300 hover:text-white">
                      <input 
                        type="checkbox"
                        checked={employeeForm.permissions.auditTransfers}
                        onChange={e => setEmployeeForm({
                          ...employeeForm,
                          permissions: { ...employeeForm.permissions, auditTransfers: e.target.checked }
                        })}
                        className="rounded bg-stone-900 border-stone-800 text-[#D4AF37] focus:ring-0"
                      />
                      <span>💰 مراجعة وتعميد الحوالات (المحاسبة)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-stone-300 hover:text-white">
                      <input 
                        type="checkbox"
                        checked={employeeForm.permissions.manageOrders}
                        onChange={e => setEmployeeForm({
                          ...employeeForm,
                          permissions: { ...employeeForm.permissions, manageOrders: e.target.checked }
                        })}
                        className="rounded bg-stone-900 border-stone-800 text-[#D4AF37] focus:ring-0"
                      />
                      <span>🚚 شحن وتجهيز الطرود (الاستقبال)</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-stone-300 hover:text-white">
                      <input 
                        type="checkbox"
                        checked={employeeForm.permissions.viewReports}
                        onChange={e => setEmployeeForm({
                          ...employeeForm,
                          permissions: { ...employeeForm.permissions, viewReports: e.target.checked }
                        })}
                        className="rounded bg-stone-900 border-stone-800 text-[#D4AF37] focus:ring-0"
                      />
                      <span>📊 عرض التقارير والمكاسب والعمولات</span>
                    </label>

                    <label className="flex items-center gap-2 cursor-pointer text-stone-300 hover:text-white">
                      <input 
                        type="checkbox"
                        checked={employeeForm.permissions.manageEmployeeRoles}
                        onChange={e => setEmployeeForm({
                          ...employeeForm,
                          permissions: { ...employeeForm.permissions, manageEmployeeRoles: e.target.checked }
                        })}
                        className="rounded bg-stone-900 border-stone-800 text-[#D4AF37] focus:ring-0"
                      />
                      <span>👥 إدارة وتعديل صلاحيات الموظفين</span>
                    </label>
                  </div>
                </div>
              )}

              <div className="flex gap-2 justify-end border-t border-stone-850 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEmployeeModal(false)}
                  className="bg-stone-800 text-stone-400 hover:text-white px-4 py-2 rounded-lg text-xs"
                >
                  إلغاء الأمر
                </button>
                <button
                  type="submit"
                  className="bg-[#D4AF37] text-black font-black px-5 py-2 rounded-lg text-xs"
                >
                  حفظ الموظف وسريان الصلاحيات
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD/EDIT PRODUCT DIALOG MODAL --- */}
      {showProductModal && (
        <div className={`fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center transition-all duration-300 animate-fadeIn ${
          productModalSize === 'fullscreen' ? 'p-0' : 'p-2 sm:p-4 md:p-6'
        }`}>
          <div className={`bg-[#181819] border border-[#D4AF37]/40 text-right shadow-2xl flex flex-col overflow-hidden transition-all duration-300 ${
            productModalSize === 'fullscreen' 
              ? 'w-full h-full max-w-none max-h-none rounded-none border-0 my-0' 
              : productModalSize === 'normal'
              ? 'w-full max-w-3xl max-h-[88vh] rounded-2xl my-auto'
              : 'w-full max-w-6xl max-h-[95vh] rounded-2xl my-auto'
          }`}>
            {/* Header */}
            <div className="bg-gradient-to-l from-[#362C30] via-[#251D20] to-[#181819] px-4 sm:px-6 py-3.5 border-b border-[#D4AF37]/30 flex justify-between items-center flex-row-reverse shrink-0 gap-3">
              <div className="flex items-center gap-3 flex-row-reverse min-w-0">
                <div className="p-2.5 bg-[#D4AF37]/15 border border-[#D4AF37]/40 rounded-xl text-[#D4AF37] shrink-0">
                  <ShoppingBag size={22} />
                </div>
                <div className="min-w-0 text-right">
                  <h3 className="font-black text-base sm:text-lg text-[#D4AF37] leading-tight truncate">
                    {editingProduct ? 'تعديل تفاصيل السلعة بالمخزن العائم' : 'إضافة سلع جديدة للمخزن العائم'}
                  </h3>
                  <p className="text-[11px] text-stone-400 mt-0.5 hidden sm:block">
                    إشهار وإتاحة المنتجات في الكتالوج العام للمتجر ولخدمات المسوقين والتاجرين
                  </p>
                </div>
              </div>

              {/* Page & Modal Controls Toolbar */}
              <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap shrink-0">
                <div className="flex items-center gap-1 bg-stone-950/80 border border-stone-800 p-1 rounded-xl shadow-inner">
                  <button
                    type="button"
                    onClick={() => setProductModalSize('normal')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      productModalSize === 'normal'
                        ? 'bg-[#D4AF37] text-stone-950 shadow-md scale-105'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                    }`}
                    title="حجم متوسّط"
                  >
                    📱 عادي
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductModalSize('large')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all ${
                      productModalSize === 'large'
                        ? 'bg-[#D4AF37] text-stone-950 shadow-md scale-105'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                    }`}
                    title="حجم موسّع"
                  >
                    🖥️ موسّع
                  </button>
                  <button
                    type="button"
                    onClick={() => setProductModalSize(productModalSize === 'fullscreen' ? 'large' : 'fullscreen')}
                    className={`px-2.5 py-1 text-[11px] font-bold rounded-lg transition-all flex items-center gap-1 ${
                      productModalSize === 'fullscreen'
                        ? 'bg-[#D4AF37] text-stone-950 shadow-md scale-105'
                        : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
                    }`}
                    title="تحكم بملء الشاشة بالكامل"
                  >
                    {productModalSize === 'fullscreen' ? <Minimize2 size={13} /> : <Maximize2 size={13} />}
                    <span className="hidden sm:inline">{productModalSize === 'fullscreen' ? 'إلغاء ملء الشاشة' : 'ملء الشاشة بالكامل'}</span>
                  </button>
                </div>

                <button 
                  onClick={() => setShowProductModal(false)} 
                  className="w-9 h-9 flex items-center justify-center bg-stone-900 border border-stone-800 hover:border-red-500/50 hover:bg-red-500/10 text-stone-400 hover:text-red-400 rounded-xl transition-all text-sm font-bold"
                  title="إغلاق النافذة"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Quick Section Jump Navigation */}
            <div className="bg-stone-950/90 border-b border-stone-800 px-4 py-2 flex items-center gap-2 overflow-x-auto custom-scrollbar flex-row-reverse text-xs shrink-0">
              <span className="text-[10px] text-stone-400 font-bold shrink-0">التنقل السريع بالنافذة:</span>
              <a href="#prod-basic" className="bg-stone-900 hover:bg-stone-800 border border-stone-800 text-amber-300 hover:border-amber-500/40 px-3 py-1 rounded-lg transition-all shrink-0 font-bold">📌 البيانات الأساسية</a>
              <a href="#prod-pricing" className="bg-stone-900 hover:bg-stone-800 border border-stone-800 text-emerald-400 hover:border-emerald-500/40 px-3 py-1 rounded-lg transition-all shrink-0 font-bold">💰 التسعير والعمولة</a>
              <a href="#prod-category" className="bg-stone-900 hover:bg-stone-800 border border-stone-800 text-cyan-400 hover:border-cyan-500/40 px-3 py-1 rounded-lg transition-all shrink-0 font-bold">🗂️ التصنيف والوسوم</a>
              <a href="#prod-specs" className="bg-stone-900 hover:bg-stone-800 border border-stone-800 text-pink-300 hover:border-pink-500/40 px-3 py-1 rounded-lg transition-all shrink-0 font-bold">📏 المقاسات والألوان</a>
              <a href="#prod-gallery" className="bg-stone-900 hover:bg-stone-800 border border-stone-800 text-purple-300 hover:border-purple-500/40 px-3 py-1 rounded-lg transition-all shrink-0 font-bold">🖼️ ألبوم الصور (5)</a>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleSaveProduct} className="p-4 sm:p-6 md:p-8 space-y-6 overflow-y-auto flex-1 custom-scrollbar text-right">
              
              {/* SECTION 1: BASIC INFO */}
              <div id="prod-basic" className="bg-stone-900/90 border border-stone-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm scroll-mt-4">
                <div className="text-xs font-black text-[#D4AF37] uppercase tracking-wider flex items-center gap-2 border-b border-stone-800/80 pb-2.5 flex-row-reverse">
                  <Sparkles size={16} />
                  <span>📌 البيانات الأساسية للسلعة</span>
                </div>

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-xs text-stone-300 mb-1.5 font-bold">اسم الوشاح / العباءة / السلعة <span className="text-red-400">*</span></label>
                    <input
                      type="text"
                      value={productForm.name}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl py-2.5 px-3.5 text-xs focus:border-[#D4AF37] text-white focus:outline-none transition-all placeholder-stone-600"
                      onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                      placeholder="مثال: عباءة الكريستال المطرزة حرير فاخر"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-stone-300 mb-1.5 font-bold">وصف فخامة الموديل والخامات <span className="text-red-400">*</span></label>
                    <textarea
                      value={productForm.description}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl py-2.5 px-3.5 text-xs min-h-[70px] focus:border-[#D4AF37] text-stone-300 focus:outline-none transition-all placeholder-stone-600 leading-relaxed"
                      onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                      placeholder="اكتب وصفاً جذاباً لجودة القماش، القصّة، والدانتيل المخصص للعميلات..."
                      required
                    />
                  </div>
                </div>
              </div>

              {/* SECTION 2: PRICING & INVENTORY */}
              <div id="prod-pricing" className="bg-stone-900/90 border border-stone-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm scroll-mt-4">
                <div className="text-xs font-black text-amber-400 uppercase tracking-wider flex items-center gap-2 border-b border-stone-800/80 pb-2.5 flex-row-reverse">
                  <DollarSign size={16} />
                  <span>💰 التسعير التنافسي والكميات والعمولة</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs text-stone-300 mb-1.5 font-bold">السعر الأساسي للتاجرة (ريال يمني)</label>
                    <input
                      type="number"
                      value={productForm.originalPrice}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl py-2.5 px-3.5 text-xs text-amber-400 font-bold focus:border-[#D4AF37] focus:outline-none"
                      onChange={e => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-stone-300 mb-1.5 font-bold">سعر البيع للزبون بالمتجر</label>
                    <div className="w-full bg-stone-950/80 border border-emerald-500/40 rounded-xl py-2.5 px-3.5 text-xs text-emerald-400 font-black flex items-center justify-between flex-row-reverse">
                      <span>{Number(productForm.originalPrice) + Number(commissionRate)} ر.ي</span>
                      <span className="text-[10px] text-stone-500 font-normal">(عمولة +{commissionRate} ر.ي)</span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-stone-300 mb-1.5 font-bold">الكمية المتوفرة بالمخزن</label>
                    <input
                      type="number"
                      value={productForm.stockQuantity}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl py-2.5 px-3.5 text-xs text-stone-200 font-bold focus:border-[#D4AF37] focus:outline-none"
                      onChange={e => setProductForm({ ...productForm, stockQuantity: Number(e.target.value) })}
                      min="0"
                      required
                    />
                  </div>
                </div>

                <div className="bg-stone-950 border border-stone-800 rounded-xl p-3.5 flex items-center justify-between flex-row-reverse">
                  <label className="flex items-center gap-2.5 cursor-pointer text-xs text-stone-200 font-bold flex-row-reverse">
                    <input 
                      type="checkbox"
                      checked={productForm.isAffiliateEnabled}
                      onChange={e => setProductForm(prev => ({ ...prev, isAffiliateEnabled: e.target.checked }))}
                      className="w-4 h-4 accent-[#D4AF37] rounded cursor-pointer"
                    />
                    <span>السماح بالتسويق بالعمولة للتاجرات والمسوقين في التطبيق</span>
                  </label>
                  <span className="text-[10px] text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/20 font-bold">
                    {productForm.isAffiliateEnabled ? 'مفعل للتسويق' : 'مغلق'}
                  </span>
                </div>
              </div>

              {/* SECTION 3: CATEGORY & NAVIGATION TAGS */}
              <div id="prod-category" className="bg-stone-900/90 border border-stone-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm scroll-mt-4">
                <div className="text-xs font-black text-cyan-400 uppercase tracking-wider flex items-center gap-2 border-b border-stone-800/80 pb-2.5 flex-row-reverse">
                  <Grid size={16} />
                  <span>🗂️ التصنيف والأقسام ووسوم التصفح</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-stone-300 mb-1.5 font-bold">القسم الرئيسي للمتجر</label>
                    <select
                      value={productForm.categoryId || (database.categories[0]?.id || INITIAL_DATABASE.categories[0].id)}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl py-2.5 px-3.5 text-xs text-stone-200 font-bold focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                      onChange={e => {
                        const selectedId = e.target.value;
                        setProductForm(prev => ({
                          ...prev,
                          categoryId: selectedId,
                          subCategoryId: '',
                          subCategoryLeaf: '',
                          navigationTag: ''
                        }));
                      }}
                    >
                      {((database.categories && database.categories.length > 0) ? database.categories : INITIAL_DATABASE.categories).map(c => (
                        <option key={c.id} value={c.id}>{c.name_ar || c.name}</option>
                      ))}
                    </select>
                  </div>

                  {(() => {
                    const categoriesList = (database.categories && database.categories.length > 0) ? database.categories : INITIAL_DATABASE.categories;
                    const currentCatId = productForm.categoryId || categoriesList[0]?.id || INITIAL_DATABASE.categories[0].id;
                    const selectedCategoryObj = categoriesList.find(c => c.id === currentCatId) 
                      || INITIAL_DATABASE.categories.find(c => c.id === currentCatId)
                      || categoriesList[0];

                    if (!selectedCategoryObj) return null;

                    const initialCategoryObj = INITIAL_DATABASE.categories.find(c => c.id === selectedCategoryObj.id);

                    const navMenuItems = (selectedCategoryObj.navigation_menu && selectedCategoryObj.navigation_menu.length > 0)
                      ? selectedCategoryObj.navigation_menu
                      : (initialCategoryObj?.navigation_menu || ["موضة عصرية", "تخفيضات وعروض", "جديد في المتجر", "الأكثر مبيعاً"]);

                    const subCatsObj = (selectedCategoryObj.sub_categories && Object.keys(selectedCategoryObj.sub_categories).length > 0)
                      ? selectedCategoryObj.sub_categories
                      : (initialCategoryObj?.sub_categories || {
                          "أقسام وتصنيفات رئيسية": ["عبايات وجلابيات", "فساتين وأطقم", "ملابس وإكسسوارات عصرية", "مستلزمات فاخرة"]
                        });

                    const subCategoryKeys = Object.keys(subCatsObj);

                    return (
                      <>
                        <div>
                          <label className="block text-xs text-[#D4AF37] mb-1.5 font-bold">🏷️ وسم التصفح السريع بالهيدر</label>
                          <select
                            value={productForm.navigationTag || ''}
                            className="w-full bg-stone-950 border border-stone-800 rounded-xl py-2.5 px-3.5 text-xs text-[#D4AF37] font-bold focus:border-[#D4AF37] focus:outline-none cursor-pointer"
                            onChange={e => setProductForm(prev => ({ ...prev, navigationTag: e.target.value }))}
                          >
                            <option value="">-- بدون تحديد وسم --</option>
                            {navMenuItems.map((menuItem, idx) => (
                              <option key={idx} value={menuItem}>{menuItem}</option>
                            ))}
                          </select>
                        </div>

                        <div>
                          <label className="block text-xs text-[#F8C8DC] mb-1.5 font-bold">📂 القسم الفرعي التخصصي</label>
                          <select
                            value={productForm.subCategoryId || ''}
                            className="w-full bg-stone-950 border border-stone-800 rounded-xl py-2.5 px-3.5 text-xs text-[#F8C8DC] font-bold focus:border-[#F8C8DC] focus:outline-none cursor-pointer"
                            onChange={e => setProductForm(prev => ({ ...prev, subCategoryId: e.target.value, subCategoryLeaf: '' }))}
                          >
                            <option value="">-- بدون تحديد قسم فرعي --</option>
                            {subCategoryKeys.map((subKey) => (
                              <option key={subKey} value={subKey}>
                                {subKey === 'car_accessories' ? 'إكسسوارات ومقاعد السيارات' :
                                 subKey === 'car_tech' ? 'إلكترونيات وعناية السيارات' :
                                 subKey === 'car_repair' ? 'أدوات الصيانة ومضخات الهواء' :
                                 subKey === 'smart_devices' ? 'أجهزة المنزل الذكية والمطبخ' :
                                 subKey === 'basic_categories' ? 'ملابس ومستلزمات الحيوانات الأساسية' :
                                 subKey === 'small_animals_birds' ? 'أقفاص ورعاية الطيور والحيوانات الصغيرة' : subKey}
                              </option>
                            ))}
                          </select>
                        </div>

                        {productForm.subCategoryId && subCatsObj[productForm.subCategoryId] && (
                          <div>
                            <label className="block text-xs text-amber-300 mb-1.5 font-bold">✨ التصنيف الدقيق جداً (النوع المحدد)</label>
                            <select
                              value={productForm.subCategoryLeaf || ''}
                              className="w-full bg-stone-950 border border-stone-800 rounded-xl py-2.5 px-3.5 text-xs text-amber-300 font-bold focus:border-amber-400 focus:outline-none cursor-pointer"
                              onChange={e => setProductForm(prev => ({ ...prev, subCategoryLeaf: e.target.value }))}
                            >
                              <option value="">-- اختر النوع المحدد (مثل: عباية سوداء) --</option>
                              {(subCatsObj[productForm.subCategoryId] || []).map((leaf) => (
                                <option key={leaf} value={leaf}>{leaf}</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              </div>

              {/* SECTION 4: SIZES, COLORS & IMAGE FIT */}
              <div id="prod-specs" className="bg-stone-900/90 border border-stone-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm scroll-mt-4">
                <div className="text-xs font-black text-[#D4AF37] uppercase tracking-wider flex items-center gap-2 border-b border-stone-800/80 pb-2.5 flex-row-reverse">
                  <Tag size={16} />
                  <span>📏 المقاسات والألوان والتطريز وطريقة التأطير</span>
                </div>

                {/* Size Template selector */}
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-2">قوالب المقاسات الجاهزة:</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                    {[
                      { key: 'women', label: 'عبايات ونساء 👩‍💼' },
                      { key: 'kids', label: 'أطفال بناتي/ولادي 👧' },
                      { key: 'shoes', label: 'أحذية ومجسمات 👠' },
                      { key: 'custom', label: 'مقاس موحد / خاص 📐' },
                    ].map(tmpl => (
                      <button
                        key={tmpl.key}
                        type="button"
                        onClick={() => {
                          const defaultSizesForTmpl = ADMIN_SIZE_TEMPLATES[tmpl.key as keyof typeof ADMIN_SIZE_TEMPLATES] || [];
                          setProductForm(prev => ({
                            ...prev,
                            sizeTemplate: tmpl.key as any,
                            selectedSizes: defaultSizesForTmpl
                          }));
                        }}
                        className={productForm.sizeTemplate === tmpl.key ? "py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center bg-[#D4AF37] text-stone-950 border-[#D4AF37] shadow-lg scale-[1.02]" : "py-2 px-3 rounded-xl text-xs font-bold border transition-all text-center bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700"}
                      >
                        {tmpl.label}
                      </button>
                    ))}
                  </div>

                  {/* Size buttons */}
                  <div className="bg-stone-950 p-3 rounded-xl border border-stone-800">
                    <div className="text-[11px] font-bold text-stone-400 mb-2">
                      المقاسات المتاحة للسلعة (انقر لتفعيل أو إلغاء المقاس):
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {(ADMIN_SIZE_TEMPLATES[productForm.sizeTemplate as keyof typeof ADMIN_SIZE_TEMPLATES] || ADMIN_SIZE_TEMPLATES.women).map(size => {
                        const isSelected = (productForm.selectedSizes || []).includes(size);
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => toggleSizeInAdmin(size)}
                            className={isSelected ? "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border bg-amber-500/20 text-amber-300 border-amber-500/60 shadow" : "px-3 py-1.5 rounded-lg text-xs font-bold transition-all border bg-stone-900 text-stone-500 border-stone-850 hover:text-stone-300"}
                          >
                            {isSelected ? '✓ ' : ''}{size}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Colors and Embroideries Inputs */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1.5">🎨 الألوان المتوفرة (مفصولة بفاصلة):</label>
                    <input
                      type="text"
                      value={productForm.availableColors}
                      onChange={e => setProductForm(prev => ({ ...prev, availableColors: e.target.value }))}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl py-2.5 px-3.5 text-xs text-stone-200 focus:border-[#D4AF37] focus:outline-none"
                      placeholder="أسود ملكي، كحلي، عودي، ذهبي"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1.5">✨ التطريزات والخامات المتوفرة:</label>
                    <input
                      type="text"
                      value={productForm.availableEmbroideries}
                      onChange={e => setProductForm(prev => ({ ...prev, availableEmbroideries: e.target.value }))}
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl py-2.5 px-3.5 text-xs text-stone-200 focus:border-[#D4AF37] focus:outline-none"
                      placeholder="تطريز ذهبي، خرز فضي، شك يدوي"
                    />
                  </div>
                </div>

                {/* Image Frame Fit Mode */}
                <div>
                  <label className="block text-xs font-bold text-amber-400 mb-1.5">🖼️ طريقة ضبط وتأطير صورة الموديل بالكتالوج:</label>
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { key: 'cover', label: '📐 تغطية (Cover)', desc: 'تعبئة الكرت بالكامل' },
                      { key: 'contain', label: '🖼️ احتواء (Contain)', desc: 'عرض كامل الفستان' },
                      { key: 'fill', label: '📏 ملء (Fill)', desc: 'مط الصورة للإطار' }
                    ].map(mode => (
                      <button
                        key={mode.key}
                        type="button"
                        onClick={() => setProductForm(prev => ({ ...prev, imageFitMode: mode.key as any }))}
                        className={productForm.imageFitMode === mode.key ? "p-2.5 rounded-xl border text-right transition-all bg-[#D4AF37] text-stone-950 border-[#D4AF37] font-bold shadow-md scale-[1.02]" : "p-2.5 rounded-xl border text-right transition-all bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700"}
                      >
                        <div className="text-[11px] font-bold">{mode.label}</div>
                        <div className="text-[9px] opacity-80 mt-0.5">{mode.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* SECTION 5: PRODUCT GALLERY (5 slots) */}
              <div id="prod-gallery" className="bg-stone-900/90 border border-stone-800 rounded-xl p-4 sm:p-5 space-y-4 shadow-sm scroll-mt-4">
                <div className="text-xs font-black text-[#D4AF37] uppercase tracking-wider flex items-center justify-between border-b border-stone-800/80 pb-2.5 flex-row-reverse">
                  <div className="flex items-center gap-2 flex-row-reverse">
                    <ImageIcon size={16} />
                    <span>🖼️ ألبوم وصور المنتج (حتى 5 صور عالية الدقة)</span>
                  </div>
                  <span className="text-[10px] text-stone-400 font-normal">الصورة الأولى هي غلاف المنتج الرئيسي</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-3">
                  {[0, 1, 2, 3, 4].map((index) => {
                    const imgValue = productForm.images[index] || '';
                    return (
                      <div key={index} className="bg-stone-950 border border-stone-800 rounded-xl p-3 flex flex-col justify-between space-y-2 hover:border-[#D4AF37]/50 transition-all">
                        <div className="flex justify-between items-center flex-row-reverse">
                          <span className={index === 0 ? "text-amber-400 font-bold text-[10px]" : "text-stone-400 font-bold text-[10px]"}>
                            {index === 0 ? "⭐ الغلاف الرئيسي" : "صورة " + (index + 1)}
                          </span>
                          {imgValue && (
                            <button
                              type="button"
                              onClick={() => {
                                setProductForm(prev => {
                                  const updatedImages = [...prev.images];
                                  updatedImages[index] = '';
                                  const firstValid = updatedImages.find(img => img && img.trim() !== '') || '';
                                  const mainImage = index === 0 ? firstValid : prev.image;
                                  return {
                                    ...prev,
                                    image: mainImage,
                                    images: updatedImages
                                  };
                                });
                              }}
                              className="text-red-400 hover:text-red-300 text-xs font-bold"
                              title="حذف الصورة"
                            >
                              ✕
                            </button>
                          )}
                        </div>

                        <div className="bg-stone-900 aspect-square rounded-lg overflow-hidden flex items-center justify-center border border-stone-800 relative group">
                          {imgValue ? (
                            <img src={imgValue} alt={"صورة " + (index + 1)} className="w-full h-full object-contain" />
                          ) : (
                            <ImageIcon size={22} className="text-stone-700" />
                          )}
                        </div>

                        <div className="space-y-1.5">
                          <label className="w-full bg-stone-850 hover:bg-stone-800 text-stone-200 text-[10px] py-1.5 rounded-lg cursor-pointer flex items-center justify-center gap-1 border border-stone-750 transition-all font-bold">
                            <Upload size={12} />
                            <span>رفع صورة</span>
                            <input 
                              type="file" 
                              accept="image/*" 
                              className="hidden" 
                              onChange={(e) => {
                                handleImageUpload(e, (b64) => {
                                  setProductForm(prev => {
                                    const updatedImages = [...prev.images];
                                    updatedImages[index] = b64;
                                    const mainImage = index === 0 ? b64 : (prev.image || b64);
                                    return {
                                      ...prev,
                                      image: mainImage,
                                      images: updatedImages
                                    };
                                  });
                                });
                              }}
                            />
                          </label>

                          <input
                            type="text"
                            value={imgValue || ''}
                            placeholder="رابط الصورة"
                            className="w-full bg-stone-900 border border-stone-800 rounded-lg py-1 px-1.5 text-[9px] font-mono text-center text-stone-300 placeholder-stone-600 focus:outline-none focus:border-[#D4AF37]"
                            onChange={(e) => {
                              const val = e.target.value;
                              setProductForm(prev => {
                                const updatedImages = [...prev.images];
                                updatedImages[index] = val;
                                const mainImage = index === 0 ? val : (prev.image || val);
                                return {
                                  ...prev,
                                  image: mainImage,
                                  images: updatedImages
                                };
                              });
                            }}
                          />
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Bottom Sticky Action Bar inside Form */}
              <div className="sticky bottom-0 bg-[#181819]/95 backdrop-blur-md pt-4 pb-1 border-t border-stone-800 flex justify-between items-center flex-row-reverse gap-3 shrink-0">
                <button
                  type="submit"
                  className="bg-gradient-to-r from-[#D4AF37] via-amber-400 to-amber-500 hover:from-amber-400 hover:to-[#D4AF37] text-stone-950 font-black px-7 py-3 rounded-xl text-xs sm:text-sm shadow-xl shadow-amber-500/10 hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-2"
                >
                  <Sparkles size={16} />
                  <span>{editingProduct ? 'حفظ التعديلات وإشهار السلعة ✨' : 'حفظ وإشهار السلعة بالمخزن العائم ✨'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-400 hover:text-stone-200 px-5 py-3 rounded-xl text-xs font-bold transition-all"
                >
                  إلغاء الأمر
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD/EDIT CATEGORY MODAL --- */}
      {showCategoryModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1C1D] border border-stone-800 rounded-2xl w-full max-w-sm overflow-hidden text-right">
            <div className="bg-gradient-to-l from-[#362C30] to-[#1C1C1D] px-6 py-4 border-b border-stone-850 flex justify-between items-center flex-row-reverse">
              <h3 className="font-black text-md text-[#D4AF37]">
                {editingCategory ? 'تعديل وتحديث قسم بالمول' : 'إضافة قسم أو فئة تسوق جديدة'}
              </h3>
              <button onClick={() => setShowCategoryModal(false)} className="text-stone-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveCategory} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-stone-300 mb-1.5 font-bold">معرّف القسم الفريد (أحرف إنجليزية فقط)</label>
                <input
                  type="text"
                  value={categoryForm.id}
                  disabled={!!editingCategory}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs text-amber-500 font-mono focus:border-[#D4AF37] disabled:opacity-40"
                  onChange={e => setCategoryForm({ ...categoryForm, id: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
                  placeholder="women_section"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1.5 font-bold font-sans">اسم التبويب / الفئة (عربي)</label>
                <input
                  type="text"
                  value={categoryForm.name}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs text-white"
                  onChange={e => setCategoryForm({ ...categoryForm, name: e.target.value })}
                  placeholder="العبايات الفخمة والملكية"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1.5 font-bold">أيقونة أو صورة القسم</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={categoryForm.image}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg py-1.5 px-3 text-[10px] text-stone-400 font-mono select-all"
                    onChange={e => setCategoryForm({ ...categoryForm, image: e.target.value })}
                    required
                  />
                  <label className="bg-stone-800 hover:bg-stone-750 text-stone-300 text-[10px] px-2 py-1.5 rounded cursor-pointer leading-loose">
                    رفع
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleImageUpload(e, (b64) => setCategoryForm({ ...categoryForm, image: b64 }))} 
                    />
                  </label>
                </div>
              </div>

              <div className="bg-stone-950 p-2 rounded-lg flex items-center justify-center">
                {categoryForm.image ? (
                  <img src={categoryForm.image} alt="Prem" className="h-16 w-16 object-contain rounded" />
                ) : (
                  <span className="text-[11px] text-stone-600">لا توجد صورة بعد</span>
                )}
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-stone-850">
                <button
                  type="button"
                  onClick={() => setShowCategoryModal(false)}
                  className="bg-stone-800 text-stone-400 hover:text-white px-4 py-2 rounded-lg text-xs"
                >
                  إلغاء الأمر
                </button>
                <button
                  type="submit"
                  className="bg-[#D4AF37] text-black font-black px-5 py-2 rounded-lg text-xs"
                >
                  حفظ وتطبيق القسم
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD/EDIT BANK MODAL --- */}
      {showBankModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1C1D] border border-stone-800 rounded-2xl w-full max-w-md overflow-hidden text-right col-span-1">
            <div className="bg-gradient-to-l from-[#362C30] to-[#1C1C1D] px-6 py-4 border-b border-stone-850 flex justify-between items-center flex-row-reverse">
              <h3 className="font-black text-md text-[#D4AF37]">
                {editingBank ? 'تحديث معلومات حساب التحويل' : 'أرشفة خيار دفع وبنك سداد جديد'}
              </h3>
              <button onClick={() => setShowBankModal(false)} className="text-stone-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveBank} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-stone-300 mb-1.5 font-bold">اسم بنك السداد المعتمد</label>
                <input
                  type="text"
                  value={bankForm.bankName}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs focus:border-[#D4AF37] text-white"
                  onChange={e => setBankForm({ ...bankForm, bankName: e.target.value })}
                  placeholder="بنك الكريمي الإسلامي أو محظة الكريمي جوال"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1.5 font-bold">رقم الحساب البنكي أو المحفظة</label>
                <input
                  type="text"
                  value={bankForm.accountNumber}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs text-amber-400 font-bold font-mono"
                  onChange={e => setBankForm({ ...bankForm, accountNumber: e.target.value })}
                  placeholder="310920492"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1.5 font-bold">اسم صاحب الحساب المعتمد لمطابقة الحوالة</label>
                <input
                  type="text"
                  value={bankForm.accountHolder}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs text-stone-300"
                  onChange={e => setBankForm({ ...bankForm, accountHolder: e.target.value })}
                  placeholder="مجموعة المول الرقمي Digital Mall"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1.5 font-bold">ملاحظات توضيحية تظهر للزبائن</label>
                <textarea
                  value={bankForm.notes}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs min-h-[50px] text-stone-400"
                  onChange={e => setBankForm({ ...bankForm, notes: e.target.value })}
                  placeholder="التحويل يتم فوري عبر شبكة الكريمي أو باسم المندوب..."
                />
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-stone-850">
                <button
                  type="button"
                  onClick={() => setShowBankModal(false)}
                  className="bg-stone-800 text-stone-400 hover:text-white px-4 py-2 rounded-lg text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-[#D4AF37] text-black font-black px-5 py-2 rounded-lg text-xs"
                >
                  تأكيد وسريان حساب السداد
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- ADD/EDIT BANNER MODAL --- */}
      {showBannerModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1C1D] border border-stone-800 rounded-2xl w-full max-w-sm overflow-hidden text-right">
            <div className="bg-gradient-to-l from-[#362C30] to-[#1C1C1D] px-6 py-4 border-b border-stone-850 flex justify-between items-center flex-row-reverse">
              <h3 className="font-black text-md text-[#D4AF37]">
                {editingBanner ? 'تحديث الإعلان الدائر' : 'حجز وتصميم مساحة إعلانية جديدة'}
              </h3>
              <button onClick={() => setShowBannerModal(false)} className="text-stone-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleSaveBanner} className="p-6 space-y-4">
              <div>
                <label className="block text-xs text-stone-300 mb-1.5 font-bold">عنوان الإعلان العريض</label>
                <input
                  type="text"
                  value={bannerForm.title}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs"
                  onChange={e => setBannerForm({ ...bannerForm, title: e.target.value })}
                  placeholder="موديلات العيد الفاخرة وصلت"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1.5 font-bold">وصف فرعي تعريفي جذاب</label>
                <input
                  type="text"
                  value={bannerForm.subtitle}
                  className="w-full bg-stone-900 border border-stone-800 rounded-lg py-2 px-3 text-xs"
                  onChange={e => setBannerForm({ ...bannerForm, subtitle: e.target.value })}
                  placeholder="خصومات للتاجرات بنسبة تصل إلى %30"
                  required
                />
              </div>

              <div>
                <label className="block text-xs text-stone-300 mb-1.5 font-bold font-sans">رابط الصورة الإعلانية العريضة (أو SVG)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={bannerForm.image}
                    className="w-full bg-stone-900 border border-stone-800 rounded-lg py-1.5 px-3 text-[9px] font-mono select-all text-stone-400"
                    onChange={e => setBannerForm({ ...bannerForm, image: e.target.value })}
                    required
                  />
                  <label className="bg-stone-800 hover:bg-stone-750 text-stone-300 text-[10px] px-2 py-1.5 rounded cursor-pointer leading-loose">
                    رفع
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="hidden" 
                      onChange={(e) => handleImageUpload(e, (b64) => setBannerForm({ ...bannerForm, image: b64 }))} 
                    />
                  </label>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="ban_act"
                  checked={bannerForm.active}
                  onChange={e => setBannerForm({ ...bannerForm, active: e.target.checked })}
                />
                <label htmlFor="ban_act" className="text-xs text-stone-300 font-bold cursor-pointer">الحالة: تنشيط وعرض فوري بالتطبيق</label>
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-stone-850">
                <button
                  type="button"
                  onClick={() => setShowBannerModal(false)}
                  className="bg-stone-800 text-stone-400 hover:text-white px-4 py-2 rounded-lg text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-[#D4AF37] text-black font-black px-5 py-2 rounded-lg text-xs"
                >
                  تأثير ونشر الإعلان
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- DRILL-DOWN FINANCIAL SUMMARY MODALS --- */}
      {selectedFinancialModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1C1C1D] border border-stone-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto text-right">
            <div className="bg-gradient-to-l from-amber-950/40 to-[#1C1C1D] px-6 py-4 border-b border-stone-850 flex justify-between items-center flex-row-reverse sticky top-0 z-10">
              <div className="flex items-center gap-2">
                <DollarSign size={18} className="text-[#D4AF37]" />
                <h3 className="font-black text-md text-[#D4AF37]">
                  {selectedFinancialModal === 'commissions' && 'تفاصيل كشف العمولات المقتطعة حسب المتاجر'}
                  {selectedFinancialModal === 'platformRevenue' && 'تفاصيل الفواتير وإجمالي إيرادات المبيعات'}
                  {selectedFinancialModal === 'approvedWithdrawals' && 'سجل سحوبات التجار المسددة والناجحة'}
                  {selectedFinancialModal === 'pendingWithdrawals' && 'طلبات سحب أرباح التجار المعلقة بانتظار الاعتماد'}
                </h3>
              </div>
              <button onClick={() => setSelectedFinancialModal(null)} className="text-stone-400 hover:text-white text-lg">✕</button>
            </div>

            <div className="p-6">
              {/* Commissions Modal Content */}
              {selectedFinancialModal === 'commissions' && (
                <div className="space-y-4">
                  <p className="text-xs text-stone-400">بيان تفصيلي بحصة المنصة المقتطعة لكل قطعة مباعة من التاجرات بالريال اليمني YER:</p>
                  <div className="border border-stone-800 rounded-xl overflow-hidden">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-stone-950 text-stone-400 font-bold border-b border-stone-800">
                        <tr>
                          <th className="py-2.5 px-3">رقم الطلب</th>
                          <th className="py-2.5 px-3">المنتج والقطع</th>
                          <th className="py-2.5 px-3">اسم المتجر</th>
                          <th className="py-2.5 px-3">عمولة القطعة</th>
                          <th className="py-2.5 px-3">إجمالي العمولة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-850">
                        {database.orders
                          .filter(o => o.status === 'completed')
                          .flatMap(o => (o.items || []).map(item => ({ orderId: o.id, item })))
                          .map((row, idx) => {
                            const commRate = row.item.product.commission || 300;
                            const totalComm = commRate * row.item.quantity;
                            return (
                              <tr key={idx} className="hover:bg-stone-850/50">
                                <td className="py-2.5 px-3 font-mono font-bold text-stone-300">#{row.orderId}</td>
                                <td className="py-2.5 px-3 text-stone-200">{row.item.product.name} ({row.item.quantity} قطعة)</td>
                                <td className="py-2.5 px-3 text-[#F8C8DC] font-bold">
                                  {database.users.find(u => u.id === row.item.product.vendorId)?.name || 'متجر معتمد'}
                                </td>
                                <td className="py-2.5 px-3 text-stone-400 font-mono">{commRate.toLocaleString('ar-YE')} ر.ي</td>
                                <td className="py-2.5 px-3 text-[#D4AF37] font-black font-mono">{totalComm.toLocaleString('ar-YE')} ر.ي</td>
                              </tr>
                            );
                          })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Platform Revenue Modal Content */}
              {selectedFinancialModal === 'platformRevenue' && (
                <div className="space-y-4">
                  <p className="text-xs text-stone-400">سجل الطلبات المؤكدة وإجمالي العائدات النقدية بالريال اليمني YER:</p>
                  <div className="border border-stone-800 rounded-xl overflow-hidden">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-stone-950 text-stone-400 font-bold border-b border-stone-800">
                        <tr>
                          <th className="py-2.5 px-3">الفاتورة</th>
                          <th className="py-2.5 px-3">العميل والهاتف</th>
                          <th className="py-2.5 px-3">طريقة السداد</th>
                          <th className="py-2.5 px-3">المبلغ الإجمالي</th>
                          <th className="py-2.5 px-3">حالة الطلب</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-850">
                        {database.orders
                          .filter(o => o.status !== 'pending_payment')
                          .map(o => (
                            <tr key={o.id} className="hover:bg-stone-850/50">
                              <td className="py-2.5 px-3 font-mono font-bold text-stone-300">#{o.id}</td>
                              <td className="py-2.5 px-3 text-stone-200">{o.customerPhone}</td>
                              <td className="py-2.5 px-3 text-amber-500 font-bold">{o.bankName}</td>
                              <td className="py-2.5 px-3 text-emerald-400 font-black font-mono">{o.totalAmount.toLocaleString('ar-YE')} ر.ي</td>
                              <td className="py-2.5 px-3">
                                <span className="bg-emerald-950 text-emerald-400 border border-emerald-800/40 px-2 py-0.5 rounded text-[10px] font-bold">
                                  {o.status === 'completed' ? 'مكتمل ومطابق' : 'قيد الشحن والتنفيذ'}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Approved Withdrawals Modal Content */}
              {selectedFinancialModal === 'approvedWithdrawals' && (
                <div className="space-y-4">
                  <p className="text-xs text-stone-400">سجل سحوبات الأرباح التي تم تحويلها وصرفها بنجاح للتاجر عبر البنوك اليمنية:</p>
                  <div className="border border-stone-800 rounded-xl overflow-hidden">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-stone-950 text-stone-400 font-bold border-b border-stone-800">
                        <tr>
                          <th className="py-2.5 px-3">اسم التاجرة / المتجر</th>
                          <th className="py-2.5 px-3">مبلغ الحوالة</th>
                          <th className="py-2.5 px-3">البنك / المحفظة</th>
                          <th className="py-2.5 px-3">التاريخ</th>
                          <th className="py-2.5 px-3">حالة الحوالة</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-850">
                        {database.withdrawalRequests
                          .filter(w => w.status === 'approved')
                          .map(w => (
                            <tr key={w.id} className="hover:bg-stone-850/50">
                              <td className="py-2.5 px-3 font-bold text-stone-200">{w.vendorName}</td>
                              <td className="py-2.5 px-3 text-blue-400 font-black font-mono">{w.amount.toLocaleString('ar-YE')} ر.ي</td>
                              <td className="py-2.5 px-3 text-stone-300">{w.bankName} ({w.accountNumber})</td>
                              <td className="py-2.5 px-3 text-stone-500 text-[10px]">{new Date(w.requestedAt).toLocaleDateString('ar-YE')}</td>
                              <td className="py-2.5 px-3">
                                <span className="bg-blue-950 text-blue-400 border border-blue-800/40 px-2 py-0.5 rounded text-[10px] font-bold">
                                  مسددة برقم حوالة #{w.id.slice(-6)}
                                </span>
                              </td>
                            </tr>
                          ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Pending Withdrawals Modal Content */}
              {selectedFinancialModal === 'pendingWithdrawals' && (
                <div className="space-y-4">
                  <p className="text-xs text-stone-400">طلبات السحب المقدمة من التاجرات وتنتظر الاعتماد والتحويل:</p>
                  <div className="border border-stone-800 rounded-xl overflow-hidden">
                    <table className="w-full text-right text-xs">
                      <thead className="bg-stone-950 text-stone-400 font-bold border-b border-stone-800">
                        <tr>
                          <th className="py-2.5 px-3">المتجر</th>
                          <th className="py-2.5 px-3">المبلغ المطلوب</th>
                          <th className="py-2.5 px-3">حساب التحويل</th>
                          <th className="py-2.5 px-3">إجراءات الاعتماد الفوري</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-stone-850">
                        {database.withdrawalRequests.filter(w => w.status === 'pending').length === 0 ? (
                          <tr>
                            <td colSpan={4} className="py-8 text-center text-stone-500">لا توجد طلبات سحب معلقة حالياً</td>
                          </tr>
                        ) : (
                          database.withdrawalRequests
                            .filter(w => w.status === 'pending')
                            .map(w => (
                              <tr key={w.id} className="hover:bg-stone-850/50">
                                <td className="py-2.5 px-3 font-bold text-stone-200">{w.vendorName}</td>
                                <td className="py-2.5 px-3 text-orange-400 font-black font-mono">{w.amount.toLocaleString('ar-YE')} ر.ي</td>
                                <td className="py-2.5 px-3 text-stone-300">{w.bankName} - {w.accountNumber}</td>
                                <td className="py-2.5 px-3 flex gap-2">
                                  <button
                                    onClick={() => {
                                      const updated = database.withdrawalRequests.map(item => 
                                        item.id === w.id ? { ...item, status: 'approved' as const } : item
                                      );
                                      onSave({ ...database, withdrawalRequests: updated });
                                      logOperation(currentUser.id, currentUser.name, currentUser.role, 'اعتماد طلب سحب', `تم اعتماد تحويل مبلغ ${w.amount} ر.ي لمتجر (${w.vendorName})`);
                                      alert(`✓ تم اعتماد تحويل مبلغ ${w.amount} ر.ي لمتجر (${w.vendorName}) بنجاح!`);
                                    }}
                                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-3 py-1 rounded text-[10px] font-bold cursor-pointer"
                                  >
                                    اعتماد وتأكيد الحوالة ✓
                                  </button>
                                  <button
                                    onClick={() => {
                                      const updated = database.withdrawalRequests.map(item => 
                                        item.id === w.id ? { ...item, status: 'rejected' as const } : item
                                      );
                                      onSave({ ...database, withdrawalRequests: updated });
                                      alert(`تم رفض طلب سحب الأرباح لمتجر (${w.vendorName}).`);
                                    }}
                                    className="bg-red-950 text-red-400 border border-red-800 px-3 py-1 rounded text-[10px] font-bold cursor-pointer"
                                  >
                                    رفض
                                  </button>
                                </td>
                              </tr>
                            ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-stone-800 flex justify-end">
                <button
                  onClick={() => setSelectedFinancialModal(null)}
                  className="bg-stone-800 hover:bg-stone-750 text-stone-300 font-bold px-5 py-2 rounded-xl text-xs cursor-pointer"
                >
                  إغلاق النافذة
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- ADD SHIPPING COMPANY MODAL --- */}
      {showAddCompanyModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1C1D] border border-stone-800 rounded-2xl w-full max-w-md text-right">
            <div className="bg-gradient-to-l from-[#362C30] to-[#1C1C1D] px-6 py-4 border-b border-stone-850 flex justify-between items-center flex-row-reverse">
              <h3 className="font-black text-md text-[#D4AF37]">إضافة شركة / مكتب شحن وتوصيل جديد</h3>
              <button onClick={() => setShowAddCompanyModal(false)} className="text-stone-400 hover:text-white">✕</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const newCompany = {
                  id: `ship_${Date.now()}`,
                  name: newCompanyForm.name,
                  fee: Number(newCompanyForm.fee),
                  price: Number(newCompanyForm.fee),
                  estimatedTime: newCompanyForm.estimatedTime,
                  coverageAreas: newCompanyForm.coverageAreas.split(/[,،]/).map(a => a.trim()).filter(Boolean),
                  active: true
                };

                const updatedCompanies = [...shippingConfig.companies, newCompany];
                const updated = { ...shippingConfig, companies: updatedCompanies };
                setShippingConfig(updated);
                onSave({ ...database, shippingSettings: updated });

                alert('✓ تم إضافة شركة الشحن والتوصيل الجديدة بنجاح!');
                setShowAddCompanyModal(false);
                setNewCompanyForm({ name: '', fee: 2000, estimatedTime: '24-48 ساعة', coverageAreas: 'صنعاء، عدن، تعز' });
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">اسم شركة / مكتب التوصيل</label>
                <input
                  type="text"
                  className="w-full bg-stone-900 border border-stone-800 text-stone-100 text-xs py-2 px-3 rounded-xl focus:border-[#D4AF37]"
                  value={newCompanyForm.name}
                  onChange={e => setNewCompanyForm({ ...newCompanyForm, name: e.target.value })}
                  placeholder="مثال: شركة النجم للتوصيل السريع"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">رسوم التوصيل الأساسية (بالريال اليمني YER)</label>
                <input
                  type="number"
                  className="w-full bg-stone-900 border border-stone-800 text-amber-400 font-bold font-mono text-xs py-2 px-3 rounded-xl focus:border-[#D4AF37]"
                  value={newCompanyForm.fee}
                  onChange={e => setNewCompanyForm({ ...newCompanyForm, fee: Number(e.target.value) })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">الوقت المتوقع للتسليم</label>
                <input
                  type="text"
                  className="w-full bg-stone-900 border border-stone-800 text-stone-100 text-xs py-2 px-3 rounded-xl focus:border-[#D4AF37]"
                  value={newCompanyForm.estimatedTime}
                  onChange={e => setNewCompanyForm({ ...newCompanyForm, estimatedTime: e.target.value })}
                  placeholder="مثال: 24-48 ساعة"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">مناطق ومدن التغطية (مفصولة بفواصل)</label>
                <input
                  type="text"
                  className="w-full bg-stone-900 border border-stone-800 text-stone-100 text-xs py-2 px-3 rounded-xl focus:border-[#D4AF37]"
                  value={newCompanyForm.coverageAreas}
                  onChange={e => setNewCompanyForm({ ...newCompanyForm, coverageAreas: e.target.value })}
                  placeholder="صنعاء، عدن، تعز، المكلا"
                  required
                />
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowAddCompanyModal(false)}
                  className="bg-stone-800 text-stone-400 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-[#D4AF37] text-black font-black px-5 py-2 rounded-xl text-xs cursor-pointer"
                >
                  حفظ وتفعيل الشركة ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- EDIT SHIPPING COMPANY MODAL --- */}
      {editingCompany && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1C1D] border border-stone-800 rounded-2xl w-full max-w-md text-right">
            <div className="bg-gradient-to-l from-[#362C30] to-[#1C1C1D] px-6 py-4 border-b border-stone-850 flex justify-between items-center flex-row-reverse">
              <h3 className="font-black text-md text-[#D4AF37]">تعديل بيانات شركة / مكتب الشحن</h3>
              <button onClick={() => setEditingCompany(null)} className="text-stone-400 hover:text-white">✕</button>
            </div>

            <form
              onSubmit={(e) => {
                e.preventDefault();
                const updatedCompanies = shippingConfig.companies.map(c => {
                  if (c.id === editingCompany.id) {
                    const coverage = (editingCompany.coverageAreasText || '')
                      .split(/[,،]/)
                      .map((a: string) => a.trim())
                      .filter(Boolean);

                    return {
                      ...c,
                      name: editingCompany.name,
                      fee: Number(editingCompany.fee),
                      price: Number(editingCompany.fee),
                      estimatedTime: editingCompany.estimatedTime,
                      coverageAreas: coverage.length > 0 ? coverage : ['جميع المناطق'],
                      active: editingCompany.active !== false
                    };
                  }
                  return c;
                });

                const updated = { ...shippingConfig, companies: updatedCompanies };
                setShippingConfig(updated);
                onSave({ ...database, shippingSettings: updated });

                alert('✓ تم تحديث بيانات شركة الشحن والتوصيل بنجاح!');
                setEditingCompany(null);
              }}
              className="p-6 space-y-4"
            >
              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">اسم شركة / مكتب التوصيل</label>
                <input
                  type="text"
                  className="w-full bg-stone-900 border border-stone-800 text-stone-100 text-xs py-2 px-3 rounded-xl focus:border-[#D4AF37]"
                  value={editingCompany.name || ''}
                  onChange={e => setEditingCompany({ ...editingCompany, name: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">رسوم التوصيل الأساسية (بالريال اليمني YER)</label>
                <input
                  type="number"
                  className="w-full bg-stone-900 border border-stone-800 text-amber-400 font-bold font-mono text-xs py-2 px-3 rounded-xl focus:border-[#D4AF37]"
                  value={editingCompany.fee ?? 2000}
                  onChange={e => setEditingCompany({ ...editingCompany, fee: Number(e.target.value) })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">الوقت المتوقع للتسليم</label>
                <input
                  type="text"
                  className="w-full bg-stone-900 border border-stone-800 text-stone-100 text-xs py-2 px-3 rounded-xl focus:border-[#D4AF37]"
                  value={editingCompany.estimatedTime || ''}
                  onChange={e => setEditingCompany({ ...editingCompany, estimatedTime: e.target.value })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">مناطق ومدن التغطية (مفصولة بفواصل)</label>
                <input
                  type="text"
                  className="w-full bg-stone-900 border border-stone-800 text-stone-100 text-xs py-2 px-3 rounded-xl focus:border-[#D4AF37]"
                  value={editingCompany.coverageAreasText || ''}
                  onChange={e => setEditingCompany({ ...editingCompany, coverageAreasText: e.target.value })}
                  required
                />
              </div>

              <div className="flex items-center justify-between bg-stone-900 p-3 rounded-xl border border-stone-800">
                <span className="text-xs font-bold text-stone-300">حالة الشركة (تفعيل / إيقاف):</span>
                <input
                  type="checkbox"
                  checked={editingCompany.active !== false}
                  onChange={e => setEditingCompany({ ...editingCompany, active: e.target.checked })}
                  className="w-5 h-5 accent-[#D4AF37] cursor-pointer"
                />
              </div>

              <div className="flex gap-2 justify-end pt-4 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setEditingCompany(null)}
                  className="bg-stone-800 text-stone-400 font-bold px-4 py-2 rounded-xl text-xs cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-[#D4AF37] text-black font-black px-5 py-2 rounded-xl text-xs cursor-pointer"
                >
                  حفظ التعديلات ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
