import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_auth/firebase_auth.dart';
import 'package:cloud_firestore/cloud_firestore.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  try {
    await Firebase.initializeApp();
  } catch (e) {
    debugPrint("Firebase initialization note: $e");
  }
  runApp(const EscarfProAdminApp());
}

/// App Configuration & Metadata
class AppConfig {
  static const String appName = 'escarf Pro admin';
  static const String packageName = 'com.escarfpro.admin';
  static const String version = '1.0.0+1';
}

class EscarfProAdminApp extends StatelessWidget {
  const EscarfProAdminApp({Super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: AppConfig.appName,
      debugShowCheckedModeBanner: false,
      locale: const Locale('ar', 'SA'),
      theme: ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: const Color(0xFF0C0A09), // Stone 950
        colorScheme: const ColorScheme.dark(
          primary: Color(0xFFD4AF37), // Luxury Gold
          secondary: Color(0xFFF8C8DC), // Dusty Pink
          surface: Color(0xFF1C1917), // Stone 900
          background: Color(0xFF0C0A09),
        ),
        fontFamily: 'Cairo',
      ),
      home: const AdminHomeScreen(),
    );
  }
}

class AdminHomeScreen extends StatefulWidget {
  const AdminHomeScreen({Super.key});

  @override
  State<AdminHomeScreen> createState() => _AdminHomeScreenState();
}

class _AdminHomeScreenState extends State<AdminHomeScreen> {
  int _selectedIndex = 0;

  final List<Widget> _pages = const [
    DashboardView(),
    MerchantVerificationView(),
    AccountingAuditView(),
    SettingsView(),
  ];

  @override
  Widget build(BuildContext context) {
    return Directionality(
      textDirection: TextDirection.rtl,
      child: Scaffold(
        appBar: AppBar(
          backgroundColor: const Color(0xFF1C1917),
          elevation: 0,
          title: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(8),
                decoration: BoxDecoration(
                  color: const Color(0xFFD4AF37).withOpacity(0.15),
                  shape: BoxShape.circle,
                  border: Border.all(color: const Color(0xFFD4AF37), width: 1.5),
                ),
                child: const Icon(Icons.shield, color: Color(0xFFD4AF37), size: 20),
              ),
              const SizedBox(width: 12),
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: const [
                  Text(
                    AppConfig.appName,
                    style: TextStyle(
                      fontSize: 16,
                      fontWeight: FontWeight.bold,
                      color: Color(0xFFD4AF37),
                    ),
                  ),
                  Text(
                    'لوحة التحكم والإدارة المالية',
                    style: TextStyle(fontSize: 10, color: Colors.grey),
                  ),
                ],
              ),
            ],
          ),
          actions: [
            IconButton(
              icon: const Icon(Icons.notifications_outlined, color: Colors.white70),
              onPressed: () {},
            ),
          ],
        ),
        body: IndexedStack(
          index: _selectedIndex,
          children: _pages,
        ),
        bottomNavigationBar: NavigationBar(
          selectedIndex: _selectedIndex,
          onDestinationSelected: (index) {
            setState(() {
              _selectedIndex = index;
            });
          },
          backgroundColor: const Color(0xFF1C1917),
          indicatorColor: const Color(0xFFD4AF37).withOpacity(0.2),
          destinations: const [
            NavigationDestination(
              icon: Icon(Icons.dashboard_outlined),
              selectedIcon: Icon(Icons.dashboard, color: Color(0xFFD4AF37)),
              label: 'الرئيسية',
            ),
            NavigationDestination(
              icon: Icon(Icons.verified_user_outlined),
              selectedIcon: Icon(Icons.verified_user, color: Color(0xFFD4AF37)),
              label: 'توثيق المتاجر',
            ),
            NavigationDestination(
              icon: Icon(Icons.account_balance_wallet_outlined),
              selectedIcon: Icon(Icons.account_balance_wallet, color: Color(0xFFD4AF37)),
              label: 'المحاسب المالي',
            ),
            NavigationDestination(
              icon: Icon(Icons.settings_outlined),
              selectedIcon: Icon(Icons.settings, color: Color(0xFFD4AF37)),
              label: 'الإعدادات',
            ),
          ],
        ),
      ),
    );
  }
}

/// 1. Main Dashboard View
class DashboardView extends StatelessWidget {
  const DashboardView({Super.key});

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16.0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text(
            'مرحباً بك، المحاسب الإداري 👋',
            style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold, color: Colors.white),
          ),
          const SizedBox(height: 4),
          const Text(
            'ملخص أداء منصة إسكارف برو والإحصائيات الحية',
            style: TextStyle(fontSize: 12, color: Colors.grey),
          ),
          const SizedBox(height: 16),
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            crossAxisSpacing: 12,
            mainAxisSpacing: 12,
            childAspectRatio: 1.4,
            children: const [
              StatCard(
                title: 'إجمالي المبيعات',
                value: '48,250.00 \$',
                icon: Icons.payments_outlined,
                color: Color(0xFFD4AF37),
              ),
              StatCard(
                title: 'طلبات التوثيق',
                value: '5 متاجر بانتظارك',
                icon: Icons.shield_outlined,
                color: Colors.amber,
              ),
              StatCard(
                title: 'عمولة المنصة (5%)',
                value: '2,412.50 \$',
                icon: Icons.pie_chart_outline,
                color: Colors.emerald,
              ),
              StatCard(
                title: 'المتاجر المعتمدة',
                value: '32 متجر موثق',
                icon: Icons.store_outlined,
                color: Colors.lightBlue,
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class StatCard extends StatelessWidget {
  final String title;
  final String value;
  final IconData icon;
  final Color color;

  const StatCard({
    Super.key,
    required this.title,
    required this.value,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: const Color(0xFF1C1917),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.white.withOpacity(0.08)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(title, style: const TextStyle(fontSize: 11, color: Colors.grey)),
              Icon(icon, color: color, size: 20),
            ],
          ),
          Text(
            value,
            style: TextStyle(
              fontSize: 15,
              fontWeight: FontWeight.bold,
              color: color,
            ),
          ),
        ],
      ),
    );
  }
}

/// 2. Merchant KYC Verification Screen
class MerchantVerificationView extends StatelessWidget {
  const MerchantVerificationView({Super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        const Text(
          'طلبات تدقيق وثائق المتاجر والتاجرات',
          style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold, color: Color(0xFFD4AF37)),
        ),
        const SizedBox(height: 4),
        const Text(
          'مراجعة الهويات الرسمية والسجلات التجارية لمنح شارة التوثيق',
          style: TextStyle(fontSize: 11, color: Colors.grey),
        ),
        const SizedBox(height: 16),
        _buildMerchantKYCCard(
          context,
          storeName: 'متجر عبايات الملكة',
          ownerName: 'سارة أحمد العتيبي',
          phone: '+966 50 123 4567',
          status: 'بانتظار المراجعة',
        ),
        const SizedBox(height: 12),
        _buildMerchantKYCCard(
          context,
          storeName: 'دار الشالات الحريرية',
          ownerName: 'منى عبد الله',
          phone: '+966 55 987 6543',
          status: 'موثق ومعتمد',
          isVerified: true,
        ),
      ],
    );
  }

  Widget _buildMerchantKYCCard(
    BuildContext context, {
    required String storeName,
    required String ownerName,
    required String phone,
    required String status,
    bool isVerified = false,
  }) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF1C1917),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(
          color: isVerified ? Colors.emerald.withOpacity(0.3) : const Color(0xFFD4AF37).withOpacity(0.3),
        ),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                storeName,
                style: const TextStyle(fontSize: 14, fontWeight: FontWeight.bold, color: Colors.white),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: isVerified ? Colors.emerald.withOpacity(0.2) : Colors.amber.withOpacity(0.2),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  status,
                  style: TextStyle(
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                    color: isVerified ? Colors.emerald : Colors.amber,
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text('مالكة المتجر: $ownerName', style: const TextStyle(fontSize: 12, color: Colors.grey)),
          Text('رقم الهاتف: $phone', style: const TextStyle(fontSize: 12, color: Colors.grey)),
          const SizedBox(height: 12),
          Row(
            children: [
              Expanded(
                child: ElevatedButton.icon(
                  style: ElevatedButton.styleFrom(
                    backgroundColor: isVerified ? Colors.grey[800] : const Color(0xFFD4AF37),
                    foregroundColor: isVerified ? Colors.white : Colors.black,
                  ),
                  onPressed: isVerified ? null : () {},
                  icon: const Icon(Icons.check_circle_outline, size: 16),
                  label: Text(isVerified ? 'معتمد' : 'اعتماد التوثيق'),
                ),
              ),
            ],
          )
        ],
      ),
    );
  }
}

/// 3. Accounting Audit View
class AccountingAuditView extends StatelessWidget {
  const AccountingAuditView({Super.key});

  @override
  Widget build(BuildContext context) {
    return const Center(
      child: Text(
        'غرفة الاعتماد والتحويلات المالية للمحاسب المالي',
        style: TextStyle(color: Colors.white70),
      ),
    );
  }
}

/// 4. Settings & Package Info View
class SettingsView extends StatelessWidget {
  const SettingsView({Super.key});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        ListTile(
          tileColor: const Color(0xFF1C1917),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          title: const Text('اسم التطبيق (App Name)', style: TextStyle(color: Colors.grey, fontSize: 12)),
          subtitle: const Text(AppConfig.appName, style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
          leading: const Icon(Icons.app_shortcut, color: Color(0xFFD4AF37)),
        ),
        const SizedBox(height: 8),
        ListTile(
          tileColor: const Color(0xFF1C1917),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
          title: const Text('اسم حزمة الأندرويد (Android Package Name)', style: TextStyle(color: Colors.grey, fontSize: 12)),
          subtitle: const Text(AppConfig.packageName, style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontFamily: 'monospace')),
          leading: const Icon(Icons.android, color: Colors.emerald),
        ),
      ],
    );
  }
}
