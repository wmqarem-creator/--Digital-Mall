import React, { useState } from 'react';
import { 
  AppDatabase, 
  UserProfile, 
  Order, 
  ChatMessage, 
  Product, 
  Category 
} from '../types';
import { 
  Truck, 
  CheckCircle2, 
  MessageSquare, 
  Send, 
  Image as ImageIcon, 
  Inbox, 
  ShoppingBag, 
  FolderLock, 
  Eye, 
  Share2,
  Clock,
  DollarSign,
  FileText,
  TrendingUp,
  Plus,
  Trash2
} from 'lucide-react';
import { logOperation } from '../dbMock';

interface StaffPortalProps {
  database: AppDatabase;
  onSave: (db: AppDatabase) => void;
  currentUser: UserProfile;
}

export default function StaffPortal({ database, onSave, currentUser }: StaffPortalProps) {
  // Permission flags assigned by Super Admin
  const hasOrdersPermission = currentUser.permissions?.manageOrders || currentUser.role === 'receiver';
  const hasAuditPermission = currentUser.permissions?.auditTransfers;
  const hasCatalogPermission = currentUser.permissions?.manageProducts || currentUser.permissions?.manageCategories;
  const hasReportsPermission = currentUser.permissions?.viewReports;

  // Determine initial active tab based on permissions
  const initialTab = hasOrdersPermission ? 'fulfillment' :
                     hasAuditPermission ? 'auditTransfers' :
                     hasCatalogPermission ? 'productHelper' :
                     hasReportsPermission ? 'viewReports' : 'fulfillment';

  const [activeTab, setActiveTab] = useState<string>(initialTab);
  const [selectedOrderForChat, setSelectedOrderForChat] = useState<Order | null>(null);
  const [chatText, setChatText] = useState('');
  const [chatImage, setChatImage] = useState('');

  // Update order status to Shipped
  const handleMarkAsShipped = (orderId: string) => {
    const updatedOrders = database.orders.map(o => {
      if (o.id === orderId) {
        logOperation(
          currentUser.id,
          currentUser.name,
          currentUser.role,
          'تحديث حالة الطلب إلى مشحون',
          `قامت موظفة الاستقبال ${currentUser.name} بتسليم طرد الطلب #${o.id} لشركة الشحن، مع تمكين زر الاستلام للزبون.`
        );

        const autoMsg: ChatMessage = {
          id: `msg_ship_${Date.now()}`,
          senderId: currentUser.id,
          senderName: currentUser.name,
          senderRole: currentUser.role,
          text: `📦 إشعار شحن: تم تسليم مشترياتكِ الأنيقة لشركة الشحن المعتمدة بنجاح! يرجى تأكيد استلام الطرد ومطابقته فور وصوله إليكِ لتنشيط تحرير أرباح التاجرات. دمتِ أنيقة.`,
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
    if (selectedOrderForChat?.id === orderId) {
      setSelectedOrderForChat(updatedOrders.find(o => o.id === orderId) || null);
    }
    alert('تم شحن الطلب وتوجيه إشعار للزبون بالاستحقاق!');
  };

  // Send message in active chat channel
  const handleSendChatMsg = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedOrderForChat) return;
    if (!chatText.trim() && !chatImage) return;

    const newMsg: ChatMessage = {
      id: `msg_staff_${Date.now()}`,
      senderId: currentUser.id,
      senderName: currentUser.name,
      senderRole: 'receiver',
      text: chatText,
      imageAttachment: chatImage || undefined,
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
    setChatText('');
    setChatImage('');
    setSelectedOrderForChat(updatedOrders.find(o => o.id === selectedOrderForChat.id) || null);
  };

  const handleImageAttached = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const r = new FileReader();
      r.onloadend = () => setChatImage(r.result as string);
      r.readAsDataURL(file);
    }
  };

  // Filtering orders under preparation
  const processingOrders = database.orders.filter(o => o.status === 'processing');
  const shippedOrders = database.orders.filter(o => o.status === 'shipped');

  // Filter lists based on status

  return (
    <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 min-h-screen">
      
      {/* Sidebar navigation */}
      <div className="xl:col-span-1 bg-[#1E1E1E] border border-stone-880 rounded-2xl p-4 flex flex-col gap-2.5">
        <div className="flex items-center gap-3 px-3 py-4 border-b border-stone-850">
          <div className="w-10 h-10 rounded-full bg-[#D4AF37] flex items-center justify-center text-stone-900 font-extrabold text-sm">
            تشغيل
          </div>
          <div>
            <h3 className="font-extrabold text-sm text-[#D4AF37]">{currentUser.name}</h3>
            <span className="text-[11px] text-stone-400">التشغيل وإدارة الخدمات</span>
          </div>
        </div>

        {hasOrdersPermission && (
          <>
            <button
              onClick={() => setActiveTab('fulfillment')}
              className={`w-full text-right px-4 py-3 rounded-xl text-xs flex justify-between items-center transition-all ${
                activeTab === 'fulfillment' 
                  ? 'bg-gradient-to-l from-[#362C30] to-stone-900 border-r-4 border-[#D4AF37] text-white font-bold' 
                  : 'text-stone-300 hover:bg-stone-850'
              }`}
            >
              <span className="flex items-center gap-2">
                <Truck size={16} className="text-amber-500" />
                <span>طلبات قيد التجهيز</span>
              </span>
              {processingOrders.length > 0 && (
                <span className="bg-amber-400 text-stone-950 font-black text-[10px] px-2 py-0.5 rounded-full">
                  {processingOrders.length}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('chatCenter')}
              className={`w-full text-right px-4 py-3 rounded-xl text-xs flex justify-between items-center transition-all ${
                activeTab === 'chatCenter' 
                  ? 'bg-gradient-to-l from-slate-900 to-stone-900 border-r-4 border-blue-400 text-white font-bold' 
                  : 'text-stone-300 hover:bg-stone-850'
              }`}
            >
              <span className="flex items-center gap-2">
                <MessageSquare size={16} className="text-blue-400" />
                <span>شات خدمة العملاء للتسليم</span>
              </span>
            </button>
          </>
        )}

        {hasAuditPermission && (
          <button
            onClick={() => setActiveTab('auditTransfers')}
            className={`w-full text-right px-4 py-3 rounded-xl text-xs flex justify-between items-center transition-all ${
              activeTab === 'auditTransfers' 
                ? 'bg-gradient-to-l from-amber-950/20 to-stone-900 border-r-4 border-amber-500 text-white font-bold' 
                : 'text-stone-300 hover:bg-stone-850'
            }`}
          >
            <span className="flex items-center gap-2">
              <Clock size={16} className="text-amber-500" />
              <span>تدقيق إيصالات الحوالات</span>
            </span>
            {database.orders.filter(o => o.status === 'pending_payment').length > 0 && (
              <span className="bg-amber-500 text-black font-black text-[10px] px-1.5 py-0.5 rounded-full">
                {database.orders.filter(o => o.status === 'pending_payment').length}
              </span>
            )}
          </button>
        )}

        {hasCatalogPermission && (
          <button
            onClick={() => setActiveTab('productHelper')}
            className={`w-full text-right px-4 py-3 rounded-xl text-xs flex justify-between items-center transition-all ${
              activeTab === 'productHelper' 
                ? 'bg-gradient-to-l from-stone-800 to-stone-900 border-r-4 border-pink-400 text-white font-bold' 
                : 'text-stone-300 hover:bg-stone-850'
            }`}
          >
            <span className="flex items-center gap-2">
              <ShoppingBag size={16} className="text-[#F8C8DC]" />
              <span>أدوات المنتجات الممنوحة</span>
            </span>
          </button>
        )}

        {hasReportsPermission && (
          <button
            onClick={() => setActiveTab('viewReports')}
            className={`w-full text-right px-4 py-3 rounded-xl text-xs flex justify-between items-center transition-all ${
              activeTab === 'viewReports' 
                ? 'bg-gradient-to-l from-emerald-950/20 to-stone-900 border-r-4 border-emerald-400 text-white font-bold' 
                : 'text-stone-300 hover:bg-stone-850'
            }`}
          >
            <span className="flex items-center gap-2">
              <FileText size={16} className="text-emerald-400" />
              <span>التقارير المالية والعمولات</span>
            </span>
          </button>
        )}

        <div className="bg-stone-900/60 p-4 rounded-xl border border-stone-850/60 mt-4">
          <span className="text-[10px] uppercase text-stone-500 block mb-1">دليل التشغيل الفوري:</span>
          <p className="text-[10px] text-stone-400 leading-relaxed">
            تم توسيع صلاحياتك بقرار من الإدارة العامة لمطابقة أو شحن أو تدقيق حسابات المول بكفاءة.
          </p>
        </div>
      </div>

      {/* Main Workstation */}
      <div className="xl:col-span-3 bg-[#1D1D1E] border border-stone-800 rounded-2xl p-6">
        
        {/* Fulfillment Center */}
        {activeTab === 'fulfillment' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-[#D4AF37]">طلبات بانتظار تجهيز العينات والشحن</h2>
              <p className="text-xs text-stone-400 mt-1">تجهيز الشالات، وفساتين السهرة، ومطابقة البيانات والربط الفوري بشركة التوصيل المحلية</p>
            </div>

            {processingOrders.length === 0 && shippedOrders.length === 0 ? (
              <div className="bg-stone-900 border border-stone-850 rounded-2xl p-12 text-center text-stone-500">
                <Inbox size={36} className="mx-auto text-stone-700 mb-2" />
                <p className="text-sm">لا توجد طلبات معتمدة بالدفع وبانتظار التجهيز حالياً.</p>
              </div>
            ) : (
              <div className="space-y-6">
                
                {/* Under Prep */}
                {processingOrders.length > 0 && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-amber-500 uppercase tracking-wider flex items-center gap-1">
                      <span>● قيد الحياكة والتجهيز بمخزن المول الرقمي اليوم:</span>
                      <span className="bg-stone-800 text-stone-300 font-mono text-[9px] px-1.5 py-0.5 rounded-full">{processingOrders.length}</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {processingOrders.map(order => (
                        <div key={order.id} className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-bold text-white text-xs">رقم الطلب: #{order.id}</h4>
                                <span className="text-[10px] text-stone-500">هاتف: {order.customerPhone}</span>
                              </div>
                              <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-800/40 px-2 py-0.5 rounded-full font-bold">بانتظار الشحن</span>
                            </div>

                            <div className="border-t border-b border-stone-850 my-3 py-2 text-xs space-y-1 text-stone-350">
                              {(order.items || []).map((item, idx) => (
                                <div key={idx} className="flex justify-between">
                                  <span>{item.product.name} × {item.quantity}</span>
                                  <span className="text-amber-400 font-bold">{item.product.price * item.quantity} ر.ي</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          <div className="flex gap-2">
                            <button
                              onClick={() => handleMarkAsShipped(order.id)}
                              className="flex-1 bg-gradient-to-l from-[#362C30] to-stone-850 hover:from-pink-900/60 text-[#F8C8DC] border border-pink-900/30 font-bold py-1.5 px-3 rounded-lg text-[11px] flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            >
                              <Truck size={13} />
                              <span>تم تجهيزه لشحن الطرد</span>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedOrderForChat(order);
                                setActiveTab('chatCenter');
                              }}
                              className="bg-stone-800 p-2 rounded-lg text-stone-400 hover:text-white"
                              title="دردشة التوصيل"
                            >
                              <MessageSquare size={13} />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Shipped History */}
                {shippedOrders.length > 0 && (
                  <div className="space-y-3 pt-4 border-t border-stone-850">
                    <h4 className="text-xs font-bold text-blue-400 uppercase tracking-wider flex items-center gap-1">
                      <span>✓ طرود تم شحنها وبانتظار تأكيد الاستلام من العملاء:</span>
                      <span className="bg-stone-800 text-stone-300 font-mono text-[9px] px-1.5 py-0.5 rounded-full">{shippedOrders.length}</span>
                    </h4>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {shippedOrders.map(order => (
                        <div key={order.id} className="bg-stone-900/40 border border-stone-850 rounded-xl p-4 flex flex-col justify-between opacity-80 hover:opacity-100 transition-opacity">
                          <div>
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-bold text-stone-300 text-xs">طلب رقم: #{order.id}</h4>
                                <span className="text-[10px] text-stone-500">جوال: {order.customerPhone}</span>
                              </div>
                              <span className="text-[10px] bg-blue-950 text-blue-400 border border-blue-900/40 px-2 py-0.5 rounded-full font-bold">بين يدي شركة الشحن</span>
                            </div>
                          </div>

                          <div className="text-[11px] text-stone-350 italic mt-2 bg-stone-950 p-2 rounded">
                            في انتظار العميل لفتح المعاينة وتفعيل زر "تأكيد واستلام ومطابقة الشحنة".
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              </div>
            )}
          </div>
        )}

        {/* TAB: Chat Center */}
        {activeTab === 'chatCenter' && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-blue-400">شات خدمة العملاء وتتبع اللوجستيات</h2>
              <p className="text-xs text-stone-400 mt-1">تحديد تفاصيل الألوان، التغليف الهدية أو عنوان التسليم بمحافظات اليمن</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[450px]">
              {/* Order List selectors */}
              <div className="md:col-span-1 bg-stone-900 rounded-xl p-3 border border-stone-850 overflow-y-auto space-y-2">
                <span className="text-[9px] text-[#D4AF37] block mb-2 font-bold uppercase">قائمة فواتير التواصل النشطة:</span>
                {database.orders.map(order => (
                  <button
                    key={order.id}
                    onClick={() => setSelectedOrderForChat(order)}
                    className={`w-full text-right p-2.5 rounded-lg text-xs flex flex-col transition-all ${
                      selectedOrderForChat?.id === order.id 
                        ? 'bg-[#362C30] text-[#F8C8DC] border-r-2 border-[#F8C8DC]' 
                        : 'bg-stone-950 hover:bg-stone-850 text-stone-300'
                    }`}
                  >
                    <span className="font-black text-[11px]">طلب #{order.id}</span>
                    <span className="text-[10px] text-stone-400 mt-0.5">{order.customerPhone}</span>
                  </button>
                ))}
              </div>

              {/* Live Chat stream */}
              <div className="md:col-span-2 bg-stone-950 rounded-xl border border-stone-850 p-4 flex flex-col justify-between overflow-hidden">
                {selectedOrderForChat ? (
                  <div className="flex flex-col h-full justify-between">
                    <div className="border-b border-stone-850 pb-2 mb-2 flex justify-between items-center">
                      <span className="font-bold text-[#D4AF37] text-xs">مسيو تتبع الطلب #{selectedOrderForChat.id}</span>
                      <span className="text-[9px] text-stone-400 capitalize">{selectedOrderForChat.status}</span>
                    </div>

                    <div className="flex-1 overflow-y-auto space-y-2.5 p-2 flex flex-col justify-end">
                      {selectedOrderForChat.chatMessages.map(msg => {
                        const isMe = msg.senderId === currentUser.id;
                        return (
                          <div 
                            key={msg.id} 
                            className={`max-w-[85%] rounded-xl p-2.5 text-xs ${
                              isMe 
                                ? 'bg-gradient-to-l from-stone-850 to-stone-900 text-white mr-auto' 
                                : 'bg-stone-900 text-stone-200 ml-auto'
                            }`}
                          >
                            <div className="flex justify-between items-center gap-2 mb-1">
                              <span className="font-bold text-[9px] text-[#F8C8DC]">{isMe ? 'أنتِ (موظف الاستقبال)' : msg.senderName}</span>
                              <span className="text-[8px] text-stone-500">{new Date(msg.timestamp).toLocaleTimeString('ar-YE', { hour: '2-digit', minute: '2-digit' })}</span>
                            </div>
                            <p className="whitespace-pre-wrap">{msg.text}</p>
                            {msg.imageAttachment && (
                              <img src={msg.imageAttachment} className="max-h-32 rounded mt-1 border border-stone-800" alt="inline" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <form onSubmit={handleSendChatMsg} className="mt-3 flex items-center gap-2 border-t border-stone-850 pt-3">
                      <input
                        type="text"
                        placeholder="إدخال رسالة تتبع التغليف أو طريقة الشحن..."
                        className="flex-1 bg-stone-900 border border-stone-800 rounded px-2.5 py-1.5 text-xs text-white"
                        value={chatText}
                        onChange={e => setChatText(e.target.value)}
                      />
                      <label className="p-1.5 bg-stone-800 hover:bg-stone-750 text-stone-300 rounded cursor-pointer">
                        <ImageIcon size={14} />
                        <input type="file" accept="image/*" className="hidden" onChange={handleImageAttached} />
                      </label>
                      <button type="submit" className="bg-blue-600 p-1.5 rounded text-white hover:bg-blue-500 font-bold">
                        <Send size={14} />
                      </button>
                    </form>
                  </div>
                ) : (
                  <div className="h-full flex items-center justify-center text-stone-500 text-xs">
                    يرجى اختيار أحد طلبات الفواتير من القائمة الجانبية لتنشيط دردشة التتبع اللوجستي
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB: Secondary Catalog helpers */}
        {activeTab === 'productHelper' && hasCatalogPermission && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-purple-400">أدوات فهرسة الموديلات والأقسام الممنوحة</h2>
              <p className="text-xs text-stone-400 mt-1">عرض السلع، التحكم في الأقسام الرئيسية والموديلات وتعديل الخيارات الفورية</p>
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
                          <span className="text-[10px] text-stone-500">القسم: {categoryName} {p.subCategoryId ? `-> ${p.subCategoryId}` : ''}</span>
                          <div className="text-[10px] text-amber-500 font-bold mt-0.5">{p.price} ر.ي</div>
                        </div>
                      </div>

                      <button
                        onClick={() => {
                          const updated = database.products.filter(item => item.id !== p.id);
                          onSave({ ...database, products: updated });
                          alert('تم حذف المنتج من مستودع المتجر بنجاح!');
                        }}
                        className="p-1.5 bg-red-950/40 text-red-400 hover:bg-red-900/60 rounded border border-red-900/30 text-xs"
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

        {/* TAB: Audit Transfers */}
        {activeTab === 'auditTransfers' && hasAuditPermission && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-amber-400">غرفة التدقيق والتحقق المالي الممنوحة</h2>
              <p className="text-xs text-stone-400 mt-1">مطابقة صور الحوالات الصادرة والتحقق من الحسابات والشبكات الموحدة</p>
            </div>

            {database.orders.filter(o => o.status === 'pending_payment').length === 0 ? (
              <div className="bg-stone-900 border border-stone-850 rounded-2xl p-12 text-center text-stone-500">
                <Inbox size={36} className="mx-auto text-stone-700 mb-2" />
                <p className="text-sm">لا تتوفر أي إيصالات فواتير معلقة بانتظار المراجعة والتعميد المالي حالياً.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {database.orders.filter(o => o.status === 'pending_payment').map(order => (
                  <div key={order.id} className="bg-stone-900 border border-stone-800 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <h4 className="font-bold text-white text-xs">طلب رقم: #{order.id}</h4>
                          <span className="text-[10px] text-stone-500">هاتف العميل: {order.customerPhone}</span>
                        </div>
                        <span className="text-[10px] bg-amber-950 text-amber-400 border border-amber-800/40 px-2 py-0.5 rounded-full font-bold">معلق الدفع</span>
                      </div>

                      <div className="text-xs text-stone-350 space-y-1 my-3 border-t border-b border-stone-800 py-2">
                        <div>المبلغ الإجمالي: <span className="text-[#D4AF37] font-bold">{order.totalAmount} ر.ي</span></div>
                        {order.receiptImage && (
                          <div className="mt-2">
                            <span className="text-[10px] text-stone-400 block mb-1">صورة إيصال التحويل:</span>
                            <img src={order.receiptImage} className="max-h-32 rounded border border-stone-800 object-cover w-full cursor-pointer" alt="Receipt" />
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-2">
                      <button
                        onClick={() => {
                          const updatedOrders = database.orders.map(o => {
                            if (o.id === order.id) {
                              logOperation(
                                currentUser.id,
                                currentUser.name,
                                currentUser.role,
                                'تعميد الحوالة المالية (عبر الموظف)',
                                `قام الموظف المفوض ${currentUser.name} بتعميد دفعة الطلب #${o.id}.`
                              );
                              return {
                                ...o,
                                status: 'processing' as const,
                                updatedAt: new Date().toISOString()
                              };
                            }
                            return o;
                          });
                          onSave({ ...database, orders: updatedOrders });
                          alert('تم تعميد الإيصال وبدء الحياكة والتحضير!');
                        }}
                        className="flex-1 bg-gradient-to-l from-emerald-600 to-teal-700 hover:from-emerald-500 text-white font-bold py-1.5 rounded-lg text-xs"
                      >
                        تعميد وقبول الدفعة
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* TAB: View Reports */}
        {activeTab === 'viewReports' && hasReportsPermission && (
          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-bold text-emerald-400">التقارير المالية والعمولات الممنوحة لكِ</h2>
              <p className="text-xs text-stone-400 mt-1">كشف حركات الحسابات والمبالغ المتداولة وأرباح التاجرات والمنصة</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-stone-900 p-5 rounded-2xl border border-stone-800">
                <span className="text-[10px] text-stone-500 font-bold block">إجمالي مبيعات المتجر</span>
                <div className="text-2xl font-black text-emerald-400 mt-1 font-mono">
                  {database.orders.filter(o => o.status === 'shipped' || o.status === 'completed').reduce((sum, o) => sum + o.totalAmount, 0)} <span className="text-xs">ر.ي</span>
                </div>
              </div>

              <div className="bg-stone-900 p-5 rounded-2xl border border-stone-800">
                <span className="text-[10px] text-stone-500 font-bold block">عمولات المنصة المستحقة (10%)</span>
                <div className="text-2xl font-black text-[#D4AF37] mt-1 font-mono">
                  {Math.round(database.orders.filter(o => o.status === 'shipped' || o.status === 'completed').reduce((sum, o) => sum + o.totalAmount, 0) * 0.1)} <span className="text-xs">ر.ي</span>
                </div>
              </div>

              <div className="bg-stone-900 p-5 rounded-2xl border border-stone-800">
                <span className="text-[10px] text-stone-500 font-bold block">مبالغ السحوبات المنفذة للتاجرات</span>
                <div className="text-2xl font-black text-[#F8C8DC] mt-1 font-mono">
                  {database.withdrawalRequests.filter(r => r.status === 'approved').reduce((sum, r) => sum + r.amount, 0)} <span className="text-xs">ر.ي</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>

    </div>
  );
}
