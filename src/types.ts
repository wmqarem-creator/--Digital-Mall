/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type UserRole = 'admin' | 'accountant' | 'receiver' | 'vendor' | 'customer';

export interface EmployeePermissions {
  manageProducts: boolean;
  manageCategories: boolean;
  manageBanks: boolean;
  manageBanners: boolean;
  manageEmployeeRoles: boolean;
  auditTransfers: boolean; // مراجعة وتأكيد الحوالات والمالية
  manageOrders: boolean;   // إدارة شحن وتجهيز الطرود
  viewReports: boolean;    // عرض التقارير والإحصائيات المالية
}

export interface UserProfile {
  id: string;
  email: string;
  phone: string;
  role: UserRole;
  name: string;
  fullName?: string; // Vendor physical name
  currentResidence?: string; // Vendor physical residence address (Required)
  idCardPhoto?: string; // Vendor base64 identity snapshot (Photo 1)
  idCardPhoto2?: string; // Vendor base64 identity snapshot (Photo 2 - Optional)
  passportPhoto?: string; // Vendor base64 passport snapshot (Optional)
  shopLicensePhoto?: string; // Vendor base64 shop commercial license (Optional)
  logoImage?: string; // Vendor logo image (Base64 or URL)
  isApproved?: boolean; // Admin store approval status
  isPublishApproved?: boolean; // Admin publish permission approval status
  isVerified?: boolean; // Admin verification status (Blue badge)
  latitude?: number; // Map location latitude
  longitude?: number; // Map location longitude
  mapAddress?: string; // Selected address or coordinates descriptor
  bankAccountDetails?: string; // Optional banking coordinates
  permissions?: EmployeePermissions; // Roles control
  isBlocked?: boolean; // Blocked or suspended account status
  commissionTier?: 'bronze' | 'silver' | 'gold'; // Store category / tier level
  customCommissionRate?: number; // Specific platform commission percentage/amount for this vendor
  taxRate?: number; // Store sales tax rate percentage
  shippingTariff?: number; // Delivery handling fee tariff for this store
  followersCount?: number; // Total count of followers
  followedByUserIds?: string[]; // List of user IDs/phones following this store
  hidePrivateContact?: boolean; // Admin toggle to hide vendor personal name, phone, and physical address from public view
  merchantType?: 'female' | 'male'; // Female merchant (تاجرة) or male merchant (تاجر)
  customStoreCategories?: { id: string; name: string; count?: number }[]; // Internal store categories
  storeApplicationStatus?: 'pending' | 'approved' | 'rejected'; // Status of vendor store creation request
  storeApplicationRejectReason?: string; // Reason if vendor store application was rejected
  storeName?: string; // Proposed store commercial name
  storeActivity?: string; // Business/activity type (e.g., أزياء وعبايات، إكسسوارات)
  isGoogleLinked?: boolean; // True if Google account is linked to phone
  createdAt: string;
}

export interface Category {
  id: string;
  name: string;
  name_ar: string;
  name_en: string;
  image: string; // القسم - صورة القسم
  navigation_menu?: string[];
  picks_for_you?: string[];
  may_also_like?: string[];
  sub_categories?: Record<string, string[]>;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number; // Customer price (including platform commission)
  originalPrice: number; // Base vendor price (if added by vendor)
  commission: number; // Profit share margin (e.g., flat 300 YER or customized)
  categoryId: string;
  subCategoryId?: string; // Explicit subcategory selection code
  subCategoryLeaf?: string; // Explicit sub-category leaf element (e.g. Abaya type or Pant style)
  navigationTag?: string; // Explicit quick navigation menu tag
  image: string;
  images?: string[]; // Up to 10 images for a single product
  vendorId: string | null; // null represents platform/master store
  isAffiliateEnabled: boolean;
  availableSizes?: string[]; // e.g., ['S', 'M', 'L', 'XL', 'FREE', '38', '40', '42']
  sizeStock?: Record<string, number>; // Stock per size
  materialType?: string; // نوع الخامة
  embroideryType?: string; // نوع التطريز
  stockQuantity?: number; // الكمية المتوفرة في المخزن
  isOutofStock?: boolean; // حالة التوفر (نافد / متوفر)
  isHidden?: boolean; // إخفاء مؤقت من العرض العام
  availableColors?: string[]; // الألوان المتوفرة
  availableEmbroideries?: string[]; // التطريزات والتطعيمات المتوفرة
  sizeTemplate?: 'women' | 'kids' | 'shoes' | 'custom'; // قالب المقاسات الجاهزة
  imageFitMode?: 'cover' | 'contain' | 'fill'; // وضع ملاءمة وضبط إطار صورة الموديل
  createdAt: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  selectedSize?: string;
  selectedColor?: string;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: UserRole;
  text: string;
  imageAttachment?: string; // Image message attachment (captures or documents)
  timestamp: string;
}

export interface Order {
  id: string;
  customerId: string;
  customerName?: string;
  customerPhone: string;
  deliveryAddress?: string;
  items: CartItem[];
  totalAmount: number;
  bankName: string; // البسيري، الشرق، الشبكة الموحدة، وبنك الكريمي
  accountNumber: string; // The selected account details
  receiptImage: string; // Mandatory receipt photo
  transactionRefId?: string; // Validated transaction proof ID or reference number
  status: 'pending_payment' | 'processing' | 'shipped' | 'completed';
  customerResidence?: string; // تفاصيل إقامة العميل التفصيلية للتوصيل
  customerLatitude?: number;  // خط العرض لموقع التوصيل على الخريطة
  customerLongitude?: number; // خط الطول لموقع التوصيل على الخريطة
  customerMapAddress?: string; // العنوان المعتمد من الخريطة للتوصيل
  shippingCompanyId?: string; // رقم شركة الشحن المختارة
  shippingCompanyName?: string; // اسم شركة الشحن والتوصيل
  shippingFee?: number; // قيمة رسوم الشحن والتوصيل
  createdAt: string;
  updatedAt: string;
  chatMessages: ChatMessage[];
  reviews?: {
    productRating: number;
    vendorRating: number;
    storeRating: number;
    comment: string;
  };
}

export interface BankAccount {
  id: string;
  bankName: string; // e.g. بنك الكريمي
  accountNumber: string; // e.g. 123456789
  accountHolder: string; // e.g. شركة المول الرقمي Digital Mall
  notes?: string;
}

export interface SocialLinks {
  whatsapp: string;
  instagram: string;
  facebook: string;
  telegram?: string;
  tiktok?: string;
  youtube?: string;
  phone?: string;
}

export interface AuditLog {
  id: string;
  operatorId: string;
  operatorName: string;
  operatorRole: UserRole;
  actionType: string; // e.g., "إضافة موظف" | "تأكيد حوالة" | "شحن الطلب"
  timestamp: string;
  details: string;
}

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  image: string;
  productId?: string; // Click redirection target
  active: boolean;
}

export interface WithdrawalRequest {
  id: string;
  vendorId: string;
  vendorName: string;
  amount: number;
  bankName: string;
  accountNumber: string;
  status: 'pending' | 'approved' | 'rejected';
  requestedAt: string;
  createdAt?: string;
  processedAt?: string;
}

export interface ProductReview {
  id: string;
  productId: string;
  customerId: string;
  customerName: string;
  customerPhone?: string;
  rating: number; // 1 to 5 stars
  comment: string;
  createdAt: string;
}

export interface VendorNotification {
  id: string;
  vendorId: string;
  orderId: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
}

export interface ShippingCompany {
  id: string;
  name: string;
  price?: number;
  fee?: number;
  active: boolean;
  notes?: string;
  estimatedTime?: string;
  coverageAreas?: string[];
}

export interface ShippingSettings {
  appExpressShippingEnabled?: boolean;
  externalShippingEnabled?: boolean;
  companies?: ShippingCompany[];
  enableAppShipping?: boolean; // الشحن والتوصيل المباشر عبر التطبيق
  enableExternalShipping?: boolean; // الشحن عبر شركات خارجية
  externalCompanies?: ShippingCompany[];
  showToVendors: boolean; // إظهار التحكم للتاجر في اللوحة
}

export interface AppAppearanceSettings {
  primaryColor: string; // e.g. '#D4AF37'
  accentColor: string; // e.g. '#F8C8DC'
  appTitle?: string;
  appLogoUrl?: string;
  customIconsTheme?: 'gold' | 'rose' | 'emerald' | 'classic';
  showPromoBanner?: boolean;
}

export interface AppDatabase {
  users: UserProfile[];
  categories: Category[];
  products: Product[];
  orders: Order[];
  bankAccounts: BankAccount[];
  socialLinks: SocialLinks;
  auditLogs: AuditLog[];
  banners: Banner[];
  withdrawalRequests: WithdrawalRequest[];
  productReviews?: ProductReview[];
  vendorNotifications?: VendorNotification[];
  shippingSettings?: ShippingSettings;
  appAppearanceSettings?: AppAppearanceSettings;
  commissionSettings: {
    vendorCommissionEnabled: boolean;
    flatCommissionRate: number;
    isFreeBeginning?: boolean; // Free subscription/fees period toggle
  };
}

