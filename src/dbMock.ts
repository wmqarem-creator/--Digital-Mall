import { 
  UserProfile, 
  Category, 
  Product, 
  BankAccount, 
  SocialLinks, 
  AuditLog, 
  Banner, 
  Order, 
  WithdrawalRequest,
  UserRole,
  AppDatabase
} from './types';

// Luxury Base64/SVG assets so that real product images show up beautifully as requested!
export const MOCK_IMAGES = {
  abayaCategory: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="%231E1E1E"/><rect x="5" y="5" width="90" height="90" rx="12" stroke="%23D4AF37" stroke-width="1.5" stroke-dasharray="4 2"/><path d="M50 15 L25 85 h50 Z" fill="%232C2C2C" stroke="%23F8C8DC" stroke-width="2"/><path d="M50 15 L50 85" stroke="%23D4AF37" stroke-width="1.5"/><circle cx="50" cy="35" r="3" fill="%23D4AF37"/><circle cx="50" cy="50" r="3" fill="%23D4AF37"/><circle cx="50" cy="65" r="3" fill="%23D4AF37"/><text x="50" y="93" fill="%23D4AF37" font-size="8" font-family="sans-serif" font-weight="bold" text-anchor="middle">العبايات</text></svg>`,
  
  dressCategory: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="%231E1E1E"/><rect x="5" y="5" width="90" height="90" rx="12" stroke="%23D4AF37" stroke-width="1.5" stroke-dasharray="4 2"/><path d="M50 15 L35 40 L30 85 h40 L65 40 Z" fill="%232C2C2C" stroke="%23F8C8DC" stroke-width="2"/><path d="M35 40 Q50 35 65 40" stroke="%23D4AF37" stroke-width="1.5"/><path d="M50 15 v25" stroke="%23D4AF37" stroke-width="1.5"/><text x="50" y="93" fill="%23D4AF37" font-size="8" font-family="sans-serif" font-weight="bold" text-anchor="middle">فساتين</text></svg>`,
  
  kidsCategory: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="%231E1E1E"/><rect x="5" y="5" width="90" height="90" rx="12" stroke="%23D4AF37" stroke-width="1.5" stroke-dasharray="4 2"/><path d="M50 20 L38 45 h24 Z" fill="%23F8C8DC" opacity="0.8"/><rect x="42" y="45" width="16" height="30" rx="3" fill="%232C2C2C" stroke="%23D4AF37" stroke-width="1.5"/><circle cx="45" cy="30" r="4" fill="%23D4AF37"/><circle cx="55" cy="30" r="4" fill="%23D4AF37"/><text x="50" y="93" fill="%23D4AF37" font-size="8" font-family="sans-serif" font-weight="bold" text-anchor="middle">أطفال</text></svg>`,
  
  accessoriesCategory: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="%231E1E1E"/><rect x="5" y="5" width="90" height="90" rx="12" stroke="%23D4AF37" stroke-width="1.5" stroke-dasharray="4 2"/><circle cx="50" cy="45" r="25" stroke="%23D4AF37" stroke-width="3" fill="none"/><path d="M50 20 L50 10" stroke="%23F8C8DC" stroke-width="2"/><circle cx="50" cy="45" r="10" fill="%23F8C8DC" opacity="0.6"/><circle cx="50" cy="45" r="4" fill="%23D4AF37"/><text x="50" y="93" fill="%23D4AF37" font-size="8" font-family="sans-serif" font-weight="bold" text-anchor="middle">إكسسوارات</text></svg>`,

  royalScarfProduct: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" fill="none"><rect width="160" height="160" rx="16" fill="%23151515"/><rect x="8" y="8" width="144" height="144" rx="8" stroke="%23D4AF37" stroke-width="1" stroke-opacity="0.3"/><path d="M40 30 Q80 10 120 30 T80 150 Q50 90 40 30 Z" fill="%232E2226" stroke="%23F8C8DC" stroke-width="2"/><path d="M55 45 C75 35 85 35 105 45" stroke="%23D4AF37" stroke-width="1.5" stroke-dasharray="3 3"/><ellipse cx="80" cy="85" rx="15" ry="10" fill="%23D4AF37" opacity="0.9"/><path d="M80 85 L80 130" stroke="%23F8C8DC" stroke-width="2"/><circle cx="80" cy="85" r="4" fill="%23151515"/><text x="80" y="145" fill="%23D4AF37" font-size="10" font-family="sans-serif" text-anchor="middle">إسكارف حرير ملكي</text></svg>`,

  blackAbayaProduct: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" fill="none"><rect width="160" height="160" rx="16" fill="%23151515"/><rect x="8" y="8" width="144" height="144" rx="8" stroke="%23D4AF37" stroke-width="1" stroke-opacity="0.3"/><path d="M50 20 L25 140 h110 L110 20 Z" fill="%23101010" stroke="%23F8C8DC" stroke-width="2"/><path d="M80 20 L80 140" stroke="%23D4AF37" stroke-width="1.5"/><path d="M50 20 L80 40 L110 20" fill="none" stroke="%23D4AF37" stroke-width="2"/><circle cx="80" cy="55" r="4" fill="%23F8C8DC"/><circle cx="80" cy="75" r="4" fill="%23F8C8DC"/><circle cx="80" cy="95" r="4" fill="%23F8C8DC"/><text x="80" y="152" fill="%23D4AF37" font-size="9" font-family="sans-serif" text-anchor="middle">العباءة الملكية الفاخرة</text></svg>`,

  premiumDressProduct: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" fill="none"><rect width="160" height="160" rx="16" fill="%23151515"/><rect x="8" y="8" width="144" height="144" rx="8" stroke="%23D4AF37" stroke-width="1" stroke-opacity="0.3"/><path d="M80 20 L50 60 Q35 110 30 140 h100 Q125 110 110 60 Z" fill="%232D1B22" stroke="%23F8C8DC" stroke-width="2"/><path d="M50 60 Q80 50 110 60" stroke="%23D4AF37" stroke-width="1.5"/><circle cx="80" cy="85" r="6" fill="%23D4AF37"/><text x="80" y="152" fill="%23D4AF37" font-size="9" font-family="sans-serif" text-anchor="middle">فستان الدانتيل الفخم</text></svg>`,

  kidsSetProduct: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" fill="none"><rect width="160" height="160" rx="16" fill="%23151515"/><rect x="8" y="8" width="144" height="144" rx="8" stroke="%23D4AF37" stroke-width="1" stroke-opacity="0.3"/><path d="M80 25 L55 55 h50 Z" fill="%23F8C8DC" stroke="%23D4AF37" stroke-width="1.5"/><rect x="63" y="55" width="34" height="65" rx="6" fill="%231C1A1B" stroke="%23F8C8DC" stroke-width="2"/><path d="M70 120 L65 140 M90 120 L95 140" stroke="%23D4AF37" stroke-width="3"/><text x="80" y="152" fill="%23D4AF37" font-size="9" font-family="sans-serif" text-anchor="middle">وشاح وقبعة أنيقة للأطفال</text></svg>`,

  broochProduct: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" fill="none"><rect width="160" height="160" rx="16" fill="%23151515"/><rect x="8" y="8" width="144" height="144" rx="8" stroke="%23D4AF37" stroke-width="1" stroke-opacity="0.3"/><circle cx="80" cy="70" r="30" stroke="%23D4AF37" stroke-width="4" fill="%23222222"/><path d="M50 70 h60 M80 40 v60" stroke="%23F8C8DC" stroke-width="2"/><circle cx="80" cy="70" r="12" fill="%23F8C8DC" opacity="0.7"/><circle cx="80" cy="70" r="5" fill="%23D4AF37"/><text x="80" y="145" fill="%23D4AF37" font-size="9" font-family="sans-serif" text-anchor="middle">بروش ذهبي فاخر مرصع بالياقوت</text></svg>`,

  menThobeProduct: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" fill="none"><rect width="160" height="160" rx="16" fill="%23151515"/><rect x="8" y="8" width="144" height="144" rx="8" stroke="%23D4AF37" stroke-width="1" stroke-opacity="0.3"/><path d="M55 20 H105 L115 140 H45 Z" fill="%23ECECEE" stroke="%23D4AF37" stroke-width="1.5"/><path d="M80 20 V65" stroke="%23D4AF37" stroke-width="2"/><circle cx="80" cy="35" r="2.5" fill="%23111"/><circle cx="80" cy="50" r="2.5" fill="%23111"/><path d="M68 20 C72 25 88 25 92 20" fill="none" stroke="%23D4AF37" stroke-width="2"/><text x="80" y="152" fill="%23D4AF37" font-size="9" font-family="sans-serif" text-anchor="middle">ثوب كاجوال مطرز</text></svg>`,

  menSuitProduct: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 160 160" fill="none"><rect width="160" height="160" rx="16" fill="%23151515"/><rect x="8" y="8" width="144" height="144" rx="8" stroke="%23D4AF37" stroke-width="1" stroke-opacity="0.3"/><path d="M50 30 H110 L115 130 H45 Z" fill="%231E1E24" stroke="%23F8C8DC" stroke-width="1.5"/><path d="M80 30 L60 65 H100 Z" fill="%23ECECEE"/><path d="M80 65 V130" stroke="%23D4AF37" stroke-width="1.5"/><path d="M80 30 L55 60 L80 85 L105 60 Z" fill="none" stroke="%23D4AF37" stroke-width="2"/><text x="80" y="152" fill="%23D4AF37" font-size="9" font-family="sans-serif" text-anchor="middle">طقم بدلة رسمية كلاسيكية</text></svg>`,

  // Default beautiful ad banner
  adBannerBg: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300" fill="none"><rect width="800" height="300" rx="16" fill="%231E1216"/><path d="M0 0 Q400 150 800 0 v300 Q400 150 0 300 Z" fill="%23150D10"/><rect x="20" y="20" width="760" height="260" rx="12" stroke="%23D4AF37" stroke-width="1.5" stroke-opacity="0.4" stroke-dasharray="8 4"/><text x="400" y="120" fill="%23D4AF37" font-size="36" font-family="sans-serif" font-weight="900" text-anchor="middle">مجموعة الموديلات الملكية الجديدة</text><text x="400" y="170" fill="%23F8C8DC" font-size="18" font-family="sans-serif" font-weight="normal" text-anchor="middle">عبايات، فساتين، وشالات مطرزة بخيوط الذهب الفاخرة</text><text x="400" y="220" fill="%23FFFFFF" font-size="14" font-family="sans-serif" font-weight="bold" text-anchor="middle">خصومات تصل إلى %30 - تسوقي الآن</text></svg>`,
  
  adBannerAffiliate: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 300" fill="none"><rect width="800" height="300" rx="16" fill="%231A1A2E"/><path d="M0 300 L800 0 v300 Z" fill="%2316213E" opacity="0.5"/><rect x="20" y="20" width="760" height="260" rx="12" stroke="%23D4AF37" stroke-width="1.5" stroke-opacity="0.4" stroke-dasharray="8 4"/><text x="400" y="120" fill="%23D4AF37" font-size="34" font-family="sans-serif" font-weight="900" text-anchor="middle">انضم كـ تاجر بالعمولة في المول الرقمي Digital Mall</text><text x="400" y="175" fill="%23F8C8DC" font-size="18" font-family="sans-serif" text-anchor="middle">حققي أرباحاً هائلة بسحب مباشر لكافة البنوك المحلية اليمنية</text><text x="400" y="225" fill="%23FFFFFF" font-size="14" font-family="sans-serif" font-weight="bold" text-anchor="middle">بدون شروط معقدة - ابدئي تجارتكِ اليوم</text></svg>`
};

export const INITIAL_DATABASE: AppDatabase = {
  users: [
    {
      id: 'admin_user',
      email: 'hamazz1984@gmail.com',
      phone: '+967780044700',
      role: 'admin',
      name: 'المدير العام',
      fullName: 'المدير العام للمتجر الأمني',
      createdAt: new Date('2026-01-01T00:00:00Z').toISOString()
    },
    {
      id: 'acc_user',
      email: 'accountant@digitalmall.com',
      phone: '+967771122334',
      role: 'accountant',
      name: 'أحمد المحاسب المالي',
      fullName: 'أحمد علي عوبثان',
      permissions: {
        manageProducts: true,
        manageCategories: true,
        manageBanks: true,
        manageBanners: true,
        manageEmployeeRoles: false,
        auditTransfers: true,
        manageOrders: true,
        viewReports: true
      },
      createdAt: new Date('2026-01-05T00:00:00Z').toISOString()
    },
    {
      id: 'staff_user',
      email: 'reception@digitalmall.com',
      phone: '+967711223344',
      role: 'receiver',
      name: 'سارة موظفة الاستقبال',
      fullName: 'سارة خالد المحضار',
      permissions: {
        manageProducts: true,
        manageCategories: true,
        manageBanks: false,
        manageBanners: true,
        manageEmployeeRoles: false,
        auditTransfers: false,
        manageOrders: true,
        viewReports: false
      },
      createdAt: new Date('2026-01-10T00:00:00Z').toISOString()
    },
    {
      id: 'vendor_sample',
      email: 'arwa_vendor@gmail.com',
      phone: '+967733221100',
      role: 'vendor',
      merchantType: 'female',
      name: 'أروى الأنيقة للعبايات',
      fullName: 'أروى أحمد الكبسي',
      currentResidence: 'اليمن - صنعاء - حدة',
      logoImage: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="48" fill="%232D2226" stroke="%23D4AF37" stroke-width="2"/><text x="50" y="55" fill="%23F8C8DC" font-size="28" font-family="'Cairo', sans-serif" font-weight="bold" text-anchor="middle">أروى</text></svg>`,
      idCardPhoto: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80" fill="none"><rect width="120" height="80" rx="4" fill="%23222"/><text x="60" y="45" fill="%23D4AF37" font-size="8" font-family="sans-serif" text-anchor="middle">البطاقة الشخصية - الوجه الأول</text></svg>`,
      idCardPhoto2: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80" fill="none"><rect width="120" height="80" rx="4" fill="%23222"/><text x="60" y="45" fill="%23D4AF37" font-size="8" font-family="sans-serif" text-anchor="middle">البطاقة الشخصية - الوجه الثاني</text></svg>`,
      isApproved: true,
      isPublishApproved: true,
      isVerified: true,
      bankAccountDetails: 'بنك الكريمي: 31102932',
      latitude: 15.3694,
      longitude: 44.1910,
      mapAddress: 'صنعاء، حي حدة، شارع الخمسين',
      createdAt: new Date('2026-01-12T00:00:00Z').toISOString()
    },
    {
      id: 'vendor_bilqis',
      email: 'bilqis_fashion@gmail.com',
      phone: '+967775544332',
      role: 'vendor',
      merchantType: 'female',
      name: 'متجر بلقيس الملكية',
      fullName: 'بلقيس عمر الشرماني',
      currentResidence: 'اليمن - عدن - المعلا',
      logoImage: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="48" fill="%231E1E28" stroke="%23F8C8DC" stroke-width="2"/><text x="50" y="55" fill="%23D4AF37" font-size="24" font-family="'Cairo', sans-serif" font-weight="bold" text-anchor="middle">بلقيس</text></svg>`,
      idCardPhoto: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80" fill="none"><rect width="120" height="80" rx="4" fill="%23111"/><text x="60" y="45" fill="%23F8C8DC" font-size="8" font-family="sans-serif" text-anchor="middle">بطاقة الشخصية - بلقيس الشرماني</text></svg>`,
      idCardPhoto2: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80" fill="none"><rect width="120" height="80" rx="4" fill="%23111"/><text x="60" y="45" fill="%23F8C8DC" font-size="8" font-family="sans-serif" text-anchor="middle">الظهر - بطاقة بلقيس</text></svg>`,
      shopLicensePhoto: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 80" fill="none"><rect width="120" height="80" rx="4" fill="%23222"/><text x="60" y="45" fill="%23D4AF37" font-size="8" font-family="sans-serif" text-anchor="middle">سجل تجاري / ترخيص محل</text></svg>`,
      isApproved: true,
      isPublishApproved: true,
      isVerified: false,
      bankAccountDetails: 'شركة البسيري للصرافة: 5012903',
      mapAddress: 'عدن، شارع المعلا الرئيسي',
      createdAt: new Date('2026-02-01T00:00:00Z').toISOString()
    },
    {
      id: 'vendor_sheikha',
      email: 'sheikha_boutique@gmail.com',
      phone: '+967711998877',
      role: 'vendor',
      merchantType: 'female',
      name: 'بوتيك الشيخة للفساتين والشيلان',
      fullName: 'شيخة عبدالملك الحوري',
      currentResidence: 'اليمن - تعز - شارع جمال',
      logoImage: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="48" fill="%232A1F2D" stroke="%23D4AF37" stroke-width="2"/><text x="50" y="55" fill="%23D4AF37" font-size="22" font-family="'Cairo', sans-serif" font-weight="bold" text-anchor="middle">الشيخة</text></svg>`,
      isApproved: true,
      isPublishApproved: true,
      isVerified: true,
      bankAccountDetails: 'بنك اليمن والكويت: 1008200',
      mapAddress: 'تعز، شارع جمال عبد الناصر',
      createdAt: new Date('2026-02-10T00:00:00Z').toISOString()
    },
    {
      id: 'vendor_falaq',
      email: 'falaq_fashion@gmail.com',
      phone: '+967773300112',
      role: 'vendor',
      merchantType: 'female',
      name: 'متجر الفلق للموديلات الحديثة 👗',
      fullName: 'هدى محمد باوزير',
      currentResidence: 'اليمن - حضرموت - المكلا',
      logoImage: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="48" fill="%232D1B22" stroke="%23D4AF37" stroke-width="2"/><text x="50" y="55" fill="%23F8C8DC" font-size="22" font-family="'Cairo', sans-serif" font-weight="bold" text-anchor="middle">الفلق</text></svg>`,
      isApproved: true,
      isPublishApproved: true,
      isVerified: true,
      bankAccountDetails: 'بنك حضرموت التجاري: 8820192',
      mapAddress: 'حضرموت، المكلا، شارع الستين',
      createdAt: new Date('2026-02-15T00:00:00Z').toISOString()
    },
    {
      id: 'vendor_alghalib',
      email: 'alghalib_men@gmail.com',
      phone: '+967734455667',
      role: 'vendor',
      merchantType: 'male',
      name: 'متجر الأناقة للرجل 👔',
      fullName: 'خالد أحمد العلفي',
      currentResidence: 'اليمن - صنعاء - الأصبحي',
      logoImage: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="48" fill="%231E1E28" stroke="%23D4AF37" stroke-width="2"/><text x="50" y="55" fill="%23D4AF37" font-size="20" font-family="'Cairo', sans-serif" font-weight="bold" text-anchor="middle">الأناقة</text></svg>`,
      isApproved: true,
      isPublishApproved: true,
      isVerified: true,
      bankAccountDetails: 'بنك الكريمي الإسلامي: 3091823',
      mapAddress: 'صنعاء، شارع الأصبحي الرئيسي',
      createdAt: new Date('2026-02-18T00:00:00Z').toISOString()
    },
    {
      id: 'vendor_reem',
      email: 'reem_accessories@gmail.com',
      phone: '+967712233445',
      role: 'vendor',
      merchantType: 'female',
      name: 'ريم براند للإكسسوارات والشيلان 💍',
      fullName: 'ريم يحيى الشامي',
      currentResidence: 'اليمن - إب - شارع العدين',
      logoImage: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><circle cx="50" cy="50" r="48" fill="%23221C2B" stroke="%23F8C8DC" stroke-width="2"/><text x="50" y="55" fill="%23F8C8DC" font-size="24" font-family="'Cairo', sans-serif" font-weight="bold" text-anchor="middle">ريم</text></svg>`,
      isApproved: true,
      isPublishApproved: true,
      isVerified: true,
      bankAccountDetails: 'شركة النجم للصرافة: 771092',
      mapAddress: 'إب، شارع العدين الرئيسي',
      createdAt: new Date('2026-02-20T00:00:00Z').toISOString()
    }
  ],
  categories: [
    {
      id: 'offers_and_sales',
      name: 'قسم العروض والتخفيضات',
      name_ar: 'قسم العروض والتخفيضات',
      name_en: "Offers & Sales",
      image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="%231E1E1E"/><rect x="5" y="5" width="90" height="90" rx="12" stroke="%23D4AF37" stroke-width="1.5" stroke-dasharray="4 2"/><path d="M30 30 H70 L60 70 H40 Z" fill="%232C2C2C" stroke="%23D4AF37" stroke-width="2"/><text x="50" y="52" fill="%23D4AF37" font-size="14" font-weight="bold" text-anchor="middle">%</text><text x="50" y="93" fill="%23D4AF37" font-size="8" font-family="sans-serif" font-weight="bold" text-anchor="middle">عروض وتخفيضات</text></svg>`,
      navigation_menu: [
        "تخفيضات كبرى (Mega Sales)",
        "عروض لفترة محدودة (Flash Sales)",
        "تصفية نهاية الموسم (End of Season Clearance)",
        "خصومات ملابس النساء",
        "خصومات ملابس الرجال",
        "خصومات ملابس الأطفال",
        "الأكثر مبيعاً ورواجاً",
        "المنتجات الأعلى تقييماً",
        "أحدث صيحات الموضة"
      ],
      sub_categories: {
        "تخفيضات وعروض الموسم": [
          "تخفيضات كبرى (Mega Sales)",
          "عروض لفترة محدودة (Flash Sales)",
          "تصفية نهاية الموسم (End of Season Clearance)"
        ],
        "عروض فئات محددة": [
          "خصومات ملابس النساء",
          "خصومات ملابس الرجال",
          "خصومات ملابس الأطفال"
        ],
        "الفلاتر الرائجة": [
          "الأكثر مبيعاً ورواجاً",
          "المنتجات الأعلى تقييماً",
          "أحدث صيحات الموضة"
        ]
      }
    },
    {
      id: 'women_section',
      name: 'قسم الملابس النسائية',
      name_ar: 'قسم الملابس النسائية',
      name_en: "Women's Department",
      image: MOCK_IMAGES.abayaCategory,
      navigation_menu: [
        "الملابس العلوية (Tops)",
        "الملابس السفلية (Bottoms)",
        "الفساتين والجمبسوت",
        "الملابس الخارجية والشتوية",
        "ملابس النوم والمنزل",
        "ملابس رياضية",
        "ملابس البحر",
        "الأحذية النسائية",
        "الإكسسوارات والحقائب"
      ],
      sub_categories: {
        "الملابس العلوية (Tops)": [
          "تيشرتات",
          "بلوزات وقمصان",
          "توب وبوديز"
        ],
        "الملابس السفلية (Bottoms)": [
          "بنطلونات جينز",
          "بنطلونات قماش وليجنز",
          "تنانير وشورتات"
        ],
        "الفساتين والجمبسوت (Dresses & Jumpsuits)": [
          "فساتين كاجوال",
          "فساتين سهرة ومناسبات",
          "جمبسوت وأوفرول"
        ],
        "الملابس الخارجية والشتوية (Outerwear & Winter)": [
          "جاكيتات ومعاطف",
          "كارديجان وكيمونو",
          "هوديز وسويت شيرت"
        ],
        "ملابس النوم والمنزل (Loungewear & Sleepwear)": [
          "بيجامات",
          "روب وفساتين نوم",
          "ملابس مريحة للمنزل"
        ],
        "ملابس رياضية (Activewear)": [
          "حمالات صدر رياضية",
          "بنطلونات وشورتات رياضية",
          "أطقم رياضية كاملة"
        ],
        "ملابس البحر (Beachwear)": [
          "مايوهات قطعة واحدة",
          "بكيني وتانكيني",
          "كاش مايوه وفساتين بحر"
        ],
        "الأحذية النسائية (Shoes)": [
          "أحذية كعب عالي",
          "أحذية مسطحة وفلات",
          "أحذية رياضية",
          "صنادل وشباشب",
          "أبوات / بوت طويل"
        ],
        "الإكسسوارات والحقائب (Accessories & Bags)": [
          "حقائب يد ومحافظ",
          "نظارات شمسية وساعات",
          "أوشحة وشالات وإكسسوارات شعر"
        ]
      }
    },
    {
      id: 'men_section',
      name: 'قسم الملابس الرجالية',
      name_ar: 'قسم الملابس الرجالية',
      name_en: "Men's Department",
      image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="%231E1E1E"/><rect x="5" y="5" width="90" height="90" rx="12" stroke="%23D4AF37" stroke-width="1.5" stroke-dasharray="4 2"/><path d="M30 20 L50 40 L70 20 L65 80 H35 Z" fill="%232C2C2C" stroke="%23F8C8DC" stroke-width="2"/><path d="M50 40 L50 80" stroke="%23D4AF37" stroke-width="1.5"/><path d="M45 30 L50 35 L55 30" fill="none" stroke="%23D4AF37" stroke-width="1.5"/><text x="50" y="93" fill="%23D4AF37" font-size="8" font-family="sans-serif" font-weight="bold" text-anchor="middle">ملابس رجالية</text></svg>`,
      navigation_menu: [
        "الملابس العلوية (Tops)",
        "الملابس السفلية (Bottoms)",
        "الملابس الخارجية والشتوية",
        "البدل والملابس الرسمية",
        "ملابس النوم والمنزل",
        "ملابس رياضية",
        "الأحذية الرجالية",
        "الإكسسوارات"
      ],
      sub_categories: {
        "الملابس العلوية (Tops)": [
          "تيشرتات وبولو",
          "قمصان كاجوال",
          "قمصان كلاسيك/رسمية"
        ],
        "الملابس السفلية (Bottoms)": [
          "بنطلونات جينز",
          "بنطلونات تشينو وقماش",
          "شورتات كاجوال وسباحة"
        ],
        "الملابس الخارجية والشتوية (Outerwear & Winter)": [
          "جاكيتات جينز وجلد",
          "معاطف وبليزر",
          "هوديز وسويت شيرت"
        ],
        "البدل والملابس الرسمية (Suits & Tailoring)": [
          "بدل كاملة",
          "جواكيت بدل منفصلة",
          "صدريات"
        ],
        "ملابس النوم والمنزل (Sleepwear & Loungewear)": [
          "بيجامات رجالية",
          "سراويل منزلية مريحة"
        ],
        "ملابس رياضية (Activewear)": [
          "تيشيرتات رياضية",
          "بنطلونات رياضية وشورتات"
        ],
        "الأحذية الرجالية (Shoes)": [
          "أحذية كلاسيك ورسمية",
          "أحذية رياضية",
          "أحذية كاجوال ولوفرز",
          "صنادل وشباشب",
          "أبوات / هاف بوت"
        ],
        "الإكسسوارات (Accessories)": [
          "محفظة جيب وأحزمة جلدية",
          "قبعات وكاب رياضي",
          "نظارات وساعات رجالية"
        ]
      }
    },
    {
      id: 'kids_section',
      name: 'قسم ملابس الأطفال',
      name_ar: 'قسم ملابس الأطفال',
      name_en: "Kids' Department",
      image: MOCK_IMAGES.kidsCategory,
      navigation_menu: [
        "ملابس الرضع (0-24 شهر)",
        "ملابس البنات (2-14 سنة)",
        "ملابس الأولاد (2-14 سنة)",
        "ملابس خارجية",
        "أحذية وإكسسوارات الأطفال"
      ],
      sub_categories: {
        "ملابس الرضع (Infants 0-24 Months)": [
          "بربتوزات وسالوبيتات",
          "أطقم كاملة ومجموعات",
          "ملابس نوم للرضع"
        ],
        "ملابس البنات (Girls 2-14 Years)": [
          "فساتين وتنانير",
          "بلوزات وتيشرتات",
          "بنطلونات وليجنز"
        ],
        "ملابس الأولاد (Boys 2-14 Years)": [
          "تيشرتات وقمصان",
          "بنطلونات وشورتات",
          "أطقم كاجوال"
        ],
        "ملابس خارجية (Outerwear)": [
          "جاكيتات ومعاطف",
          "هوديز وسويت شيرت"
        ],
        "أحذية وإكسسوارات الأطفال (Shoes & Accessories)": [
          "أحذية رياضية ومدرسية",
          "صنادل وشباشب للأطفال",
          "قبعات وجوارب وحقائب ظهر"
        ]
      }
    },
    {
      id: 'home_and_pets',
      name: 'قسم المنزل + الحيوانات الأليفة',
      name_ar: 'قسم المنزل + الحيوانات الأليفة',
      name_en: "Home & Pets",
      image: MOCK_IMAGES.accessoriesCategory,
      navigation_menu: [
        "المنزل والمعيشة",
        "ديكور منزل",
        "لوازم الحفلات والمناسبات",
        "صندوق تخزين ومنظمة",
        "مطبخ وعشاء",
        "منسوجات منزلية",
        "أدوات وتحسين المنزل",
        "الألعاب",
        "لوازم مدرسية ومكتبية",
        "مستلزمات الحيوانات الأليفة",
        "أجهزة"
      ],
      sub_categories: {
        "ديكور منزل ومنسوجات": [
          "وسائد مريحة وأغطية سرير فاخرة",
          "ستائر رقيقة وتحف جدارية",
          "شموع معطرة وفواحات استرخاء"
        ],
        "المطبخ وأدوات العشاء": [
          "منظمات أواني وسكاكين ذكية",
          "أكواب وفناجين سيراميك فاخرة",
          "صناديق غداء حافظة للحرارة"
        ],
        "لوازم وتخزين المنزل": [
          "صناديق قماشية ومنظمات ملابس",
          "علاقات وأرفف ذكية موفرة للمساحة",
          "مصابيح إضاءة ديكورية راقية"
        ]
      },
      picks_for_you: [
        "صناديق الغداء وصناديق الغداء المعزولة وجرة الطعام",
        "منظم أواني للمطبخ",
        "تحف وديكور للمنزل",
        "لوازم حفلات",
        "منظمات غرف النوم"
      ],
      may_also_like: [
        "أدوات النوم لحديثي الولادة",
        "مستلزمات السباحة",
        "صناديق المجوهرات"
      ]
    },
    {
      id: 'beauty_section',
      name: 'قسم تجميل',
      name_ar: 'قسم تجميل',
      name_en: "Beauty Section",
      image: MOCK_IMAGES.dressCategory,
      navigation_menu: [
        "الجديد",
        "علامات تجارية",
        "مكياج",
        "العطور والروائح العلاجية",
        "العناية بالبشرة",
        "العناية بالشعر وتصفيفه",
        "أدوات مكياج",
        "العناية بالأظافر واليدين والقدمين",
        "شعر مستعار وإكسسوارات العناية بالجسم والفم",
        "الرعاية الصحية والتحضير للرجال"
      ],
      sub_categories: {
        "مكياج ومستحضرات تجميل": [
          "أحمر شفاه ذو ثبات ومظهر مخملي",
          "كريم أساس خفيف وبودرة وجه",
          "باليت ظلال عيون وماسكارا رموش"
        ],
        "العطور والروائح العلاجية": [
          "عطور فرنسية وشرقية فاخرة",
          "بخور عود ملكي معطر",
          "زيوت عطرية وفواحات بخارية"
        ],
        "العناية بالبشرة والشعر": [
          "أقنعة ورقة للوجه وسيروم مغذي",
          "شامبو وبلسم علاجي للشعر",
          "كريمات ترطيب فائقة وواقي شمس"
        ]
      },
      picks_for_you: [
        "أحمر الخدود",
        "حواجب",
        "باليت ظلال العيون",
        "أساس",
        "رموش صناعية موثوقة",
        "عدسات لاصقة تجميلية",
        "كريم أساس",
        "أقنعة وجه"
      ],
      may_also_like: [
        "إسفنجات مكياج",
        "جوارب مرطبة",
        "فرش أصلية",
        "وجه"
      ]
    },
    {
      id: 'devices_and_cars',
      name: 'قسم الأجهزة والسيارات',
      name_ar: 'قسم الأجهزة والسيارات',
      name_en: "Devices, Care & Kitchen",
      image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="%231E1E1E"/><rect x="5" y="5" width="90" height="90" rx="12" stroke="%23D4AF37" stroke-width="1.5" stroke-dasharray="4 2"/><path d="M30 40 h40 L60 70 H40 Z" fill="%232C2C2C" stroke="%23F8C8DC" stroke-width="2"/><circle cx="40" cy="70" r="6" fill="%23D4AF37"/><circle cx="60" cy="70" r="6" fill="%23D4AF37"/><text x="50" y="93" fill="%23D4AF37" font-size="8" font-family="sans-serif" font-weight="bold" text-anchor="middle">سيارات وأجهزة</text></svg>`,
      navigation_menu: [
        "إكسسوارات السيارات",
        "إلكترونيات القيادة والعناية",
        "أدوات الصيانة ومضخات الهواء",
        "أجهزة المطبخ والمنزل الذكية",
        "قطع غيار وأمان السيارات"
      ],
      sub_categories: {
        "car_accessories": [
          "مقاعد السيارات والإكسسوارات",
          "أجهزة ومعدات القيادة",
          "وسادة مقعد السيارة",
          "وسادة مسند ذراع",
          "وسادة الرقبة والبطانية للسيارة",
          "فرش أرضية السيارة",
          "أغطية مقاعد السيارة",
          "إكسسوارات السيارات للحيوانات الأليفة",
          "أطقم السيارة الداخلية",
          "غطاء الحزام",
          "غطاء أمان حزام الأمان",
          "ملحقات الحركة والفرامل",
          "قطع غيار السيارات"
        ],
        "car_tech": [
          "إلكترونيات السيارات الداخلية والخارجية",
          "خازنات للسيارة",
          "أدوات غسيل وصيانة السيارات (مجموعات الغسيل، قماش التنظيف، فرشاة التنظيف، مواد العناية والتلميع)"
        ],
        "car_repair": [
          "أدوات تشخيص الأعطال",
          "شاحن ومضخة هواء للسيارة",
          "أدوات إصلاح الهيكل",
          "مصابيح الإضاءة الأساسية",
          "معدات الطوارئ وتوصيل الوقود"
        ],
        "smart_devices": [
          "أجهزة المطبخ الكهربائية الصغيرة",
          "أجهزة التجميل والعناية الشخصية",
          "بطاريات طاقة كهربائية (باوربانك)",
          "معدات التدفئة والتبريد الذكية"
        ]
      }
    },
    {
      id: 'integrated_pet_supplies',
      name: 'مستلزمات الحيوانات الأليفة المتكاملة',
      name_ar: 'مستلزمات الحيوانات الأليفة المتكاملة',
      name_en: "Integrated Pet Supplies",
      image: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" fill="none"><rect width="100" height="100" rx="16" fill="%231E1E1E"/><rect x="5" y="5" width="90" height="90" rx="12" stroke="%23D4AF37" stroke-width="1.5" stroke-dasharray="4 2"/><path d="M40 40 Q50 25 60 40 T50 70 Z" fill="%232C2C2C" stroke="%23F8C8DC" stroke-width="2"/><circle cx="50" cy="40" r="12" fill="%23F8C8DC" opacity="0.6"/><text x="50" y="93" fill="%23D4AF37" font-size="8" font-family="sans-serif" font-weight="bold" text-anchor="middle">حيوانات أليفة</text></svg>`,
      navigation_menu: [
        "ملابس للحيوانات الأليفة",
        "مقاود وأطواق ومآزر",
        "أدوات التنظيف والعناية",
        "أوعية ومغذيات الطعام",
        "أقفاص وبيوت للحيوانات والطيور"
      ],
      sub_categories: {
        "basic_categories": [
          "ملابس للحيوانات الأليفة (بلوزات، هوديس، فساتين، بيجامات)",
          "مقاود وأطواق ومآزر",
          "أدوات التنظيف والعناية",
          "أوعية ومغذيات الطعام (أوعية حفظ، مغارف، سقاية ونوافير أوتوماتيكية)"
        ],
        "small_animals_birds": [
          "أقفاص وبيوت للحيوانات الصغيرة",
          "مستلزمات الطيور",
          "أدوات الرعاية الصحية (طوق الاستعادة، الإسعافات الأولية، حفاضات الحيوانات)",
          "مستلفات خيول",
          "مستلزمات زواحف وبرمائيات",
          "ألعاب تفاعلية للحيوانات الأليفة (PETSIN)"
        ]
      }
    }
  ],
  products: [
    {
      id: 'prod_royal_silk',
      name: 'شال الحرير الملكي المطرز بالذهب',
      description: 'إسكارف من الحرير الطبيعي الممتاز مطرز بخيوط رقيقة ذهبية فاخرة، قطعة تراثية عصرية لمظهر غاية في الرقي.',
      price: 4500,
      originalPrice: 4200,
      commission: 300,
      categoryId: 'women_section',
      subCategoryId: 'قسم العبايات الراقية',
      subCategoryLeaf: 'شالات وأوشحة متناسقة',
      navigationTag: 'موضة عصرية',
      image: MOCK_IMAGES.royalScarfProduct,
      vendorId: null,
      isAffiliateEnabled: true,
      createdAt: new Date('2026-02-01T00:00:00Z').toISOString()
    },
    {
      id: 'prod_black_abaya',
      name: 'العباءة الملكية السواد الفاخر بالخرز الفرنسي',
      description: 'عباءة فاخرة بقماش كوري أصلي مع تطريز يدوي بالخرز الأسود اللامع الفاخر للجمال المحتشم والراقي.',
      price: 18500,
      originalPrice: 18200,
      commission: 300,
      categoryId: 'women_section',
      subCategoryId: 'قسم العبايات الراقية',
      subCategoryLeaf: 'عبايات سوداء ملكية مطرزة',
      navigationTag: 'العبايات والجلابيات (ملابس إسلامية)',
      image: MOCK_IMAGES.blackAbayaProduct,
      vendorId: 'vendor_sample',
      isAffiliateEnabled: true,
      createdAt: new Date('2026-02-02T00:00:00Z').toISOString()
    },
    {
      id: 'prod_premium_dress',
      name: 'فستان الدانتيل الفخم "وردية الشال"',
      description: 'فستان أنيق من الدانتيل الفرنسي الناعم مبطن بالحرير الهادئ، يمنحك حضوراً ساحراً وعالي الفخامة.',
      price: 25300,
      originalPrice: 25000,
      commission: 300,
      categoryId: 'women_section',
      subCategoryId: 'قسم الفساتين الأنيقة',
      subCategoryLeaf: 'فساتين سهرة راقية ودانتيل',
      navigationTag: 'فساتين',
      image: MOCK_IMAGES.premiumDressProduct,
      vendorId: 'vendor_sample',
      isAffiliateEnabled: true,
      createdAt: new Date('2026-02-03T00:00:00Z').toISOString()
    },
    {
      id: 'prod_kids_set',
      name: 'طقم وشاح وقبعة العيد الصوفي المزين باللؤلؤ للأطفال',
      description: 'طقم ناعم ودافئ مصنوع بأيدي حياكة يمنية فائقة الجودة مزين بلآلئ هادئة ليوم أنيق وجميل لطفلتكِ.',
      price: 6800,
      originalPrice: 6500,
      commission: 300,
      categoryId: 'kids_section',
      subCategoryId: 'ملابس البنات',
      subCategoryLeaf: 'فساتين بناتية زاهية للمناسبات',
      navigationTag: 'أحذية وإكسسوارات',
      image: MOCK_IMAGES.kidsSetProduct,
      vendorId: null,
      isAffiliateEnabled: true,
      createdAt: new Date('2026-02-10T00:00:00Z').toISOString()
    },
    {
      id: 'prod_accessory_brooch',
      name: 'مشبك وبروش الياقوت مطلي بالذهب عيار 18 لتثبيت الإسكارف',
      description: 'بروش مصمم بدقة لتثبيت الشالات والعبايات مرصع بحجر أحمر ياقوتي في المنتصف لإطلالة ملفتة وبراقة.',
      price: 3200,
      originalPrice: 2900,
      commission: 300,
      categoryId: 'beauty_section',
      subCategoryId: 'مكياج ومستحضرات تجميل',
      subCategoryLeaf: 'باليت ظلال عيون وماسكارا رموش',
      navigationTag: 'أدوات مكياج',
      image: MOCK_IMAGES.broochProduct,
      vendorId: null,
      isAffiliateEnabled: false,
      createdAt: new Date('2026-02-12T00:00:00Z').toISOString()
    },
    {
      id: 'prod_men_thobe',
      name: 'ثوب يمني مطرز ملكي فاخر',
      description: 'ثوب تقليدي أنيق مصنوع من أفخم الخامات القطنية الممتازة مع تطريز يدوي دقيق على الياقة والأكمام مريح ومناسب للمناسبات.',
      price: 15000,
      originalPrice: 14500,
      commission: 500,
      categoryId: 'men_section',
      subCategoryId: 'الثياب والجلابيات',
      subCategoryLeaf: 'ثوب يمني مطرز ملكي فاخر',
      navigationTag: 'ثياب وجلابيات (ملابس تقليدية)',
      image: MOCK_IMAGES.menThobeProduct,
      vendorId: 'vendor_sample',
      isAffiliateEnabled: true,
      createdAt: new Date('2026-02-15T00:00:00Z').toISOString()
    },
    {
      id: 'prod_men_suit',
      name: 'طقم بدلة رسمية كلاسيك عصرية للرجال',
      description: 'طقم بدلة فاخر قطعتين (جاكيت وبنطلون) بتفصيل احترافي دقيق يناسب بيئات العمل والمناسبات الرسمية الراقية.',
      price: 28000,
      originalPrice: 27200,
      commission: 800,
      categoryId: 'men_section',
      subCategoryId: 'الأطقم والبدلات الرسمية',
      subCategoryLeaf: 'طقم بدلة رسمية كلاسيك',
      navigationTag: 'أطقم وبدلات رسمية',
      image: MOCK_IMAGES.menSuitProduct,
      vendorId: null,
      isAffiliateEnabled: true,
      createdAt: new Date('2026-02-16T00:00:00Z').toISOString()
    },
    {
      id: 'prod_falaq_chiffon',
      name: 'فستان الشيفون الإيطالي المطرز بالحرير الفاخر',
      description: 'فستان راقٍ بتصميم الشيفون المنسدل بدقة عالية، مرصع بلمسات حريرية ناعمة من متجر الفلق للموديلات الحديثة.',
      price: 29500,
      originalPrice: 29200,
      commission: 300,
      categoryId: 'women_section',
      subCategoryId: 'قسم الفساتين الأنيقة',
      subCategoryLeaf: 'فساتين سهرة راقية ودانتيل',
      navigationTag: 'فساتين',
      image: MOCK_IMAGES.premiumDressProduct,
      vendorId: 'vendor_falaq',
      isAffiliateEnabled: true,
      createdAt: new Date('2026-02-17T00:00:00Z').toISOString()
    },
    {
      id: 'prod_falaq_scarf',
      name: 'إسكارف الفلق حرير طبيعي 100% بنقش ملكي',
      description: 'وشاح حريري فاخر بتصميم عصري من متجر الفلق للموديلات الحديثة بالوان متناسقة وجذابة.',
      price: 5200,
      originalPrice: 4900,
      commission: 300,
      categoryId: 'women_section',
      subCategoryId: 'قسم العبايات الراقية',
      subCategoryLeaf: 'شالات وأوشحة متناسقة',
      navigationTag: 'موضة عصرية',
      image: MOCK_IMAGES.royalScarfProduct,
      vendorId: 'vendor_falaq',
      isAffiliateEnabled: true,
      createdAt: new Date('2026-02-18T00:00:00Z').toISOString()
    },
    {
      id: 'prod_alghalib_thobe',
      name: 'ثوب يمني فاخر مطرز بخيوط الحرير الذهبي',
      description: 'ثوب رجالي كلاسيكي مطرز بأعلى درجات الدقة والقص المتقن من متجر الأناقة للرجل.',
      price: 16500,
      originalPrice: 16200,
      commission: 300,
      categoryId: 'men_section',
      subCategoryId: 'الثياب والجلابيات',
      subCategoryLeaf: 'ثوب يمني مطرز ملكي فاخر',
      navigationTag: 'ثياب وجلابيات (ملابس تقليدية)',
      image: MOCK_IMAGES.menThobeProduct,
      vendorId: 'vendor_alghalib',
      isAffiliateEnabled: true,
      createdAt: new Date('2026-02-19T00:00:00Z').toISOString()
    },
    {
      id: 'prod_alghalib_suit',
      name: 'طقم بدلة رسمية إيطالية كلاسيك عصرية',
      description: 'طقم بدلة رسمية من متجر الأناقة للرجل بقصة إيطالية ممتازة وجاكيت بقماش صوف فاخر.',
      price: 34000,
      originalPrice: 33700,
      commission: 300,
      categoryId: 'men_section',
      subCategoryId: 'الأطقم والبدلات الرسمية',
      subCategoryLeaf: 'طقم بدلة رسمية كلاسيك',
      navigationTag: 'أطقم وبدلات رسمية',
      image: MOCK_IMAGES.menSuitProduct,
      vendorId: 'vendor_alghalib',
      isAffiliateEnabled: true,
      createdAt: new Date('2026-02-20T00:00:00Z').toISOString()
    },
    {
      id: 'prod_reem_brooch',
      name: 'طقم بروش ملكي مرصع بالياقوت والفضة النقية',
      description: 'بروش فضي فاخر لتزيين الشالات والعبايات من ريم براند للإكسسوارات والشيلان.',
      price: 4800,
      originalPrice: 4500,
      commission: 300,
      categoryId: 'beauty_section',
      subCategoryId: 'مكياج ومستحضرات تجميل',
      subCategoryLeaf: 'باليت ظلال عيون وماسكارا رموش',
      navigationTag: 'أدوات مكياج',
      image: MOCK_IMAGES.broochProduct,
      vendorId: 'vendor_reem',
      isAffiliateEnabled: true,
      createdAt: new Date('2026-02-21T00:00:00Z').toISOString()
    },
    {
      id: 'prod_reem_kids_set',
      name: 'طقم وشاح وقبعة أنيقة للأم والطفلة',
      description: 'طقم شال وقبعة صوفية ناعمة عالية الجودة من ريم براند للإكسسوارات والشيلان.',
      price: 7200,
      originalPrice: 6900,
      commission: 300,
      categoryId: 'kids_section',
      subCategoryId: 'ملابس البنات',
      subCategoryLeaf: 'فساتين بناتية زاهية للمناسبات',
      navigationTag: 'أحذية وإكسسوارات',
      image: MOCK_IMAGES.kidsSetProduct,
      vendorId: 'vendor_reem',
      isAffiliateEnabled: true,
      createdAt: new Date('2026-02-22T00:00:00Z').toISOString()
    }
  ],
  orders: [
    {
      id: 'order_1001',
      customerId: 'customer_sample',
      customerPhone: '+967733445566',
      items: [
        {
          product: {
            id: 'prod_royal_silk',
            name: 'شال الحرير الملكي المطرز بالذهب',
            description: 'إسكارف من الحرير الطبيعي الممتاز مطرز بخيوط رقيقة ذهبية فاخرة، قطعة تراثية عصرية لمظهر غاية في الرقي.',
            price: 4500,
            originalPrice: 4200,
            commission: 300,
            categoryId: 'accessories',
            image: MOCK_IMAGES.royalScarfProduct,
            vendorId: null,
            isAffiliateEnabled: true,
            createdAt: new Date('2026-02-01T00:00:00Z').toISOString()
          },
          quantity: 1
        }
      ],
      totalAmount: 4500,
      bankName: 'بنك الكريمي الإسلامي',
      accountNumber: 'حساب رقم: 310920492 - باسم: شركة إسكارف برو ليمتد',
      receiptImage: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 200" fill="none"><rect width="150" height="200" rx="8" fill="%23222"/><rect x="10" y="10" width="130" height="180" rx="4" stroke="%23D4AF37" stroke-dasharray="3 3"/><text x="75" y="70" fill="%23059669" font-size="10" font-weight="bold" text-anchor="middle">الكريمي أونلاين</text><text x="75" y="100" fill="%23FFF" font-size="8" text-anchor="middle">تم الحوالة بنجاح</text><text x="75" y="120" fill="%23FFF" font-size="7" text-anchor="middle">مبلغ: 4500 ريال</text><text x="75" y="140" fill="%23D4AF37" font-size="6" text-anchor="middle">الرمز: 90281-002</text></svg>`,
      status: 'pending_payment',
      createdAt: new Date('2026-07-23T09:00:00Z').toISOString(),
      updatedAt: new Date('2026-07-23T09:15:00Z').toISOString(),
      chatMessages: [
        {
          id: 'msg_1',
          senderId: 'customer_sample',
          senderName: 'أم محمد الصنعانية',
          senderRole: 'customer',
          text: 'السلام عليكم، قمت بإيداع المبلغ عبر تطبيق الكريمي جوال وأرفقت صورة الإشعار برقم المودع.',
          timestamp: new Date('2026-07-23T09:05:00Z').toISOString()
        }
      ]
    },
    {
      id: 'order_1002',
      customerId: 'customer_fatima',
      customerPhone: '+967770099887',
      items: [
        {
          product: {
            id: 'prod_black_abaya',
            name: 'العباءة الملكية السواد الفاخر المطرزة',
            description: 'عباءة فاخرة ذات سواد فاخر ملكي قماش كوري أصلي مع شال مطرز ناعم.',
            price: 18500,
            originalPrice: 18000,
            commission: 500,
            categoryId: 'women_section',
            image: MOCK_IMAGES.blackAbayaProduct,
            vendorId: 'vendor_sample',
            isAffiliateEnabled: true,
            createdAt: new Date('2026-02-02T00:00:00Z').toISOString()
          },
          quantity: 1
        }
      ],
      totalAmount: 18500,
      bankName: 'شركة وبنك البسيري للصرافة',
      accountNumber: 'حساب رقم: 5102030',
      receiptImage: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 200" fill="none"><rect width="150" height="200" rx="8" fill="%231E1E28"/><rect x="10" y="10" width="130" height="180" rx="4" stroke="%23F8C8DC" stroke-width="1.5"/><text x="75" y="60" fill="%23F8C8DC" font-size="11" font-weight="bold" text-anchor="middle">شركة البسيري للصرافة</text><text x="75" y="90" fill="%23D4AF37" font-size="9" text-anchor="middle">إشعار إيداع نقدي</text><text x="75" y="120" fill="%23FFF" font-size="8" text-anchor="middle">المبلغ: 18,500 ريال يمني</text><text x="75" y="145" fill="%2310B981" font-size="7" text-anchor="middle">حالة العملية: مؤكدة</text></svg>`,
      status: 'pending_payment',
      createdAt: new Date('2026-07-23T10:10:00Z').toISOString(),
      updatedAt: new Date('2026-07-23T10:12:00Z').toISOString(),
      chatMessages: [
        {
          id: 'msg_201',
          senderId: 'customer_fatima',
          senderName: 'فاطمة اليافعي',
          senderRole: 'customer',
          text: 'تم الإيداع بحساب البسيري، أرجو تأكيد الحوالة والبدء بالتجهيز.',
          timestamp: new Date('2026-07-23T10:11:00Z').toISOString()
        }
      ]
    },
    {
      id: 'order_1003',
      customerId: 'customer_suad',
      customerPhone: '+967711223399',
      items: [
        {
          product: {
            id: 'prod_premium_dress',
            name: 'فستان الدانتيل الفخم للمناسبات',
            description: 'فستان أنيق بتفاصيل ناعمة وقماش كوري دانتيل خفيف ومريح.',
            price: 22000,
            originalPrice: 21500,
            commission: 500,
            categoryId: 'women_section',
            image: MOCK_IMAGES.premiumDressProduct,
            vendorId: 'vendor_sheikha',
            isAffiliateEnabled: true,
            createdAt: new Date('2026-02-03T00:00:00Z').toISOString()
          },
          quantity: 1
        }
      ],
      totalAmount: 22000,
      bankName: 'بنك اليمن والكويت',
      accountNumber: 'حساب رقم: 1008200',
      receiptImage: `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 150 200" fill="none"><rect width="150" height="200" rx="8" fill="%23111827"/><rect x="10" y="10" width="130" height="180" rx="4" stroke="%233B82F6" stroke-width="1.5"/><text x="75" y="60" fill="%2360A5FA" font-size="10" font-weight="bold" text-anchor="middle">بنك اليمن والكويت</text><text x="75" y="90" fill="%23FFF" font-size="9" text-anchor="middle">إيصال تحويل مصرفي</text><text x="75" y="120" fill="%23D4AF37" font-size="8" text-anchor="middle">المبلغ: 22,000 ريال</text><text x="75" y="145" fill="%2310B981" font-size="7" text-anchor="middle">مرجع: YKB-99210</text></svg>`,
      status: 'pending_payment',
      createdAt: new Date('2026-07-23T10:30:00Z').toISOString(),
      updatedAt: new Date('2026-07-23T10:32:00Z').toISOString(),
      chatMessages: []
    }
  ],
  bankAccounts: [
    {
      id: 'bank_karimi',
      bankName: 'بنك الكريمي الإسلامي',
      accountNumber: '310920492',
      accountHolder: 'شركة المول الرقمي Digital Mall',
      notes: 'التحويل عبر خدمة الكريمي جوال أو إرسال حوالة باسم المستلم'
    },
    {
      id: 'bank_busiri',
      bankName: 'شركة وبنك البسيري للصرافة',
      accountNumber: '5102030',
      accountHolder: 'فاطمة الكبسي للتجارة العامة',
      notes: 'تأكدي من مطابقة رقم الحساب مع الرمز التعريفي'
    },
    {
      id: 'bank_sharq',
      bankName: 'بنك الشرق الأوسط الإسلامي',
      accountNumber: '445500',
      accountHolder: 'مجموعة المول الرقمي التجاري',
      notes: 'يرجى إرفاق رقم العملية بشكل واضح بالإيصال المرفوع'
    },
    {
      id: 'bank_unified',
      bankName: 'الشبكة الموحدة للأموال (سويفت/حوالة)',
      accountNumber: 'نقطة بيع رقم 9081 - صنعاء وعدن',
      accountHolder: 'وكالة المول الرقمي الموحدة Digital Mall',
      notes: 'يمكن التحويل الفوري من أي صراف فرعي شبكة موحدة'
    }
  ],
  socialLinks: {
    whatsapp: 'https://wa.me/967780044700',
    instagram: 'https://instagram.com/digitalmall.yemen',
    facebook: 'https://facebook.com/digitalmall.yemen',
    telegram: 'https://t.me/digitalmallyemen',
    tiktok: 'https://tiktok.com/@digitalmall.yemen',
    phone: '+967780044700'
  },
  banners: [
    {
      id: 'banner_1',
      title: 'حملة الأناقة الفخمة',
      subtitle: 'طقم جديد مطرز بخيوط الذهب الخالص بخصومات حصرية للتاجرات',
      image: MOCK_IMAGES.adBannerBg,
      productId: 'prod_royal_silk',
      active: true
    },
    {
      id: 'banner_2',
      title: 'التسويق بالعمولة للتاجرات',
      subtitle: 'ولدي رابطكِ المخصص لأي منتج واحصلي على 300 ريال عمولة فورية مسلوبة',
      image: MOCK_IMAGES.adBannerAffiliate,
      active: true
    }
  ],
  withdrawalRequests: [
    {
      id: 'req_101',
      vendorId: 'vendor_sample',
      vendorName: 'أروى الأنيقة للعبايات',
      amount: 18500,
      bankName: 'بنك الكريمي الإسلامي',
      accountNumber: 'حساب رقم 31102932',
      status: 'pending',
      requestedAt: new Date('2026-07-22T14:00:00Z').toISOString()
    },
    {
      id: 'req_102',
      vendorId: 'vendor_sheikha',
      vendorName: 'بوتيك الشيخة للفساتين والشيلان',
      amount: 22000,
      bankName: 'شركة وبنك البسيري للصرافة',
      accountNumber: 'حساب رقم 5012903',
      status: 'pending',
      requestedAt: new Date('2026-07-23T08:30:00Z').toISOString()
    },
    {
      id: 'req_103',
      vendorId: 'vendor_bilqis',
      vendorName: 'متجر بلقيس الملكية',
      amount: 35000,
      bankName: 'بنك اليمن والكويت',
      accountNumber: 'حساب رقم 1008200',
      status: 'approved',
      requestedAt: new Date('2026-07-20T11:00:00Z').toISOString(),
      processedAt: new Date('2026-07-20T12:00:00Z').toISOString()
    }
  ],
  auditLogs: [
    {
      id: 'log_init',
      operatorId: 'admin_user',
      operatorName: 'المدير العام',
      operatorRole: 'admin',
      actionType: 'تأسيس النظام الأساسي',
      timestamp: new Date('2026-06-01T08:00:00Z').toISOString(),
      details: 'تمت تهيئة إعدادات الحسابات المبدئية، العهود المصرفية والبنوك المحلية الأربعة وشبكات الصرافة بنجاح.'
    },
    {
      id: 'log_vendor_add',
      operatorId: 'vendor_sample',
      operatorName: 'أروى الأنيقة للعبايات',
      operatorRole: 'vendor',
      actionType: 'إضافة منتج تاجر',
      timestamp: new Date('2026-06-02T11:00:00Z').toISOString(),
      details: 'قامت التاجرة أروى بإضافة العباءة الملكية السواد الفاخر بتكلفة أصلية 18200 ريال يمني.'
    },
    {
      id: 'log_accountant_verif',
      operatorId: 'acc_user',
      operatorName: 'أحمد المحاسب المالي',
      operatorRole: 'accountant',
      actionType: 'تأكيد الحوالة المالية للطلب order_1001',
      timestamp: new Date('2026-06-05T10:30:00Z').toISOString(),
      details: 'تمت مراجعة الحوالة المرفوعة ببنك الكريمي وتعميد الحوالة وتحويل حالة الطلب إلى "قيد التجهيز".'
    }
  ],
  commissionSettings: {
    vendorCommissionEnabled: true,
    flatCommissionRate: 300,
    isFreeBeginning: true
  },
  shippingSettings: {
    enableAppShipping: true,
    enableExternalShipping: true,
    showToVendors: true,
    externalCompanies: [
      { id: 'ship_1', name: 'ألو توصيل إكسبرس (عدن / صنعاء)', price: 1500, active: true, notes: 'توصيل مباشر حتى باب المنزل خلال 24 ساعة' },
      { id: 'ship_2', name: 'شركة النجم للنقل السريع', price: 2500, active: true, notes: 'شحن بين المحافظات اليمنية' },
      { id: 'ship_3', name: 'مؤسسة البرق للتوصيل', price: 1800, active: true, notes: 'توصيل سريع للمحافظات المجاورة' }
    ]
  },
  appAppearanceSettings: {
    primaryColor: '#D4AF37',
    accentColor: '#F8C8DC',
    appTitle: 'Digital Mall - المول الرقمي',
    customIconsTheme: 'gold',
    showPromoBanner: true
  },
  vendorNotifications: [
    {
      id: 'notif_1',
      vendorId: 'vendor_sample',
      orderId: 'order_1001',
      title: 'طلب جديد تم تحويله!',
      message: 'قام العميل بشراء العباءة الملكية السواد الفاخر. يرجى البدء بتجهيز الطرد.',
      createdAt: new Date('2026-06-05T10:00:00Z').toISOString(),
      read: false
    }
  ],
  productReviews: [
    {
      id: 'rev_1',
      productId: 'prod_royal_silk',
      customerId: 'customer_sample',
      customerName: 'أم محمد الصنعانية',
      rating: 5,
      comment: 'الشال رائع جداً ومطرز بخيوط ذهبية غاية في الدقة والأناقة. أنصح به بشدة!',
      createdAt: new Date('2026-06-06T11:00:00Z').toISOString()
    },
    {
      id: 'rev_2',
      productId: 'prod_black_abaya',
      customerId: 'customer_sample',
      customerName: 'أم محمد الصنعانية',
      rating: 5,
      comment: 'عباءة فاخرة وسوادها ممتاز، القماش كوري أصلي ثقيل وناعم، الخياطة والتطريز في غاية الجمال والإتقان.',
      createdAt: new Date('2026-06-07T14:30:00Z').toISOString()
    }
  ]
};

/**
 * Loads the current app database state from localStorage or initializes fallback defaults.
 */
export function loadAppDatabase(): AppDatabase {
  const store = localStorage.getItem('digital_mall_db_v1') || localStorage.getItem('escarf_pro_db_v1');
  if (store) {
    try {
      const parsed = JSON.parse(store);
      if (!parsed.auditLogs) {
        parsed.auditLogs = INITIAL_DATABASE.auditLogs || [];
      }
      if (!parsed.banners) {
        parsed.banners = INITIAL_DATABASE.banners || [];
      }
      if (!parsed.products) {
        parsed.products = INITIAL_DATABASE.products || [];
      }
      if (!parsed.productReviews) {
        parsed.productReviews = [];
      }
      if (!parsed.vendorNotifications) {
        parsed.vendorNotifications = INITIAL_DATABASE.vendorNotifications || [];
      }
      if (!parsed.shippingSettings) {
        parsed.shippingSettings = {
          appExpressShippingEnabled: true,
          externalShippingEnabled: true,
          showToVendors: true,
          companies: [
            { id: 'ship_1', name: 'خدمة التوصيل السريع بالمول (صنعاء)', fee: 1500, price: 1500, active: true, estimatedTime: 'نفس اليوم', coverageAreas: ['صنعاء', 'حدة', 'الستين'] },
            { id: 'ship_2', name: 'شركة النجم السريع للتوصيل', fee: 2500, price: 2500, active: true, estimatedTime: '24-48 ساعة', coverageAreas: ['عدن', 'تعز', 'إب'] },
            { id: 'ship_3', name: 'أكسبرس اليمن للنقل البري', fee: 3500, price: 3500, active: true, estimatedTime: '24-72 ساعة', coverageAreas: ['المكلا', 'الحديدة', 'ذمار'] }
          ]
        };
      } else {
        const rawList = parsed.shippingSettings.companies || parsed.shippingSettings.externalCompanies || [
          { id: 'ship_1', name: 'خدمة التوصيل السريع بالمول (صنعاء)', fee: 1500, price: 1500, active: true, estimatedTime: 'نفس اليوم', coverageAreas: ['صنعاء', 'حدة', 'الستين'] },
          { id: 'ship_2', name: 'شركة النجم السريع للتوصيل', fee: 2500, price: 2500, active: true, estimatedTime: '24-48 ساعة', coverageAreas: ['عدن', 'تعز', 'إب'] }
        ];
        parsed.shippingSettings.companies = rawList.map((c: any) => ({
          id: c.id || `ship_${Math.random()}`,
          name: c.name || 'شركة شحن وتوصيل',
          fee: Number(c.fee ?? c.price ?? 2000),
          price: Number(c.price ?? c.fee ?? 2000),
          active: c.active !== false,
          estimatedTime: c.estimatedTime || '24-48 ساعة',
          coverageAreas: Array.isArray(c.coverageAreas) ? c.coverageAreas : ['جميع المحافظات']
        }));
        parsed.shippingSettings.appExpressShippingEnabled = parsed.shippingSettings.appExpressShippingEnabled ?? parsed.shippingSettings.enableAppShipping ?? true;
        parsed.shippingSettings.externalShippingEnabled = parsed.shippingSettings.externalShippingEnabled ?? parsed.shippingSettings.enableExternalShipping ?? true;
        parsed.shippingSettings.showToVendors = parsed.shippingSettings.showToVendors ?? true;
      }
      if (!parsed.appAppearanceSettings) {
        parsed.appAppearanceSettings = INITIAL_DATABASE.appAppearanceSettings;
      }
      if (!parsed.bankAccounts || parsed.bankAccounts.length === 0) {
        parsed.bankAccounts = INITIAL_DATABASE.bankAccounts;
      }
      if (!parsed.withdrawalRequests || parsed.withdrawalRequests.length === 0) {
        parsed.withdrawalRequests = INITIAL_DATABASE.withdrawalRequests;
      }
      if (!parsed.orders || parsed.orders.length === 0) {
        parsed.orders = INITIAL_DATABASE.orders;
      } else {
        // Merge missing default mock orders if fewer than 3 orders exist
        const existingOrderIds = new Set(parsed.orders.map((o: any) => o.id));
        INITIAL_DATABASE.orders.forEach(defaultOrder => {
          if (!existingOrderIds.has(defaultOrder.id)) {
            parsed.orders.unshift(defaultOrder);
          }
        });
      }

      // Ensure every order has items and chatMessages arrays
      parsed.orders.forEach((o: any) => {
        if (!o.items) o.items = [];
        if (!o.chatMessages) o.chatMessages = [];
      });

      if (!parsed.users) {
        parsed.users = INITIAL_DATABASE.users;
      } else {
        const existingUserIds = new Set(parsed.users.map((u: any) => u.id));
        INITIAL_DATABASE.users.forEach(defaultUser => {
          if (!existingUserIds.has(defaultUser.id)) {
            parsed.users.push(defaultUser);
          }
        });
      }
      // Merge categories to ensure new sub_categories and navigation_menu configurations are loaded
      if (parsed.categories) {
        const initialMap = new Map(INITIAL_DATABASE.categories.map(c => [c.id, c]));
        parsed.categories = parsed.categories.map((parsedCat: any) => {
          const initialCat = initialMap.get(parsedCat.id);
          if (initialCat) {
            return {
              ...parsedCat,
              sub_categories: initialCat.sub_categories || parsedCat.sub_categories,
              navigation_menu: initialCat.navigation_menu || parsedCat.navigation_menu,
              image: parsedCat.image || initialCat.image,
              name_ar: parsedCat.name_ar || initialCat.name_ar,
              name_en: parsedCat.name_en || initialCat.name_en,
            };
          }
          return parsedCat;
        });

        // Add any missing default categories
        const parsedIds = new Set(parsed.categories.map((c: any) => c.id));
        INITIAL_DATABASE.categories.forEach(initialCat => {
          if (!parsedIds.has(initialCat.id)) {
            parsed.categories.push(initialCat);
          }
        });
      } else {
        parsed.categories = INITIAL_DATABASE.categories;
      }
      return parsed;
    } catch (e) {
      console.error('Error loading database, resetting to defaults.', e);
    }
  }
  // Initialize to disk on first call
  saveAppDatabase(INITIAL_DATABASE);
  return INITIAL_DATABASE;
}

/**
 * Saves database state directly to LocalStorage.
 */
export function saveAppDatabase(db: AppDatabase): void {
  localStorage.setItem('digital_mall_db_v1', JSON.stringify(db));
}

/**
 * Pushes a tracking operations audit log to keep robust employee activity visible to the General Manager.
 */
export function logOperation(
  operatorId: string, 
  operatorName: string, 
  operatorRole: UserRole, 
  actionType: string, 
  details: string
): void {
  const db = loadAppDatabase();
  const newLog: AuditLog = {
    id: `log_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
    operatorId,
    operatorName,
    operatorRole,
    actionType,
    timestamp: new Date().toISOString(),
    details
  };
  db.auditLogs.unshift(newLog); // Prepend so new actions show first
  saveAppDatabase(db);
}

/**
 * Resets the local storage database state back to initial seed values
 */
export function resetDatabaseToDefaults(): AppDatabase {
  saveAppDatabase(INITIAL_DATABASE);
  return INITIAL_DATABASE;
}

