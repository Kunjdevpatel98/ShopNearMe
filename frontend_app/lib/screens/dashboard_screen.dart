import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/auth_provider.dart';
import '../providers/shop_provider.dart';
import '../models/shop.dart';
import 'shop_detail_screen.dart';
import '../utils/style_constants.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  int? _selectedCategoryId;
  final _searchController = TextEditingController();
  double? _selectedDistanceRange;
  bool _isCustomDistance = false;
  double _customDistanceValue = 50000;

  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      context.read<ShopProvider>().fetchCategories();
      context.read<ShopProvider>().fetchShops();
    });
  }

  @override
  Widget build(BuildContext context) {
    final auth = Provider.of<AuthProvider>(context);
    final shopProvider = Provider.of<ShopProvider>(context);

    return Scaffold(
      backgroundColor: AppColors.background,
      body: CustomScrollView(
        physics: const BouncingScrollPhysics(),
        slivers: [
          _buildSliverAppBar(auth),
          SliverToBoxAdapter(
            child: Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 24),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _buildSearchAndLocationHub(shopProvider),
                  const SizedBox(height: 32),
                  _buildSectionHeader('Explore Categories', onSeeAll: () {}),
                  const SizedBox(height: 20),
                  _buildCategoryList(shopProvider),
                  const SizedBox(height: 32),
                  _buildDistanceFilter(shopProvider),
                  const SizedBox(height: 32),
                  _buildSectionHeader('Popular Shops Nearby', onSeeAll: () {}),
                  const SizedBox(height: 20),
                ],
              ),
            ),
          ),
          _buildShopList(shopProvider),
          const SliverToBoxAdapter(child: SizedBox(height: 100)),
        ],
      ),
    );
  }

  Widget _buildSliverAppBar(AuthProvider auth) {
    return SliverAppBar(
      expandedHeight: 220,
      floating: false,
      pinned: true,
      elevation: 0,
      backgroundColor: AppColors.primary,
      flexibleSpace: FlexibleSpaceBar(
        background: Stack(
          children: [
            Container(
              decoration: const BoxDecoration(
                gradient: AppColors.primaryGradient,
              ),
            ),
            Positioned(
              top: -50,
              right: -50,
              child: CircleAvatar(
                radius: 120,
                backgroundColor: Colors.white.withOpacity(0.1),
              ),
            ),
            Positioned(
              bottom: 40,
              left: -30,
              child: CircleAvatar(
                radius: 80,
                backgroundColor: Colors.white.withOpacity(0.05),
              ),
            ),
            SafeArea(
              child: Padding(
                padding: const EdgeInsets.fromLTRB(24, 60, 24, 20),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Find your daily\nessentials nearby.',
                      style: AppStyles.headingMain.copyWith(
                        color: Colors.white,
                        height: 1.1,
                      ),
                    ),
                    const SizedBox(height: 12),
                    Text(
                      'Over 500+ shops around you.',
                      style: AppStyles.bodyLarge.copyWith(
                        color: Colors.white.withAlpha(204),
                      ),
                    ),
                  ],
                ),
              ),
            ),
          ],
        ),
      ),
      title: const Text(
        'ShopNearMe',
        style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold),
      ),
      actions: [
        IconButton(
          onPressed: () => auth.logout(),
          icon: const Icon(Icons.logout_rounded, color: Colors.white),
        ),
      ],
    );
  }

  Widget _buildSearchAndLocationHub(ShopProvider provider) {
    return Container(
      decoration: AppStyles.cardDecoration,
      padding: const EdgeInsets.all(16),
      child: Column(
        children: [
          Row(
            children: [
              const Icon(Icons.location_on_rounded, color: AppColors.primary, size: 20),
              const SizedBox(width: 8),
              Expanded(
                child: Text(
                  provider.userAddress ?? 'Fetching location...',
                  style: AppStyles.bodySmall.copyWith(fontWeight: FontWeight.w600),
                  overflow: TextOverflow.ellipsis,
                ),
              ),
              const Icon(Icons.keyboard_arrow_down_rounded, color: Colors.grey, size: 20),
            ],
          ),
          const Padding(
            padding: EdgeInsets.symmetric(vertical: 12),
            child: Divider(height: 1, color: Color(0xFFF1F1F1)),
          ),
          TextField(
            controller: _searchController,
            onSubmitted: (val) {
              provider.fetchShops(search: val, categoryId: _selectedCategoryId);
            },
            decoration: InputDecoration(
              hintText: 'Search for shops, products...',
              hintStyle: AppStyles.bodySmall.copyWith(color: Colors.grey[400]),
              prefixIcon: const Icon(Icons.search_rounded, color: AppColors.primary),
              filled: true,
              fillColor: AppColors.background,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(16),
                borderSide: BorderSide.none,
              ),
              contentPadding: const EdgeInsets.symmetric(horizontal: 16, vertical: 0),
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildSectionHeader(String title, {VoidCallback? onSeeAll}) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(title, style: AppStyles.headingSub),
        if (onSeeAll != null)
          TextButton(
            onPressed: onSeeAll,
            child: const Text('See All', style: TextStyle(color: AppColors.primary)),
          ),
      ],
    );
  }

  Widget _buildCategoryList(ShopProvider provider) {
    return SizedBox(
      height: 100,
      child: ListView.builder(
        scrollDirection: Axis.horizontal,
        physics: const BouncingScrollPhysics(),
        itemCount: provider.categories.length + 1,
        itemBuilder: (context, index) {
          if (index == 0) {
            return _buildCategoryItem(null, 'All', Icons.grid_view_rounded);
          }
          final category = provider.categories[index - 1];
          return _buildCategoryItem(
            category.id,
            category.name,
            _getCategoryIcon(category.name),
          );
        },
      ),
    );
  }

  Widget _buildCategoryItem(int? id, String label, IconData icon) {
    final isSelected = _selectedCategoryId == id;
    return GestureDetector(
      onTap: () {
        setState(() => _selectedCategoryId = isSelected ? null : id);
        context.read<ShopProvider>().fetchShops(
              categoryId: _selectedCategoryId,
              search: _searchController.text.isEmpty ? null : _searchController.text,
            );
      },
      child: Container(
        margin: const EdgeInsets.only(right: 16),
        width: 72,
        child: Column(
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 200),
              height: 64,
              width: 64,
              decoration: BoxDecoration(
                color: isSelected ? AppColors.primary : Colors.white,
                borderRadius: BorderRadius.circular(20),
                boxShadow: isSelected
                    ? [
                        BoxShadow(
                          color: AppColors.primary.withOpacity(0.3),
                          blurRadius: 12,
                          offset: const Offset(0, 4),
                        )
                      ]
                    : [],
                border: Border.all(
                  color: isSelected ? AppColors.primary : Colors.grey[100]!,
                  width: 1,
                ),
              ),
              child: Icon(
                icon,
                color: isSelected ? Colors.white : AppColors.textPrimary,
                size: 28,
              ),
            ),
            const SizedBox(height: 8),
            Text(
              label,
              style: AppStyles.bodySmall.copyWith(
                fontSize: 12,
                fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
                color: isSelected ? AppColors.primary : AppColors.textSecondary,
              ),
              textAlign: TextAlign.center,
              maxLines: 1,
              overflow: TextOverflow.ellipsis,
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildDistanceFilter(ShopProvider provider) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        _buildSectionHeader('Filter by Distance'),
        const SizedBox(height: 12),
        SingleChildScrollView(
          scrollDirection: Axis.horizontal,
          physics: const BouncingScrollPhysics(),
          child: Row(
            children: [
              _buildDistanceChip(null, 'All', provider),
              _buildDistanceChip(1000, '1 km', provider),
              _buildDistanceChip(5000, '5 km', provider),
              _buildDistanceChip(10000, '10 km', provider),
              _buildDistanceChip(-1, 'Custom', provider),
            ],
          ),
        ),
        if (_isCustomDistance) ...[
          const SizedBox(height: 16),
          Row(
            children: [
              Expanded(
                child: Slider(
                  value: _customDistanceValue,
                  min: 500,
                  max: 100000,
                  divisions: 199,
                  activeColor: AppColors.primary,
                  onChanged: (value) {
                    setState(() => _customDistanceValue = value);
                    provider.setMaxDistanceFilter(value);
                  },
                ),
              ),
              Text(
                '${(_customDistanceValue / 1000).toStringAsFixed(1)}km',
                style: AppStyles.bodySmall.copyWith(fontWeight: FontWeight.bold),
              ),
            ],
          ),
        ],
      ],
    );
  }

  Widget _buildDistanceChip(double? value, String label, ShopProvider provider) {
    final bool isSelected = (value == -1)
        ? _isCustomDistance
        : (!_isCustomDistance && _selectedDistanceRange == value);

    return Padding(
      padding: const EdgeInsets.only(right: 8),
      child: ChoiceChip(
        label: Text(label),
        selected: isSelected,
        onSelected: (selected) {
          setState(() {
            if (value == -1) {
              _isCustomDistance = true;
              provider.setMaxDistanceFilter(_customDistanceValue);
            } else {
              _isCustomDistance = false;
              _selectedDistanceRange = value;
              provider.setMaxDistanceFilter(value);
            }
          });
        },
        selectedColor: AppColors.primary,
        labelStyle: TextStyle(
          color: isSelected ? Colors.white : AppColors.textPrimary,
          fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
        ),
        backgroundColor: Colors.white,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(12),
          side: BorderSide(color: isSelected ? AppColors.primary : Colors.grey[200]!),
        ),
      ),
    );
  }

  Widget _buildShopList(ShopProvider provider) {
    if (provider.isLoading) {
      return const SliverFillRemaining(
        child: Center(child: CircularProgressIndicator()),
      );
    }
    if (provider.shops.isEmpty) {
      return const SliverFillRemaining(
        child: Center(child: Text('No shops found in this area.')),
      );
    }
    return SliverPadding(
      padding: const EdgeInsets.symmetric(horizontal: 20),
      sliver: SliverList(
        delegate: SliverChildBuilderDelegate(
          (context, index) => _buildShopCard(provider.shops[index]),
          childCount: provider.shops.length,
        ),
      ),
    );
  }

  Widget _buildShopCard(Shop shop) {
    return Container(
      margin: const EdgeInsets.only(bottom: 20),
      decoration: AppStyles.cardDecoration,
      clipBehavior: Clip.antiAlias,
      child: InkWell(
        onTap: () => Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => ShopDetailScreen(shop: shop)),
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                Hero(
                  tag: 'shop-${shop.id}',
                  child: shop.imageUrl != null
                      ? Image.network(
                          shop.imageUrl!,
                          height: 180,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          errorBuilder: (_, __, ___) => _buildPlaceholderImage(),
                        )
                      : _buildPlaceholderImage(),
                ),
                Positioned(
                  top: 12,
                  right: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Row(
                      children: const [
                        Icon(Icons.star_rounded, color: Colors.amber, size: 16),
                        SizedBox(width: 4),
                        Text(
                          '4.2',
                          style: TextStyle(fontWeight: FontWeight.bold, fontSize: 12),
                        ),
                      ],
                    ),
                  ),
                ),
                Positioned(
                  bottom: 12,
                  left: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                    decoration: BoxDecoration(
                      color: Colors.black.withOpacity(0.6),
                      borderRadius: BorderRadius.circular(12),
                    ),
                    child: Text(
                      shop.isOpen ? 'OPEN NOW' : 'CLOSED',
                      style: const TextStyle(
                        color: Colors.white,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 0.5,
                      ),
                    ),
                  ),
                ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Expanded(
                        child: Text(
                          shop.name,
                          style: AppStyles.headingSub.copyWith(fontSize: 18),
                          overflow: TextOverflow.ellipsis,
                        ),
                      ),
                      if (shop.distance != null)
                        Text(
                          '${(shop.distance! / 1000).toStringAsFixed(1)} km',
                          style: AppStyles.bodySmall.copyWith(
                            color: AppColors.primary,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                    ],
                  ),
                  const SizedBox(height: 4),
                  Text(
                    '${shop.category.name} • ${shop.city}',
                    style: AppStyles.bodySmall,
                  ),
                  const SizedBox(height: 12),
                  Row(
                    children: [
                      _buildBadge(Icons.delivery_dining_rounded, 'Delivery'),
                      const SizedBox(width: 8),
                      _buildBadge(Icons.verified_user_rounded, 'Trusted'),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildBadge(IconData icon, String label) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: AppColors.primary.withOpacity(0.08),
        borderRadius: BorderRadius.circular(8),
      ),
      child: Row(
        children: [
          Icon(icon, size: 14, color: AppColors.primary),
          const SizedBox(width: 4),
          Text(
            label,
            style: TextStyle(
              color: AppColors.primary,
              fontSize: 10,
              fontWeight: FontWeight.w600,
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildPlaceholderImage() {
    return Container(
      height: 180,
      width: double.infinity,
      decoration: const BoxDecoration(
        gradient: AppColors.primaryGradient,
      ),
      child: const Icon(Icons.store_rounded, size: 48, color: Colors.white),
    );
  }

  IconData _getCategoryIcon(String name) {
    name = name.toLowerCase();
    if (name.contains('kirana')) return Icons.shopping_basket_rounded;
    if (name.contains('medicine')) return Icons.medical_services_rounded;
    if (name.contains('clothing')) return Icons.checkroom_rounded;
    if (name.contains('restaurant')) return Icons.restaurant_rounded;
    if (name.contains('electronic')) return Icons.devices_rounded;
    return Icons.storefront_rounded;
  }
}
