import 'package:flutter/material.dart';
import '../../utils/style_constants.dart';
import 'package:provider/provider.dart';
import '../../providers/shop_provider.dart';
import '../../models/shop.dart';
import 'tabs/overview_tab.dart';
import 'tabs/products_tab.dart';
import 'tabs/settings_tab.dart';
import 'tabs/orders_tab.dart';
import 'add_shop_screen.dart';
import '../../providers/auth_provider.dart';

class PartnerDashboardScreen extends StatefulWidget {
  const PartnerDashboardScreen({super.key});

  @override
  State<PartnerDashboardScreen> createState() => _PartnerDashboardScreenState();
}

class _PartnerDashboardScreenState extends State<PartnerDashboardScreen> {
  int _selectedIndex = 0;
  final GlobalKey<ScaffoldState> _scaffoldKey = GlobalKey<ScaffoldState>();
  Shop? _selectedShop;

  final List<String> _titles = ["Overview", "Products", "Orders", "Settings"];

  @override
  void initState() {
    super.initState();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      _loadShops();
    });
  }

  Future<void> _loadShops() async {
    final shopProvider = Provider.of<ShopProvider>(context, listen: false);
    await shopProvider.fetchMyShops();
    if (shopProvider.myShops.isNotEmpty) {
      setState(() {
        _selectedShop = shopProvider.myShops[0];
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_selectedShop == null) {
      final shopProvider = Provider.of<ShopProvider>(context);
      if (shopProvider.isLoading) {
        return const Scaffold(
          body: Center(child: CircularProgressIndicator()),
        );
      }
      return Scaffold(
        body: Center(
          child: Column(
            mainAxisAlignment: MainAxisAlignment.center,
            children: [
              const Text("You haven't registered any shops yet."),
              const SizedBox(height: 20),
              ElevatedButton(
                onPressed: () => _navigateToAddShop(),
                child: const Text("Register First Shop"),
              ),
            ],
          ),
        ),
      );
    }

    final List<Widget> tabs = [
      OverviewTab(shop: _selectedShop!),
      ProductsTab(shop: _selectedShop!),
      OrdersTab(shop: _selectedShop!),
      SettingsTab(shop: _selectedShop!),
    ];

    return Scaffold(
      key: _scaffoldKey,
      backgroundColor: AppColors.background,
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        leading: IconButton(
          icon: const Icon(Icons.menu, color: Colors.black),
          onPressed: () => _scaffoldKey.currentState?.openDrawer(),
        ),
        title: Text(
          _titles[_selectedIndex],
          style: const TextStyle(color: Colors.black, fontWeight: FontWeight.bold),
        ),
      ),
      drawer: _buildDrawer(),
      body: Column(
        children: [
          _buildHeader(),
          Expanded(
            child: tabs[_selectedIndex],
          ),
        ],
      ),
    );
  }

  Future<void> _navigateToAddShop() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(builder: (context) => const AddShopScreen()),
    );
    if (result == true) {
      _loadShops();
    }
  }

  Widget _buildDrawer() {
    final shopProvider = Provider.of<ShopProvider>(context);
    return Drawer(
      child: Container(
        color: const Color(0xFF1E1E1E),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 60),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(8),
                    decoration: BoxDecoration(
                      color: AppColors.primary,
                      borderRadius: BorderRadius.circular(8),
                    ),
                    child: const Icon(Icons.store, color: Colors.white),
                  ),
                  const SizedBox(width: 12),
                  const Text(
                    "PartnerHub",
                    style: TextStyle(
                      color: Colors.white,
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 40),
            _drawerItem(0, Icons.dashboard_outlined, "Overview"),
            _drawerItem(1, Icons.inventory_2_outlined, "Products"),
            _drawerItem(2, Icons.receipt_long_outlined, "Orders"),
            _drawerItem(3, Icons.settings_outlined, "Settings"),
            const Spacer(),
            const Padding(
              padding: EdgeInsets.all(20),
              child: Text(
                "YOUR SHOPS",
                style: TextStyle(color: Colors.grey, fontSize: 12, fontWeight: FontWeight.bold),
              ),
            ),
            Expanded(
              flex: 0,
              child: ListView.builder(
                shrinkWrap: true,
                padding: EdgeInsets.zero,
                itemCount: shopProvider.myShops.length,
                itemBuilder: (context, index) {
                  final shop = shopProvider.myShops[index];
                  return _drawerItem(
                    index,
                    Icons.storefront,
                    shop.name,
                    isShop: true,
                    isSelectedShop: _selectedShop?.id == shop.id,
                    onTap: () {
                      setState(() {
                        _selectedShop = shop;
                        _selectedIndex = 0;
                      });
                      Navigator.pop(context);
                    },
                  );
                },
              ),
            ),
            const SizedBox(height: 10),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: OutlinedButton.icon(
                onPressed: () => _navigateToAddShop(),
                icon: const Icon(Icons.add, size: 16),
                label: const Text("Add Another Shop"),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.grey,
                  side: const BorderSide(color: Colors.grey),
                ),
              ),
            ),
            const SizedBox(height: 10),
            Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20),
              child: ListTile(
                leading: const Icon(Icons.logout, color: Colors.redAccent),
                title: const Text("Logout", style: TextStyle(color: Colors.redAccent, fontWeight: FontWeight.bold)),
                onTap: () {
                  Provider.of<AuthProvider>(context, listen: false).logout();
                  Navigator.of(context).pushNamedAndRemoveUntil('/', (route) => false);
                },
              ),
            ),
            const SizedBox(height: 30),
          ],
        ),
      ),
    );
  }

  Widget _drawerItem(int index, IconData icon, String label,
      {bool isShop = false, bool isSelectedShop = false, VoidCallback? onTap}) {
    bool isSelected = (!isShop && _selectedIndex == index) || (isShop && isSelectedShop);
    return InkWell(
      onTap: onTap ??
          () {
            if (!isShop) {
              setState(() => _selectedIndex = index);
              Navigator.pop(context); // Close drawer
            }
          },
      child: Container(
        margin: const EdgeInsets.symmetric(horizontal: 12, vertical: 4),
        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
        decoration: BoxDecoration(
          color: isSelected ? AppColors.primary.withOpacity(0.8) : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Row(
          children: [
            Icon(icon, color: isSelected || isShop ? Colors.white : Colors.grey[400]),
            const SizedBox(width: 12),
            Expanded(
              child: Text(
                label,
                style: TextStyle(
                  color: isSelected || isShop ? Colors.white : Colors.grey[400],
                  fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
                ),
                overflow: TextOverflow.ellipsis,
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildHeader() {
    return Container(
      padding: const EdgeInsets.all(20),
      color: Colors.white,
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            _selectedShop?.name ?? "No Shop",
                            style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 8),
                        Container(
                          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                          decoration: BoxDecoration(
                            color: _selectedShop?.isOpen == true ? Colors.teal[50] : const Color(0xFFFFEBEE),
                            borderRadius: BorderRadius.circular(12),
                          ),
                          child: Text(
                            _selectedShop?.manualOpen == true ? "ACTIVE" : "INACTIVE",
                            style: TextStyle(
                              color: _selectedShop?.manualOpen == true ? Colors.teal : Colors.red,
                              fontSize: 10,
                              fontWeight: FontWeight.bold,
                            ),
                          ),
                        ),
                      ],
                    ),
                    Row(
                      children: [
                        const Icon(Icons.location_on, size: 14, color: Colors.grey),
                        Text(" ${_selectedShop?.city ?? 'Unknown'}", style: const TextStyle(color: Colors.grey)),
                      ],
                    ),
                  ],
                ),
              ),
              ElevatedButton(
                onPressed: () {
                  setState(() => _selectedIndex = 3); // Move to settings
                },
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
                  minimumSize: Size.zero,
                  tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
                ),
                child: const Text("Edit Shop", style: TextStyle(fontSize: 12)),
              ),
            ],
          ),
          const Divider(height: 30),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              const Text("SHOP STATUS ", style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
              Row(
                children: [
                  Text(
                    _selectedShop?.manualOpen == true ? "ACTIVE" : "INACTIVE",
                    style: TextStyle(
                      fontSize: 12,
                      color: _selectedShop?.manualOpen == true ? Colors.teal : Colors.red,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  Switch(
                    value: _selectedShop?.manualOpen ?? false,
                    onChanged: (v) async {
                      if (_selectedShop != null) {
                        final success = await Provider.of<ShopProvider>(context, listen: false)
                            .updateShopStatus(_selectedShop!.id!, v);
                        if (success) {
                          setState(() {
                            _selectedShop = _selectedShop!.copyWith(manualOpen: v);
                          });
                        }
                      }
                    },
                    activeColor: Colors.teal,
                  ),
                ],
              ),
            ],
          ),
        ],
      ),
    );
  }
}
