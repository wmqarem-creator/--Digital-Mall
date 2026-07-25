import React, { useState } from 'react';
import { 
  AppDatabase, 
  UserProfile, 
  Product, 
  WithdrawalRequest, 
  Category 
} from '../types';
import { 
  Briefcase, 
  Wallet, 
  ShoppingBag, 
  Link as LinkIcon, 
  Plus, 
  CreditCard, 
  CheckCircle2, 
  AlertCircle, 
  Copy, 
  Sparkles, 
  TrendingUp, 
  Clock, 
  ArrowRightLeft,
  ArrowUpRight,
  User,
  MapPin,
  Smartphone,
  Image as ImageIcon,
  Settings,
  Trash2,
  Edit,
  Eye,
  EyeOff,
  Filter,
  Search,
  Package,
  Layers,
  Grid,
  Check,
  FolderPlus,
  RefreshCw,
  Truck,
  Bell,
  X,
  Tag,
  ChevronDown
} from 'lucide-react';
import { logOperation, INITIAL_DATABASE } from '../dbMock';
import SanaaMap from './SanaaMap';

interface VendorPortalProps {
  database: AppDatabase;
  onSave: (db: AppDatabase) => void;
  currentUser: UserProfile;
}

// Preset default 44 internal store sections for royal vendor catalog
const DEFAULT_44_STORE_SECTIONS = [
  "عبايات بشت واسعة",
  "عبايات تطريز يدوي",
  "عبايات مخمل ملكية",
  "عبايات حرير ياباني",
  "عبايات كاجوال وطلعات",
  "جلابيات استقبال فاخرة",
  "جلابيات يمنية تراثية",
  "فساتين سهرة ومناسبات",
  "فساتين خطوبة وملكة",
  "بلوزات وقمصان راقية",
  "تنانير وأطقم رسمية",
  "دقة شالات وطرح ملكية",
  "أقمشة يابانية وكورية",
  "أقمشة تطريز خصب",
  "خمارات ونقابات أنيقة",
  "ملابس أطفال وبناتي",
  "ملابس سهرة للأطفال",
  "إكسسوارات ومجوهرات بديلة",
  "عطور وبخور ملكي",
  "حقائب يد وأحذية",
  "أحذية كعب عالي ومناسبات",
  "عبايات رأس وقماش إسلامي",
  "عبايات ملونة حديثة",
  "عبايات تخرج وقمصان",
  "عبايات مناسبات وأعراس",
  "جلابيات حراير وكريب",
  "بيجامات ولانجري أنيق",
  "مستلزمات الشيل والحجاب",
  "أطقم هدايا ملكية",
  "منتجات العناية والتجميل",
  "أقمشة حراير مشجرة",
  "عبايات سفر ورحلات",
  "فساتين ناعمة يومية",
  "جاكيتات وبلايز شتوية",
  "جلابيات قطن يمني",
  "عبايات كلوش ودبل كلوش",
  "إكسسوارات شعر وتاج",
  "شنط سفر ومكياج",
  "أطقم ذهب صيني وفضة",
  "عبايات بشت رجالي",
  "أزياء شالكي وتراث",
  "عبايات شيفون وطبقات",
  "شالات صوف وشال يمني",
  "قسم الخصومات والتصفية"
];

// Preset model design gallery for 1-click preview
const PRESET_SUGGESTED_DESIGNS = [
  {
    name: "عباية بشت تطريز خصب ملكي",
    material: "حرير ياباني أسود",
    embroidery: "تطريز خيوط القصب الذهبي",
    category: "women_section",
    image: "https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "فستان سهرة حراير مطرز",
    material: "مخمل ملكي مع شيفون",
    embroidery: "شك خرز وفصوص كريستال",
    category: "women_section",
    image: "https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "جلابية استقبال يمنية فاخرة",
    material: "قطن يمني مزين بالحلي",
    embroidery: "تطريز تراثي فضي",
    category: "women_section",
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800"
  },
  {
    name: "بلوزة حرير ناعمة مع كشكشة",
    material: "حرير طبيعي 100%",
    embroidery: "دانتيل إيطالي رقيق",
    category: "women_section",
    image: "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800"
  }
];

export default function VendorPortal({ database, onSave, currentUser }: VendorPortalProps) {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'royalWarehouse' | 'addRoyalDesign' | 'orders' | 'wallet' | 'affiliateCenter' | 'settings' | 'accountantSimulation'>('dashboard');

  // Registration & profile states
  const [fullName, setFullName] = useState(currentUser.fullName || '');
  const [residence, setResidence] = useState(currentUser.currentResidence || '');
  const [phoneInput, setPhoneInput] = useState(currentUser.phone || '');
  const [bankCoords, setBankCoords] = useState(currentUser.bankAccountDetails || '');
  const [idCard, setIdCard] = useState(currentUser.idCardPhoto || '');
  const [idCard2, setIdCard2] = useState(currentUser.idCardPhoto2 || '');
  const [passportPhoto, setPassportPhoto] = useState(currentUser.passportPhoto || '');
  const [shopLicense, setShopLicense] = useState(currentUser.shopLicensePhoto || '');
  const [logoImage, setLogoImage] = useState(currentUser.logoImage || '');
  const [merchantType, setMerchantType] = useState<'female' | 'male'>(currentUser.merchantType || 'female');
  const [latitude, setLatitude] = useState(currentUser.latitude || 15.3185);
  const [longitude, setLongitude] = useState(currentUser.longitude || 44.1812);
  const [mapAddress, setMapAddress] = useState(currentUser.mapAddress || 'صنعاء - شارع حدة الرئيسي');
  const [showVerificationModal, setShowVerificationModal] = useState(false);
  const [showEditStoreModal, setShowEditStoreModal] = useState(false);
  const [showNotifPopover, setShowNotifPopover] = useState(false);

  // Custom Store Internal Categories state (Initialized with 44 default sections + any user added)
  const [customStoreSections, setCustomStoreSections] = useState<{ id: string; name: string }[]>(() => {
    if (currentUser.customStoreCategories && currentUser.customStoreCategories.length > 0) {
      return currentUser.customStoreCategories;
    }
    return DEFAULT_44_STORE_SECTIONS.map((secName, idx) => ({
      id: `sec_${idx + 1}`,
      name: secName
    }));
  });
  const [newSectionInput, setNewSectionInput] = useState('');
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [editingSectionName, setEditingSectionName] = useState('');

  // Notifications
  const myVendorNotifs = (database.vendorNotifications || []).filter(n => n.vendorId === currentUser.id);
  const myUnreadNotifsCount = myVendorNotifs.filter(n => !n.read).length;

  const handleMarkAllNotifsRead = () => {
    const updated = (database.vendorNotifications || []).map(n => 
      n.vendorId === currentUser.id ? { ...n, read: true } : n
    );
    onSave({ ...database, vendorNotifications: updated });
  };

  // Warehouse Search & Filtering
  const [warehouseSearch, setWarehouseSearch] = useState('');
  const [warehouseCategoryFilter, setWarehouseCategoryFilter] = useState('ALL');
  const [warehouseStockFilter, setWarehouseStockFilter] = useState<'ALL' | 'IN_STOCK' | 'OUT_OF_STOCK' | 'HIDDEN'>('ALL');

  // Royal Product Creation & Editing State
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [productForm, setProductForm] = useState({
    name: '',
    materialType: 'حرير ياباني أسود',
    embroideryType: 'تطريز خصب بلؤلؤ عودي',
    description: '',
    originalPrice: 4500,
    stockQuantity: 15,
    categoryId: 'women_section',
    subCategoryId: '',
    subCategoryLeaf: '',
    navigationTag: '',
    sizeTemplate: 'women' as 'women' | 'kids' | 'shoes' | 'custom',
    selectedSizes: ['52', '54', '56', '58', '60', 'S', 'M', 'L', 'XL', 'XXL'] as string[],
    availableColors: 'أسود ملكي، كحلي، عودي، ذهبي',
    availableEmbroideries: 'تطريز ذهبي، خرز فضي، شك يدوي',
    imageFitMode: 'cover' as 'cover' | 'contain' | 'fill',
    image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
    images: [
      'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
      '', '', '', '', '', ''
    ] as string[],
    isOutofStock: false,
    isHidden: false
  });

  // Size Template Options
  const SIZE_TEMPLATES = {
    women: ['52', '54', '56', '58', '60', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXXXL'],
    kids: ['22', '24', '26', '28', '30', '32', '34', '36'],
    shoes: ['36', '37', '38', '39', '40', '41', '42'],
    custom: ['FREE SIZE', 'مقاس موحد', 'تفصيل خاص']
  };

  // Handle Size Toggle
  const toggleSize = (size: string) => {
    setProductForm(prev => {
      const current = prev.selectedSizes || [];
      const exists = current.includes(size);
      const updated = exists 
        ? current.filter(s => s !== size)
        : [...current, size];
      return { ...prev, selectedSizes: updated };
    });
  };

  // Image Upload Handler
  const handleImageAttached = (e: React.ChangeEvent<HTMLInputElement>, callback: (base64: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 2 * 1024 * 1024) {
        alert('حجم الصورة كبير جداً، يرجى اختيار صورة أقل من 2 ميجابايت.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          callback(reader.result.toString());
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Save Royal Product (Create or Update)
  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productForm.name.trim()) {
      alert('يرجى إدخال اسم الموديل.');
      return;
    }

    const firstValidImg = productForm.images.find(img => img && img.trim() !== '') || productForm.image || 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800';

    const colorsArray = productForm.availableColors.split('،').flatMap(c => c.split(',')).map(s => s.trim()).filter(Boolean);
    const embroideryArray = productForm.availableEmbroideries.split('،').flatMap(c => c.split(',')).map(s => s.trim()).filter(Boolean);

    const calculatedCustomerPrice = productForm.originalPrice + (database.commissionSettings.isFreeBeginning ? 0 : database.commissionSettings.flatCommissionRate);

    if (editingProduct) {
      // Update existing
      const updatedProducts = database.products.map(p => {
        if (p.id === editingProduct.id) {
          return {
            ...p,
            name: productForm.name,
            materialType: productForm.materialType,
            embroideryType: productForm.embroideryType,
            description: productForm.description,
            originalPrice: productForm.originalPrice,
            price: calculatedCustomerPrice,
            stockQuantity: productForm.stockQuantity,
            categoryId: productForm.categoryId,
            subCategoryId: productForm.subCategoryId,
            subCategoryLeaf: productForm.subCategoryLeaf,
            navigationTag: productForm.navigationTag,
            sizeTemplate: productForm.sizeTemplate,
            availableSizes: productForm.selectedSizes,
            availableColors: colorsArray,
            availableEmbroideries: embroideryArray,
            imageFitMode: productForm.imageFitMode,
            image: firstValidImg,
            images: productForm.images.filter(img => img && img.trim() !== ''),
            isOutofStock: productForm.isOutofStock || productForm.stockQuantity <= 0,
            isHidden: productForm.isHidden
          };
        }
        return p;
      });

      onSave({ ...database, products: updatedProducts });
      logOperation(currentUser.id, currentUser.name, currentUser.role, 'تعديل منتج ملكي', `تم تعديل الموديل [${productForm.name}] بنجاح.`);
      alert(`✨ تم تحديث بيانات الموديل الملكي [${productForm.name}] بنجاح!`);
      setEditingProduct(null);
    } else {
      // Create new
      const newProd: Product = {
        id: `prod_royal_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
        name: productForm.name,
        description: productForm.description || `خامة ${productForm.materialType} وتطريز ${productForm.embroideryType} من متجر ${currentUser.name}`,
        originalPrice: productForm.originalPrice,
        price: calculatedCustomerPrice,
        commission: database.commissionSettings.flatCommissionRate,
        categoryId: productForm.categoryId,
        subCategoryId: productForm.subCategoryId,
        subCategoryLeaf: productForm.subCategoryLeaf,
        navigationTag: productForm.navigationTag,
        image: firstValidImg,
        images: productForm.images.filter(img => img && img.trim() !== ''),
        vendorId: currentUser.id,
        isAffiliateEnabled: true,
        availableSizes: productForm.selectedSizes,
        materialType: productForm.materialType,
        embroideryType: productForm.embroideryType,
        stockQuantity: productForm.stockQuantity,
        isOutofStock: productForm.stockQuantity <= 0,
        isHidden: false,
        availableColors: colorsArray,
        availableEmbroideries: embroideryArray,
        sizeTemplate: productForm.sizeTemplate,
        imageFitMode: productForm.imageFitMode,
        createdAt: new Date().toISOString()
      };

      onSave({ ...database, products: [newProd, ...database.products] });
      logOperation(currentUser.id, currentUser.name, currentUser.role, 'إضافة تصميم ملكي جديد', `تم إضافة الموديل الجديد [${productForm.name}] بنجاح.`);
      alert(`✨ تم نشر وطرح التصميم الملكي الجديد [${productForm.name}] بالمول الرقمي بنجاح!`);
    }

    // Reset Form
    setProductForm({
      name: '',
      materialType: 'حرير ياباني أسود',
      embroideryType: 'تطريز خصب بلؤلؤ عودي',
      description: '',
      originalPrice: 4500,
      stockQuantity: 15,
      categoryId: 'women_section',
      subCategoryId: '',
      subCategoryLeaf: '',
      navigationTag: '',
      sizeTemplate: 'women',
      selectedSizes: ['52', '54', '56', '58', '60', 'S', 'M', 'L', 'XL', 'XXL'],
      availableColors: 'أسود ملكي، كحلي، عودي، ذهبي',
      availableEmbroideries: 'تطريز ذهبي، خرز فضي، شك يدوي',
      imageFitMode: 'cover',
      image: 'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
      images: [
        'https://images.unsplash.com/photo-1583391733956-3750e0ff4e8b?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1566174053879-31528523f8ae?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?auto=format&fit=crop&q=80&w=800',
        'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=800',
        '', '', '', '', '', ''
      ],
      isOutofStock: false,
      isHidden: false
    });

    setActiveTab('royalWarehouse');
  };

  // Open Edit Form Modal / Tab
  const handleStartEditProduct = (product: Product) => {
    setEditingProduct(product);
    setProductForm({
      name: product.name,
      materialType: product.materialType || 'حرير ياباني أسود',
      embroideryType: product.embroideryType || 'تطريز خصب بلؤلؤ عودي',
      description: product.description || '',
      originalPrice: product.originalPrice || product.price,
      stockQuantity: product.stockQuantity !== undefined ? product.stockQuantity : 15,
      categoryId: product.categoryId || 'women_section',
      subCategoryId: product.subCategoryId || '',
      subCategoryLeaf: product.subCategoryLeaf || '',
      navigationTag: product.navigationTag || '',
      sizeTemplate: product.sizeTemplate || 'women',
      selectedSizes: product.availableSizes || ['52', '54', '56', '58', '60'],
      availableColors: (product.availableColors || ['أسود ملكي', 'كحلي']).join('، '),
      availableEmbroideries: (product.availableEmbroideries || ['تطريز ذهبي']).join('، '),
      imageFitMode: product.imageFitMode || 'cover',
      image: product.image,
      images: [
        ...(product.images || [product.image]),
        ...Array(10).fill('')
      ].slice(0, 10),
      isOutofStock: product.isOutofStock || false,
      isHidden: product.isHidden || false
    });
    setActiveTab('addRoyalDesign');
  };

  // Toggle Hide/Show Product
  const handleToggleHideProduct = (prodId: string) => {
    const updated = database.products.map(p => {
      if (p.id === prodId) {
        const nextState = !p.isHidden;
        return { ...p, isHidden: nextState };
      }
      return p;
    });
    onSave({ ...database, products: updated });
  };

  // Delete Product
  const handleDeleteProduct = (prodId: string, name: string) => {
    if (window.confirm(`هل أنتِ متأكدة من حذف الموديل [${name}] نهائياً من المتجر؟`)) {
      const updated = database.products.filter(p => p.id !== prodId);
      onSave({ ...database, products: updated });
      logOperation(currentUser.id, currentUser.name, currentUser.role, 'حذف منتج', `تم حذف المنتج [${name}] من المتجر.`);
    }
  };

  // Custom Store Internal Sections Handlers
  const handleAddCustomSection = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSectionInput.trim()) return;
    const newSec = {
      id: `sec_custom_${Date.now()}`,
      name: newSectionInput.trim()
    };
    const updatedSections = [...customStoreSections, newSec];
    setCustomStoreSections(updatedSections);
    setNewSectionInput('');

    // Save to user profile in db
    const updatedUsers = database.users.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, customStoreCategories: updatedSections };
      }
      return u;
    });
    onSave({ ...database, users: updatedUsers });
  };

  const handleRenameCustomSection = (id: string) => {
    if (!editingSectionName.trim()) return;
    const updatedSections = customStoreSections.map(s => s.id === id ? { ...s, name: editingSectionName.trim() } : s);
    setCustomStoreSections(updatedSections);
    setEditingSectionId(null);
    setEditingSectionName('');

    const updatedUsers = database.users.map(u => {
      if (u.id === currentUser.id) {
        return { ...u, customStoreCategories: updatedSections };
      }
      return u;
    });
    onSave({ ...database, users: updatedUsers });
  };

  const handleDeleteCustomSection = (id: string, secName: string) => {
    if (window.confirm(`هل أنتِ متأكدة من حذف قسم المتجر [${secName}]؟`)) {
      const updatedSections = customStoreSections.filter(s => s.id !== id);
      setCustomStoreSections(updatedSections);

      const updatedUsers = database.users.map(u => {
        if (u.id === currentUser.id) {
          return { ...u, customStoreCategories: updatedSections };
        }
        return u;
      });
      onSave({ ...database, users: updatedUsers });
    }
  };

  // Withdrawal Popup State
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);
  const [withdrawForm, setWithdrawForm] = useState({
    amount: 1000,
    bankName: 'بنك الكريمي الإسلامي',
    accountNumber: ''
  });

  // Calculate Vendor Products & Math
  const myProducts = database.products.filter(p => p.vendorId === currentUser.id);
  const totalProductsCount = myProducts.length;
  const activeProductsCount = myProducts.filter(p => !p.isHidden && !p.isOutofStock).length;
  const outOfStockCount = myProducts.filter(p => p.isOutofStock).length;
  const hiddenCount = myProducts.filter(p => p.isHidden).length;

  // Filtered Warehouse Products
  const filteredWarehouseProducts = myProducts.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(warehouseSearch.toLowerCase()) || 
                          (p.materialType || '').toLowerCase().includes(warehouseSearch.toLowerCase()) ||
                          (p.embroideryType || '').toLowerCase().includes(warehouseSearch.toLowerCase());
    
    const matchesCategory = warehouseCategoryFilter === 'ALL' || p.categoryId === warehouseCategoryFilter || p.subCategoryId === warehouseCategoryFilter;

    let matchesStock = true;
    if (warehouseStockFilter === 'IN_STOCK') matchesStock = !p.isOutofStock && !p.isHidden;
    if (warehouseStockFilter === 'OUT_OF_STOCK') matchesStock = p.isOutofStock;
    if (warehouseStockFilter === 'HIDDEN') matchesStock = p.isHidden;

    return matchesSearch && matchesCategory && matchesStock;
  });

  // Orders math
  const vendorOrders = database.orders.filter(o => o.status !== 'pending_payment');
  let pendingWalletAmount = 0;
  let clearedWalletAmount = 0;

  vendorOrders.forEach(o => {
    (o.items || []).forEach(item => {
      if (item.product.vendorId === currentUser.id) {
        let commissionEarned = item.product.originalPrice || item.product.price;
        const totalLineAmount = commissionEarned * item.quantity;
        
        if (o.status === 'completed') {
          clearedWalletAmount += totalLineAmount;
        } else {
          pendingWalletAmount += totalLineAmount;
        }
      }
    });
  });

  const totalWithdrawnAmount = (database.withdrawalRequests || [])
    .filter(w => w.vendorId === currentUser.id && w.status === 'approved')
    .reduce((sum, w) => sum + w.amount, 0);

  const availableToWithdraw = Math.max(0, clearedWalletAmount - totalWithdrawnAmount);

  // Handle Withdraw Request
  const handleRequestWithdraw = (e: React.FormEvent) => {
    e.preventDefault();
    if (withdrawForm.amount <= 0 || withdrawForm.amount > availableToWithdraw) {
      alert('المبلغ المطلوب غير صالح أو يتجاوز الرصيد المتاح للسحب.');
      return;
    }
    const newReq: WithdrawalRequest = {
      id: `withdraw_${Date.now()}`,
      vendorId: currentUser.id,
      vendorName: currentUser.fullName || currentUser.name,
      amount: withdrawForm.amount,
      bankName: withdrawForm.bankName,
      accountNumber: withdrawForm.accountNumber,
      status: 'pending',
      requestedAt: new Date().toISOString(),
      createdAt: new Date().toISOString()
    };

    onSave({ ...database, withdrawalRequests: [newReq, ...(database.withdrawalRequests || [])] });
    logOperation(currentUser.id, currentUser.name, currentUser.role, 'طلب سحب أرباح', `طلب سحب أرباح بمبلغ ${withdrawForm.amount} ر.ي عبر ${withdrawForm.bankName}`);
    alert('✨ تم تقديم طلب سحب العمولات والأرباح بنجاح للمحاسب المالي!');
    setShowWithdrawModal(false);
  };

  return (
    <div className="min-h-screen bg-[#121212] text-stone-100 font-sans pb-20" dir="rtl">
      
      {/* HEADER BAR */}
      <header className="bg-stone-900 border-b border-stone-800 sticky top-0 z-30 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#D4AF37] to-amber-600 p-0.5 flex items-center justify-center shadow-lg">
              {currentUser.logoImage ? (
                <img src={currentUser.logoImage} alt="Logo" className="w-full h-full object-cover rounded-[10px]" />
              ) : (
                <Briefcase className="text-stone-950" size={20} />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-black text-sm text-[#D4AF37] tracking-wide">
                  {currentUser.name || 'متجر الأناقة الملكية'}
                </h1>
                {currentUser.isVerified && (
                  <span className="bg-amber-500/20 text-[#D4AF37] border border-[#D4AF37]/40 text-[9px] px-1.5 py-0.5 rounded-full font-bold flex items-center gap-0.5" title="شارة التوثيق الذهبية">
                    <CheckCircle2 size={10} />
                    <span>موثق</span>
                  </span>
                )}
              </div>
              <p className="text-[10px] text-stone-400">
                {merchantType === 'female' ? 'لوحة التاجرة' : 'لوحة التاجر'} • {currentUser.fullName || 'أروى الكبسي'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* NOTIFICATIONS POPOVER */}
            <div className="relative">
              <button 
                onClick={() => setShowNotifPopover(!showNotifPopover)}
                className="relative bg-stone-800 hover:bg-stone-750 p-2 rounded-xl text-stone-300 transition-colors"
                title="التنبيهات الإدارية"
              >
                <Bell size={18} />
                {myUnreadNotifsCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-amber-500 text-stone-950 text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center animate-pulse">
                    {myUnreadNotifsCount}
                  </span>
                )}
              </button>

              {showNotifPopover && (
                <div className="absolute left-0 mt-2 w-80 bg-stone-900 border border-stone-800 rounded-2xl shadow-2xl p-4 z-50 text-right space-y-3">
                  <div className="flex justify-between items-center border-b border-stone-800 pb-2">
                    <h3 className="font-bold text-xs text-[#D4AF37]">الإشعارات والتنبيهات</h3>
                    {myUnreadNotifsCount > 0 && (
                      <button onClick={handleMarkAllNotifsRead} className="text-[10px] text-stone-400 hover:text-white">
                        تحديد الكل كقروء
                      </button>
                    )}
                  </div>
                  <div className="max-h-60 overflow-y-auto space-y-2">
                    {myVendorNotifs.length === 0 ? (
                      <p className="text-[11px] text-stone-500 text-center py-4">لا توجد إشعارات حالياً.</p>
                    ) : (
                      myVendorNotifs.map(n => (
                        <div key={n.id} className={`p-2.5 rounded-xl border text-xs space-y-1 ${n.read ? 'bg-stone-950/40 border-stone-850 text-stone-400' : 'bg-amber-950/30 border-[#D4AF37]/30 text-stone-200'}`}>
                          <div className="font-bold text-[11px] text-[#D4AF37]">{n.title}</div>
                          <p className="text-[10px] leading-relaxed">{n.message}</p>
                          <span className="text-[8px] text-stone-500 block font-mono">{n.createdAt.slice(0, 10)}</span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <button
              onClick={() => setShowEditStoreModal(true)}
              className="bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs px-3 py-2 rounded-xl flex items-center gap-1.5 transition-colors"
            >
              <Settings size={14} className="text-[#D4AF37]" />
              <span className="hidden sm:inline">بيانات المتجر</span>
            </button>

            <button
              onClick={() => setActiveTab('addRoyalDesign')}
              className="bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-400 hover:to-amber-600 text-stone-950 font-black text-xs px-3.5 py-2 rounded-xl flex items-center gap-1.5 shadow-md hover:scale-[1.02] transition-transform"
            >
              <Plus size={16} />
              <span>إضافة تصميم ملكي</span>
            </button>
          </div>
        </div>
      </header>

      {/* NAVIGATION TABS */}
      <div className="bg-stone-950 border-b border-stone-850 sticky top-[61px] z-20">
        <div className="max-w-7xl mx-auto px-4 flex items-center gap-2 overflow-x-auto scrollbar-none py-2 text-xs">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'dashboard'
                ? 'bg-[#D4AF37] text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Grid size={15} />
            <span>لوحة إدارة المتجر (ورشة العمل)</span>
          </button>

          <button
            onClick={() => setActiveTab('royalWarehouse')}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'royalWarehouse'
                ? 'bg-[#D4AF37] text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Package size={15} />
            <span>مستودع المنتجات والأقسام ({totalProductsCount})</span>
          </button>

          <button
            onClick={() => {
              setEditingProduct(null);
              setActiveTab('addRoyalDesign');
            }}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'addRoyalDesign'
                ? 'bg-[#D4AF37] text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Sparkles size={15} />
            <span>إضافة تصميم ملكي جديد</span>
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'orders'
                ? 'bg-[#D4AF37] text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Truck size={15} />
            <span>متابعة الطلبات الواردة</span>
          </button>

          <button
            onClick={() => setActiveTab('wallet')}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'wallet'
                ? 'bg-[#D4AF37] text-stone-950 shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Wallet size={15} />
            <span>المحفظة والأرباح</span>
          </button>

          <button
            onClick={() => setActiveTab('accountantSimulation')}
            className={`px-4 py-2 rounded-xl font-bold flex items-center gap-2 whitespace-nowrap transition-all ${
              activeTab === 'accountantSimulation'
                ? 'bg-amber-950/80 border border-amber-500/50 text-amber-200 shadow-md'
                : 'text-stone-400 hover:text-stone-200 hover:bg-stone-900'
            }`}
          >
            <Briefcase size={15} />
            <span>محاكاة المحاسب المالي</span>
          </button>
        </div>
      </div>

      {/* MAIN CONTAINER */}
      <main className="max-w-7xl mx-auto px-4 py-6">

        {/* 1. STORE WORKSHOP DASHBOARD (لوحة إدارة المتجر - ورشة العمل) */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* STORE PROFILE SUMMARY BANNER */}
            <div className="bg-gradient-to-r from-stone-900 via-[#1C1C1D] to-stone-900 border border-stone-800 rounded-3xl p-6 relative overflow-hidden shadow-2xl">
              <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
              
              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-2xl bg-stone-950 border-2 border-[#D4AF37] overflow-hidden flex items-center justify-center shrink-0 shadow-lg">
                    {currentUser.logoImage ? (
                      <img src={currentUser.logoImage} alt="Store logo" className="w-full h-full object-cover" />
                    ) : (
                      <ShoppingBag className="text-[#D4AF37]" size={32} />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <h2 className="text-xl font-black text-white">{currentUser.name || 'متجر الأناقة الملكية'}</h2>
                      {currentUser.isVerified ? (
                        <span className="bg-amber-500/20 text-[#D4AF37] border border-[#D4AF37]/40 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <CheckCircle2 size={12} />
                          <span>شارة التوثيق الذهبية موثقة</span>
                        </span>
                      ) : (
                        <span className="bg-stone-800 text-stone-400 text-xs px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1">
                          <Clock size={12} />
                          <span>بانتظار توثيق المستندات</span>
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-stone-400 mt-1">
                      المالك: <strong className="text-stone-200">{currentUser.fullName || 'أروى أحمد الكبسي'}</strong> • الهاتف: <span className="font-mono text-amber-300">{currentUser.phone || '+967733221100'}</span> • الإقامة: <span className="text-stone-300">{currentUser.currentResidence || 'صنعاء'}</span>
                    </p>
                    <p className="text-[11px] text-stone-500 mt-0.5">
                      العنوان الميداني: {currentUser.mapAddress || 'صنعاء - شارع حدة الرئيسي'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-stretch md:self-auto justify-end">
                  {!currentUser.isVerified && (
                    <button
                      onClick={() => setShowVerificationModal(true)}
                      className="bg-amber-500/10 hover:bg-amber-500/20 border border-[#D4AF37] text-[#D4AF37] text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
                    >
                      🪪 توثيق المتجر فوراً
                    </button>
                  )}
                  <button
                    onClick={() => setShowEditStoreModal(true)}
                    className="bg-stone-800 hover:bg-stone-750 text-stone-200 text-xs font-bold px-4 py-2.5 rounded-xl transition-all"
                  >
                    ✏️ تعديل البيانات
                  </button>
                </div>
              </div>
            </div>

            {/* QUICK STATS GRID */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {/* Stat 1 */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-2 hover:border-[#D4AF37]/50 transition-colors">
                <div className="flex items-center justify-between text-stone-400">
                  <span className="text-xs font-bold">إجمالي المنتجات</span>
                  <Package size={18} className="text-[#D4AF37]" />
                </div>
                <div className="text-2xl font-black text-white">{totalProductsCount} <span className="text-xs font-normal text-stone-400">منتجاً</span></div>
                <p className="text-[10px] text-emerald-400 font-bold">نشط بالكتالوج: {activeProductsCount} موديل</p>
              </div>

              {/* Stat 2 */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-2 hover:border-[#D4AF37]/50 transition-colors">
                <div className="flex items-center justify-between text-stone-400">
                  <span className="text-xs font-bold">الأقسام المتاحة</span>
                  <Layers size={18} className="text-amber-400" />
                </div>
                <div className="text-2xl font-black text-white">{customStoreSections.length} <span className="text-xs font-normal text-stone-400">قسماً</span></div>
                <p className="text-[10px] text-stone-400">تشمل أقسامك الداخلية المخصصة والعامة</p>
              </div>

              {/* Stat 3 */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-2 hover:border-[#D4AF37]/50 transition-colors">
                <div className="flex items-center justify-between text-stone-400">
                  <span className="text-xs font-bold">الرصيد المتاح للسحب</span>
                  <Wallet size={18} className="text-emerald-400" />
                </div>
                <div className="text-xl font-black text-emerald-400 font-mono">{availableToWithdraw} <span className="text-xs font-normal text-stone-400">ر.ي</span></div>
                <p className="text-[10px] text-amber-300">أرباح معلقة: {pendingWalletAmount} ر.ي</p>
              </div>

              {/* Stat 4 */}
              <div className="bg-stone-900 border border-stone-800 rounded-2xl p-4 space-y-2 hover:border-[#D4AF37]/50 transition-colors">
                <div className="flex items-center justify-between text-stone-400">
                  <span className="text-xs font-bold">حالة الموديلات</span>
                  <AlertCircle size={18} className="text-red-400" />
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-red-400 font-bold">نافد: {outOfStockCount}</span>
                  <span className="text-stone-400 font-bold">مخفي: {hiddenCount}</span>
                </div>
                <p className="text-[10px] text-stone-500">تنبيهات المخزون والتوافر</p>
              </div>
            </div>

            {/* QUICK ACTIONS GRID */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-[#D4AF37] flex items-center gap-2">
                <Sparkles size={16} />
                <span>عمليات وإدارة المتجر السريعة (ورشة العمل)</span>
              </h3>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setActiveTab('addRoyalDesign');
                  }}
                  className="bg-gradient-to-br from-[#D4AF37] to-amber-600 hover:from-amber-400 hover:to-amber-700 text-stone-950 font-black p-4 rounded-2xl text-right space-y-2 transition-all shadow-md hover:scale-[1.02]"
                >
                  <Plus size={24} />
                  <div>
                    <div className="text-xs">إضافة تصميم ملكي جديد</div>
                    <p className="text-[10px] opacity-80 font-normal">إضافة موديل مع الصور والمقاسات</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('royalWarehouse')}
                  className="bg-stone-800 hover:bg-stone-750 text-white font-bold p-4 rounded-2xl text-right space-y-2 transition-all border border-stone-700"
                >
                  <Package size={24} className="text-[#D4AF37]" />
                  <div>
                    <div className="text-xs">مستودع المنتجات والأقسام</div>
                    <p className="text-[10px] text-stone-400 font-normal">إدارة الكتالوج والأسعار وتوافر المخزون</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('orders')}
                  className="bg-stone-800 hover:bg-stone-750 text-white font-bold p-4 rounded-2xl text-right space-y-2 transition-all border border-stone-700"
                >
                  <Truck size={24} className="text-emerald-400" />
                  <div>
                    <div className="text-xs">متابعة الطلبات الواردة</div>
                    <p className="text-[10px] text-stone-400 font-normal">عرض ومعالجة طلبات الزبائن</p>
                  </div>
                </button>

                <button
                  onClick={() => setActiveTab('wallet')}
                  className="bg-stone-800 hover:bg-stone-750 text-white font-bold p-4 rounded-2xl text-right space-y-2 transition-all border border-stone-700"
                >
                  <Wallet size={24} className="text-amber-400" />
                  <div>
                    <div className="text-xs">المحفظة وتسوية الأرباح</div>
                    <p className="text-[10px] text-stone-400 font-normal">طلب تحويل وسحب العمولات والأرباح</p>
                  </div>
                </button>
              </div>
            </div>

            {/* RECENT PRODUCTS PREVIEW */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Package size={16} className="text-[#D4AF37]" />
                  <span>أحدث الموديلات المضافة لمتجرك</span>
                </h3>
                <button
                  onClick={() => setActiveTab('royalWarehouse')}
                  className="text-xs text-[#D4AF37] hover:underline font-bold"
                >
                  عرض الكل في المستودع ←
                </button>
              </div>

              {myProducts.length === 0 ? (
                <div className="p-8 text-center text-stone-500 text-xs bg-stone-950/50 rounded-2xl border border-dashed border-stone-800">
                  لم تقمي بإضافة أي موديلات لمتجرك بعد. انقري على "إضافة تصميم ملكي جديد" لنشر أول موديل!
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {myProducts.slice(0, 3).map(prod => (
                    <div key={prod.id} className="bg-stone-950 border border-stone-800 rounded-2xl p-3 flex items-center gap-3">
                      <img src={prod.image} alt={prod.name} className="w-16 h-16 object-cover rounded-xl border border-stone-800" />
                      <div className="flex-1 space-y-1">
                        <h4 className="font-bold text-xs text-stone-100 line-clamp-1">{prod.name}</h4>
                        <div className="text-[11px] font-black text-[#D4AF37]">{prod.originalPrice || prod.price} ريال يمني</div>
                        <span className={`text-[9px] px-2 py-0.5 rounded font-bold inline-block ${prod.isOutofStock ? 'bg-red-950/60 text-red-300' : 'bg-emerald-950/60 text-emerald-300'}`}>
                          {prod.isOutofStock ? '🔴 نافد' : `🟢 متوفر (${prod.stockQuantity || 15} قطعة)`}
                        </span>
                      </div>
                      <button
                        onClick={() => handleStartEditProduct(prod)}
                        className="bg-stone-800 hover:bg-stone-700 p-2 rounded-lg text-stone-300"
                        title="تعديل"
                      >
                        <Edit size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

        {/* 2. ROYAL WAREHOUSE & CATALOG MANAGEMENT (واجهة مستودع المنتجات الملكي وعرض منتجات المتجر) */}
        {activeTab === 'royalWarehouse' && (
          <div className="space-y-6 animate-fadeIn">
            
            {/* TOP BAR: SEARCH & FILTERS */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-5 space-y-4">
              <div className="flex flex-col md:flex-row gap-3 justify-between items-stretch md:items-center">
                
                {/* Search */}
                <div className="relative flex-1">
                  <Search size={16} className="absolute right-3 top-3 text-stone-500" />
                  <input
                    type="text"
                    placeholder="البحث باسم الموديل، نوع الخامة، التطريز..."
                    className="w-full bg-stone-950 border border-stone-800 rounded-2xl py-2.5 pr-9 pl-3 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#D4AF37]"
                    value={warehouseSearch}
                    onChange={e => setWarehouseSearch(e.target.value)}
                  />
                </div>

                {/* Category Filter */}
                <select
                  className="bg-stone-950 border border-stone-800 rounded-2xl px-3 py-2.5 text-xs text-stone-300 font-bold focus:outline-none focus:border-[#D4AF37]"
                  value={warehouseCategoryFilter}
                  onChange={e => setWarehouseCategoryFilter(e.target.value)}
                >
                  <option value="ALL">كل الأقسام والتصنيفات</option>
                  {(database.categories || []).map(cat => (
                    <option key={cat.id} value={cat.id}>{cat.name_ar || cat.name}</option>
                  ))}
                </select>

                {/* Stock Status Filter */}
                <div className="flex items-center gap-1 bg-stone-950 p-1 rounded-2xl border border-stone-800 text-xs">
                  <button
                    onClick={() => setWarehouseStockFilter('ALL')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${warehouseStockFilter === 'ALL' ? 'bg-[#D4AF37] text-stone-950' : 'text-stone-400 hover:text-white'}`}
                  >
                    الكل ({myProducts.length})
                  </button>
                  <button
                    onClick={() => setWarehouseStockFilter('IN_STOCK')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${warehouseStockFilter === 'IN_STOCK' ? 'bg-emerald-500 text-stone-950' : 'text-stone-400 hover:text-white'}`}
                  >
                    🟢 متوفر ({myProducts.filter(p => !p.isOutofStock && !p.isHidden).length})
                  </button>
                  <button
                    onClick={() => setWarehouseStockFilter('OUT_OF_STOCK')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${warehouseStockFilter === 'OUT_OF_STOCK' ? 'bg-red-500 text-white' : 'text-stone-400 hover:text-white'}`}
                  >
                    🔴 نافد ({outOfStockCount})
                  </button>
                  <button
                    onClick={() => setWarehouseStockFilter('HIDDEN')}
                    className={`px-3 py-1.5 rounded-xl font-bold transition-colors ${warehouseStockFilter === 'HIDDEN' ? 'bg-stone-700 text-white' : 'text-stone-400 hover:text-white'}`}
                  >
                    👁️‍🗨️ مخفي ({hiddenCount})
                  </button>
                </div>

              </div>
            </div>

            {/* PRODUCT CATALOG GRID */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-bold text-[#D4AF37] flex items-center gap-2">
                  <Package size={18} />
                  <span>كتالوج منتجات المتجر بالمستودع ({filteredWarehouseProducts.length})</span>
                </h3>
                <button
                  onClick={() => {
                    setEditingProduct(null);
                    setActiveTab('addRoyalDesign');
                  }}
                  className="bg-[#D4AF37] text-stone-950 font-black text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1"
                >
                  <Plus size={14} />
                  <span>إضافة موديل جديد</span>
                </button>
              </div>

              {filteredWarehouseProducts.length === 0 ? (
                <div className="bg-stone-900 border border-stone-800 rounded-3xl p-12 text-center space-y-3">
                  <Package size={36} className="mx-auto text-stone-600" />
                  <p className="text-xs text-stone-400">لا توجد منتجات مطابقة لخيارات البحث والفلترة الحالية.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                  {filteredWarehouseProducts.map(prod => (
                    <div 
                      key={prod.id} 
                      className={`bg-stone-900 border rounded-3xl overflow-hidden transition-all duration-300 hover:border-[#D4AF37]/50 ${
                        prod.isHidden ? 'opacity-60 border-stone-800' : 'border-stone-800'
                      }`}
                    >
                      {/* IMAGE & BADGES */}
                      <div className="relative aspect-[4/3] bg-stone-950 overflow-hidden">
                        <img 
                          src={prod.image} 
                          alt={prod.name} 
                          className={`w-full h-full group-hover:scale-105 transition-transform duration-500 ${
                            prod.imageFitMode === 'contain' ? 'object-contain p-2' : prod.imageFitMode === 'fill' ? 'object-fill' : 'object-cover'
                          }`} 
                        />
                        
                        {/* Status Badges */}
                        <div className="absolute top-2 right-2 flex flex-col gap-1 items-end">
                          {prod.isHidden && (
                            <span className="bg-stone-950/90 text-stone-300 border border-stone-700 text-[10px] px-2 py-0.5 rounded-lg font-bold">
                              👁️‍🗨️ مخفي مؤقتاً
                            </span>
                          )}
                          {prod.isOutofStock ? (
                            <span className="bg-red-950/90 text-red-300 border border-red-800 text-[10px] px-2 py-0.5 rounded-lg font-bold">
                              🔴 نافد من المخزن
                            </span>
                          ) : (
                            <span className="bg-emerald-950/90 text-emerald-300 border border-emerald-800 text-[10px] px-2 py-0.5 rounded-lg font-bold">
                              🟢 متوفر ({prod.stockQuantity || 15} قطعة)
                            </span>
                          )}
                        </div>

                        {/* Images count indicator */}
                        {prod.images && prod.images.length > 1 && (
                          <div className="absolute bottom-2 left-2 bg-black/70 text-amber-300 text-[9px] px-2 py-0.5 rounded-full font-mono flex items-center gap-1">
                            <ImageIcon size={10} />
                            <span>{prod.images.length} صور</span>
                          </div>
                        )}
                      </div>

                      {/* CARD DETAILS */}
                      <div className="p-4 space-y-3">
                        <div>
                          <h4 className="font-bold text-sm text-white">{prod.name}</h4>
                          <div className="flex items-center gap-2 mt-1 text-[11px] text-stone-400 flex-wrap">
                            {prod.materialType && (
                              <span className="bg-stone-950 border border-stone-800 text-stone-300 px-2 py-0.5 rounded-md">
                                🧶 {prod.materialType}
                              </span>
                            )}
                            {prod.embroideryType && (
                              <span className="bg-stone-950 border border-stone-800 text-stone-300 px-2 py-0.5 rounded-md">
                                ✨ {prod.embroideryType}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Price & Stock */}
                        <div className="bg-stone-950 p-2.5 rounded-2xl border border-stone-850 flex justify-between items-center">
                          <div>
                            <span className="text-[10px] text-stone-400 block">السعر للعميل:</span>
                            <span className="font-black text-sm text-[#D4AF37]">{prod.originalPrice || prod.price} ريال يمني</span>
                          </div>
                          <div className="text-left">
                            <span className="text-[10px] text-stone-400 block">المخزون:</span>
                            <span className="font-bold text-xs text-stone-200">{prod.stockQuantity || 15} قطعة</span>
                          </div>
                        </div>

                        {/* Sizes preview */}
                        {prod.availableSizes && prod.availableSizes.length > 0 && (
                          <div className="flex items-center gap-1 flex-wrap text-[9px]">
                            <span className="text-stone-500">المقاسات:</span>
                            {prod.availableSizes.slice(0, 5).map(s => (
                              <span key={s} className="bg-stone-800 text-stone-300 px-1.5 py-0.5 rounded font-mono">
                                {s}
                              </span>
                            ))}
                            {prod.availableSizes.length > 5 && (
                              <span className="text-stone-500 font-mono">+{prod.availableSizes.length - 5}</span>
                            )}
                          </div>
                        )}

                        {/* ACTION BUTTONS */}
                        <div className="flex gap-2 pt-2 border-t border-stone-800">
                          <button
                            onClick={() => handleStartEditProduct(prod)}
                            className="flex-1 bg-stone-800 hover:bg-stone-750 text-stone-200 font-bold text-xs py-2 rounded-xl flex items-center justify-center gap-1 transition-colors"
                          >
                            <Edit size={12} className="text-[#D4AF37]" />
                            <span>تعديل</span>
                          </button>

                          <button
                            onClick={() => handleToggleHideProduct(prod.id)}
                            className="bg-stone-800 hover:bg-stone-750 text-stone-300 p-2 rounded-xl transition-colors"
                            title={prod.isHidden ? 'إظهار المنتج للزبائن' : 'إخفاء مؤقت للزبائن'}
                          >
                            {prod.isHidden ? <Eye size={16} className="text-emerald-400" /> : <EyeOff size={16} className="text-stone-400" />}
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(prod.id, prod.name)}
                            className="bg-stone-800 hover:bg-red-950 text-stone-400 hover:text-red-400 p-2 rounded-xl transition-colors"
                            title="حذف المنتج نهائياً"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>

                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* CUSTOM STORE INTERNAL SECTIONS (إدارة وتعديل أقسام المتجر الداخلية) */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-stone-800 pb-4">
                <div>
                  <h3 className="text-sm font-bold text-[#D4AF37] flex items-center gap-2">
                    <Layers size={18} />
                    <span>إدارة وتعديل أقسام المتجر الداخلية ({customStoreSections.length} قسماً)</span>
                  </h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    يمكنك تعديل أسماء الأقسام الخاصة بمتجرك أو إضافة تصنيفات جديدة لتنظيم الكتالوج لزبائنك.
                  </p>
                </div>

                {/* Add Section Form */}
                <form onSubmit={handleAddCustomSection} className="flex gap-2">
                  <input
                    type="text"
                    placeholder="اسم القسم الجديد..."
                    className="bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white placeholder-stone-500 focus:outline-none focus:border-[#D4AF37]"
                    value={newSectionInput}
                    onChange={e => setNewSectionInput(e.target.value)}
                  />
                  <button
                    type="submit"
                    className="bg-[#D4AF37] hover:bg-amber-500 text-stone-950 font-black text-xs px-4 py-2 rounded-xl shrink-0 flex items-center gap-1"
                  >
                    <FolderPlus size={14} />
                    <span>إضافة قسم</span>
                  </button>
                </form>
              </div>

              {/* Sections Chips Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-2.5">
                {customStoreSections.map((sec, index) => (
                  <div key={sec.id} className="bg-stone-950 border border-stone-800 rounded-xl p-2.5 space-y-2 relative group hover:border-[#D4AF37]/40 transition-colors">
                    {editingSectionId === sec.id ? (
                      <div className="space-y-1.5">
                        <input
                          type="text"
                          className="w-full bg-stone-900 border border-[#D4AF37] text-white text-[11px] p-1 rounded font-bold"
                          value={editingSectionName}
                          onChange={e => setEditingSectionName(e.target.value)}
                        />
                        <div className="flex gap-1 justify-end">
                          <button
                            type="button"
                            onClick={() => handleRenameCustomSection(sec.id)}
                            className="bg-emerald-500 text-stone-950 font-bold text-[9px] px-2 py-0.5 rounded"
                          >
                            حفظ
                          </button>
                          <button
                            type="button"
                            onClick={() => setEditingSectionId(null)}
                            className="bg-stone-800 text-stone-400 text-[9px] px-2 py-0.5 rounded"
                          >
                            إلغاء
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] text-amber-400 font-mono font-bold">#{index + 1}</span>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => {
                                setEditingSectionId(sec.id);
                                setEditingSectionName(sec.name);
                              }}
                              className="text-stone-400 hover:text-[#D4AF37]"
                              title="تعديل الاسم"
                            >
                              <Edit size={12} />
                            </button>
                            <button
                              onClick={() => handleDeleteCustomSection(sec.id, sec.name)}
                              className="text-stone-400 hover:text-red-400"
                              title="حذف"
                            >
                              <Trash2 size={12} />
                            </button>
                          </div>
                        </div>
                        <h5 className="font-bold text-xs text-stone-200 truncate">{sec.name}</h5>
                      </>
                    )}
                  </div>
                ))}
              </div>
            </div>

          </div>
        )}

        {/* 3. NEW ROYAL DESIGN ADDITION FORM (شاشة إضافة تصميم ملكي جديد) */}
        {activeTab === 'addRoyalDesign' && (
          <div className="max-w-4xl mx-auto space-y-6 animate-fadeIn">
            
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 sm:p-8 space-y-6">
              
              {/* Form Title Header */}
              <div className="border-b border-stone-800 pb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-lg font-black text-[#D4AF37] flex items-center gap-2">
                    <Sparkles size={20} />
                    <span>{editingProduct ? `تعديل الموديل الملكي: [${editingProduct.name}]` : 'شاشة إضافة تصميم ملكي جديد'}</span>
                  </h2>
                  <p className="text-xs text-stone-400 mt-1">
                    أدخلي تفاصيل الخامة، التطريز، المقاسات، الألوان، والسعر بالريال اليمني لنشر الموديل فوراً بالمول.
                  </p>
                </div>
                {editingProduct && (
                  <button
                    onClick={() => {
                      setEditingProduct(null);
                      setActiveTab('royalWarehouse');
                    }}
                    className="text-xs text-stone-400 hover:text-white bg-stone-800 px-3 py-1.5 rounded-xl"
                  >
                    إلغاء التعديل ✕
                  </button>
                )}
              </div>

              {/* FORM */}
              <form onSubmit={handleSaveProduct} className="space-y-6">
                
                {/* 1. اسم الموديل والتخصص */}
                <div className="space-y-4 bg-stone-950 p-5 rounded-2xl border border-stone-850">
                  <h3 className="text-xs font-bold text-amber-400 flex items-center gap-2">
                    <Tag size={14} />
                    <span>1. اسم الموديل وتفاصيل الخامة والتطريز</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-300 mb-1">اسم الموديل (مثل: عباية بشت تطريز ملكي)</label>
                      <input
                        type="text"
                        placeholder="عباية بشت تطريز ملكي"
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                        value={productForm.name}
                        onChange={e => setProductForm({ ...productForm, name: e.target.value })}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-300 mb-1">نوع الخامة القماشية</label>
                      <input
                        type="text"
                        placeholder="حرير ياباني / مخمل كوري / كريب"
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                        value={productForm.materialType}
                        onChange={e => setProductForm({ ...productForm, materialType: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-300 mb-1">نوع التطريز والتطعيم</label>
                      <input
                        type="text"
                        placeholder="تطريز خصب / شك خرز / قصب ذهبي"
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                        value={productForm.embroideryType}
                        onChange={e => setProductForm({ ...productForm, embroideryType: e.target.value })}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-1">وصف رقة الفستان والموديل (اختياري)</label>
                    <textarea
                      placeholder="وصف إضافي للموديل ودقة التفصيل..."
                      className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3 text-xs text-stone-200 min-h-[60px] focus:outline-none focus:border-[#D4AF37]"
                      value={productForm.description}
                      onChange={e => setProductForm({ ...productForm, description: e.target.value })}
                    />
                  </div>
                </div>

                {/* 2. القسم والتصنيف */}
                <div className="space-y-4 bg-stone-950 p-5 rounded-2xl border border-stone-850">
                  <h3 className="text-xs font-bold text-amber-400 flex items-center gap-2">
                    <Layers size={14} />
                    <span>2. القسم وتصنيف العرض في المعرض</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-300 mb-1">القسم الرئيسي</label>
                      <select
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                        value={productForm.categoryId}
                        onChange={e => setProductForm({ ...productForm, categoryId: e.target.value })}
                      >
                        {(database.categories || []).map(cat => (
                          <option key={cat.id} value={cat.id}>{cat.name_ar || cat.name}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-300 mb-1">القسم الداخلي للمتجر</label>
                      <select
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                        value={productForm.subCategoryId}
                        onChange={e => setProductForm({ ...productForm, subCategoryId: e.target.value })}
                      >
                        <option value="">-- اختر من أقسم متجرك ({customStoreSections.length}) --</option>
                        {customStoreSections.map(sec => (
                          <option key={sec.id} value={sec.name}>{sec.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* 3. السعر والكمية */}
                <div className="space-y-4 bg-stone-950 p-5 rounded-2xl border border-stone-850">
                  <h3 className="text-xs font-bold text-amber-400 flex items-center gap-2">
                    <Wallet size={14} />
                    <span>3. السعر بالريال اليمني والكمية المتوفرة بالمخزن</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-300 mb-1">سعر التكلفة للتاجر (ريال يمني YER)</label>
                      <input
                        type="number"
                        min={100}
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2.5 text-xs text-[#D4AF37] font-bold focus:outline-none focus:border-[#D4AF37]"
                        value={productForm.originalPrice}
                        onChange={e => setProductForm({ ...productForm, originalPrice: Number(e.target.value) })}
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-300 mb-1">السعر النهائي للزبون بالمعرض</label>
                      <div className="w-full bg-stone-900/80 border border-stone-800 rounded-xl px-3 py-2.5 text-xs text-emerald-400 font-black">
                        {productForm.originalPrice + (database.commissionSettings.isFreeBeginning ? 0 : database.commissionSettings.flatCommissionRate)} ريال يمني
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-300 mb-1">الكمية المتوفرة بالمخزن</label>
                      <input
                        type="number"
                        min={0}
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2.5 text-xs text-white font-bold focus:outline-none focus:border-[#D4AF37]"
                        value={productForm.stockQuantity}
                        onChange={e => {
                          const qty = Number(e.target.value);
                          setProductForm({ 
                            ...productForm, 
                            stockQuantity: qty,
                            isOutofStock: qty <= 0 
                          });
                        }}
                        required
                      />
                    </div>
                  </div>
                </div>

                {/* 4. المقاسات والألوان */}
                <div className="space-y-4 bg-stone-950 p-5 rounded-2xl border border-stone-850">
                  <h3 className="text-xs font-bold text-amber-400 flex items-center gap-2">
                    <Grid size={14} />
                    <span>4. المقاسات والألوان والتطريزات المتاحة</span>
                  </h3>

                  {/* Size Templates Selection */}
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-2">تحديد قالب المقاسات الجاهزة:</label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {[
                        { key: 'women', label: '👗 نساء (52 - 60 / S - XXXXXXL)' },
                        { key: 'kids', label: '👧 أطفال (22 - 36)' },
                        { key: 'shoes', label: '👠 أحذية (36 - 42)' },
                        { key: 'custom', label: '🎨 مخصص / مقاس موحد' }
                      ].map(tmpl => (
                        <button
                          key={tmpl.key}
                          type="button"
                          onClick={() => {
                            const newKey = tmpl.key as 'women' | 'kids' | 'shoes' | 'custom';
                            setProductForm({
                              ...productForm,
                              sizeTemplate: newKey,
                              selectedSizes: SIZE_TEMPLATES[newKey]
                            });
                          }}
                          className={`p-2.5 rounded-xl border text-xs font-bold transition-all text-center ${
                            productForm.sizeTemplate === tmpl.key
                              ? 'bg-[#D4AF37] text-stone-950 border-[#D4AF37]'
                              : 'bg-stone-900 border-stone-800 text-stone-300 hover:border-stone-700'
                          }`}
                        >
                          {tmpl.label}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Sizes Checkboxes Chips */}
                  <div>
                    <label className="block text-xs font-bold text-stone-300 mb-2">اختر المقاسات المتوفرة بالمخزن:</label>
                    <div className="flex items-center gap-2 flex-wrap">
                      {(SIZE_TEMPLATES[productForm.sizeTemplate] || SIZE_TEMPLATES.women).map(size => {
                        const isSelected = (productForm.selectedSizes || []).includes(size);
                        return (
                          <button
                            key={size}
                            type="button"
                            onClick={() => toggleSize(size)}
                            className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold transition-all ${
                              isSelected
                                ? 'bg-amber-500/20 text-[#D4AF37] border-[#D4AF37]'
                                : 'bg-stone-900 text-stone-400 border-stone-800 hover:border-stone-700'
                            }`}
                          >
                            {isSelected ? `✓ ${size}` : size}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Colors & Embroideries Inputs */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-stone-300 mb-1">الألوان المتوفرة (مفصولة بفاصلة)</label>
                      <input
                        type="text"
                        placeholder="أسود ملكي، كحلي، عودي، ذهبي"
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                        value={productForm.availableColors}
                        onChange={e => setProductForm({ ...productForm, availableColors: e.target.value })}
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-stone-300 mb-1">أنواع التطريز المتوفرة (مفصولة بفاصلة)</label>
                      <input
                        type="text"
                        placeholder="تطريز ذهبي، خرز فضي، شك يدوي"
                        className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                        value={productForm.availableEmbroideries}
                        onChange={e => setProductForm({ ...productForm, availableEmbroideries: e.target.value })}
                      />
                    </div>
                  </div>
                </div>

                {/* 5. رفع الصور مع المعاينة والموديلات المقترحة */}
                <div className="space-y-4 bg-stone-950 p-5 rounded-2xl border border-stone-850">
                  <div className="flex justify-between items-center">
                    <h3 className="text-xs font-bold text-amber-400 flex items-center gap-2">
                      <ImageIcon size={14} />
                      <span>5. ألبوم صور الموديل والتصميم (حتى 10 صور)</span>
                    </h3>
                  </div>

                  {/* IMAGE FRAME FIT CONTROL */}
                  <div className="bg-stone-900/60 p-3 rounded-xl border border-stone-800 space-y-2">
                    <label className="text-[11px] font-bold text-amber-400 block">🖼️ طريقة ضبط إطار وتأطير صورة الموديل بالكتالوج والسنترال العائم:</label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { key: 'cover', label: '📐 تغطية الإطار (Cover)', desc: 'تعبئة الكرت بالكامل' },
                        { key: 'contain', label: '🖼️ احتواء كامل (Contain)', desc: 'عرض كامل الفستان بدون قص' },
                        { key: 'fill', label: '📏 ملء الإطار (Fill)', desc: 'مط الصورة لتناسب الإطار' }
                      ].map(mode => (
                        <button
                          key={mode.key}
                          type="button"
                          onClick={() => setProductForm({ ...productForm, imageFitMode: mode.key as any })}
                          className={`p-2 rounded-xl border text-right transition-all ${
                            productForm.imageFitMode === mode.key
                              ? 'bg-[#D4AF37] text-stone-950 border-[#D4AF37] font-bold shadow-md'
                              : 'bg-stone-950 border-stone-800 text-stone-300 hover:border-stone-700'
                          }`}
                        >
                          <div className="text-[10px] font-bold">{mode.label}</div>
                          <div className="text-[8px] opacity-80">{mode.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* PRESET SUGGESTED DESIGNS ONE-CLICK SELECTION */}
                  <div className="bg-stone-900/60 p-3 rounded-xl border border-stone-800 space-y-2">
                    <span className="text-[11px] font-bold text-[#D4AF37] block">✨ اختيار موديل وتصميم مقترح جاهز بنقرة واحدة للتجربة والمعاينة السريعة:</span>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {PRESET_SUGGESTED_DESIGNS.map((preset, idx) => (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setProductForm(prev => {
                              const updatedImgs = [...prev.images];
                              updatedImgs[0] = preset.image;
                              return {
                                ...prev,
                                name: preset.name,
                                materialType: preset.material,
                                embroideryType: preset.embroidery,
                                image: preset.image,
                                images: updatedImgs
                              };
                            });
                          }}
                          className="p-2 bg-stone-950 hover:bg-stone-850 border border-stone-800 hover:border-[#D4AF37] rounded-xl text-right transition-all flex items-center gap-2"
                        >
                          <img src={preset.image} alt={preset.name} className="w-9 h-9 object-cover rounded-lg border border-stone-800 shrink-0" />
                          <div className="overflow-hidden">
                            <div className="text-[10px] font-bold text-stone-200 truncate">{preset.name}</div>
                            <div className="text-[8px] text-stone-400 truncate">{preset.material}</div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* IMAGES GRID */}
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
                    {Array.from({ length: 10 }).map((_, index) => {
                      const imgVal = productForm.images[index] || '';
                      return (
                        <div key={index} className="bg-stone-900 border border-stone-800 rounded-xl p-2 flex flex-col justify-between space-y-2">
                          <div className="flex justify-between items-center text-[9px]">
                            <span className="font-bold text-stone-400">صورة {index + 1} {index === 0 && '(الرئيسية)'}</span>
                            {imgVal && (
                              <button
                                type="button"
                                onClick={() => {
                                  setProductForm(prev => {
                                    const updated = [...prev.images];
                                    updated[index] = '';
                                    return { ...prev, images: updated };
                                  });
                                }}
                                className="text-red-400 hover:text-red-300"
                              >
                                ✕
                              </button>
                            )}
                          </div>

                          <div className="aspect-square bg-stone-950 rounded-lg overflow-hidden flex items-center justify-center border border-stone-850">
                            {imgVal ? (
                              <img 
                                src={imgVal} 
                                alt={`Preview ${index + 1}`} 
                                className={`w-full h-full ${
                                  productForm.imageFitMode === 'contain' ? 'object-contain p-1' : productForm.imageFitMode === 'fill' ? 'object-fill' : 'object-cover'
                                }`} 
                              />
                            ) : (
                              <ImageIcon size={20} className="text-stone-700" />
                            )}
                          </div>

                          <div className="space-y-1">
                            <label className="w-full bg-stone-800 hover:bg-stone-750 text-stone-300 text-[9px] py-1 rounded cursor-pointer flex items-center justify-center gap-1">
                              <ImageIcon size={10} />
                              <span>رفع من الهاتف</span>
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(e) => {
                                  handleImageAttached(e, (b64) => {
                                    setProductForm(prev => {
                                      const updated = [...prev.images];
                                      updated[index] = b64;
                                      return {
                                        ...prev,
                                        image: index === 0 ? b64 : (prev.image || b64),
                                        images: updated
                                      };
                                    });
                                  });
                                }}
                              />
                            </label>

                            <input
                              type="text"
                              placeholder="رابط الصورة"
                              className="w-full bg-stone-950 border border-stone-800 rounded text-[8px] p-1 font-mono text-stone-400"
                              value={imgVal}
                              onChange={e => {
                                const val = e.target.value;
                                setProductForm(prev => {
                                  const updated = [...prev.images];
                                  updated[index] = val;
                                  return {
                                    ...prev,
                                    image: index === 0 ? val : (prev.image || val),
                                    images: updated
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

                {/* SUBMIT BUTTON */}
                <div className="flex gap-3 pt-4 border-t border-stone-800 justify-end">
                  <button
                    type="button"
                    onClick={() => setActiveTab('royalWarehouse')}
                    className="bg-stone-800 hover:bg-stone-750 text-stone-300 font-bold px-5 py-2.5 rounded-2xl text-xs"
                  >
                    إلغاء والعودة للمستودع
                  </button>
                  <button
                    type="submit"
                    className="bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-400 hover:to-amber-600 text-stone-950 font-black px-8 py-2.5 rounded-2xl text-xs shadow-xl cursor-pointer hover:scale-[1.02] transition-all"
                  >
                    {editingProduct ? 'حفظ التعديلات المعتمدة ✓' : 'طرح ونشر التصميم الملكي بالمول ✨'}
                  </button>
                </div>

              </form>

            </div>

          </div>
        )}

        {/* 4. ORDERS TRACKING TAB (متابعة الطلبات الواردة) */}
        {activeTab === 'orders' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-[#D4AF37] flex items-center gap-2">
                <Truck size={18} />
                <span>طلبات الزبائن الواردة لموديلاتك</span>
              </h3>

              {vendorOrders.length === 0 ? (
                <div className="p-8 text-center text-stone-500 text-xs bg-stone-950/50 rounded-2xl border border-dashed border-stone-800">
                  لا توجد طلبات واردة لموديلاتك حالياً. عند إتمام الزبائن للشراء ستظهر طلباتهم مباشرة هنا!
                </div>
              ) : (
                <div className="space-y-3">
                  {vendorOrders.map(order => (
                    <div key={order.id} className="bg-stone-950 border border-stone-800 rounded-2xl p-4 flex flex-col md:flex-row justify-between gap-4">
                      <div className="space-y-1 text-xs">
                        <div className="font-bold text-white flex items-center gap-2">
                          <span>طلب رقم: #{order.id}</span>
                          <span className="text-[10px] bg-amber-500/20 text-[#D4AF37] px-2 py-0.5 rounded font-mono">
                            {order.status === 'completed' ? '🟢 مكتمل ومستلم' : '🟡 قيد التجهيز والشحن'}
                          </span>
                        </div>
                        <p className="text-stone-400 text-[11px]">العميل: {order.customerName || 'عميل المول'} ({order.customerPhone})</p>
                        <p className="text-stone-400 text-[11px]">العنوان: {order.deliveryAddress || 'صنعاء'}</p>
                        <div className="pt-2 text-stone-300">
                          <strong>المنتجات المطلوبة:</strong>
                          <ul className="list-disc list-inside mt-1 space-y-0.5 text-[11px]">
                            {(order.items || []).filter(item => item.product.vendorId === currentUser.id).map((item, i) => (
                              <li key={i}>
                                {item.product.name} - العدد: {item.quantity} (السعر: {item.product.originalPrice || item.product.price} ر.ي)
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>

                      <div className="text-left flex flex-col justify-between items-end border-t md:border-t-0 md:border-r border-stone-800 pt-3 md:pt-0 md:pr-4">
                        <div className="text-sm font-black text-[#D4AF37]">
                          إجمالي الطلب: {order.totalAmount} ر.ي
                        </div>
                        <span className="text-[10px] text-stone-500 font-mono">{order.createdAt.slice(0, 10)}</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 5. WALLET & PAYOUTS TAB (المحفظة والأرباح) */}
        {activeTab === 'wallet' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              
              <div className="bg-gradient-to-br from-stone-900 to-stone-950 border border-stone-800 rounded-3xl p-6 space-y-3">
                <span className="text-xs font-bold text-stone-400 block">الرصيد الجاهز القابل للسحب</span>
                <div className="text-3xl font-black text-emerald-400 font-mono">{availableToWithdraw} <span className="text-sm font-normal text-stone-400">ريال يمني</span></div>
                <button
                  onClick={() => setShowWithdrawModal(true)}
                  disabled={availableToWithdraw <= 0}
                  className="w-full bg-[#D4AF37] hover:bg-amber-500 disabled:opacity-50 text-stone-950 font-black text-xs py-2.5 rounded-xl transition-all shadow-md cursor-pointer"
                >
                  💸 طلب سحب وتسييل الأرباح
                </button>
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-3">
                <span className="text-xs font-bold text-stone-400 block">الرصيد المعلق (طلبات قيد الشحن)</span>
                <div className="text-2xl font-black text-amber-300 font-mono">{pendingWalletAmount} <span className="text-xs font-normal text-stone-400">ريال يمني</span></div>
                <p className="text-[10px] text-stone-500 leading-relaxed">
                  يتحول هذا الرصيد تلقائياً للرصيد المتاح فور تأكيد استلام الشحنة بواسطة الزبون.
                </p>
              </div>

              <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-3">
                <span className="text-xs font-bold text-stone-400 block">إجمالي المسحوبات المعتمدة</span>
                <div className="text-2xl font-black text-white font-mono">{totalWithdrawnAmount} <span className="text-xs font-normal text-stone-400">ريال يمني</span></div>
                <p className="text-[10px] text-stone-500 leading-relaxed">
                  إجمالي الحوالات المالية المحولة لحسابك البنكي أو محفظتك المصرفية.
                </p>
              </div>

            </div>

            {/* WITHDRAWAL HISTORY TABLE */}
            <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Clock size={16} className="text-[#D4AF37]" />
                <span>سجل طلبات السحب والحوالات الصادرة</span>
              </h3>

              {(database.withdrawalRequests || []).filter(w => w.vendorId === currentUser.id).length === 0 ? (
                <div className="p-6 text-center text-stone-500 text-xs bg-stone-950/50 rounded-2xl">
                  لا توجد طلبات سحب أرباح سابقة.
                </div>
              ) : (
                <div className="space-y-2">
                  {(database.withdrawalRequests || []).filter(w => w.vendorId === currentUser.id).map(req => (
                    <div key={req.id} className="bg-stone-950 p-3.5 rounded-2xl border border-stone-850 flex justify-between items-center text-xs">
                      <div>
                        <div className="font-bold text-stone-200">{req.amount} ريال يمني عبر ({req.bankName})</div>
                        <div className="text-[10px] text-stone-500 font-mono mt-0.5">الحساب: {req.accountNumber}</div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${req.status === 'approved' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' : 'bg-amber-950 text-amber-300 border border-amber-800'}`}>
                        {req.status === 'approved' ? '✓ تم التحويل' : '⏳ قيد التدقيق'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* 6. FINANCIAL ACCOUNTANT SIMULATION VIEW (محاكاة المحاسب المالي) */}
        {activeTab === 'accountantSimulation' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-gradient-to-r from-stone-900 via-amber-950/30 to-stone-900 border border-amber-500/40 rounded-3xl p-6 space-y-4">
              <div className="flex items-center gap-3">
                <Briefcase size={28} className="text-[#D4AF37]" />
                <div>
                  <h2 className="text-base font-black text-[#D4AF37]">لوحة المحاسب المالي التجريبية (أحمد عوبثان)</h2>
                  <p className="text-xs text-stone-400">تتيح لك محاكاة واعتماد حوالات الزبائن وتوثيق المتاجر وصرف العمولات فوراً للاختبار المباشر.</p>
                </div>
              </div>

              {/* ACTION: VERIFY VENDOR ACCOUNT */}
              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 flex justify-between items-center">
                <div>
                  <h4 className="font-bold text-xs text-white">اعتماد وتوثيق متجرك الحالي ({currentUser.name})</h4>
                  <p className="text-[11px] text-stone-400">تمنح شارة التوثيق الذهبية وتفعل كافة الميزات دون انتظار التدقيق الميداني.</p>
                </div>
                {currentUser.isVerified ? (
                  <button
                    onClick={() => {
                      const updated = database.users.map(u => u.id === currentUser.id ? { ...u, isVerified: false } : u);
                      onSave({ ...database, users: updated });
                    }}
                    className="bg-stone-800 text-red-400 text-xs px-4 py-2 rounded-xl font-bold"
                  >
                    إلغاء التوثيق
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      const updated = database.users.map(u => u.id === currentUser.id ? { ...u, isVerified: true } : u);
                      onSave({ ...database, users: updated });
                      alert('✨ تم تعميد وتوثيق متجركِ بنجاح بشارة التوثيق الذهبية!');
                    }}
                    className="bg-[#D4AF37] text-stone-950 font-black text-xs px-5 py-2 rounded-xl"
                  >
                    ✓ تعميد وتوثيق المتجر فوراً
                  </button>
                )}
              </div>

              {/* ACTION: APPROVE PENDING PAYMENTS */}
              <div className="bg-stone-950 p-4 rounded-2xl border border-stone-800 space-y-3">
                <h4 className="font-bold text-xs text-amber-300">حوالات طلبات الزبائن المعلقة بانتظار التعميد المصرفي:</h4>
                {database.orders.filter(o => o.status === 'pending_payment').length === 0 ? (
                  <p className="text-[11px] text-stone-500 text-center py-3">لا توجد طلبات معلقة بانتظار الحوالة حالياً.</p>
                ) : (
                  database.orders.filter(o => o.status === 'pending_payment').map(ord => (
                    <div key={ord.id} className="bg-stone-900 p-3 rounded-xl flex justify-between items-center text-xs">
                      <div>
                        <span className="font-bold text-white">طلب رقم #{ord.id}</span> - <span className="text-amber-400 font-bold">{ord.totalAmount} ر.ي</span>
                        <span className="text-stone-400 block text-[10px]">العميل: {ord.customerPhone} ({ord.bankName})</span>
                      </div>
                      <button
                        onClick={() => {
                          const updated = database.orders.map(o => o.id === ord.id ? { ...o, status: 'completed' as const } : o);
                          onSave({ ...database, orders: updated });
                          alert(`✅ تم تعميد حوالة طلب العميل #${ord.id} وتحويل حالة الطلب لمكتمل!`);
                        }}
                        className="bg-emerald-500 text-stone-950 font-bold text-xs px-3 py-1.5 rounded-lg"
                      >
                        ✓ تعميد الحوالة
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

      </main>

      {/* MODAL: VERIFICATION DOCUMENTS */}
      {showVerificationModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1C1C1D] border border-stone-800 rounded-3xl w-full max-w-2xl text-right p-6 space-y-5 my-8 shadow-2xl">
            <div className="flex justify-between items-center border-b border-stone-800 pb-3">
              <h3 className="font-black text-sm text-[#D4AF37] flex items-center gap-2">
                <Briefcase size={18} />
                <span>وثائق التوثيق والتحقق الاختيارية للمتجر 🪪</span>
              </h3>
              <button onClick={() => setShowVerificationModal(false)} className="text-stone-400 hover:text-white">✕</button>
            </div>

            <div className="bg-stone-950 p-3.5 rounded-2xl border border-stone-850 text-xs text-stone-400 leading-relaxed">
              📢 <strong>توضيح هام للتاجر:</strong> هذه الوثائق والملفات اختيارية تماماً لتوثيق المتجر وتفعيله بالمول الرقمي Digital Mall. يمكنك اختيار صور حقيقية من جهازك أو استخدام الخيارات السريعة.
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-stone-900 p-3.5 rounded-2xl border border-stone-800 space-y-2">
                <span className="text-[10px] text-[#D4AF37] font-bold block">1. البطاقة الشخصية - الوجه الأول (اختياري)</span>
                <input
                  type="text"
                  placeholder="رابط الصورة أو base64"
                  className="w-full bg-stone-950 border border-stone-800 text-stone-300 text-[10px] p-2 rounded-xl font-mono"
                  value={idCard}
                  onChange={e => setIdCard(e.target.value)}
                />
              </div>

              <div className="bg-stone-900 p-3.5 rounded-2xl border border-stone-800 space-y-2">
                <span className="text-[10px] text-[#D4AF37] font-bold block">2. البطاقة الشخصية - الوجه الثاني (اختياري)</span>
                <input
                  type="text"
                  placeholder="رابط الصورة أو base64"
                  className="w-full bg-stone-950 border border-stone-800 text-stone-300 text-[10px] p-2 rounded-xl font-mono"
                  value={idCard2}
                  onChange={e => setIdCard2(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
              <button
                type="button"
                onClick={() => setShowVerificationModal(false)}
                className="bg-stone-800 text-stone-400 px-4 py-2 rounded-xl text-xs"
              >
                إلغاء
              </button>
              <button
                type="button"
                onClick={() => {
                  const updatedUsers = database.users.map(u => {
                    if (u.id === currentUser.id) {
                      return {
                        ...u,
                        idCardPhoto: idCard,
                        idCardPhoto2: idCard2,
                        isVerified: true
                      };
                    }
                    return u;
                  });
                  onSave({ ...database, users: updatedUsers });
                  alert('✨ تم تقديم وثائق التوثيق وتفعيل المتجر بنجاح!');
                  setShowVerificationModal(false);
                }}
                className="bg-[#D4AF37] text-stone-950 font-black px-6 py-2 rounded-xl text-xs"
              >
                حفظ وإرسال التوثيق ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: EDIT STORE DATA */}
      {showEditStoreModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1C1C1D] border border-stone-800 rounded-3xl w-full max-w-2xl text-right p-6 space-y-5 my-8 shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b border-stone-800 pb-3">
              <h3 className="font-black text-sm text-[#D4AF37] flex items-center gap-2">
                <Settings size={18} />
                <span>تعديل بيانات المتجر والموقع الميداني</span>
              </h3>
              <button onClick={() => setShowEditStoreModal(false)} className="text-stone-400 hover:text-white">✕</button>
            </div>

            <form
              onSubmit={e => {
                e.preventDefault();
                const updatedUsers = database.users.map(u => {
                  if (u.id === currentUser.id) {
                    return {
                      ...u,
                      fullName: fullName,
                      phone: phoneInput,
                      currentResidence: residence,
                      bankAccountDetails: bankCoords,
                      logoImage: logoImage,
                      merchantType: merchantType,
                      latitude: latitude,
                      longitude: longitude,
                      mapAddress: mapAddress
                    };
                  }
                  return u;
                });
                onSave({ ...database, users: updatedUsers });
                alert('✅ تم حفظ وتحديث بيانات وشعار المتجر والموقع بنجاح!');
                setShowEditStoreModal(false);
              }}
              className="space-y-4"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">صفة التاجر (ذكر / أنثى)</label>
                  <select
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white"
                    value={merchantType}
                    onChange={e => setMerchantType(e.target.value as 'female' | 'male')}
                  >
                    <option value="female">👩‍💼 تاجرة (أنثى)</option>
                    <option value="male">👨‍💼 تاجر (ذكر)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">الاسم الرباعي للصاحب/الصاحبة</label>
                  <input
                    type="text"
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">رقم الهاتف الفعلي للتواصل</label>
                  <input
                    type="text"
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white text-left font-mono"
                    value={phoneInput}
                    onChange={e => setPhoneInput(e.target.value)}
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-stone-300 mb-1">مقر الإقامة / المحافظة</label>
                  <input
                    type="text"
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-xs text-white"
                    value={residence}
                    onChange={e => setResidence(e.target.value)}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">شعار المتجر / الصورة الرمزية</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="رابط الصورة أو base64"
                    className="flex-1 bg-stone-900 border border-stone-800 text-stone-300 text-[10px] p-2 rounded-xl font-mono text-left"
                    value={logoImage}
                    onChange={e => setLogoImage(e.target.value)}
                  />
                  <label className="bg-[#D4AF37] text-stone-950 font-bold text-xs px-3 py-2 rounded-xl cursor-pointer">
                    رفع صورة
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={e => handleImageAttached(e, setLogoImage)}
                    />
                  </label>
                </div>
              </div>

              <div className="border-t border-stone-800 pt-3">
                <SanaaMap
                  initialLatitude={latitude}
                  initialLongitude={longitude}
                  initialAddress={mapAddress}
                  storeName={currentUser.name}
                  onChange={(data) => {
                    setLatitude(data.latitude);
                    setLongitude(data.longitude);
                    setMapAddress(data.mapAddress);
                  }}
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowEditStoreModal(false)}
                  className="bg-stone-800 text-stone-400 px-4 py-2 rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-[#D4AF37] text-stone-950 font-black px-6 py-2 rounded-xl text-xs"
                >
                  حفظ البيانات المعتمدة ✓
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: WITHDRAW PAYOUT */}
      {showWithdrawModal && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1C1D] border border-stone-800 rounded-3xl w-full max-w-sm p-6 text-right space-y-4">
            <div className="flex justify-between items-center border-b border-stone-800 pb-3">
              <h3 className="font-black text-sm text-[#D4AF37]">طلب سحب وتسييل الأرباح</h3>
              <button onClick={() => setShowWithdrawModal(false)} className="text-stone-400 hover:text-white">✕</button>
            </div>

            <form onSubmit={handleRequestWithdraw} className="space-y-3">
              <div>
                <span className="text-[11px] text-stone-400 block">الرصيد المتاح للسحب:</span>
                <span className="font-extrabold text-emerald-400 text-lg block">{availableToWithdraw} ريال يمني</span>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">المبلغ المراد سحبه</label>
                <input
                  type="number"
                  min={100}
                  max={availableToWithdraw}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2 text-xs text-white font-bold"
                  value={withdrawForm.amount}
                  onChange={e => setWithdrawForm({ ...withdrawForm, amount: Number(e.target.value) })}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">جهة / بنك الصرف</label>
                <select
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2 text-xs text-white"
                  value={withdrawForm.bankName}
                  onChange={e => setWithdrawForm({ ...withdrawForm, bankName: e.target.value })}
                >
                  <option value="بنك الكريمي الإسلامي">بنك الكريمي الإسلامي</option>
                  <option value="بنك البسيري للصرافة">بنك البسيري للصرافة</option>
                  <option value="بنك الشرق الأوسط">بنك الشرق الأوسط</option>
                  <option value="الشبكة الموحدة">الشبكة الموحدة للأموال</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">رقم حسابك المصرفي</label>
                <input
                  type="text"
                  placeholder="مثال: حساب الكريمي رقم 31102932"
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-2 text-xs text-white font-mono"
                  value={withdrawForm.accountNumber}
                  onChange={e => setWithdrawForm({ ...withdrawForm, accountNumber: e.target.value })}
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-stone-800">
                <button
                  type="button"
                  onClick={() => setShowWithdrawModal(false)}
                  className="bg-stone-800 text-stone-400 px-3 py-1.5 rounded-xl text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="bg-[#D4AF37] text-stone-950 font-black px-5 py-1.5 rounded-xl text-xs"
                >
                  إرسال الطلب للمحاسب
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
