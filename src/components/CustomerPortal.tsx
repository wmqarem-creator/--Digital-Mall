import React, { useState } from 'react';
import { 
  AppDatabase, 
  Product, 
  Category, 
  CartItem, 
  Order, 
  ChatMessage,
  UserProfile
} from '../types';
import { 
  ShoppingBag, 
  ShoppingCart, 
  Search, 
  ArrowLeft, 
  CheckCircle, 
  Upload, 
  Star, 
  MessageCircle, 
  Send, 
  Image as ImageIcon, 
  ChevronRight, 
  Plus, 
  Minus, 
  Trash2, 
  CreditCard, 
  ArrowLeftRight,
  Sparkles,
  Phone,
  Instagram,
  Facebook,
  AlertCircle,
  Truck,
  UserPlus,
  Check,
  Store,
  Users,
  PhoneCall,
  Share2,
  User,
  X,
  ShieldCheck,
  Clock,
  CheckCircle2,
  Briefcase
} from 'lucide-react';
import { logOperation } from '../dbMock';
import { validateTransactionRef } from '../utils/validation';
import SanaaMap from './SanaaMap';

interface CustomerPortalProps {
  database: AppDatabase;
  onSave: (db: AppDatabase) => void;
  currentUser: UserProfile;
  onLogout?: () => void;
}

const SUB_CATEGORY_ICONS: Record<string, string> = {
  "البنطلونات والدنيم": `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="%231E1E1E"/><rect x="5" y="5" width="90" height="90" rx="12" stroke="%23D4AF37" stroke-width="1.5" stroke-dasharray="4 2"/><path d="M35 20 h30 l12 60 h-16 l-6 -35 l-6 35 h-16 Z" fill="%23F8C8DC" stroke="%23D4AF37" stroke-width="1.5"/></svg>`,
  "قسم البنطلونات النسائيه": `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="%231E1E1E"/><rect x="5" y="5" width="90" height="90" rx="12" stroke="%23D4AF37" stroke-width="1.5" stroke-dasharray="4 2"/><path d="M35 20 h30 l12 60 h-16 l-6 -35 l-6 35 h-16 Z" fill="%23F8C8DC" stroke="%23D4AF37" stroke-width="1.5"/></svg>`,
  "الثياب والجلابيات": `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="%231E1E1E"/><rect x="5" y="5" width="90" height="90" rx="12" stroke="%23D4AF37" stroke-width="1.5" stroke-dasharray="4 2"/><path d="M35 20 h30 l10 60 h-50 Z" fill="%23F8C8DC" stroke="%23D4AF37" stroke-width="1.5"/></svg>`,
  "قسم الجلابيات والارواب": `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="%231E1E1E"/><rect x="5" y="5" width="90" height="90" rx="12" stroke="%23D4AF37" stroke-width="1.5" stroke-dasharray="4 2"/><path d="M35 20 h30 l12 60 h-54 Z" fill="%23F8C8DC" stroke="%23D4AF37" stroke-width="1.5"/></svg>`,
  "القمصان وتيشيرتات": `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="%231E1E1E"/><rect x="5" y="5" width="90" height="90" rx="12" stroke="%23D4AF37" stroke-width="1.5" stroke-dasharray="4 2"/><path d="M25 30 h15 l5 -10 h10 l5 10 h15 l8 30 h-15 v25 h-30 v-25 h-15 Z" fill="%23F8C8DC" stroke="%23D4AF37" stroke-width="1.5"/></svg>`,
  "الأطقم والبدلات الرسمية": `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="%231E1E1E"/><rect x="5" y="5" width="90" height="90" rx="12" stroke="%23D4AF37" stroke-width="1.5" stroke-dasharray="4 2"/><path d="M25 25 h50 l10 55 h-70 Z" fill="%23F8C8DC" stroke="%23D4AF37" stroke-width="1.5"/></svg>`,
  "قسم الفساتين الأنيقة": `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="%231E1E1E"/><rect x="5" y="5" width="90" height="90" rx="12" stroke="%23D4AF37" stroke-width="1.5" stroke-dasharray="4 2"/><path d="M35 20 l15 15 l15 -15 l15 30 l-45 30 Z" fill="%23F8C8DC" stroke="%23D4AF37" stroke-width="1.5"/></svg>`,
  "قسم العبايات الراقية": `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="%231E1E1E"/><rect x="5" y="5" width="90" height="90" rx="12" stroke="%23D4AF37" stroke-width="1.5" stroke-dasharray="4 2"/><path d="M30 20 h40 l15 60 h-70 Z" fill="%23151515" stroke="%23D4AF37" stroke-width="1.5"/><path d="M50 20 v60" stroke="%23F8C8DC" stroke-width="1"/></svg>`,
};

export default function CustomerPortal({ database, onSave, currentUser, onLogout = () => window.location.reload() }: CustomerPortalProps) {
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [selectedSubCategory, setSelectedSubCategory] = useState<string | null>(null);
  const [selectedSubCategoryLeaf, setSelectedSubCategoryLeaf] = useState<string | null>(null);
  const [selectedNavigationTag, setSelectedNavigationTag] = useState<string | null>(null);
  
  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    setSelectedSubCategory(null);
    setSelectedSubCategoryLeaf(null);
    setSelectedNavigationTag(null);
  };

  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [activeImgIndex, setActiveImgIndex] = useState<number>(0);
  
  // Shopping Cart State (Solves: "لا يوجد اضافة للسله في لوحه الزبون . يرجيا اضافهته")
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Checkout Wizard
  const [showCheckout, setShowCheckout] = useState(false);
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [selectedShippingCompanyId, setSelectedShippingCompanyId] = useState<string>('express_direct');
  const [receiptImageBase64, setReceiptImageBase64] = useState<string>('');
  const [transactionRefId, setTransactionRefId] = useState<string>('');
  const [customerResidence, setCustomerResidence] = useState<string>('');
  const [customerLatitude, setCustomerLatitude] = useState<number>(15.3185);
  const [customerLongitude, setCustomerLongitude] = useState<number>(44.1812);
  const [customerMapAddress, setCustomerMapAddress] = useState<string>('صنعاء - شارع حدة الرئيسي');
  const [isSubmittingOrder, setIsSubmittingOrder] = useState(false);

  // Tracking orders states
  const [activeTrackingOrderId, setActiveTrackingOrderId] = useState<string | null>(null);
  const [customerChatMessage, setCustomerChatMessage] = useState('');
  const [customerChatImage, setCustomerChatImage] = useState('');

  // Double Review Pop-up Modal states
  const [showReviewPopup, setShowReviewPopup] = useState<string | null>(null); // OrderId
  const [productRating, setProductRating] = useState(5);
  const [vendorRating, setVendorRating] = useState(5);
  const [storeRating, setStoreRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  // Individual product detail review state fields
  const [newRating, setNewRating] = useState<number>(5);
  const [newComment, setNewComment] = useState<string>('');
  const [reviewSuccess, setReviewSuccess] = useState<boolean>(false);

  // Merchant Store Activation state variables
  const [showProfileModal, setShowProfileModal] = useState<boolean>(false);
  const [activeProfileTab, setActiveProfileTab] = useState<'info' | 'activateStore'>('activateStore');
  const [storeNameVal, setStoreNameVal] = useState('');
  const [merchantFullNameVal, setMerchantFullNameVal] = useState('');
  const [residenceVal, setResidenceVal] = useState('');
  const [bankDetailsVal, setBankDetailsVal] = useState('');
  const [merchantTypeVal, setMerchantTypeVal] = useState<'female' | 'male'>('female');
  const [idCardPhotoBase64, setIdCardPhotoBase64] = useState('');
  const [logoPhotoBase64, setLogoPhotoBase64] = useState('');
  const [isActivatingStore, setIsActivatingStore] = useState(false);
  const [activationSuccess, setActivationSuccess] = useState(false);

  const handleIdCardPhotoAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setIdCardPhotoBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleLogoPhotoAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setLogoPhotoBase64(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleToggleFollowVendor = (vendorId: string) => {
    const currentUserId = currentUser.id || currentUser.phone || currentUser.email;
    if (!currentUserId) return;

    const updatedUsers = database.users.map(u => {
      if (u.id === vendorId || u.phone === vendorId) {
        const existingFollowers = u.followedByUserIds || [];
        const isFollowing = existingFollowers.includes(currentUserId);
        const newFollowers = isFollowing
          ? existingFollowers.filter(id => id !== currentUserId)
          : [...existingFollowers, currentUserId];

        return {
          ...u,
          followedByUserIds: newFollowers,
          followersCount: newFollowers.length
        };
      }
      return u;
    });

    onSave({ ...database, users: updatedUsers });
  };

  const handleActivateMerchantStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!storeNameVal.trim() || !merchantFullNameVal.trim()) {
      alert('الرجاء إدخال اسم المتجر والاسم الكامل لتفعيل حسابك كتاجر.');
      return;
    }

    setIsActivatingStore(true);

    const hasIdCard = !!(idCardPhotoBase64 && idCardPhotoBase64.trim());

    let userFound = false;
    // Create the updated users array with the customer updated to a vendor
    const updatedUsers = database.users.map(u => {
      if (u.id === currentUser.id || (currentUser.phone && u.phone === currentUser.phone) || (currentUser.email && u.email === currentUser.email)) {
        userFound = true;
        return {
          ...u,
          role: 'vendor' as const,
          name: storeNameVal.trim(),
          storeName: storeNameVal.trim(),
          fullName: merchantFullNameVal.trim(),
          currentResidence: residenceVal.trim() || u.currentResidence || 'اليمن - صنعاء',
          merchantType: merchantTypeVal,
          idCardPhoto: idCardPhotoBase64 || u.idCardPhoto || '',
          logoImage: logoPhotoBase64 || u.logoImage || '',
          isVerified: hasIdCard,
          bankAccountDetails: bankDetailsVal.trim() || u.bankAccountDetails || 'بنك الكريمي - حساب سحب العمولة',
          storeApplicationStatus: 'pending' as const,
          createdAt: u.createdAt || new Date().toISOString()
        };
      }
      return u;
    });

    if (!userFound) {
      updatedUsers.push({
        id: currentUser.id || `user_${Date.now()}`,
        phone: currentUser.phone || '+967780000000',
        email: currentUser.email || 'user@digitalmall.com',
        role: 'customer',
        name: storeNameVal.trim(),
        storeName: storeNameVal.trim(),
        fullName: merchantFullNameVal.trim(),
        currentResidence: residenceVal.trim() || 'اليمن - صنعاء',
        merchantType: merchantTypeVal,
        idCardPhoto: idCardPhotoBase64 || '',
        logoImage: logoPhotoBase64 || '',
        isVerified: hasIdCard,
        bankAccountDetails: bankDetailsVal.trim() || 'بنك الكريمي - حساب سحب العمولة',
        storeApplicationStatus: 'pending' as const,
        createdAt: new Date().toISOString()
      });
    }

    const updatedDb = {
      ...database,
      users: updatedUsers
    };

    // Log the operation
    logOperation(
      currentUser.phone || currentUser.id || 'system',
      merchantFullNameVal,
      'vendor',
      'تنشيط متجر تاجر شريك',
      `تمت ترقية الحساب وتنشيط متجر "${storeNameVal}" للتاجرة الشريكة بنجاح (${hasIdCard ? 'حساب موثق بالبطاقة' : 'حساب غير موثق'}).`
    );

    // Save and Sync with Local + Cloud
    onSave(updatedDb);

    setIsActivatingStore(false);
    setActivationSuccess(true);
    
    alert(`🎉 تهانينا! لقد تم حفظ وتنشيط متجركِ الخاص "${storeNameVal}" بنجاح! ${hasIdCard ? 'تم تفعيل شارة التوثيق الزرقاء للمتجر ✓' : 'تم إضافة المتجر بنجاح (بدون توثيق، يمكنكِ إضافة الهوية لاحقاً للتوثيق).'}`);
  };

  // Filtering products
  const filteredProducts = database.products.filter(p => {
    const matchesCategory = activeCategory === 'all' || p.categoryId === activeCategory;
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase());
    
    let matchesSubFilter = true;
    if (activeCategory !== 'all') {
      const selectedCat = database.categories.find(c => c.id === activeCategory);
      if (selectedCat) {
        if (selectedNavigationTag) {
          if (p.navigationTag) {
            matchesSubFilter = p.navigationTag === selectedNavigationTag;
          } else {
            const tagWords = selectedNavigationTag.split(' ');
            const nameDesc = (p.name + ' ' + p.description).toLowerCase();
            matchesSubFilter = tagWords.some(w => w.length > 2 && nameDesc.includes(w.toLowerCase())) || nameDesc.includes(selectedNavigationTag.toLowerCase());
          }
        } else if (selectedSubCategory && selectedCat.sub_categories) {
          // Check if specific sub-category leaf is selected
          if (selectedSubCategoryLeaf) {
            if (p.subCategoryLeaf) {
              matchesSubFilter = p.subCategoryLeaf === selectedSubCategoryLeaf;
            } else {
              // Fallback for older mock items
              const nameDesc = (p.name + ' ' + p.description).toLowerCase();
              matchesSubFilter = nameDesc.includes(selectedSubCategoryLeaf.toLowerCase());
            }
          } else {
            // Only broader sub-category is selected
            if (p.subCategoryId) {
              matchesSubFilter = p.subCategoryId === selectedSubCategory;
            } else {
              const subItems = selectedCat.sub_categories[selectedSubCategory] || [];
              const nameDesc = (p.name + ' ' + p.description).toLowerCase();
              matchesSubFilter = subItems.some(item => {
                const itemWords = item.split(' ');
                return itemWords.some(w => w.length > 2 && nameDesc.includes(w.toLowerCase())) || nameDesc.includes(item.toLowerCase());
              });
            }
          }
        }
      }
    }

    return matchesCategory && matchesSearch && matchesSubFilter;
  });

  // Cart Handlers
  const handleAddToCart = (product: Product, selectedSize?: string) => {
    const sizeToUse = selectedSize || (product.availableSizes && product.availableSizes.length > 0 ? product.availableSizes[0] : 'FREE');
    const existingIndex = cart.findIndex(item => item.product.id === product.id && (item.selectedSize || 'FREE') === sizeToUse);
    if (existingIndex > -1) {
      setCart(cart.map((item, idx) => 
        idx === existingIndex 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, { product, quantity: 1, selectedSize: sizeToUse }]);
    }
    setIsCartOpen(true);
  };

  const updateCartQuantity = (productId: string, quantity: number, selectedSize?: string) => {
    const sizeToMatch = selectedSize || 'FREE';
    if (quantity <= 0) {
      setCart(cart.filter(item => !(item.product.id === productId && (item.selectedSize || 'FREE') === sizeToMatch)));
    } else {
      setCart(cart.map(item => 
        (item.product.id === productId && (item.selectedSize || 'FREE') === sizeToMatch)
          ? { ...item, quantity } 
          : item
      ));
    }
  };

  const removeFromCart = (productId: string, selectedSize?: string) => {
    const sizeToMatch = selectedSize || 'FREE';
    setCart(cart.filter(item => !(item.product.id === productId && (item.selectedSize || 'FREE') === sizeToMatch)));
  };

  const cartTotalAmount = cart.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);

  // Image Upload helper for Checkout receipt - fixing "في التدقيق المالي يجب فتح نافذه اضافه صوره او التقاط صوره الايصال مع زر الارسال"
  const handleReceiptUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setReceiptImageBase64(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Submit Order Process
  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    if (cart.length === 0) return;
    if (!selectedBankId) {
      alert('يرجى اختيار بنك السداد المحلي لتحويل المبلغ لمصداقية الشراء');
      return;
    }
    if (!receiptImageBase64) {
      alert('يرجى التقاط أو رفع صورة إيصال التحويل البنكي كشرط أساسي لإتمام الطلب!');
      return;
    }
    if (!customerResidence.trim()) {
      alert('يرجى إدخال تفاصيل إقامتكِ وعنوان التوصيل (الشارع والحي والمنزل) لتمكين مندوب التوصيل من الوصول إليكِ!');
      return;
    }

    const validationResult = validateTransactionRef(transactionRefId);
    if (!validationResult.isValid) {
      alert(validationResult.errorMsg);
      return;
    }

    setIsSubmittingOrder(true);

    const chosenBank = database.bankAccounts.find(b => b.id === selectedBankId);
    const activeCompanies = (database.shippingSettings?.companies || database.shippingSettings?.externalCompanies || []).filter(c => c.active !== false);
    const chosenShippingComp = activeCompanies.find(c => c.id === selectedShippingCompanyId);

    const shippingCompanyName = selectedShippingCompanyId === 'express_direct' || !chosenShippingComp
      ? 'التوصيل المباشر المضمون (مناديب المنصة)'
      : chosenShippingComp.name;

    const shippingFee = selectedShippingCompanyId === 'express_direct' || !chosenShippingComp
      ? 1500
      : Number(chosenShippingComp.fee ?? chosenShippingComp.price ?? 2000);

    const finalTotalAmount = cartTotalAmount + shippingFee;
    const orderId = `order_${Date.now().toString().slice(-4)}`;

    const newOrder: Order = {
      id: orderId,
      customerId: currentUser.phone || currentUser.email,
      customerPhone: currentUser.phone,
      items: [...cart],
      totalAmount: finalTotalAmount,
      bankName: chosenBank ? chosenBank.bankName : 'بنك محلي مخصص',
      accountNumber: chosenBank ? `حساب رقم ${chosenBank.accountNumber} باسم ${chosenBank.accountHolder}` : 'غير محدد',
      receiptImage: receiptImageBase64,
      transactionRefId: transactionRefId.trim(),
      status: 'pending_payment',
      customerResidence: customerResidence.trim(),
      customerLatitude: customerLatitude,
      customerLongitude: customerLongitude,
      customerMapAddress: customerMapAddress,
      shippingCompanyId: selectedShippingCompanyId || 'express_direct',
      shippingCompanyName: shippingCompanyName,
      shippingFee: shippingFee,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      chatMessages: [
        {
          id: `msg_sys_${Date.now()}`,
          senderId: 'system',
          senderName: 'نظام المول الرقمي الآلي',
          senderRole: 'admin' as const,
          text: `🎉 مرحباً بكِ. تم تقييد طلبكِ الملكي رقم #${orderId} عبر (${shippingCompanyName}) برقم عملية/تحويل (${transactionRefId.trim()})، وعنوان التوصيل (${customerResidence.trim()}) بمحاذاة إحداثيات موقعكِ الجغرافي. وقام النظام بإرسال إشعار فوري وتنبيه للمدير والمحاسب لمراجعة إيصال التحويل وتعميده ببنك ${chosenBank?.bankName}. يمكنكِ التواصل مع المحاسب عبر شات هذا الطلب لأي استفسارات.`,
          timestamp: new Date().toISOString()
        }
      ]
    };

    const updatedOrders = [...database.orders, newOrder];

    // Generate Push notifications for vendors who own products in this cart
    const newVendorNotifications = [...(database.vendorNotifications || [])];
    cart.forEach(item => {
      if (item.product.vendorId) {
        newVendorNotifications.unshift({
          id: `notif_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
          vendorId: item.product.vendorId,
          orderId: orderId,
          title: '🛍️ طلب جديد في متجرك!',
          message: `تم استقبال طلب شراء للموديل "${item.product.name}"${item.selectedSize ? ` مقاس (${item.selectedSize})` : ''} بالكمية ${item.quantity} بقيمة ${(item.product.price * item.quantity).toLocaleString('ar-YE')} ر.ي.`,
          createdAt: new Date().toISOString(),
          read: false
        });
      }
    });

    // Log the action to the secure Admin audit trail
    logOperation(
      'customer',
      currentUser.name || 'زبونة مجهولة',
      'customer',
      'تسجيل طلب جديد ورفع إيصال سداد',
      `قامت الزبونة بتسجيل فاتورة بقيمة ${cartTotalAmount} ر.ي عبر ${chosenBank?.bankName} برقم عملية/حوالة (${transactionRefId.trim()}) وأرفقت إيصال الحوالة الفوري.`
    );

    // Save
    onSave({ 
      ...database, 
      orders: updatedOrders,
      vendorNotifications: newVendorNotifications
    });
    
    // Clear and redirect
    setCart([]);
    setShowCheckout(false);
    setSelectedBankId('');
    setReceiptImageBase64('');
    setTransactionRefId('');
    setCustomerResidence('');
    setIsSubmittingOrder(false);
    setActiveTrackingOrderId(orderId);

    // SMS/Push notification simulation alerts directly to the designated number requested by user 780044700!
    alert(`📢 نظام التنبيهات الذكي: تم إرسال إشعار فوري (Push SMS) ومسج للرقم 780044700 لتنبيه المدير العام والمحاسب بوجود طلب حوالة جديد رقم #${orderId} لتسريع الشحن.`);
  };

  // Submit Review - Dual Review Modal after receiving and confirming packet matching
  const handleConfirmOrderDeliveryAndReview = (orderId: string) => {
    // Open Double review popup
    setProductRating(5);
    setVendorRating(5);
    setStoreRating(5);
    setReviewComment('');
    setShowReviewPopup(orderId);
  };

  const handlePostReviewAndSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!showReviewPopup) return;

    const orderId = showReviewPopup;

    const updatedOrders = database.orders.map(o => {
      if (o.id === orderId) {
        logOperation(
          'customer',
          currentUser.name || 'زبونة مجهولة',
          'customer',
          'تأكيد استلاف الطرد ومطابقة الجودة وتقييم التاجرة',
          `أكدت الزبونة مطابقة الطرد للطلب #${orderId}، ومنحت المنتج تقييم ${productRating} نجوم، والمتجر العام ${storeRating} نجوم.`
        );

        if (productRating < 3 || storeRating < 3) {
          logOperation(
            'system',
            'مراقب الجودة الآلي',
            'admin',
            '⚠️ تنبيه جودة منخفضة لمنظومة التقييمات',
            `هناك مراجعة دون المعتاد (أقل من 3 نجوم) على الطلب #${orderId}. تم إشعار المدير العام لتقييم أداء التاجرة المسلية.`
          );
        }

        return {
          ...o,
          status: 'completed' as const,
          updatedAt: new Date().toISOString(),
          chatMessages: [
            ...o.chatMessages,
            {
              id: `msg_sys_rev_${Date.now()}`,
              senderId: 'system',
              senderName: 'نظام التقييم الآلي',
              senderRole: 'admin' as const,
              text: `🌟 شكراً لكِ لمشاركتنا آرائكِ القيمة! تم نقل الطلب إلى سجلات "تم التوصيل والمطابقة" بنجاح، وتحرير عمولات التاجرات فوراً لمحافظهن القابلة للسحب المالي.`,
              timestamp: new Date().toISOString()
            }
          ],
          reviews: {
            productRating,
            vendorRating,
            storeRating,
            comment: reviewComment
          }
        };
      }
      return o;
    });

    const targetOrder = database.orders.find(o => o.id === orderId);
    const newProductReviews = [...(database.productReviews || [])];
    if (targetOrder) {
      (targetOrder.items || []).forEach(item => {
        // Prevent duplicate reviews for same order item if any
        if (!newProductReviews.some(r => r.id === `rev_order_${orderId}_${item.product.id}`)) {
          newProductReviews.push({
            id: `rev_order_${orderId}_${item.product.id}`,
            productId: item.product.id,
            customerId: currentUser.phone || currentUser.email,
            customerName: currentUser.name || 'زبونة مجهولة',
            customerPhone: currentUser.phone,
            rating: productRating,
            comment: reviewComment,
            createdAt: new Date().toISOString()
          });
        }
      });
    }

    onSave({ ...database, orders: updatedOrders, productReviews: newProductReviews });
    setShowReviewPopup(null);
    if (activeTrackingOrderId === orderId) {
      setActiveTrackingOrderId(null);
    }
    alert('شكراً لكِ! تم تحرير عمولة التاجرة ونقلها لمحفظتها الجاهزة للسحب، وتعميم تعليقكِ لخدمات الجودة.');
  };

  const handleAddProductReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    if (!newComment.trim()) return;

    const newReview = {
      id: `rev_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      productId: selectedProduct.id,
      customerId: currentUser.phone || currentUser.email,
      customerName: currentUser.name || 'زبونة مجهولة',
      customerPhone: currentUser.phone,
      rating: newRating,
      comment: newComment,
      createdAt: new Date().toISOString()
    };

    const updatedReviews = [
      ...(database.productReviews || []),
      newReview
    ];

    logOperation(
      'customer',
      currentUser.name || 'زبونة مجهولة',
      'customer',
      'إضافة تقييم منتج',
      `أضافت الزبونة تقييماً ${newRating} نجوم للمنتج: ${selectedProduct.name}`
    );

    onSave({
      ...database,
      productReviews: updatedReviews
    });

    setNewComment('');
    setNewRating(5);
    setReviewSuccess(true);
    setTimeout(() => setReviewSuccess(false), 3000);
  };

  // Client Chat stream handlers
  const handleSendClientChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!activeTrackingOrderId) return;
    if (!customerChatMessage.trim() && !customerChatImage) return;

    const newMsg: ChatMessage = {
      id: `msg_cust_${Date.now()}`,
      senderId: currentUser.phone,
      senderName: currentUser.name || 'الزبون الأنيق',
      senderRole: 'customer',
      text: customerChatMessage,
      imageAttachment: customerChatImage || undefined,
      timestamp: new Date().toISOString()
    };

    const updatedOrders = database.orders.map(o => {
      if (o.id === activeTrackingOrderId) {
        return {
          ...o,
          chatMessages: [...o.chatMessages, newMsg]
        };
      }
      return o;
    });

    onSave({ ...database, orders: updatedOrders });
    setCustomerChatMessage('');
    setCustomerChatImage('');
  };

  const handleCustomerChatImageAttach = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCustomerChatImage(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const myOrders = database.orders.filter(o => o.customerId === currentUser.phone || o.customerId === currentUser.email);
  const activeTrackingOrder = database.orders.find(o => o.id === activeTrackingOrderId);

  return (
    <div className="flex flex-col gap-6 font-sans">
      
      {/* CUSTOMER TOP SHORTCUTS TOOLBAR */}
      <div className="bg-[#1C1C1D] border border-stone-800 rounded-2xl p-3.5 flex flex-wrap items-center justify-between gap-3 shadow-lg">
        {/* Search Input Shortcut */}
        <div className="relative flex-1 min-w-[220px]">
          <Search size={16} className="absolute top-3 right-3 text-stone-400" />
          <input
            type="text"
            placeholder="ابحثي عن العباية، الفستان، الشال، أو التاجرة..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-stone-900 border border-stone-800 focus:border-[#D4AF37] text-white text-xs py-2.5 pr-9 pl-3 rounded-xl transition-all"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute top-2.5 left-2.5 text-stone-500 hover:text-white text-xs font-bold px-1"
            >
              ✕
            </button>
          )}
        </div>

        {/* Action Shortcuts */}
        <div className="flex items-center gap-2.5">
          {/* Cart Shortcut Button */}
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-[#D4AF37] text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <ShoppingCart size={16} className="text-[#D4AF37]" />
            <span className="hidden sm:inline">السلة الشرائية</span>
            {cart.length > 0 && (
              <span className="bg-[#D4AF37] text-black text-[10px] font-black px-1.5 py-0.2 rounded-full">
                {cart.reduce((s, i) => s + i.quantity, 0)}
              </span>
            )}
          </button>

          {/* Tracking Orders Shortcut */}
          {myOrders.length > 0 && (
            <button
              onClick={() => {
                const latestOrder = myOrders[0];
                if (latestOrder) setActiveTrackingOrderId(latestOrder.id);
              }}
              className="bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-[#D4AF37] text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
            >
              <ShoppingBag size={16} className="text-pink-400" />
              <span className="hidden sm:inline">طلباتي ({myOrders.length})</span>
            </button>
          )}

          {/* User Profile Shortcut */}
          <button
            onClick={() => {
              setActiveProfileTab('info');
              setShowProfileModal(true);
            }}
            className="bg-stone-900 hover:bg-stone-850 border border-stone-800 hover:border-[#D4AF37] text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer"
          >
            <User size={16} className="text-[#D4AF37]" />
            <span className="hidden sm:inline">الملف الشخصي</span>
          </button>

          {/* Become Vendor Shortcut */}
          <button
            onClick={() => {
              setActiveProfileTab('activateStore');
              setShowProfileModal(true);
            }}
            className="bg-gradient-to-r from-purple-950/40 to-pink-950/40 hover:from-purple-900/50 border border-purple-500/30 text-purple-200 px-3 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <Sparkles size={14} className="text-purple-400" />
            <span>تفعيل متجر تاجر</span>
          </button>
        </div>
      </div>

      {/* 1. ADVERTISING BANNER ROW - Managed dynamically */}
      <div className="overflow-hidden rounded-2xl relative bg-stone-950 border border-stone-850 p-1">
        <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-none gap-4 p-1">
          {database.banners.filter(b => b.active).map(b => (
            <div 
              key={b.id} 
              className="flex-shrink-0 w-full snap-start relative h-48 md:h-64 rounded-xl overflow-hidden flex items-center justify-center p-3"
            >
              <img src={b.image} className="absolute inset-0 w-full h-full object-cover opacity-60" alt={b.title} />
              <div className="relative z-10 text-center max-w-lg p-4 bg-black/40 backdrop-blur-sm rounded-2xl border border-stone-800">
                <span className="text-[10px] text-[#D4AF37] tracking-widest uppercase font-extrabold flex items-center justify-center gap-1.5 mb-1.5">
                  <Sparkles size={12} /> {b.title}
                </span>
                <h3 className="text-sm md:text-xl font-black text-white">{b.subtitle}</h3>
                {b.productId && (
                  <button
                    onClick={() => {
                      const target = database.products.find(p => p.id === b.productId);
                      if (target) {
                        setSelectedProduct(target);
                        setActiveImgIndex(0);
                      }
                    }}
                    className="mt-3 bg-[#D4AF37] text-neutral-950 hover:bg-amber-400 text-[10px] font-black px-4 py-1.5 rounded-full transition-colors cursor-pointer"
                  >
                    تسوقي هذا الموديل الآن
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. CATEGORIES FILTER GRIDS - Arabized with luxury icons */}
      <div className="space-y-3">
        <h3 className="text-xs font-black text-stone-400 uppercase tracking-wider">تصفية أقسام المول الرقمي الفاخر:</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          
          <button
            onClick={() => handleCategoryChange('all')}
            className={`p-3 rounded-xl border text-xs text-center flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
              activeCategory === 'all' 
                ? 'bg-gradient-to-tr from-[#352B2E] to-stone-900 border-[#D4AF37] text-[#D4AF37] font-bold shadow-md shadow-neutral-900' 
                : 'bg-stone-900 border-stone-850 text-stone-300 hover:border-pink-900'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-stone-950 flex items-center justify-center text-[#D4AF37] font-black border border-stone-800 font-display">M</div>
            <span>كل المعروضات الملكية</span>
          </button>

          {database.categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.id)}
              className={`p-3 rounded-xl border text-xs text-center flex flex-col items-center justify-center gap-2 transition-all cursor-pointer ${
                activeCategory === cat.id 
                  ? 'bg-gradient-to-tr from-[#352B2E] to-stone-900 border-[#D4AF37] text-[#D4AF37] font-bold shadow shadow-neutral-900' 
                  : 'bg-stone-900 border-stone-850 text-stone-300 hover:border-pink-900'
              }`}
            >
              <img src={cat.image} className="w-10 h-10 object-contain rounded bg-stone-950 p-1 border border-stone-850" alt="icon" />
              <span>{cat.name_ar || cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* 2.5 STORES & DESIGNERS SHOWCASE BAR WITH FOLLOW BUTTON & FOLLOWERS COUNT */}
      {(() => {
        const approvedVendors = database.users.filter(u => u.role === 'vendor' && u.isApproved !== false);
        if (approvedVendors.length === 0) return null;

        return (
          <div className="space-y-3 bg-[#1C1C1D] border border-stone-800 rounded-2xl p-4">
            {/* Top Official App Management Social Media Links Bar */}
            <div className="bg-stone-950 p-2.5 rounded-xl border border-stone-850 flex flex-wrap items-center justify-between gap-2 text-right" dir="rtl">
              <div className="flex items-center gap-1.5">
                <Sparkles size={14} className="text-[#D4AF37]" />
                <span className="text-[11px] font-black text-amber-200">
                  قنوات الدعم والتواصل المباشر مع إدارة المول الرقمي Digital Mall:
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                {database.socialLinks.whatsapp && (
                  <a
                    href={database.socialLinks.whatsapp}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366]/30 border border-[#25D366]/40 text-[#25D366] font-extrabold text-[10px] flex items-center gap-1 transition-all"
                    title="تواصل واتساب مباشر مع إدارة المول"
                  >
                    <Phone size={12} />
                    <span>واتساب الإدارة</span>
                  </a>
                )}
                {database.socialLinks.instagram && (
                  <a
                    href={database.socialLinks.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-[#E1306C]/20 hover:bg-[#E1306C]/30 border border-[#E1306C]/40 text-[#E1306C] font-extrabold text-[10px] flex items-center gap-1 transition-all"
                    title="انستقرام المول الرسمي"
                  >
                    <Instagram size={12} />
                    <span>انستقرام المول</span>
                  </a>
                )}
                {database.socialLinks.facebook && (
                  <a
                    href={database.socialLinks.facebook}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-[#1877F2]/20 hover:bg-[#1877F2]/30 border border-[#1877F2]/40 text-[#1877F2] font-extrabold text-[10px] flex items-center gap-1 transition-all"
                    title="فيسبوك المول الرسمي"
                  >
                    <Facebook size={12} />
                    <span>فيسبوك</span>
                  </a>
                )}
                {database.socialLinks.telegram && (
                  <a
                    href={database.socialLinks.telegram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-[#0088cc]/20 hover:bg-[#0088cc]/30 border border-[#0088cc]/40 text-[#0088cc] font-extrabold text-[10px] flex items-center gap-1 transition-all"
                    title="قناة التلجرام الرسمية للمول"
                  >
                    <Share2 size={12} />
                    <span>تلجرام</span>
                  </a>
                )}
                {database.socialLinks.tiktok && (
                  <a
                    href={database.socialLinks.tiktok}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-2.5 py-1 rounded-lg bg-cyan-950 hover:bg-cyan-900 border border-cyan-800 text-cyan-400 font-extrabold text-[10px] flex items-center gap-1 transition-all"
                    title="حساب تيك توك المول"
                  >
                    <span>تيك توك</span>
                  </a>
                )}
                {database.socialLinks.phone && (
                  <a
                    href={`tel:${database.socialLinks.phone}`}
                    className="px-2.5 py-1 rounded-lg bg-amber-950/80 hover:bg-amber-900 border border-amber-800 text-amber-300 font-extrabold text-[10px] flex items-center gap-1 transition-all"
                    title="اتصال هاتفي مباشر بالإدارة"
                  >
                    <PhoneCall size={12} />
                    <span>اتصال</span>
                  </a>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between flex-row-reverse" dir="rtl">
              <div className="flex items-center gap-2">
                <Store size={18} className="text-[#D4AF37]" />
                <h3 className="text-xs font-black text-white">متاجر التاجرات والشركاء المعتمدين بالمول:</h3>
              </div>
              <span className="text-[10px] text-stone-400">تابعِي متجركِ المفضل ليصلكِ أحدث التصاميم فوراً</span>
            </div>

            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-stone-800" dir="rtl">
              {approvedVendors.map(v => {
                const currentUserId = currentUser.id || currentUser.phone || currentUser.email;
                const followersList = v.followedByUserIds || [];
                const isFollowing = currentUserId ? followersList.includes(currentUserId) : false;
                const count = v.followersCount || followersList.length || 0;
                const vendorProductsCount = database.products.filter(p => p.vendorId === v.id || p.vendorId === v.phone).length;
                const isPrivacyHidden = !!v.hidePrivateContact;

                return (
                  <div 
                    key={v.id} 
                    className="shrink-0 bg-stone-900 border border-stone-800 hover:border-[#D4AF37]/60 rounded-xl p-3 w-52 flex flex-col justify-between space-y-2 transition-all shadow-sm"
                  >
                    <div className="flex items-center gap-2.5">
                      {v.logoImage ? (
                        <img src={v.logoImage} className="w-10 h-10 rounded-lg object-cover border border-[#D4AF37] shrink-0" alt={v.name} />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-pink-950/80 border border-pink-800 text-[#F8C8DC] flex items-center justify-center font-bold text-sm shrink-0">
                          🏪
                        </div>
                      )}
                      <div className="overflow-hidden text-right">
                        <div className="flex items-center gap-1">
                          <h4 className="font-extrabold text-xs text-white truncate">{v.name}</h4>
                          {v.isVerified && <span className="text-[#D4AF37] text-[10px]" title="متجر موثق بالكامل">★</span>}
                        </div>
                        {isPrivacyHidden ? (
                          <p className="text-[9px] text-purple-300 font-semibold truncate" title="بيانات الاتصال والاسم الشخصي محمية من الإدارة">
                            🔒 الهوية محمية
                          </p>
                        ) : (
                          <p className="text-[9px] text-stone-400 truncate">{v.fullName || 'تاجر شريك'}</p>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center text-[10px] text-stone-400 border-t border-stone-850 pt-2" dir="rtl">
                      <span className="font-bold text-purple-300">👥 {count} متابع</span>
                      <span className="text-stone-500 font-mono">{vendorProductsCount} موديل</span>
                    </div>

                    <button
                      onClick={() => handleToggleFollowVendor(v.id)}
                      className={`w-full py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer flex items-center justify-center gap-1 ${
                        isFollowing 
                          ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/80 hover:bg-emerald-900' 
                          : 'bg-pink-950/60 hover:bg-pink-900 text-pink-200 border border-pink-800/80'
                      }`}
                    >
                      {isFollowing ? (
                        <>
                          <Check size={12} />
                          <span>مُتَابَع</span>
                        </>
                      ) : (
                        <>
                          <UserPlus size={12} />
                          <span>متابعة المتجر</span>
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })()}

      {/* Dynamic Sub-Navigation, Picks for You, and Sub-Categories for Selected Category */}
      {activeCategory !== 'all' && (() => {
        const selectedCat = database.categories.find(c => c.id === activeCategory);
        if (!selectedCat) return null;

        return (
          <div className="bg-[#1A1A1A] border border-stone-800 rounded-2xl p-5 space-y-5 animate-fadeIn">
            
            {/* Header displaying Arabic and English name */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-stone-850 pb-3">
              <div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse"></span>
                  <h4 className="text-sm font-black text-white">{selectedCat.name_ar || selectedCat.name}</h4>
                  <span className="text-[10px] text-stone-500 font-mono">({selectedCat.name_en})</span>
                </div>
                <p className="text-[10px] text-stone-400 mt-0.5">تصفحي المنتجات المتنوعة والترشيحات الحصرية في هذا القسم الملكي</p>
              </div>
              
              {/* Reset Sub-filters button */}
              {(selectedSubCategory || selectedNavigationTag || selectedSubCategoryLeaf) && (
                <button
                  onClick={() => {
                    setSelectedSubCategory(null);
                    setSelectedSubCategoryLeaf(null);
                    setSelectedNavigationTag(null);
                  }}
                  className="text-[10px] text-[#D4AF37] border border-[#D4AF37]/30 hover:border-[#D4AF37] bg-stone-900 px-3 py-1 rounded-lg transition-colors cursor-pointer"
                >
                  إعادة تصفية القسم ✕
                </button>
              )}
            </div>

            {/* Render Navigation Menu tags if available */}
            {selectedCat.navigation_menu && selectedCat.navigation_menu.length > 0 && (
              <div className="space-y-2">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">قائمة التصفح السريع / الأوسمة:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCat.navigation_menu.map((menuItem, idx) => {
                    const isSelected = selectedNavigationTag === menuItem;
                    return (
                      <button
                        key={idx}
                        onClick={() => {
                          setSelectedNavigationTag(isSelected ? null : menuItem);
                          setSelectedSubCategory(null); // Clear subcategory to avoid empty states
                        }}
                        className={`text-[10px] px-3 py-1.5 rounded-full transition-all cursor-pointer border ${
                          isSelected 
                            ? 'bg-[#D4AF37] text-neutral-950 font-black border-[#D4AF37] shadow-sm' 
                            : 'bg-stone-900 text-stone-300 border-stone-850 hover:border-stone-700'
                        }`}
                      >
                        {menuItem}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Render Sub Categories if available (like in Devices & Cars, or Pets) */}
            {selectedCat.sub_categories && Object.keys(selectedCat.sub_categories).length > 0 && (
              <div className="space-y-3">
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest block">الأقسام الفرعية التخصصية الفاخرة:</span>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {Object.entries(selectedCat.sub_categories).map(([subKey, subItems]) => {
                    const isSelectedKey = selectedSubCategory === subKey;
                    const subLabelAr = 
                      subKey === 'car_accessories' ? 'إكسسوارات ومقاعد السيارات' :
                      subKey === 'car_tech' ? 'إلكترونيات وعناية السيارات' :
                      subKey === 'car_repair' ? 'أدوات الصيانة ومضخات الهواء' :
                      subKey === 'smart_devices' ? 'أجهزة المنزل الذكية والمطبخ' :
                      subKey === 'basic_categories' ? 'ملابس ومستلزمات الحيوانات الأساسية' :
                      subKey === 'small_animals_birds' ? 'أقفاص ورعاية الطيور والحيوانات الصغيرة' : subKey;

                    // Fetch custom high-end SVG illustration for the sub-category
                    const subIcon = SUB_CATEGORY_ICONS[subKey] || `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="%231E1E1E"/><rect x="5" y="5" width="90" height="90" rx="12" stroke="%23D4AF37" stroke-width="1.5" stroke-dasharray="4 2"/><path d="M50 25 L35 45 h30 Z" fill="%23F8C8DC" opacity="0.8"/><circle cx="50" cy="55" r="10" stroke="%23D4AF37" stroke-width="1.5"/><text x="50" y="93" fill="%23D4AF37" font-size="8" font-family="sans-serif" font-weight="bold" text-anchor="middle">ملابس</text></svg>`;

                    return (
                      <div 
                        key={subKey} 
                        className={`p-3.5 rounded-xl border transition-all flex gap-3 ${
                          isSelectedKey 
                            ? 'bg-gradient-to-l from-[#2A2023] to-[#161617] border-[#D4AF37]' 
                            : 'bg-[#141415] border-stone-850 hover:border-stone-700'
                        }`}
                      >
                        {/* Sub-category specific illustration / icon */}
                        <div className="w-14 h-14 rounded-lg bg-stone-950 flex-shrink-0 overflow-hidden border border-stone-800 flex items-center justify-center">
                          <img src={subIcon} alt={subLabelAr} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                        </div>

                        <div className="flex-1 text-right">
                          <div className="flex justify-between items-center mb-2.5">
                            <span className="text-xs font-extrabold text-[#F8C8DC]">{subLabelAr}</span>
                            <button
                              onClick={() => {
                                setSelectedSubCategory(isSelectedKey ? null : subKey);
                                setSelectedSubCategoryLeaf(null); // Reset leaf when category toggled
                                setSelectedNavigationTag(null); // Clear tag filter
                              }}
                              className={`text-[9px] px-2 py-0.5 rounded transition-colors ${
                                isSelectedKey 
                                  ? 'bg-[#D4AF37] text-neutral-950 font-bold' 
                                  : 'bg-stone-900 text-stone-450 hover:text-white hover:bg-stone-850 border border-stone-800'
                              }`}
                            >
                              {isSelectedKey ? 'الكل ✕' : 'تحديد'}
                            </button>
                          </div>
                          
                          <div className="flex flex-wrap gap-1">
                            {(Array.isArray(subItems) ? subItems : []).map((item, i) => {
                              const isLeafSelected = selectedSubCategory === subKey && selectedSubCategoryLeaf === item;
                              return (
                                <button 
                                  key={i} 
                                  onClick={() => {
                                    setSelectedSubCategory(subKey);
                                    setSelectedSubCategoryLeaf(isLeafSelected ? null : item);
                                    setSelectedNavigationTag(null);
                                  }}
                                  className={`text-[9px] px-2 py-1 rounded-md border transition-all text-right cursor-pointer ${
                                    isLeafSelected
                                      ? 'bg-amber-950/45 border-[#D4AF37] text-[#D4AF37] font-bold shadow-inner'
                                      : 'bg-stone-950 border-stone-850/70 text-stone-300 hover:border-stone-700 hover:text-white'
                                  }`}
                                >
                                  {item}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Picks For You Section */}
            {selectedCat.picks_for_you && selectedCat.picks_for_you.length > 0 && (
              <div className="border-t border-stone-850 pt-4 space-y-2">
                <div className="flex items-center gap-1.5 text-[10px] font-bold text-amber-400 uppercase tracking-widest">
                  <Sparkles size={12} className="text-amber-500 animate-pulse" />
                  <span>ترشيحات وتشكيلات منسقة خصيصاً لكِ (Picks for You):</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCat.picks_for_you.map((pick, idx) => (
                    <span 
                      key={idx} 
                      className="text-[9px] bg-amber-950/20 text-amber-400 border border-amber-900/40 px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1"
                    >
                      <Star size={8} fill="currentColor" /> {pick}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* May Also Like Section */}
            {selectedCat.may_also_like && selectedCat.may_also_like.length > 0 && (
              <div className="border-t border-stone-850 pt-3 space-y-1.5">
                <span className="text-[9px] font-bold text-stone-500 uppercase tracking-widest block">قد يعجبكِ أيضاً في المعرض المترابط:</span>
                <div className="flex flex-wrap gap-1.5">
                  {selectedCat.may_also_like.map((item, idx) => (
                    <span 
                      key={idx} 
                      className="text-[9px] bg-stone-950 text-stone-300 border border-stone-850 px-2.5 py-1 rounded-md"
                    >
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>
        );
      })()}

      {/* 3. PRODUCT CATALOG PORT - Luxury Minimalist black cards */}
      <div className="space-y-4">
        
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h3 className="text-xl font-bold text-[#D4AF37]">المول الرقمي المتكامل</h3>
            <p className="text-[11px] text-stone-450">تسوق أحدث صيحات الشالات والعبايات المخيطة بعناية يملؤها الحب</p>
          </div>

          {/* Search bar */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute top-2.5 right-3 text-stone-500" size={16} />
            <input
              type="text"
              placeholder="ابحثي عن موديل أو وشاح..."
              className="w-full bg-stone-900 border border-stone-850 focus:border-[#D4AF37] text-xs py-2 pr-10 pl-3 rounded-xl text-white placeholder-stone-500 focus:outline-none"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {filteredProducts.length === 0 ? (
          <div className="bg-stone-900 border border-stone-850 rounded-xl p-12 text-center text-stone-500 text-xs">
            عذراً، لم نعثر على نتائج مطابقة لبحثكِ حالياً
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {filteredProducts.map(prod => (
              <div 
                key={prod.id} 
                className="bg-stone-900 border border-stone-850 rounded-2xl overflow-hidden shadow hover:shadow-stone-900 text-right transition-all transform hover:-translate-y-0.5 flex flex-col justify-between group"
              >
                
                {/* Product image showing - completely fixed! */}
                <div 
                  onClick={() => {
                    setSelectedProduct(prod);
                    setActiveImgIndex(0);
                  }}
                  className="relative p-2.5 bg-stone-950 flex items-center justify-center cursor-pointer min-h-[140px]"
                >
                  <img src={prod.image} alt={prod.name} className="w-full h-36 object-contain rounded-xl duration-300 group-hover:scale-105" />
                  {prod.vendorId && (() => {
                    const vendorObj = database.users.find(u => u.id === prod.vendorId || u.phone === prod.vendorId);
                    const vendorName = vendorObj ? (vendorObj.name || vendorObj.fullName || 'تاجرة شريكة') : 'تاجرة شريكة';
                    const isVendorVerified = vendorObj ? !!vendorObj.isVerified : false;
                    return (
                      <span className="absolute top-3 right-3 bg-pink-900/85 text-white border border-pink-700/80 text-[8px] px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                        <span>تصميم: {vendorName}</span>
                        {isVendorVerified && (
                          <span className="text-yellow-400 font-extrabold text-[9px]" title="متجر موثق ومطابق للجودة">★</span>
                        )}
                      </span>
                    );
                  })()}
                </div>

                <div className="p-4 flex-1 flex flex-col justify-between">
                  <div className="cursor-pointer" onClick={() => {
                    setSelectedProduct(prod);
                    setActiveImgIndex(0);
                  }}>
                    <h4 className="font-extrabold text-stone-100 text-xs line-clamp-1 group-hover:text-amber-500 transition-colors">{prod.name}</h4>
                    <p className="text-[10px] text-stone-500 line-clamp-2 mt-1 min-h-[30px] leading-relaxed">{prod.description}</p>
                  </div>

                  <div className="mt-4 border-t border-stone-850 pt-3 flex items-center justify-between">
                    <div>
                      <span className="text-[9px] text-[#D4AF37] font-semibold block">سعر المستهلك الموحد:</span>
                      <span className="text-sm font-black text-white">{prod.price} <span className="text-[10px] text-stone-400">ريال يمني</span></span>
                    </div>

                    <button
                      onClick={() => handleAddToCart(prod)}
                      className="bg-[#D4AF37] hover:bg-amber-500 text-stone-950 p-2 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-1"
                      title="إدراج بالسلة"
                    >
                      <Plus size={14} />
                      <ShoppingCart size={13} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* --- FLOATING TRIGGER TO THE SHOPPING CART (Only displays if customer has elements) --- */}
      {cart.length > 0 && (
        <button
          onClick={() => setIsCartOpen(true)}
          className="fixed bottom-20 left-6 z-40 bg-gradient-to-r from-[#D4AF37] to-amber-500 text-stone-950 font-black p-4 rounded-full shadow-lg shadow-black hover:scale-105 transition-all flex items-center gap-2 cursor-pointer border border-[#D4AF37]"
        >
          <ShoppingCart size={18} />
          <span className="text-xs">سلتك الراقية ({cart.reduce((sum, i) => sum + i.quantity, 0)})</span>
        </button>
      )}

      {/* --- FLOATING TRACKING CHECKS BAR --- */}
      {myOrders.length > 0 && (
        <div className="py-4 px-5 bg-stone-900 border border-stone-800 rounded-xl flex items-center justify-between">
          <div>
            <span className="text-xs text-stone-450 block">لديك {myOrders.length} طلب سداد وتتبع نشط:</span>
            <span className="text-[11px] text-white">تأكدي من متابعة شات المحاسب المالي لتمرير مشترياتك.</span>
          </div>

          <div className="flex gap-2">
            <select
              onChange={(e) => setActiveTrackingOrderId(e.target.value)}
              className="bg-stone-950 border border-stone-800 rounded px-2.5 py-1 text-xs text-[#D4AF37] font-bold"
              value={activeTrackingOrderId || ''}
            >
              <option value="">-- تتبع فواتيركِ --</option>
              {myOrders.map(o => (
                <option key={o.id} value={o.id}>فاتورة #{o.id} ({o.status === 'completed' ? 'تَمَّ' : o.status === 'shipped' ? 'مشحون' : 'قيد المراجعة'})</option>
              ))}
            </select>
          </div>
        </div>
      )}

      {/* --- CHUCK: ACTIVE ORDER TRACKING INDICATION CARD WITH SUPPORT PER-ORDER CHAT --- */}
      {activeTrackingOrder && (
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 space-y-6">
          <div className="flex justify-between items-center border-b border-stone-800 pb-3">
            <div>
              <span className="text-[10px] bg-pink-950 text-[#F8C8DC] border border-pink-900 px-2.5 py-0.5 rounded-full font-bold">تتبع الفاتورة الفورية</span>
              <h3 className="font-extrabold text-[#D4AF37] text-md mt-1.5">طلب رقم #{activeTrackingOrder.id}</h3>
            </div>

            <button 
              onClick={() => setActiveTrackingOrderId(null)}
              className="text-stone-450 text-xs hover:text-white"
            >
              إخفاء تتبع الطلب ✕
            </button>
          </div>

          {/* Stepper Indication Graphics */}
          <div className="grid grid-cols-4 gap-2 text-center text-[10px] sm:text-xs">
            {[
              { label: 'بانتظار السداد', active: true, done: activeTrackingOrder.status !== 'pending_payment' },
              { label: 'تعميد الحساب', active: activeTrackingOrder.status !== 'pending_payment', done: activeTrackingOrder.status === 'processing' || activeTrackingOrder.status === 'shipped' || activeTrackingOrder.status === 'completed' },
              { label: 'قيد التوصيل الشحن', active: activeTrackingOrder.status === 'shipped' || activeTrackingOrder.status === 'completed', done: activeTrackingOrder.status === 'completed' },
              { label: 'استلم ومطابقته', active: activeTrackingOrder.status === 'completed', done: activeTrackingOrder.status === 'completed' }
            ].map((step, idx) => (
              <div key={idx} className="flex flex-col items-center gap-1.5">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold border transition-colors ${
                  step.done ? 'bg-emerald-950 border-emerald-500 text-emerald-400' :
                  step.active ? 'bg-amber-950 border-amber-500 text-amber-400 font-extrabold scale-105' : 'bg-stone-950 border-stone-800 text-stone-600'
                }`}>
                  {idx + 1}
                </div>
                <span className={step.active ? 'font-bold text-white' : 'text-stone-450'}>{step.label}</span>
              </div>
            ))}
          </div>

          <div className="bg-stone-950 p-4 rounded-xl border border-stone-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <div>
              <span className="text-[10px] text-stone-500 block uppercase">بنك التحويل المالي المستخدم:</span>
              <span className="font-bold text-[#D4AF37] text-xs leading-loose">{activeTrackingOrder.bankName}</span>
              <span className="text-[11px] text-stone-400 block mt-1 select-all">{activeTrackingOrder.accountNumber}</span>
            </div>

            {/* Confirm matching receiver action button */}
            {activeTrackingOrder.status === 'shipped' ? (
              <button
                onClick={() => handleConfirmOrderDeliveryAndReview(activeTrackingOrder.id)}
                className="bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs px-6 py-3 rounded-xl flex items-center gap-1.5 animate-bounce shadow-md cursor-pointer"
              >
                <CheckCircle size={16} />
                <span>تأكيد استلام المنتج ومطابقته (التقييم الفوري)</span>
              </button>
            ) : activeTrackingOrder.status === 'completed' ? (
              <span className="bg-emerald-950 text-emerald-400 border border-emerald-900 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1">
                <CheckCircle size={14} /> تم استلام وحيازة المنتج ومطابقته بالكامل
              </span>
            ) : (
              <div className="bg-amber-950/40 text-amber-400 border border-amber-900/40 text-xs p-3 rounded-lg leading-relaxed max-w-sm">
                💡 بانتظار قيام المحاسب المالي باعتماد التحويل للمباشرة بتجهيز الطاقم وتسليمه للشاحن المحلي.
              </div>
            )}
          </div>

          {/* Delivery Location Summary Card */}
          <div className="bg-stone-950/60 p-4 rounded-xl border border-stone-850/80 grid grid-cols-1 md:grid-cols-2 gap-4 text-right" dir="rtl">
            <div>
              <span className="text-[10px] text-stone-400 block font-bold mb-1">📍 عنوان إقامة التوصيل الفعلي للطلب:</span>
              <span className="text-xs text-white leading-relaxed font-semibold block">{activeTrackingOrder.customerResidence || 'لم يتم تحديده'}</span>
            </div>
            <div>
              <span className="text-[10px] text-stone-400 block font-bold mb-1">🌐 الموقع الجغرافي على الخريطة:</span>
              <span className="text-xs text-[#D4AF37] font-mono block">
                {activeTrackingOrder.customerLatitude && activeTrackingOrder.customerLongitude ? (
                  `Lat: ${activeTrackingOrder.customerLatitude.toFixed(4)}° N | Lng: ${activeTrackingOrder.customerLongitude.toFixed(4)}° E`
                ) : 'غير متوفر'}
              </span>
              <span className="text-[10px] text-stone-500 block mt-1 leading-snug">{activeTrackingOrder.customerMapAddress || 'لم يحدد موقع من الخريطة'}</span>
            </div>
          </div>

          {/* PER-ORDER CHAT CHANNEL - matching exact requirements */}
          <div className="border border-stone-800 rounded-xl overflow-hidden">
            <div className="bg-[#2D2225] py-2.5 px-4 flex justify-between items-center">
              <span className="font-bold text-[#F8C8DC] text-xs flex items-center gap-1">
                <MessageCircle size={14} /> شات التحقق المالي تتبع اللوجستيات للطلب
              </span>
              <span className="text-[10px] text-stone-400">تواصل مباشر لتقديم استفسارات التوصيل</span>
            </div>

            <div className="h-56 overflow-y-auto bg-stone-950 p-4 space-y-2 flex flex-col justify-end">
              {(activeTrackingOrder.chatMessages || []).map(msg => {
                const isMe = msg.senderId === currentUser.phone;
                return (
                  <div 
                    key={msg.id}
                    className={`max-w-[85%] rounded-xl p-2.5 text-xs ${
                      isMe ? 'bg-gradient-to-l from-stone-850 to-stone-900 text-white mr-auto' : 'bg-stone-900 text-stone-300 ml-auto'
                    }`}
                  >
                    <div className="flex justify-between gap-4 mb-1">
                      <span className="font-bold text-[9px] text-[#D4AF37]">{isMe ? 'أنتِ' : msg.senderName}</span>
                      <span className="text-[8px] text-stone-500">{new Date(msg.timestamp).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })}</span>
                    </div>
                    <p className="whitespace-pre-wrap">{msg.text}</p>
                    {msg.imageAttachment && (
                      <img src={msg.imageAttachment} className="max-h-24 rounded mt-1 opacity-90 hover:opacity-100 transition-all border border-stone-800" alt="inline attachment" />
                    )}
                  </div>
                );
              })}
            </div>

            <form onSubmit={handleSendClientChatMessage} className="p-3 bg-stone-900 border-t border-stone-850 flex items-center gap-2">
              <input
                type="text"
                placeholder="أرسلي رسالة أو استفسار أو صورت إيصال إضافية للمحاسب..."
                className="flex-1 bg-stone-950 border border-stone-800 rounded-lg text-xs px-3 py-1.5 text-white placeholder-stone-600 focus:outline-none focus:border-pink-900"
                value={customerChatMessage}
                onChange={e => setCustomerChatMessage(e.target.value)}
              />
              <label className="p-1.5 bg-stone-800 hover:bg-stone-750 text-stone-200 rounded cursor-pointer" title="أشفق ملف">
                <ImageIcon size={14} />
                <input type="file" accept="image/*" className="hidden" onChange={handleCustomerChatImageAttach} />
              </label>

              {customerChatImage && <span className="text-[10px] text-green-400 bg-stone-950 p-1.5 rounded">مرفق</span>}

              <button type="submit" className="bg-[#D4AF37] p-1.5 rounded-lg text-stone-950 font-bold hover:bg-amber-500">
                <Send size={14} />
              </button>
            </form>
          </div>

        </div>
      )}

      {/* --- POP-UP LUXURY DIALOG MODAL FOR DOUBLE REVIEWS --- */}
      {showReviewPopup && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1C1D] border border-stone-800 rounded-2xl w-full max-w-md overflow-hidden text-right shadow-2xl">
            <div className="bg-gradient-to-l from-pink-950/40 to-[#1C1C1D] px-6 py-4 border-b border-stone-850 flex justify-between items-center flex-row-reverse">
              <h3 className="font-black text-md text-[#F8C8DC] flex items-center gap-1.5">
                <Sparkles size={16} className="text-[#D4AF37]" />
                <span>تقييم مستوى فخامة الموديل والخدمة</span>
              </h3>
              <button onClick={() => setShowReviewPopup(null)} className="text-stone-300 hover:text-white">✕</button>
            </div>

            <form onSubmit={handlePostReviewAndSave} className="p-6 space-y-4">
              <div className="text-center p-2 bg-stone-950 text-[11px] text-stone-400 rounded-lg">
                💡 تقييماتك تقتطع عمولتك وتودعها فوراً في رصيد التاجرة ومراجعتها للمشرف الأمن المرقب.
              </div>

              {/* Product and Vendor rating */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-300">تقييم جودة (المنتج والتاجرة المصدرية)</label>
                <div className="flex gap-1.5 justify-center py-2.5 bg-stone-900 rounded-lg">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setProductRating(star)}
                      className="text-amber-500 hover:scale-110 transition-transform"
                    >
                      <Star size={24} fill={star <= productRating ? '#D4AF37' : 'none'} className={star <= productRating ? 'text-[#D4AF37]' : 'text-stone-700'} />
                    </button>
                  ))}
                </div>
              </div>

              {/* General Store Service Rating */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-stone-300">تقييم مستوى (الخدمة وتوصيل المتجر العام)</label>
                <div className="flex gap-1.5 justify-center py-2.5 bg-stone-900 rounded-lg">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      type="button"
                      key={star}
                      onClick={() => setStoreRating(star)}
                      className="text-amber-500 hover:scale-110 transition-transform"
                    >
                      <Star size={24} fill={star <= storeRating ? '#D4AF37' : 'none'} className={star <= storeRating ? 'text-[#D4AF37]' : 'text-stone-700'} />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-300 mb-1">اتركي تعليقاً للأنيقة والمنصة</label>
                <textarea
                  className="w-full bg-stone-950 border border-stone-850 focus:border-pink-905 rounded p-2.5 text-xs text-stone-200 min-h-[60px]"
                  placeholder="اكتبي تجربتك بمطابقة الطاقم وجودة التطريز الصوفي..."
                  value={reviewComment}
                  onChange={e => setReviewComment(e.target.value)}
                  required
                />
              </div>

              <div className="flex gap-2 pt-4 border-t border-stone-850">
                <button
                  type="button"
                  onClick={() => setShowReviewPopup(null)}
                  className="bg-stone-800 text-stone-400 px-4 py-2 rounded-lg text-xs"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="flex-1 bg-[#F8C8DC] text-black font-black py-2 rounded-lg text-xs"
                >
                  حفظ تقييم الخدمة الملكية
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- SLIDING LUXURY DRAWER SHOPPING CART (Full Basket System) --- */}
      {isCartOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex justify-end">
          <div className="bg-[#1C1C1D] border-r border-stone-800 w-full max-w-md h-full flex flex-col justify-between overflow-hidden text-right shadow-2xl">
            
            {/* Cart head */}
            <div className="bg-gradient-to-l from-pink-950/20 to-[#1C1C1D] px-6 py-5 border-b border-stone-850 flex justify-between items-center flex-row-reverse">
              <div className="flex items-center gap-2">
                <ShoppingCart className="text-[#D4AF37]" size={18} />
                <h3 className="font-extrabold text-white text-md">سلة مشترياتكِ الراقية</h3>
              </div>
              <button 
                onClick={() => setIsCartOpen(false)}
                className="text-stone-300 hover:text-white"
              >
                ✕ إغلاق
              </button>
            </div>

            {/* Cart Items List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-stone-500 text-xs text-center gap-3">
                  <ShoppingCart size={40} className="text-stone-800" />
                  <p>حقيبة تسوقكِ فارغة تماماً من الشالات أو العبايات.</p>
                  <p className="text-[10px] text-stone-600">يمكنكِ البدء بإضافة قطع فخمة من المول الرقمي</p>
                </div>
              ) : (
                cart.map(item => (
                  <div key={item.product.id} className="bg-stone-900 border border-stone-850 rounded-xl p-3 flex gap-4">
                    <img src={item.product.image} className="w-16 h-20 object-contain rounded bg-stone-950" alt="Cart item" />
                    
                    <div className="flex-grow flex flex-col justify-between">
                      <div>
                        <h4 className="font-bold text-stone-200 text-xs line-clamp-1">{item.product.name}</h4>
                        <span className="text-xs text-amber-500 font-bold block mt-1">{item.product.price} ر.ي</span>
                      </div>

                      {/* Quantity tools */}
                      <div className="flex items-center justify-between border-t border-stone-850 pt-2 mt-2">
                        <div className="flex items-center gap-1.5">
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity - 1)}
                            className="bg-stone-800 p-1.5 rounded hover:bg-stone-750 text-white"
                          >
                            <Minus size={11} />
                          </button>
                          <span className="text-xs font-bold text-white px-1.5">{item.quantity}</span>
                          <button
                            onClick={() => updateCartQuantity(item.product.id, item.quantity + 1)}
                            className="bg-stone-800 p-1.5 rounded hover:bg-stone-750 text-white"
                          >
                            <Plus size={11} />
                          </button>
                        </div>

                        <button
                          onClick={() => removeFromCart(item.product.id)}
                          className="text-stone-500 hover:text-red-400 p-1"
                        >
                          <Trash2 size={13} />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Cart footer calculations */}
            {cart.length > 0 && (
              <div className="p-5 bg-stone-950 border-t border-stone-850 space-y-4">
                <div className="flex justify-between items-center text-xs text-stone-300">
                  <span>إجمالي مجموع القطع بالسلة:</span>
                  <span className="text-lg font-black text-[#D4AF37]">{cartTotalAmount} ريال يمني</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsCartOpen(false);
                      setShowCheckout(true);
                    }}
                    className="flex-1 bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-500 text-neutral-950 font-black py-3 rounded-xl text-xs text-center cursor-pointer shadow-md shadow-neutral-900"
                  >
                    تفويض السداد وإنهاء الطلب (Checkout)
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- COMPLETE CHECKOUT POPUP / STEPPERS MODE --- */}
      {showCheckout && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1C1D] border border-stone-800 rounded-2xl w-full max-w-xl max-h-[90vh] h-[85vh] flex flex-col overflow-hidden text-right">
            
            {/* Checkout head */}
            <div className="bg-gradient-to-l from-pink-950/20 to-[#1C1C1D] px-6 py-4 border-b border-stone-850 flex justify-between items-center flex-row-reverse flex-shrink-0">
              <h3 className="font-black text-md text-[#D4AF37] flex items-center gap-1.5">
                <CreditCard size={16} />
                <span>شاشة دفع الفاتورة وتأكيد التحويل البنكي الفوري</span>
              </h3>
              <button onClick={() => setShowCheckout(false)} className="text-stone-300 hover:text-white">✕</button>
            </div>

            {/* Checkout body scrollable */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              
              <div className="bg-stone-900 p-4 rounded-xl border border-stone-850 text-xs space-y-1.5">
                <div className="flex justify-between font-bold text-white">
                  <span>مجموع الحساب والملابس المحددة:</span>
                  <span>{cartTotalAmount} ر.ي</span>
                </div>
                <div className="text-[10px] text-stone-400">
                  توجيهات: الرجاء تحويل إجمالي الفاتورة لأحد حسابات البنوك المحلية اليمنية الموثقة أدناه، والتقاط أو إدخال صورة السند لإكمال شريان السداد.
                </div>
              </div>

              {/* 1. SELECT LOCAL BANKS DIALOG */}
              <div className="space-y-2">
                <label className="block text-xs font-black text-stone-300">أولاً: اختر البنك أو نقطة التحويل المالي المفضلة:</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {database.bankAccounts.map(bank => (
                    <button
                      type="button"
                      key={bank.id}
                      onClick={() => setSelectedBankId(bank.id)}
                      className={`p-3 rounded-lg border text-xs text-right flex flex-col justify-between transition-colors cursor-pointer ${
                        selectedBankId === bank.id 
                          ? 'bg-gradient-to-tr from-[#352B2E] to-stone-900 border-[#D4AF37] text-white font-bold shadow' 
                          : 'bg-stone-950 border-stone-850 text-stone-400 hover:border-pink-900'
                      }`}
                    >
                      <span className="font-extrabold text-[#D4AF37] block mb-1">{bank.bankName}</span>
                      <span className="text-[10px] text-stone-400 select-all">رقم: {bank.accountNumber}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Display target selected bank coordinates dynamically */}
              {selectedBankId && (() => {
                const b = database.bankAccounts.find(bk => bk.id === selectedBankId);
                return b ? (
                  <div className="bg-stone-950 p-4 rounded-lg border border-[#D4AF37]/20 space-y-1.5 text-xs text-stone-300 animate-pulse">
                    <span className="text-[10px] text-amber-500 block uppercase font-bold">معلومات وتنسيق التحويل للبنك المختار:</span>
                    <div>رقم الحساب أو المحفظة: <b className="text-white text-sm select-all">{b.accountNumber}</b></div>
                    <div>صاحب الحساب المعتمد بالكامل: <span className="font-bold text-white">{b.accountHolder}</span></div>
                    {b.notes && <div className="text-[11px] text-stone-400 italic bg-stone-900 p-2 rounded mt-1">توجيه: {b.notes}</div>}
                  </div>
                ) : null;
              })()}

              {/* 2. CAPTURE / UPLOAD TRANSACTION RECEIPT SENSITIVE - MANDATORY */}
              <div className="space-y-2 border-t border-stone-850 pt-4">
                <label className="block text-xs font-black text-stone-300 flex items-center gap-1">
                  <span>ثانياً: أرفقي صورة إيصال التحويل المالي أو السند البنكي الفعلي:</span>
                  <span className="text-red-400 font-bold">*</span>
                </label>

                <div className="flex gap-4">
                  <div className="flex-1 bg-stone-950 border border-stone-850 rounded-lg p-3 flex flex-col items-center justify-center border-dashed relative">
                    <Upload className="text-stone-500 mb-1" size={20} />
                    <span className="text-[10px] text-stone-400">انقري لرفع صورة إيصال التحويل الفوري</span>
                    <input 
                      type="file" 
                      accept="image/*" 
                      className="absolute inset-0 opacity-0 cursor-pointer" 
                      onChange={handleReceiptUpload} 
                      required
                    />
                  </div>

                  {receiptImageBase64 && (
                    <div className="w-24 h-24 border border-stone-800 rounded-lg overflow-hidden bg-stone-950 flex items-center justify-center p-1 relative">
                      <img src={receiptImageBase64} className="max-w-full max-h-full object-contain rounded" alt="Preview payment receipt" />
                      <button 
                        type="button" 
                        onClick={() => setReceiptImageBase64('')}
                        className="absolute -top-1 -right-1 bg-red-600 text-white rounded-full w-4 h-4 text-[9px] font-black"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>

                {/* رقم العملية أو رمز الحوالة المالي */}
                <div className="space-y-1.5 mt-4" dir="rtl">
                  <label className="block text-xs font-black text-stone-300 flex items-center gap-1 text-right">
                    <span>ثالثاً: أدخلي رقم العملية / رمز الحوالة الفعلي الساخن:</span>
                    <span className="text-red-400 font-bold">*</span>
                  </label>
                  <input
                    type="text"
                    value={transactionRefId}
                    onChange={(e) => setTransactionRefId(e.target.value)}
                    placeholder="مثال: 90281-002 أو KRM-1029384 أو 1029384752"
                    className="w-full bg-stone-950 border border-stone-850 focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-white placeholder-stone-600 text-right focus:outline-none transition-colors font-mono"
                    required
                  />
                  <span className="text-[10px] text-stone-500 block leading-tight text-right">
                    مطلوب للتحقق الرقمي الفوري ومطابقة الدفعة على خوادم السحاب وقنوات التحصيل المالية.
                  </span>
                </div>
              </div>

              {/* 3. CUSTOMER RESIDENCE & CO-ORDINATES MAP FOR COURIER DELIVERY */}
              <div className="space-y-4 border-t border-stone-850 pt-4" dir="rtl">
                <div className="space-y-1.5">
                  <label className="block text-xs font-black text-stone-300 flex items-center gap-1 text-right">
                    <span>رابعاً: أدخلي تفاصيل إقامتكِ وعنوان التوصيل الفعلي:</span>
                    <span className="text-red-400 font-bold">*</span>
                  </label>
                  <textarea
                    rows={2}
                    value={customerResidence}
                    onChange={(e) => setCustomerResidence(e.target.value)}
                    placeholder="مثال: صنعاء - حي حدة - خلف مركز ظمران - شارع ٢٤ - عمارة الياسمين شقة رقم ٤"
                    className="w-full bg-stone-950 border border-stone-850 focus:border-[#D4AF37] rounded-xl p-3 text-xs text-white placeholder-stone-600 text-right focus:outline-none transition-colors resize-none"
                    required
                  />
                  <span className="text-[10px] text-stone-500 block leading-tight text-right">
                    تساعد تفاصيل الإقامة مندوب التوصيل على الوصول إلى منزلكِ بأسرع وقت ممكن وبدقة متناهية.
                  </span>
                </div>

                {/* Map integration */}
                <div className="space-y-2">
                  <span className="text-[11px] font-bold text-stone-400 block">حددي موقع التوصيل الجغرافي على خريطة صنعاء:</span>
                  <div className="border border-stone-800 rounded-2xl overflow-hidden shadow-lg bg-stone-950 p-1">
                    <SanaaMap
                      initialLatitude={customerLatitude}
                      initialLongitude={customerLongitude}
                      initialAddress={customerMapAddress}
                      storeName="موقع التوصيل الخاص بي"
                      onChange={(data) => {
                        setCustomerLatitude(data.latitude);
                        setCustomerLongitude(data.longitude);
                        setCustomerMapAddress(data.mapAddress);
                      }}
                    />
                  </div>
                </div>
              </div>

              {/* 5. SHIPPING & DELIVERY COMPANY SELECTION */}
              {(() => {
                const activeShippingCompanies = (database.shippingSettings?.companies || database.shippingSettings?.externalCompanies || []).filter(c => c.active !== false);
                const isExpressEnabled = database.shippingSettings?.appExpressShippingEnabled !== false;
                const chosenCompany = activeShippingCompanies.find(c => c.id === selectedShippingCompanyId);
                const currentFee = selectedShippingCompanyId === 'express_direct' || !chosenCompany
                  ? 1500
                  : Number(chosenCompany.fee ?? chosenCompany.price ?? 2000);

                return (
                  <div className="space-y-3 border-t border-stone-850 pt-4" dir="rtl">
                    <div className="flex items-center justify-between">
                      <label className="block text-xs font-black text-stone-300">خامساً: اختر شركة وخيار الشحن والتوصيل الفعلي:</label>
                      <span className="text-xs text-[#D4AF37] font-extrabold font-mono">
                        رسوم التوصيل: {currentFee.toLocaleString('ar-YE')} ر.ي
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {/* Express Direct Delivery Option */}
                      {isExpressEnabled && (
                        <button
                          type="button"
                          onClick={() => setSelectedShippingCompanyId('express_direct')}
                          className={`p-3 rounded-xl border text-xs text-right transition-all cursor-pointer ${
                            selectedShippingCompanyId === 'express_direct' || !selectedShippingCompanyId
                              ? 'bg-gradient-to-tr from-[#352B2E] to-stone-900 border-[#D4AF37] text-white font-bold shadow'
                              : 'bg-stone-950 border-stone-850 text-stone-400 hover:border-amber-900/50'
                          }`}
                        >
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-black text-[#D4AF37] flex items-center gap-1.5">
                              <Truck size={14} />
                              <span>التوصيل المباشر مناديب المنصة</span>
                            </span>
                            <span className="text-amber-400 font-bold font-mono">1,500 ر.ي</span>
                          </div>
                          <p className="text-[10px] text-stone-400">توصيل سريع مضمون حتى باب المنزل خلال نفس اليوم</p>
                        </button>
                      )}

                      {/* External Registered Shipping Companies */}
                      {activeShippingCompanies.map(comp => {
                        const compFee = comp.fee ?? comp.price ?? 2000;
                        const isSelected = selectedShippingCompanyId === comp.id;
                        return (
                          <button
                            type="button"
                            key={comp.id}
                            onClick={() => setSelectedShippingCompanyId(comp.id)}
                            className={`p-3 rounded-xl border text-xs text-right transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-gradient-to-tr from-[#352B2E] to-stone-900 border-[#D4AF37] text-white font-bold shadow'
                                : 'bg-stone-950 border-stone-850 text-stone-400 hover:border-amber-900/50'
                            }`}
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-black text-stone-200 flex items-center gap-1.5">
                                <Truck size={14} className="text-[#D4AF37]" />
                                <span>{comp.name}</span>
                              </span>
                              <span className="text-amber-400 font-bold font-mono">{compFee.toLocaleString('ar-YE')} ر.ي</span>
                            </div>
                            <div className="text-[10px] text-stone-400">
                              الوقت: {comp.estimatedTime || '24-48 ساعة'} • التغطية: {Array.isArray(comp.coverageAreas) ? comp.coverageAreas.join('، ') : 'جميع المناطق'}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                );
              })()}

            </div>

            {/* Checkout footer */}
            <div className="p-6 bg-stone-950 border-t border-stone-850 flex gap-2 flex-shrink-0">
              <button
                type="button"
                onClick={() => setShowCheckout(false)}
                className="bg-stone-800 text-stone-400 px-4 py-2 rounded-lg text-xs"
              >
                العودة للتسوق
              </button>
              
              <button
                onClick={handlePlaceOrder}
                disabled={isSubmittingOrder || !selectedBankId || !receiptImageBase64}
                className="flex-1 bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-500 text-stone-950 font-black py-2 rounded-lg text-xs flex items-center justify-center gap-1 text-center disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
              >
                {isSubmittingOrder ? 'جاري قيد وتأريض السند...' : 'إرسال السند لإدارة المحاسبة وإتمام الطلب'}
              </button>
            </div>

          </div>
        </div>
      )}

      {/* --- SHOW SINGLE PRODUCT DETAIL DIALOG POPUP --- */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1C1D] border border-stone-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto text-right">
            
            <div className="bg-gradient-to-l from-stone-900 to-[#1C1C1D] px-6 py-4 border-b border-stone-850 flex justify-between items-center flex-row-reverse">
              <h3 className="font-extrabold text-sm text-[#D4AF37]">تقييم ومعاينة فخامة المعروض بالمول</h3>
              <button onClick={() => setSelectedProduct(null)} className="text-stone-300 hover:text-white">✕</button>
            </div>

            <div className="p-6 space-y-4">
              {(() => {
                const productImages = selectedProduct.images && selectedProduct.images.length > 0
                  ? selectedProduct.images.filter(img => img.trim() !== '')
                  : [selectedProduct.image];
                const activeIndexToUse = activeImgIndex < productImages.length ? activeImgIndex : 0;
                const currentActiveImage = productImages[activeIndexToUse] || selectedProduct.image;

                return (
                  <div className="bg-stone-950 p-4 rounded-xl flex flex-col items-center justify-center border border-stone-850 space-y-3">
                    <div className="w-full flex items-center justify-center min-h-[200px]">
                      <img src={currentActiveImage} className="max-h-64 object-contain rounded-xl transition-transform hover:scale-105 duration-300" alt="Preview detail in modal" />
                    </div>
                    
                    {productImages.length > 1 && (
                      <div className="flex gap-2 justify-center pt-2 flex-wrap" dir="rtl">
                        {productImages.map((img, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setActiveImgIndex(idx)}
                            className={`w-12 h-12 rounded border-2 transition-all p-0.5 bg-stone-900 overflow-hidden ${
                              activeIndexToUse === idx 
                              ? 'border-[#D4AF37] scale-110 shadow-lg shadow-[#D4AF37]/10' 
                              : 'border-stone-850 hover:border-stone-600 opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img src={img} className="w-full h-full object-contain" alt={`thumbnail ${idx + 1}`} />
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })()}

              <div>
                <div className="flex flex-wrap gap-2 items-center">
                  <span className="text-[10px] text-[#F8C8DC] bg-pink-950/20 border border-pink-900/30 px-2.5 py-0.5 rounded-full font-bold">
                    {database.categories.find(c => c.id === selectedProduct.categoryId)?.name || 'أنيقات الفساتين'}
                  </span>
                </div>
                <h4 className="font-black text-white text-base mt-2">{selectedProduct.name}</h4>
                <p className="text-xs text-stone-450 leading-relaxed mt-2.5">{selectedProduct.description}</p>

                {/* Designer/Vendor Profile Card with Follow Button */}
                {(() => {
                  const vendorObj = selectedProduct.vendorId ? database.users.find(u => u.id === selectedProduct.vendorId || u.phone === selectedProduct.vendorId) : null;
                  if (!vendorObj) return null;

                  const isPrivacyHidden = !!vendorObj.hidePrivateContact;
                  const vendorName = vendorObj.name || 'متجر شريك';
                  const isVendorVerified = !!vendorObj.isVerified;
                  const currentUserId = currentUser.id || currentUser.phone || currentUser.email;
                  const followersList = vendorObj.followedByUserIds || [];
                  const isFollowing = currentUserId ? followersList.includes(currentUserId) : false;
                  const followerCount = vendorObj.followersCount || followersList.length || 0;

                  return (
                    <div className="bg-stone-950 p-3 rounded-xl border border-stone-850 flex flex-col gap-2.5 mt-3" dir="rtl">
                      <div className="flex items-center justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          {vendorObj.logoImage ? (
                            <img src={vendorObj.logoImage} className="w-10 h-10 rounded-xl object-cover border border-[#D4AF37]" alt="Vendor logo" />
                          ) : (
                            <div className="w-10 h-10 rounded-xl bg-pink-950/80 text-[#F8C8DC] border border-pink-800 flex items-center justify-center font-bold text-sm">
                              🏪
                            </div>
                          )}
                          <div className="text-right">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <span className="font-extrabold text-xs text-white">{vendorName}</span>
                              {vendorObj.merchantType === 'male' ? (
                                <span className="bg-blue-950/80 text-blue-300 border border-blue-800/60 text-[8px] px-1.5 py-0.2 rounded-full font-bold">
                                  👨‍💼 تاجر
                                </span>
                              ) : (
                                <span className="bg-pink-950/80 text-pink-300 border border-pink-800/60 text-[8px] px-1.5 py-0.2 rounded-full font-bold">
                                  👩‍💼 تاجرة
                                </span>
                              )}
                              {isVendorVerified ? (
                                <span className="bg-amber-950/60 text-[#D4AF37] border border-[#D4AF37]/40 text-[8px] px-1.5 py-0.2 rounded-full font-bold flex items-center gap-0.5">
                                  ★ موثق
                                </span>
                              ) : (
                                <span className="bg-stone-900 text-stone-400 text-[8px] px-1.5 py-0.2 rounded-full">
                                  غير موثق
                                </span>
                              )}
                              {isPrivacyHidden && (
                                <span className="bg-purple-950/80 text-purple-300 border border-purple-800/60 text-[8px] px-1.5 py-0.2 rounded-full font-bold">
                                  🔒 بيانات الهوية محمية
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-purple-300 font-bold mt-0.5">
                              {isPrivacyHidden ? '🔒 اسم الجوال والعنوان الشخصي للتاجر محميان بواسطة إدارة المول' : `👥 ${followerCount} متابع لمتجر التاجرة | ${vendorObj.fullName || ''}`}
                            </p>
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={() => handleToggleFollowVendor(vendorObj.id)}
                          className={`px-3 py-1.5 rounded-lg text-[10px] font-extrabold transition-all cursor-pointer flex items-center gap-1 shrink-0 ${
                            isFollowing 
                              ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                              : 'bg-pink-950/80 hover:bg-pink-900 text-pink-200 border border-pink-800'
                          }`}
                        >
                          {isFollowing ? (
                            <>
                              <Check size={12} />
                              <span>مُتَابَع</span>
                            </>
                          ) : (
                            <>
                              <UserPlus size={12} />
                              <span>متابعة المتجر</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* App Social Channels Direct Action Bar */}
                      <div className="bg-stone-900/90 p-2 rounded-lg border border-stone-800 flex items-center justify-between gap-2 text-[10px]">
                        <span className="text-amber-200 font-bold">💬 حجز فوري أو استفسار مع إدارة المول:</span>
                        <div className="flex items-center gap-1.5">
                          {database.socialLinks.whatsapp && (
                            <a
                              href={database.socialLinks.whatsapp}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-2 py-0.5 rounded bg-[#25D366]/20 text-[#25D366] font-extrabold hover:bg-[#25D366]/30 border border-[#25D366]/40 transition-colors"
                            >
                              واتساب 💬
                            </a>
                          )}
                          {database.socialLinks.phone && (
                            <a
                              href={`tel:${database.socialLinks.phone}`}
                              className="px-2 py-0.5 rounded bg-amber-950 text-amber-300 font-extrabold hover:bg-amber-900 border border-amber-800 transition-colors"
                            >
                              اتصال 📞
                            </a>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                {/* Shipping and Payment Options Section */}
                <div className="bg-stone-950 p-3.5 rounded-xl border border-stone-850 space-y-2.5 text-right" dir="rtl">
                  <h5 className="font-extrabold text-xs text-amber-300 flex items-center gap-1.5">
                    <Truck size={14} className="text-[#D4AF37]" />
                    <span>خيارات الشحن والدفع المتاحة لطلب الموديل:</span>
                  </h5>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[10px]">
                    <div className="bg-stone-900/80 p-2.5 rounded-lg border border-stone-800">
                      <span className="text-stone-400 font-bold block mb-0.5">📦 الشحن والتوصيل:</span>
                      <span className="text-stone-200">شحن آمن عبر منصة المول الموحدة أو توصيل مباشر من التاجر لمحافظتك</span>
                    </div>
                    <div className="bg-stone-900/80 p-2.5 rounded-lg border border-stone-800">
                      <span className="text-stone-400 font-bold block mb-0.5">💳 طرق الدفع الإلكتروني:</span>
                      <span className="text-stone-200">محفظة جواني، كاك بنك، بنك الكريمي الإسلامي، أو الدفع عند الاستلام</span>
                    </div>
                  </div>
                </div>

                {/* Other Products from this Store / Vendor Section */}
                {(() => {
                  if (!selectedProduct.vendorId) return null;
                  const otherVendorProducts = database.products.filter(
                    p => (p.vendorId === selectedProduct.vendorId || (selectedProduct.vendorPhone && p.vendorId === selectedProduct.vendorPhone)) && p.id !== selectedProduct.id
                  );
                  if (otherVendorProducts.length === 0) return null;

                  return (
                    <div className="border-t border-stone-850 pt-3.5 space-y-2 text-right" dir="rtl">
                      <h5 className="font-extrabold text-xs text-white flex items-center justify-between">
                        <span>منتجات وموديلات أخرى من هذا المتجر ({otherVendorProducts.length})</span>
                      </h5>
                      <div className="flex gap-2.5 overflow-x-auto pb-2 scrollbar-none">
                        {otherVendorProducts.map(otherProd => (
                          <button
                            key={otherProd.id}
                            type="button"
                            onClick={() => {
                              setSelectedProduct(otherProd);
                              setActiveImgIndex(0);
                            }}
                            className="shrink-0 w-28 bg-stone-950 border border-stone-850 hover:border-[#D4AF37] p-2 rounded-xl text-right transition-all cursor-pointer group"
                          >
                            <div className="w-full h-20 bg-stone-900 rounded-lg overflow-hidden mb-1.5 flex items-center justify-center">
                              <img src={otherProd.image} className="w-full h-full object-cover group-hover:scale-105 transition-transform" alt={otherProd.name} />
                            </div>
                            <p className="text-[10px] font-bold text-white truncate">{otherProd.name}</p>
                            <p className="text-[10px] font-black text-[#D4AF37]">{otherProd.price} ر.ي</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  );
                })()}

                {/* Private Sensitive Data Protection Notice */}
                <div className="bg-purple-950/30 border border-purple-800/40 p-2.5 rounded-xl text-center text-[10px] text-purple-200 font-semibold" dir="rtl">
                  🔒 رقم الجوال، الموقع الجغرافي الدقيق، والحساب البنكي للتاجر محمية ومخفية ومحفوظة حصراً في لوحة التحكم الإدارية (Admin Panel) لسلامة وسرية التعامل.
                </div>
              </div>

              {/* Real Customers Reviews and Ratings Block */}
              {(() => {
                const productReviews = (database.productReviews || []).filter(rev => rev.productId === selectedProduct.id);
                const averageRating = productReviews.length > 0 
                  ? (productReviews.reduce((sum, r) => sum + r.rating, 0) / productReviews.length).toFixed(1)
                  : null;
                const hasPurchased = database.orders
                  .filter(o => o.customerId === currentUser.phone || o.customerId === currentUser.email)
                  .some(o => (o.items || []).some(item => item.product?.id === selectedProduct.id));

                return (
                  <>
                    <div className="border-t border-stone-850 pt-4 space-y-3">
                      <h5 className="font-extrabold text-xs text-white flex items-center justify-between">
                        <span>آراء وتقييمات الزبائن ({productReviews.length})</span>
                        {averageRating && (
                          <span className="text-[#D4AF37] font-sans flex items-center gap-1">
                            ⭐ {averageRating} / 5.0
                          </span>
                        )}
                      </h5>

                      {productReviews.length === 0 ? (
                        <p className="text-[11px] text-stone-550 italic text-center py-2">لا توجد تقييمات لهذا الموديل الفاخر بعد. كوني أول من يبدي رأيه!</p>
                      ) : (
                        <div className="space-y-2.5 max-h-44 overflow-y-auto pr-1" dir="rtl">
                          {productReviews.map((rev) => (
                            <div key={rev.id} className="bg-stone-950 p-2.5 rounded-xl border border-stone-850/60 text-right space-y-1">
                              <div className="flex justify-between items-center text-[10px]">
                                <span className="font-bold text-stone-300">{rev.customerName}</span>
                                <span className="text-stone-500 font-mono text-[9px]">
                                  {new Date(rev.createdAt).toLocaleDateString('ar-YE', {year: 'numeric', month: 'short', day: 'numeric'})}
                                </span>
                              </div>
                              <div className="flex gap-0.5 text-amber-500 text-[10px]">
                                {Array.from({ length: 5 }).map((_, i) => (
                                  <span key={i}>{i < rev.rating ? '★' : '☆'}</span>
                                ))}
                              </div>
                              <p className="text-[11px] text-stone-400 leading-relaxed">{rev.comment}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    {hasPurchased ? (
                      <form onSubmit={handleAddProductReview} className="border-t border-stone-850 pt-4 space-y-3 bg-stone-950/40 p-3 rounded-xl border border-stone-850">
                        <h5 className="font-bold text-xs text-[#D4AF37]">إضافة تقييمكِ الفاخر لهذا المنتج</h5>
                        {reviewSuccess && (
                          <div className="bg-emerald-950/50 border border-emerald-900/50 text-emerald-400 text-[10px] p-2 rounded text-center font-bold">
                            🎉 تم حفظ تقييمكِ الراقي في قاعدة البيانات بنجاح!
                          </div>
                        )}
                        
                        <div className="space-y-2">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] text-stone-400">تقييمكِ للمنتج:</span>
                            <div className="flex gap-1 text-lg">
                              {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                  key={star}
                                  type="button"
                                  onClick={() => setNewRating(star)}
                                  className="text-[#D4AF37] hover:scale-110 transition-transform focus:outline-none"
                                >
                                  {star <= newRating ? '★' : '☆'}
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="relative">
                            <textarea
                              rows={2}
                              value={newComment}
                              onChange={(e) => setNewComment(e.target.value)}
                              placeholder="اكتبِ تعليقكِ أو رأيكِ الصادق حول جودة ومظهر هذا الموديل..."
                              className="w-full bg-stone-950 border border-stone-850 focus:border-[#D4AF37] rounded-lg p-2 text-[11px] text-white placeholder-stone-600 text-right resize-none focus:outline-none"
                              required
                            />
                          </div>

                          <div className="flex justify-end">
                            <button
                              type="submit"
                              className="bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-500 text-stone-950 font-black text-[10px] px-4 py-1.5 rounded-lg transition-all"
                            >
                              حفظ التقييم والمشاركة
                            </button>
                          </div>
                        </div>
                      </form>
                    ) : (
                      <div className="bg-stone-950/30 border border-stone-850 p-3 rounded-xl text-center">
                        <p className="text-[10px] text-stone-400">
                          🔒 يقتصر التقييم والتعليق على الزبائن الذين قاموا باقتناء وشراء هذا الموديل مسبقاً لضمان مصداقية المراجعات.
                        </p>
                      </div>
                    )}
                  </>
                );
              })()}

              <div className="border-t border-stone-850 pt-4 flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-stone-500 block uppercase font-bold">القيمة الحياكية السارية:</span>
                  <span className="text-lg font-black text-[#D4AF37]">{selectedProduct.price} ريال يمني</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      handleAddToCart(selectedProduct);
                      setSelectedProduct(null);
                    }}
                    className="bg-[#D4AF37] text-neutral-950 hover:bg-amber-500 font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow"
                  >
                    <Plus size={14} /> Add to Cart
                  </button>
                </div>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* USER PROFILE & SELLER ACTIVATION MODAL (ProfileScreen / SellerActivationScreen) */}
      {showProfileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto" dir="rtl">
          <div className="bg-[#1C1C1D] border border-stone-800 w-full max-w-3xl rounded-2xl shadow-2xl p-5 md:p-6 my-8 space-y-6 text-right">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-stone-850 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-950/40 rounded-xl border border-amber-900/30 text-[#D4AF37]">
                  <User size={22} />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-white">الملف الشخصي وإعدادات التاجر (Profile Screen)</h3>
                  <p className="text-[11px] text-stone-400">إدارة حسابك الشخصي وتنشيط المتجر التجاري المربوط بالمول</p>
                </div>
              </div>
              <button
                onClick={() => setShowProfileModal(false)}
                className="p-2 text-stone-400 hover:text-white bg-stone-900 hover:bg-stone-800 rounded-xl border border-stone-800 transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            {/* Profile Navigation Tabs */}
            <div className="flex items-center gap-2 border-b border-stone-850 pb-3 overflow-x-auto">
              <button
                type="button"
                onClick={() => setActiveProfileTab('info')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeProfileTab === 'info'
                    ? 'bg-[#D4AF37] text-stone-950 shadow-md font-black'
                    : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
                }`}
              >
                <User size={15} />
                <span>معلومات الحساب</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveProfileTab('activateStore')}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
                  activeProfileTab === 'activateStore'
                    ? 'bg-gradient-to-r from-amber-500 to-[#D4AF37] text-stone-950 shadow-md font-black'
                    : 'bg-stone-900 text-stone-400 hover:text-white border border-stone-800'
                }`}
              >
                <Sparkles size={15} />
                <span>تنشيط متجرك الخاص (SellerActivationScreen) ⚡</span>
              </button>
            </div>

            {/* TAB 1: USER PROFILE INFO & SETTINGS (ProfileScreen Structure) */}
            {activeProfileTab === 'info' && (
              <div className="space-y-4">
                
                {/* 1️⃣ USER HEADER & BASIC PERSONAL INFO */}
                <div className="bg-stone-950 p-4 rounded-xl border border-stone-850 space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-pink-950 to-amber-950 text-[#F8C8DC] border border-[#D4AF37] flex items-center justify-center font-bold text-xl shadow-md">
                        {currentUser.name ? currentUser.name.charAt(0) : '👤'}
                      </div>
                      <div>
                        <h4 className="font-extrabold text-white text-base">{currentUser.name || currentUser.fullName || 'مريم اليافعي'}</h4>
                        <p className="text-xs text-stone-400 mt-0.5">{currentUser.email || 'user@escarf.com'}</p>
                        <p className="text-[11px] text-[#D4AF37] font-mono mt-0.5">📞 {currentUser.phone || '+967 770 000 000'}</p>
                      </div>
                    </div>

                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => alert('يمكنك تعديل اسم الحساب والبريد مباشرة من خلال خانة تحديث الحساب.')}
                        className="bg-stone-900 hover:bg-stone-850 text-stone-300 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-stone-800 transition-colors cursor-pointer"
                      >
                        ✏️ تعديل البيانات الأساسية
                      </button>
                      <button
                        type="button"
                        onClick={() => alert('تم إرسال رابط إعادة تعيين كلمة السر إلى بريدك الإلكتروني بنجاح.')}
                        className="bg-stone-900 hover:bg-stone-850 text-amber-300 text-[10px] font-bold px-3 py-1.5 rounded-lg border border-amber-900/40 transition-colors cursor-pointer"
                      >
                        🔑 تغيير كلمة السر
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs border-t border-stone-850">
                    <div className="bg-stone-900/60 p-2.5 rounded-lg border border-stone-800">
                      <span className="text-stone-500 text-[10px] block">صفة الحساب الحالية:</span>
                      <span className="font-bold text-amber-300">
                        {currentUser.role === 'vendor' ? '🏬 بائع (صاحب متجر مفعل)' : currentUser.role === 'admin' ? '👑 مدير عام المنصة' : '🛍️ زبون (مستخدم شوبينج)'}
                      </span>
                    </div>

                    <div className="bg-stone-900/60 p-2.5 rounded-lg border border-stone-800">
                      <span className="text-stone-500 text-[10px] block">حالة التوثيق بالهوية:</span>
                      <span className="font-bold text-emerald-400 flex items-center gap-1">
                        <ShieldCheck size={14} /> {currentUser.isVerified ? 'حساب موثق بالهوية ★' : 'حساب عادي (يمكن رفع الهوية لتفعيله)'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 2️⃣ SELLER MANAGEMENT SECTION (قسم إدارة المتجر) */}
                <div className="p-4 bg-gradient-to-r from-amber-950/30 to-purple-950/20 border border-amber-800/40 rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h5 className="font-extrabold text-xs text-amber-300 flex items-center gap-1.5">
                      <Sparkles size={16} />
                      <span>قسم إدارة المتجر (Seller Management Section)</span>
                    </h5>
                    {currentUser.role === 'vendor' && (
                      <span className="bg-emerald-950 text-emerald-300 text-[9px] font-bold px-2 py-0.5 rounded-full border border-emerald-800">
                        متجرك نشط وحي
                      </span>
                    )}
                  </div>

                  {currentUser.role === 'vendor' ? (
                    <div className="bg-stone-950 p-3 rounded-lg border border-stone-850 flex items-center justify-between gap-3">
                      <div>
                        <h6 className="font-black text-white text-xs">{currentUser.name}</h6>
                        <p className="text-[10px] text-stone-400 mt-0.5">
                          لوحة تحكم المتجر مفعلة بالكامل مع امكانية إضافة المنتجات ومتابعة الطلبات.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => setActiveProfileTab('activateStore')}
                        className="bg-[#D4AF37] text-stone-950 font-black text-xs px-3.5 py-2 rounded-lg hover:bg-amber-400 transition-colors shrink-0 cursor-pointer"
                      >
                        إدارة المتجر وتحديث البيانات ←
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <p className="text-stone-300 text-[11px] leading-relaxed">
                        تسمح لكِ هذه الخدمة بتسجيل متجرك الخاص كشركاء وتفعيل شارة التوثيق وربط منتجاتك بالمنصة السحابية الموحدة.
                      </p>
                      <button
                        type="button"
                        onClick={() => setActiveProfileTab('activateStore')}
                        className="bg-gradient-to-r from-[#D4AF37] to-amber-500 text-stone-950 font-black text-xs px-5 py-2 rounded-lg hover:from-amber-400 transition-all cursor-pointer shadow-md flex items-center gap-1.5"
                      >
                        <Sparkles size={14} />
                        <span>تنشيط متجرك الخاص / تسجيل كشركاء (SellerActivationScreen) ←</span>
                      </button>
                    </div>
                  )}
                </div>

                {/* 3️⃣ SHIPPING & PAYMENT SETTINGS (خيارات العناوين والدفع) */}
                <div className="bg-stone-950 p-4 rounded-xl border border-stone-850 space-y-3 text-xs">
                  <h5 className="font-extrabold text-xs text-white flex items-center gap-1.5">
                    <Truck size={15} className="text-[#D4AF37]" />
                    <span>إعدادات العناوين والدفع (Shipping & Payment Settings)</span>
                  </h5>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="bg-stone-900/80 p-3 rounded-lg border border-stone-800 space-y-1">
                      <span className="text-amber-200 font-bold block">📍 دفتر عناوين التوصيل:</span>
                      <p className="text-[10px] text-stone-400">
                        {currentUser.currentResidence || 'اليمن - صنعاء - شارع حدة - أقرب نقطة دالة'}
                      </p>
                      <button
                        type="button"
                        onClick={() => alert('تم فتح نافذة تحديث دفتر عناوين التوصيل.')}
                        className="text-[10px] text-[#D4AF37] underline font-bold mt-1 inline-block cursor-pointer"
                      >
                        إدارة العناوين ✏️
                      </button>
                    </div>

                    <div className="bg-stone-900/80 p-3 rounded-lg border border-stone-800 space-y-1">
                      <span className="text-amber-200 font-bold block">💳 طريقة الدفع والمحفظة المفضلة:</span>
                      <p className="text-[10px] text-stone-400">
                        محفظة الكريمي الإسلامي / جواني / كاك بنك / الدفع عند الاستلام
                      </p>
                      <button
                        type="button"
                        onClick={() => alert('تمت إضافة محفظتك المفضلة للسداد السريع.')}
                        className="text-[10px] text-[#D4AF37] underline font-bold mt-1 inline-block cursor-pointer"
                      >
                        تحديث المحفظة ✏️
                      </button>
                    </div>
                  </div>
                </div>

                {/* 4️⃣ ACCOUNT SETTINGS & GENERAL PREFERENCES (إعدادات الحساب العامة) */}
                <div className="bg-stone-950 p-4 rounded-xl border border-stone-850 space-y-3 text-xs">
                  <h5 className="font-extrabold text-xs text-white flex items-center gap-1.5">
                    <User size={15} className="text-[#D4AF37]" />
                    <span>إعدادات الحساب والتفضيلات العامة (Account Settings)</span>
                  </h5>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[10px]">
                    <div className="bg-stone-900/80 p-2.5 rounded-lg border border-stone-800 text-center space-y-1">
                      <span className="text-stone-400 block font-bold">اللغة والعملة</span>
                      <span className="text-amber-300 font-black block">العربية (ريال يمني)</span>
                    </div>

                    <button
                      type="button"
                      onClick={() => alert('تم تحويلك لقائمة المنتجات المفضلة.')}
                      className="bg-stone-900/80 hover:bg-stone-850 p-2.5 rounded-lg border border-stone-800 text-center space-y-1 cursor-pointer transition-colors"
                    >
                      <span className="text-stone-400 block font-bold">المفضلة</span>
                      <span className="text-pink-300 font-black block">❤️ 12 موديل</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => alert('تم مسح الذاكرة المؤقتة (Cache) وتسريع التطبيق بنجاح!')}
                      className="bg-stone-900/80 hover:bg-stone-850 p-2.5 rounded-lg border border-stone-800 text-center space-y-1 cursor-pointer transition-colors"
                    >
                      <span className="text-stone-400 block font-bold">الذاكرة المؤقتة</span>
                      <span className="text-emerald-400 font-black block">🧹 مسح الكاش</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => alert('اتصل بنا عبر الواتساب أو الدعم المباشر الإداري.')}
                      className="bg-stone-900/80 hover:bg-stone-850 p-2.5 rounded-lg border border-stone-800 text-center space-y-1 cursor-pointer transition-colors"
                    >
                      <span className="text-stone-400 block font-bold">الدعم والخصوصية</span>
                      <span className="text-purple-300 font-black block">🛡️ الشروط والدعم</span>
                    </button>
                  </div>
                </div>

                {/* 5️⃣ ACTION BUTTONS (الأزرار الإجرائية) */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-stone-850">
                  <button
                    type="button"
                    onClick={onLogout}
                    className="bg-amber-950/80 hover:bg-amber-900 border border-amber-800 text-amber-200 font-extrabold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer flex items-center gap-2"
                  >
                    <span>🚪 تسجيل الخروج من الحساب</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('هل أنت متأكد تماماً من رغبتك في حذف حسابك؟ ستفقد الوصول لسجل المشتريات والطلبات.')) {
                        alert('تم إرسال طلب حذف الحساب للإدارة وسوف يتم التواصل معك.');
                      }
                    }}
                    className="bg-red-950/50 hover:bg-red-900/80 border border-red-800/60 text-red-300 font-bold text-xs px-4 py-2.5 rounded-xl transition-all cursor-pointer"
                  >
                    ⚠️ حذف الحساب بالكامل
                  </button>
                </div>

              </div>
            )}

            {/* TAB 2: SELLER ACTIVATION FORM (FORM WIDGET) */}
            {activeProfileTab === 'activateStore' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between bg-stone-950 p-3 rounded-xl border border-stone-850">
                  <div>
                    <h4 className="text-xs font-bold text-amber-200">طلب فتح متجر / إضافة متجري التجاري بالمول</h4>
                    <p className="text-[10px] text-stone-400">تواصل مباشر مع الإدارة لتقديم طلبات الاعتماد وتأشيرة النشر والبيع</p>
                  </div>
                  {currentUser.role === 'vendor' && (
                    <span className="bg-emerald-950 text-emerald-300 border border-emerald-800 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      ✓ متجرك مفعّل حالياً
                    </span>
                  )}
                </div>

                {currentUser.storeApplicationStatus === 'pending' ? (
                  <div className="bg-amber-950/40 border border-amber-800/60 p-5 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                      <Clock size={18} className="animate-pulse text-amber-400" />
                      <span>طلب فتح متجر ({currentUser.storeName || currentUser.name}) قيد المراجعة والاعتماد</span>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      تم إرسال طلبك بنجاح وهو الآن قيد الدراسة والمراجعة بواسطة فريق إدارة المول الرقمي. سيتم إشعارك واعتماد الصلاحيات فور التدقيق.
                    </p>
                    <div className="bg-stone-900/80 p-3 rounded-xl border border-stone-800 text-xs space-y-1 text-stone-400">
                      <div>🏢 اسم المتجر: <span className="text-white font-bold">{currentUser.storeName || currentUser.name}</span></div>
                      <div>👤 اسم المالك: <span className="text-white font-bold">{currentUser.fullName || currentUser.name}</span></div>
                      <div>📍 السكن والمنطقة: <span className="text-white font-bold">{currentUser.currentResidence || 'صنعاء، اليمن'}</span></div>
                    </div>
                  </div>
                ) : currentUser.storeApplicationStatus === 'approved' || currentUser.role === 'vendor' ? (
                  <div className="bg-emerald-950/40 border border-emerald-800/60 p-5 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                      <CheckCircle2 size={18} className="text-emerald-400" />
                      <span>مبروك! تم تفعيل واعتماد متجرك ({currentUser.storeName || currentUser.name}) بنجاح</span>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      متجرك مفعّل الآن في المول الرقمي Digital Mall بكافة الصلاحيات لمباشرة إضافة وتصميم المعروضات والموديلات.
                    </p>
                    <button
                      onClick={() => {
                        const updatedUsers = database.users.map(u => u.id === currentUser.id ? { ...u, role: 'vendor' as const } : u);
                        onSave({ ...database, users: updatedUsers });
                      }}
                      className="bg-emerald-500 hover:bg-emerald-400 text-stone-950 font-black text-xs px-6 py-3 rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2"
                    >
                      <Briefcase size={16} />
                      <span>الانتقال إلى لوحة تحكم المتجر 🏬</span>
                    </button>
                  </div>
                ) : currentUser.storeApplicationStatus === 'rejected' ? (
                  <div className="bg-red-950/40 border border-red-800/60 p-5 rounded-2xl space-y-3">
                    <div className="flex items-center gap-2 text-red-300 font-bold text-sm">
                      <AlertCircle size={18} className="text-red-400" />
                      <span>لم يتم قبول الطلب حالياً</span>
                    </div>
                    <p className="text-xs text-stone-300 leading-relaxed">
                      سبب الرفض: <span className="text-red-200 font-bold">{currentUser.storeApplicationRejectReason || 'يرجى استكمال صورة الهوية وتأكيد اسم المتجر الحقيقي.'}</span>
                    </p>
                    <button
                      onClick={() => {
                        const updatedUsers = database.users.map(u => u.id === currentUser.id ? { ...u, storeApplicationStatus: undefined } : u);
                        onSave({ ...database, users: updatedUsers });
                      }}
                      className="bg-stone-900 hover:bg-stone-850 border border-stone-800 text-amber-300 font-bold text-xs px-5 py-2.5 rounded-xl transition-all cursor-pointer"
                    >
                      تعديل البيانات وإعادة تقديم الطلب 🔄
                    </button>
                  </div>
                ) : (
                <form onSubmit={handleActivateMerchantStore} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-stone-300 block">الاسم التجاري للمتجر:</label>
                      <input
                        type="text"
                        value={storeNameVal}
                        onChange={(e) => setStoreNameVal(e.target.value)}
                        placeholder="مثال: عبايات الأناقة اليمانية الفخمة"
                        className="w-full bg-stone-950 border border-stone-850 focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-white placeholder-stone-600 text-right focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-stone-300 block">اسم التاجر/التاجرة الثلاثي الكامل (كما في الهوية):</label>
                      <input
                        type="text"
                        value={merchantFullNameVal}
                        onChange={(e) => setMerchantFullNameVal(e.target.value)}
                        placeholder="مثال: أروى عبدالله صالح الكبسي"
                        className="w-full bg-stone-950 border border-stone-850 focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-white placeholder-stone-600 text-right focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-stone-300 block">عنوان السكن والإقامة الحالي في اليمن:</label>
                      <input
                        type="text"
                        value={residenceVal}
                        onChange={(e) => setResidenceVal(e.target.value)}
                        placeholder="مثال: اليمن - صنعاء - شارع حدة"
                        className="w-full bg-stone-950 border border-stone-850 focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-white placeholder-stone-600 text-right focus:outline-none transition-colors"
                        required
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[11px] font-bold text-stone-300 block">بيانات الحساب المالي أو محفظة الكريمي الإسلامي:</label>
                      <input
                        type="text"
                        value={bankDetailsVal}
                        onChange={(e) => setBankDetailsVal(e.target.value)}
                        placeholder="مثال: بنك الكريمي الإسلامي - حساب رقم 31102932"
                        className="w-full bg-stone-950 border border-stone-850 focus:border-[#D4AF37] rounded-xl px-4 py-2.5 text-xs text-white placeholder-stone-600 text-right focus:outline-none transition-colors"
                      />
                    </div>

                    <div className="space-y-1.5 md:col-span-2">
                      <label className="text-[11px] font-bold text-stone-300 block">صفة ونوع التاجر عند التسجيل:</label>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => setMerchantTypeVal('female')}
                          className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                            merchantTypeVal === 'female'
                              ? 'bg-pink-950/80 border-pink-500 text-pink-200 font-bold shadow-md ring-1 ring-pink-500/50'
                              : 'bg-stone-950 border-stone-850 text-stone-400 hover:border-stone-700'
                          }`}
                        >
                          <span className="text-xl">👩‍💼</span>
                          <div className="text-right">
                            <span className="text-xs font-bold block">تاجرة (أنثى)</span>
                            <span className="text-[9px] text-stone-400 block">مصممة أو صاحبة متجر أزياء وعبايات</span>
                          </div>
                        </button>

                        <button
                          type="button"
                          onClick={() => setMerchantTypeVal('male')}
                          className={`p-3 rounded-xl border flex items-center gap-2.5 cursor-pointer transition-all ${
                            merchantTypeVal === 'male'
                              ? 'bg-amber-950/80 border-amber-500 text-amber-200 font-bold shadow-md ring-1 ring-amber-500/50'
                              : 'bg-stone-950 border-stone-850 text-stone-400 hover:border-stone-700'
                          }`}
                        >
                          <span className="text-xl">👨‍💼</span>
                          <div className="text-right">
                            <span className="text-xs font-bold block">تاجر (ذكر)</span>
                            <span className="text-[9px] text-stone-400 block">مصمم أزياء أو صاحب متجر تجاري</span>
                          </div>
                        </button>
                      </div>
                    </div>

                  </div>

                  {/* Store Logo upload block */}
                  <div className="bg-stone-950 border border-stone-850 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-stone-300 block">شعار المتجر أو الأيقونة (من استديو أو معرض أو مدير ملفات الهاتف 🖼️):</span>
                        <span className="text-[10px] text-stone-400">اختر صورة لوجو أنيقة لتعريف العملاء بمتجرك التجاري في المول.</span>
                      </div>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleLogoPhotoAttach}
                          className="hidden"
                          id="merchant-logo-upload"
                        />
                        <label
                          htmlFor="merchant-logo-upload"
                          className="bg-[#D4AF37] hover:bg-amber-400 text-stone-950 text-[11px] font-black px-4 py-2 rounded-lg cursor-pointer transition-colors inline-flex items-center gap-1.5 shrink-0 shadow-md"
                        >
                          <Upload size={14} />
                          <span>📸 رفع الشعار من الهاتف</span>
                        </label>
                      </div>
                    </div>

                    {logoPhotoBase64 && (
                      <div className="flex items-center gap-3 bg-stone-900/50 p-2 rounded-lg border border-[#D4AF37]/50">
                        <img src={logoPhotoBase64} className="w-10 h-10 object-cover rounded-lg border border-[#D4AF37]" alt="Logo Thumbnail" />
                        <span className="text-[10px] text-[#D4AF37] font-extrabold flex items-center gap-1">
                          ✓ تم اختيار وتأكيد شعار المتجر بنجاح!
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Identity file upload block */}
                  <div className="bg-stone-950 border border-stone-850 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs font-bold text-stone-300 block">رفع صورة الهوية الوطنية أو جواز السفر (اختياري للتوثيق 🪪):</span>
                        <span className="text-[10px] text-stone-400">عند إضافة الهوية يتم توثيق متجرك فوراً وإظهار الشارة الزرقاء. وفي حال عدم رفعها يتم إضافة وتفعيل المتجر بشكل طبيعي بدون توثيق.</span>
                      </div>
                      <div className="relative">
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleIdCardPhotoAttach}
                          className="hidden"
                          id="merchant-id-upload"
                        />
                        <label
                          htmlFor="merchant-id-upload"
                          className="bg-stone-900 hover:bg-stone-850 text-stone-300 hover:text-white border border-stone-800 text-[11px] font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors inline-flex items-center gap-1.5"
                        >
                          <Upload size={13} />
                          <span>اختر صورة الهوية</span>
                        </label>
                      </div>
                    </div>

                    {idCardPhotoBase64 ? (
                      <div className="flex items-center gap-3 bg-stone-900/50 p-2 rounded-lg border border-emerald-800/60">
                        <img src={idCardPhotoBase64} className="w-12 h-8 object-cover rounded border border-emerald-500" alt="ID Thumbnail" />
                        <span className="text-[10px] text-emerald-400 font-extrabold flex items-center gap-1">
                          ✓ تم إرفاق الهوية! سيتم توثيق المتجر وتفعيل شارة التوثيق الزرقاء فور الحفظ.
                        </span>
                      </div>
                    ) : (
                      <p className="text-[10px] text-stone-400">ℹ️ لم تقومي/تقم بإرفاق الهوية. سيتم إضافة وتأكيد متجرك كمتجر عادي، ويمكنك توثيقه لاحقاً.</p>
                    )}
                  </div>

                  <div className="flex justify-end pt-2">
                    <button
                      type="submit"
                      disabled={isActivatingStore}
                      className="w-full md:w-auto bg-gradient-to-r from-[#D4AF37] to-amber-500 hover:from-amber-500 text-stone-950 hover:scale-[1.02] font-black text-xs px-8 py-3.5 rounded-xl transition-all cursor-pointer shadow-md shadow-amber-950/20 flex items-center justify-center gap-2"
                    >
                      <Sparkles size={14} />
                      <span>{isActivatingStore ? 'جاري تنشيط المتجر وتأسيس القناة السحابية...' : 'تنشيط متجري الخاص وتأكيد التزامن مع المنصة ⚡'}</span>
                    </button>
                  </div>
                </form>
                )}
              </div>
            )}

          </div>
        </div>
      )}

      {/* 4. LUXURIOUS BRIGHT CONTACT SUPPORT FOOTER - Social media links mapped */}
      <div className="bg-[#1C1C1D] border border-stone-800 rounded-2xl p-6 text-center space-y-4">
        <h4 className="font-extrabold text-white text-xs uppercase tracking-widest flex items-center justify-center gap-1.5">
          <Sparkles size={14} className="text-[#D4AF37]" strokeWidth={2.5} />
          <span>قنوات التواصل الاجتماعي المعتمدة لـ المول الرقمي Digital Mall</span>
        </h4>
        <p className="text-[10px] text-stone-500 max-w-sm mx-auto">تحدثي مع وكلائنا مباشرة أو تابعـي أحدث الموديلات المطرزة التي نطرحها يومياً</p>
        
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          {database.socialLinks.whatsapp && (
            <a
              href={database.socialLinks.whatsapp}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#25D366]/10 hover:bg-[#25D366]/20 border border-[#25D366]/20 text-[#25D366] font-extrabold text-xs transition-colors"
            >
              <Phone size={14} />
              <span>خدمة العملاء واتساب</span>
            </a>
          )}

          {database.socialLinks.instagram && (
            <a
              href={database.socialLinks.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#E1306C]/10 hover:bg-[#E1306C]/20 border border-[#E1306C]/20 text-[#E1306C] font-extrabold text-xs transition-colors"
            >
              <Instagram size={14} />
              <span>انستقرام الرسمي</span>
            </a>
          )}

          {database.socialLinks.facebook && (
            <a
              href={database.socialLinks.facebook}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1877F2]/10 hover:bg-[#1877F2]/20 border border-[#1877F2]/20 text-[#1877F2] font-extrabold text-xs transition-colors"
            >
              <Facebook size={14} />
              <span>الفيسبوك الفاخر</span>
            </a>
          )}

          {database.socialLinks.telegram && (
            <a
              href={database.socialLinks.telegram}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0088cc]/10 hover:bg-[#0088cc]/20 border border-[#0088cc]/20 text-[#0088cc] font-extrabold text-xs transition-colors"
            >
              <Share2 size={14} />
              <span>قناة التلجرام</span>
            </a>
          )}

          {database.socialLinks.tiktok && (
            <a
              href={database.socialLinks.tiktok}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-cyan-950/40 hover:bg-cyan-900/40 border border-cyan-800/40 text-cyan-400 font-extrabold text-xs transition-colors"
            >
              <span>تيك توك</span>
            </a>
          )}

          {database.socialLinks.phone && (
            <a
              href={`tel:${database.socialLinks.phone}`}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-amber-950/40 hover:bg-amber-900/40 border border-amber-800/40 text-amber-300 font-extrabold text-xs transition-colors"
            >
              <PhoneCall size={14} />
              <span>اتصال مباشر: {database.socialLinks.phone}</span>
            </a>
          )}
        </div>
      </div>

    </div>
  );
}
