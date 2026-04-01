import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../models/shop.dart';
import '../../../providers/shop_provider.dart';

class OverviewTab extends StatefulWidget {
  final Shop shop;
  const OverviewTab({super.key, required this.shop});

  @override
  State<OverviewTab> createState() => _OverviewTabState();
}

class _OverviewTabState extends State<OverviewTab> {
  Map<String, dynamic> _stats = {};
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  @override
  void didUpdateWidget(OverviewTab oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.shop.id != widget.shop.id) {
      _loadStats();
    }
  }

  Future<void> _loadStats() async {
    setState(() => _isLoading = true);
    final stats = await Provider.of<ShopProvider>(context, listen: false)
        .fetchShopStats(widget.shop.id!);
    if (mounted) {
      setState(() {
        _stats = stats;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    return SingleChildScrollView(
      padding: const EdgeInsets.all(20),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Stat Cards Grid
          GridView.count(
            crossAxisCount: 2,
            crossAxisSpacing: 16,
            mainAxisSpacing: 16,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            childAspectRatio: 1.1,
            children: [
              _buildStatCard(
                "Total Views",
                (_stats['totalViews'] ?? 0).toString(),
                Icons.visibility_outlined,
                Colors.blue,
                null,
              ),
              _buildStatCard(
                "Orders",
                (_stats['totalOrders'] ?? 0).toString(),
                Icons.assignment_outlined,
                Colors.green,
                null,
              ),
              _buildStatCard(
                "Total Sales",
                "₹${(_stats['totalSales'] ?? 0).toStringAsFixed(0)}",
                Icons.account_balance_wallet_outlined,
                Colors.purple,
                null,
              ),
              _buildStatCard(
                "Rating",
                (_stats['rating'] ?? 4.2).toString(),
                Icons.star_border,
                Colors.orange,
                null,
              ),
            ],
          ),
          const SizedBox(height: 24),
          
          // Chart Placeholder
          Container(
            padding: const EdgeInsets.all(20),
            width: double.infinity,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text("Sales Analytics", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 40),
                const Center(
                  child: Column(
                    children: [
                      Icon(Icons.show_chart, size: 48, color: Colors.grey),
                      SizedBox(height: 12),
                      Text("Chart Visualization Placeholder", style: TextStyle(color: Colors.grey, fontSize: 12)),
                    ],
                  ),
                ),
                const SizedBox(height: 30),
                Center(
                  child: OutlinedButton(
                    onPressed: () async {
                      final success = await Provider.of<ShopProvider>(context, listen: false)
                          .simulateOrderData(widget.shop.id!);
                      if (success) {
                        _loadStats();
                      }
                    },
                    style: OutlinedButton.styleFrom(
                      foregroundColor: Colors.red,
                      side: const BorderSide(color: Colors.red),
                      shape: const StadiumBorder(),
                    ),
                    child: const Text("Simulate Live Data"),
                  ),
                ),
              ],
            ),
          ),
          
          const SizedBox(height: 24),

          // Recent Activity
          Container(
            padding: const EdgeInsets.all(20),
            width: double.infinity,
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text("Recent Activity", style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 20),
                _activityItem(
                  Icons.warning_amber_rounded,
                  Colors.orange[100]!,
                  Colors.orange,
                  "Pending Orders",
                  "${_stats['pendingOrders'] ?? 0} orders waiting",
                ),
                const SizedBox(height: 16),
                _activityItem(
                  Icons.bolt,
                  Colors.green[100]!,
                  Colors.green,
                  "System Status",
                  "All systems operational",
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildStatCard(String title, String value, IconData icon, Color color, String? growth) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: color.withOpacity(0.1),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(icon, color: color, size: 20),
              ),
              if (growth != null)
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 4, vertical: 2),
                  decoration: BoxDecoration(
                    color: Colors.green[50],
                    borderRadius: BorderRadius.circular(8),
                  ),
                  child: Text(
                    "↑ $growth",
                    style: const TextStyle(color: Colors.green, fontSize: 9, fontWeight: FontWeight.bold),
                  ),
                ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title, style: const TextStyle(color: Colors.grey, fontSize: 10)),
              const SizedBox(height: 2),
              Text(value, style: const TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
            ],
          ),
        ],
      ),
    );
  }

  Widget _activityItem(IconData icon, Color bg, Color iconColor, String title, String subtitle) {
    return Container(
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: bg.withOpacity(0.3),
        borderRadius: BorderRadius.circular(12),
      ),
      child: Row(
        children: [
          Icon(icon, color: iconColor, size: 24),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13)),
                Text(subtitle, style: TextStyle(color: iconColor, fontSize: 11)),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
