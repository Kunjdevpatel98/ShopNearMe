import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../../../models/shop.dart';
import '../../../providers/shop_provider.dart';
import '../../../utils/style_constants.dart';

class OrdersTab extends StatefulWidget {
  final Shop shop;
  const OrdersTab({super.key, required this.shop});

  @override
  State<OrdersTab> createState() => _OrdersTabState();
}

class _OrdersTabState extends State<OrdersTab> {
  List<dynamic> _orders = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadOrders();
  }

  @override
  void didUpdateWidget(OrdersTab oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.shop.id != widget.shop.id) {
      _loadOrders();
    }
  }

  Future<void> _loadOrders() async {
    setState(() => _isLoading = true);
    final orders = await Provider.of<ShopProvider>(context, listen: false)
        .fetchShopOrders(widget.shop.id!);
    if (mounted) {
      setState(() {
        _orders = orders;
        _isLoading = false;
      });
    }
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }

    if (_orders.isEmpty) {
      return Center(
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(Icons.receipt_long_outlined, size: 64, color: Colors.grey[300]),
            const SizedBox(height: 16),
            const Text("No orders found yet.", style: TextStyle(color: Colors.grey)),
          ],
        ),
      );
    }

    return ListView.builder(
      padding: const EdgeInsets.all(20),
      itemCount: _orders.length,
      itemBuilder: (context, index) {
        final order = _orders[index];
        return _buildOrderCard(order);
      },
    );
  }

  Widget _buildOrderCard(dynamic order) {
    final status = order['status'] ?? 'PENDING';
    final isCompleted = status == 'COMPLETED';

    return Container(
      margin: const EdgeInsets.only(bottom: 16),
      padding: const EdgeInsets.all(16),
      decoration: AppStyles.cardDecoration,
      child: Column(
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text("Order #${order['id']}", style: const TextStyle(fontWeight: FontWeight.bold)),
                  Text(
                    "Amount: ₹${order['totalAmount']}",
                    style: TextStyle(color: AppColors.primary, fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                ],
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                decoration: BoxDecoration(
                  color: isCompleted ? Colors.green[50] : Colors.orange[50],
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  status,
                  style: TextStyle(
                    color: isCompleted ? Colors.green : Colors.orange,
                    fontWeight: FontWeight.bold,
                    fontSize: 10,
                  ),
                ),
              ),
            ],
          ),
          const Divider(height: 24),
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                "Created: ${order['createdAt'] != null ? order['createdAt'].toString().substring(0, 10) : 'N/A'}",
                style: const TextStyle(color: Colors.grey, fontSize: 12),
              ),
              const Text("View Details", style: TextStyle(color: Colors.blue, fontSize: 12, fontWeight: FontWeight.bold)),
            ],
          ),
        ],
      ),
    );
  }
}
