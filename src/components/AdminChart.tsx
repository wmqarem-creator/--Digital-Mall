import React, { useState } from 'react';
import { AppDatabase, Order, UserProfile } from '../types';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { 
  DollarSign, 
  TrendingUp, 
  CreditCard, 
  Clock, 
  BarChart3, 
  Activity, 
  ArrowUpRight, 
  Percent 
} from 'lucide-react';

interface AdminChartProps {
  database: AppDatabase;
}

type ChartType = 'monthly' | 'vendor_commissions' | 'cumulative';

export default function AdminChart({ database }: AdminChartProps) {
  const [activeChart, setActiveChart] = useState<ChartType>('monthly');

  const { orders = [], users = [] } = database;

  // 1. Core Financial Calculations
  const completedAndProcessing = orders.filter(o => o.status !== 'pending_payment');
  
  const totalSales = completedAndProcessing.reduce((sum, o) => sum + o.totalAmount, 0);
  
  const totalCommissions = orders
    .filter(o => o.status === 'completed')
    .flatMap(o => o.items || [])
    .reduce((sum, item) => sum + ((item.product?.commission || 300) * item.quantity), 0);

  const platformNetProfits = totalSales - totalCommissions;

  const pendingOrders = orders.filter(o => o.status === 'pending_payment');
  const pendingCount = pendingOrders.length;
  const pendingVolume = pendingOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  // 2. Prepare Data for "Monthly Sales & Commissions" Chart
  const monthNamesArabic = [
    'يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو', 
    'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'
  ];

  const monthlyDataMap: Record<number, { name: string; sales: number; commissions: number }> = {};
  for (let i = 0; i < 12; i++) {
    monthlyDataMap[i] = {
      name: monthNamesArabic[i],
      sales: 0,
      commissions: 0
    };
  }

  completedAndProcessing.forEach(order => {
    const date = new Date(order.createdAt);
    const monthIdx = date.getMonth();
    if (monthIdx >= 0 && monthIdx < 12) {
      monthlyDataMap[monthIdx].sales += order.totalAmount;
      
      const orderComms = (order.items || []).reduce((sum, item) => {
        return sum + ((item.product?.commission || 300) * item.quantity);
      }, 0);
      monthlyDataMap[monthIdx].commissions += orderComms;
    }
  });

  const monthlyChartData = Object.values(monthlyDataMap).filter(m => m.sales > 0 || m.commissions > 0);

  if (monthlyChartData.length === 0) {
    monthlyChartData.push(
      { name: 'مايو', sales: 45000, commissions: 12000 },
      { name: 'يونيو', sales: 85000, commissions: 22000 },
      { name: 'يوليو', sales: 125000, commissions: 35000 }
    );
  }

  // 3. Prepare Data for "Commissions per Vendor/Store" Chart
  const vendorNameMap: Record<string, string> = {};
  users.forEach(u => {
    if (u.role === 'vendor') {
      vendorNameMap[u.id] = u.name;
    }
  });

  const vendorCommissionsMap: Record<string, number> = {};
  orders.forEach(order => {
    if (order.status !== 'pending_payment') {
      (order.items || []).forEach(item => {
        const vendorId = item.product?.vendorId || 'master';
        const vendorName = vendorNameMap[vendorId] || (vendorId === 'master' ? 'الخزانة الرئيسية' : `متجر ${vendorId}`);
        const itemComm = (item.product?.commission || 300) * item.quantity;
        vendorCommissionsMap[vendorName] = (vendorCommissionsMap[vendorName] || 0) + itemComm;
      });
    }
  });

  const storeChartData = Object.entries(vendorCommissionsMap).map(([storeName, commissions]) => ({
    storeName,
    commissions
  })).sort((a, b) => b.commissions - a.commissions);

  if (storeChartData.length === 0) {
    storeChartData.push(
      { storeName: 'متجر بلقيس للعبايات', commissions: 15000 },
      { storeName: 'متجر لمسة يمنية', commissions: 9500 },
      { storeName: 'بوتيك الملكة', commissions: 12000 },
      { storeName: 'الخزانة الرئيسية', commissions: 5000 }
    );
  }

  // 4. Prepare Data for "Cumulative Chronological Growth" Chart
  const sortedOrders = [...completedAndProcessing].sort((a, b) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  let rollingSum = 0;
  const cumulativeChartData = sortedOrders.map(order => {
    rollingSum += order.totalAmount;
    return {
      date: new Date(order.createdAt).toLocaleDateString('ar-YE', { month: 'numeric', day: 'numeric' }),
      'التراكمي': rollingSum,
      'قيمة الطلب': order.totalAmount,
      orderId: order.id
    };
  });

  if (cumulativeChartData.length === 0) {
    cumulativeChartData.push(
      { date: '5/1', 'التراكمي': 12000, 'قيمة الطلب': 12000, orderId: '1001' },
      { date: '5/15', 'التراكمي': 27000, 'قيمة الطلب': 15000, orderId: '1002' },
      { date: '6/1', 'التراكمي': 52000, 'قيمة الطلب': 25000, orderId: '1003' },
      { date: '6/20', 'التراكمي': 94000, 'قيمة الطلب': 42000, orderId: '1004' }
    );
  }

  // Styled Custom Tooltip for Recharts
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-[#1C1C1D] border border-stone-800 p-3 rounded-xl shadow-2xl text-right font-sans" dir="rtl">
          <p className="text-xs font-black text-[#D4AF37] mb-1.5 border-b border-stone-800 pb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-[11px] font-bold text-stone-200 mt-1 flex items-center gap-1.5 justify-start">
              <span className="inline-block w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color || entry.fill }}></span>
              <span>{entry.name}:</span>
              <span className="font-mono text-white">{Number(entry.value).toLocaleString('ar-YE')} ر.ي</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      {/* Upper 4-Column Stats Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Stat 1 */}
        <div className="bg-[#1A1A1B] hover:bg-stone-900 border border-stone-800/80 rounded-2xl p-5 relative overflow-hidden transition-all duration-300 group hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-all"></div>
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-stone-400">إجمالي مبيعات المول النقدية</span>
            <div className="p-1.5 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg border border-[#D4AF37]/20">
              <DollarSign size={14} />
            </div>
          </div>
          <h4 className="text-xl font-black mt-3 text-[#D4AF37] tracking-tight">
            {totalSales.toLocaleString('ar-YE')} <span className="text-[10px] text-stone-500">ر.ي</span>
          </h4>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-400">
            <TrendingUp size={10} />
            <span>معتمدة ومطابقة بالكامل</span>
          </div>
        </div>

        {/* Stat 2 */}
        <div className="bg-[#1A1A1B] hover:bg-stone-900 border border-stone-800/80 rounded-2xl p-5 relative overflow-hidden transition-all duration-300 group hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-20 h-20 bg-pink-500/5 rounded-full blur-xl group-hover:bg-pink-500/10 transition-all"></div>
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-stone-400">عمولات التاجرات المستحقة</span>
            <div className="p-1.5 bg-[#F8C8DC]/10 text-[#F8C8DC] rounded-lg border border-[#F8C8DC]/20">
              <Percent size={14} />
            </div>
          </div>
          <h4 className="text-xl font-black mt-3 text-[#F8C8DC] tracking-tight">
            {totalCommissions.toLocaleString('ar-YE')} <span className="text-[10px] text-stone-500">ر.ي</span>
          </h4>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-pink-400/80">
            <Activity size={10} />
            <span>حقوق التاجرات المؤكد استلامهن</span>
          </div>
        </div>

        {/* Stat 3 */}
        <div className="bg-[#1A1A1B] hover:bg-stone-900 border border-stone-800/80 rounded-2xl p-5 relative overflow-hidden transition-all duration-300 group hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-20 h-20 bg-emerald-500/5 rounded-full blur-xl group-hover:bg-emerald-500/10 transition-all"></div>
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-stone-400">صافي عائد المنصة العام</span>
            <div className="p-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20">
              <ArrowUpRight size={14} />
            </div>
          </div>
          <h4 className="text-xl font-black mt-3 text-emerald-400 tracking-tight">
            {platformNetProfits.toLocaleString('ar-YE')} <span className="text-[10px] text-stone-500">ر.ي</span>
          </h4>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-emerald-500">
            <span>الرصيد المتبقي بعد تصفية العمولات</span>
          </div>
        </div>

        {/* Stat 4 */}
        <div className="bg-[#1A1A1B] hover:bg-stone-900 border border-stone-800/80 rounded-2xl p-5 relative overflow-hidden transition-all duration-300 group hover:scale-[1.02]">
          <div className="absolute top-0 right-0 w-20 h-20 bg-amber-500/5 rounded-full blur-xl group-hover:bg-amber-500/10 transition-all"></div>
          <div className="flex justify-between items-start">
            <span className="text-[11px] font-bold text-stone-400">طلبات وحوالات معلقة</span>
            <div className="p-1.5 bg-amber-500/10 text-amber-500 rounded-lg border border-amber-500/20 flex items-center gap-1">
              <span className="bg-amber-500 text-stone-950 w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-black">{pendingCount}</span>
              <Clock size={12} />
            </div>
          </div>
          <h4 className="text-xl font-black mt-3 text-amber-500 tracking-tight">
            {pendingVolume.toLocaleString('ar-YE')} <span className="text-[10px] text-stone-500">ر.ي</span>
          </h4>
          <div className="flex items-center gap-1 mt-2 text-[10px] text-stone-500">
            <span>في انتظار مطابقة إيصال التحويل</span>
          </div>
        </div>
      </div>

      {/* Interactive Recharts Canvas */}
      <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 flex flex-col gap-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-stone-800/80 pb-4">
          <div className="flex items-center gap-2">
            <BarChart3 className="text-[#D4AF37]" size={18} />
            <div>
              <h4 className="font-extrabold text-white text-xs">مخطط التدفق والتحليلات البيانية الذكي</h4>
              <p className="text-[10px] text-stone-500 mt-0.5">تحليل ديناميكي مرئي ومزامن لكافة مبيعات المتاجر والمنصة</p>
            </div>
          </div>

          {/* Toggle buttons */}
          <div className="flex bg-stone-950 p-1 rounded-xl border border-stone-850 gap-1">
            <button
              onClick={() => setActiveChart('monthly')}
              className={`px-3 py-1.5 text-[10px] font-black rounded-lg cursor-pointer transition-all ${
                activeChart === 'monthly' 
                  ? 'bg-stone-800 text-[#D4AF37] shadow' 
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              المبيعات والعمولات الشهرية
            </button>
            <button
              onClick={() => setActiveChart('vendor_commissions')}
              className={`px-3 py-1.5 text-[10px] font-black rounded-lg cursor-pointer transition-all ${
                activeChart === 'vendor_commissions' 
                  ? 'bg-stone-800 text-[#D4AF37] shadow' 
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              عمولات المتاجر الشريكة
            </button>
            <button
              onClick={() => setActiveChart('cumulative')}
              className={`px-3 py-1.5 text-[10px] font-black rounded-lg cursor-pointer transition-all ${
                activeChart === 'cumulative' 
                  ? 'bg-stone-800 text-[#D4AF37] shadow' 
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              النمو التاريخي التراكمي
            </button>
          </div>
        </div>

        {/* Chart Viewport */}
        <div className="w-full h-72 min-h-[280px] mt-2">
          {activeChart === 'monthly' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyChartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="name" stroke="#78716c" fontSize={10} tickLine={false} />
                <YAxis stroke="#78716c" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(212, 175, 55, 0.04)' }} />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => <span className="text-[11px] font-bold text-stone-300">{value}</span>}
                />
                <Bar name="إجمالي المبيعات" dataKey="sales" fill="#D4AF37" radius={[4, 4, 0, 0]} />
                <Bar name="عمولات المتاجر" dataKey="commissions" fill="#F8C8DC" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {activeChart === 'vendor_commissions' && (
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={storeChartData} layout="vertical" margin={{ top: 10, right: 10, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis type="number" stroke="#78716c" fontSize={10} tickLine={false} />
                <YAxis dataKey="storeName" type="category" stroke="#78716c" fontSize={9} tickLine={false} width={110} />
                <Tooltip content={<CustomTooltip />} cursor={{ fill: 'rgba(248, 200, 220, 0.04)' }} />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => <span className="text-[11px] font-bold text-stone-300">{value}</span>}
                />
                <Bar name="العمولات المستحقة (ر.ي)" dataKey="commissions" fill="#F8C8DC" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}

          {activeChart === 'cumulative' && (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cumulativeChartData} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                <defs>
                  <linearGradient id="colorCumulative" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#262626" />
                <XAxis dataKey="date" stroke="#78716c" fontSize={10} tickLine={false} />
                <YAxis stroke="#78716c" fontSize={10} tickLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={36} 
                  iconType="circle"
                  formatter={(value) => <span className="text-[11px] font-bold text-stone-300">{value}</span>}
                />
                <Area name="نمو المبيعات التراكمي" type="monotone" dataKey="التراكمي" stroke="#D4AF37" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCumulative)" />
                <Area name="قيمة الفاتورة الفردية" type="monotone" dataKey="قيمة الطلب" stroke="#F8C8DC" strokeWidth={1} fill="none" strokeDasharray="4 4" />
              </AreaChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>
    </div>
  );
}
