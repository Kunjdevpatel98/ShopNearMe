import 'package:flutter/material.dart';
import 'package:flutter/services.dart';
import 'package:provider/provider.dart';
import 'package:url_launcher/url_launcher.dart';
import 'package:share_plus/share_plus.dart';
import '../providers/shop_provider.dart';
import '../providers/bookmark_provider.dart';
import '../models/shop.dart';
import '../models/product.dart';
import '../models/review.dart';
import '../utils/style_constants.dart';
import '../providers/review_provider.dart';
import 'map_screen.dart';

class ShopDetailScreen extends StatefulWidget {
  final Shop shop;
  const ShopDetailScreen({super.key, required this.shop});

  @override
  State<ShopDetailScreen> createState() => _ShopDetailScreenState();
}

class _ShopDetailScreenState extends State<ShopDetailScreen>
    with SingleTickerProviderStateMixin {
  List<Product> _products = [];
  bool _isLoading = true;
  late TabController _tabController;
  int _reviewRating = 5;
  final _reviewController = TextEditingController();
  Map<String, dynamic> _shopStats = {};

  @override
  void initState() {
    super.initState();
    _tabController = TabController(length: 3, vsync: this);
    _initializeData();
  }

  Future<void> _initializeData() async {
    await Future.wait([
      _fetchProducts(),
      _fetchShopStats(),
      context.read<ReviewProvider>().fetchReviews(widget.shop.id!),
      context.read<BookmarkProvider>().fetchWishlistIds(),
    ]);
  }

  Future<void> _fetchShopStats() async {
    try {
      final stats = await context.read<ShopProvider>().fetchShopStats(widget.shop.id!);
      if (mounted) {
        setState(() {
          _shopStats = stats;
        });
      }
    } catch (e) {
      print('Error fetching shop stats: $e');
    }
  }

  @override
  void dispose() {
    _tabController.dispose();
    _reviewController.dispose();
    super.dispose();
  }

  Future<void> _fetchProducts() async {
    try {
      final response = await context.read<ShopProvider>().fetchProductsForShop(
        widget.shop.id!,
      );
      if (mounted) {
        setState(() {
          _products = response;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (mounted) setState(() => _isLoading = false);
    }
  }

  Future<void> _openDirections() async {
    final shop = widget.shop;
    final url = Uri.parse(
      'https://www.google.com/maps/dir/?api=1&destination=${shop.latitude},${shop.longitude}',
    );
    if (await canLaunchUrl(url)) {
      await launchUrl(url, mode: LaunchMode.externalApplication);
    } else {
      // Fallback to internal map
      if (mounted) {
        Navigator.push(
          context,
          MaterialPageRoute(builder: (_) => const MapScreen()),
        );
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final shop = widget.shop;
    final distanceText = shop.distance != null
        ? '${(shop.distance! / 1000).toStringAsFixed(1)} KM FROM YOU'
        : null;

    return Scaffold(
      backgroundColor: Colors.white,
      body: NestedScrollView(
        headerSliverBuilder: (context, innerBoxIsScrolled) => [
          SliverAppBar(
            expandedHeight: 240,
            pinned: true,
            backgroundColor: AppColors.primary,
            foregroundColor: Colors.white,
            elevation: 0,
            flexibleSpace: FlexibleSpaceBar(
              background: Stack(
                fit: StackFit.expand,
                children: [
                  if (shop.imageUrl != null)
                    Image.network(
                      shop.imageUrl!,
                      fit: BoxFit.cover,
                      errorBuilder: (ctx, e, st) => _buildPlaceholderImage(),
                    )
                  else
                    _buildPlaceholderImage(),
                  // Dark gradient overlay at top for back button readability
                  Container(
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        begin: Alignment.topCenter,
                        end: Alignment.center,
                        colors: [Colors.black54, Colors.transparent],
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
        ],
        body: Column(
          children: [
            // ── Shop Info Bar ──────────────────────────────────────────────
            _buildShopInfoBar(shop, distanceText),
            // ── Tab Bar ───────────────────────────────────────────────────
            Container(
              color: Colors.white,
              child: TabBar(
                controller: _tabController,
                labelColor: AppColors.primary,
                unselectedLabelColor: Colors.grey[600],
                indicatorColor: AppColors.primary,
                indicatorWeight: 3,
                labelStyle: AppStyles.bodySmall.copyWith(
                  fontWeight: FontWeight.bold,
                ),
                tabs: const [
                  Tab(text: 'Products'),
                  Tab(text: 'Overview'),
                  Tab(text: 'Reviews'),
                ],
              ),
            ),
            const Divider(height: 1, color: Color(0xFFEEEEEE)),
            // ── Tab Views ─────────────────────────────────────────────────
            Expanded(
              child: TabBarView(
                controller: _tabController,
                children: [
                  _buildProductsTab(),
                  _buildOverviewTab(shop, distanceText),
                  _buildReviewsTab(),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }

  // ── Shop Info Bar ──────────────────────────────────────────────────────────
  Widget _buildShopInfoBar(Shop shop, String? distanceText) {
    return Container(
      color: Colors.white,
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 0),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Row(
                      children: [
                        Flexible(
                          child: Text(
                            shop.name,
                            style: AppStyles.headingSub.copyWith(fontSize: 22),
                            overflow: TextOverflow.ellipsis,
                          ),
                        ),
                        const SizedBox(width: 10),
                        Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 10,
                            vertical: 4,
                          ),
                          decoration: BoxDecoration(
                            color: shop.isOpen
                                ? Colors.green[50]
                                : Colors.red[50],
                            borderRadius: BorderRadius.circular(20),
                            border: Border.all(
                              color: shop.isOpen ? Colors.green : Colors.red,
                              width: 0.5,
                            ),
                          ),
                          child: Text(
                            shop.isOpen ? 'OPEN' : 'CLOSED',
                            style: TextStyle(
                              color: shop.isOpen ? Colors.green : Colors.red,
                              fontWeight: FontWeight.bold,
                              fontSize: 10,
                            ),
                          ),
                        ),
                      ],
                    ),
                    const SizedBox(height: 4),
                    Text(
                      '${shop.category.name} • ${shop.city}',
                      style: AppStyles.bodySmall.copyWith(
                        color: Colors.grey[600],
                      ),
                    ),
                  ],
                ),
              ),
              // Rating box
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 12,
                  vertical: 6,
                ),
                decoration: BoxDecoration(
                  color: Colors.green[700],
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Row(
                  children: [
                    Text(
                      _shopStats['rating']?.toStringAsFixed(1) ?? '0.0',
                      style: const TextStyle(
                        color: Colors.white,
                        fontWeight: FontWeight.bold,
                        fontSize: 14,
                      ),
                    ),
                    const SizedBox(width: 4),
                    const Icon(Icons.star, color: Colors.white, size: 14),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 14),
          // Bookmark + Share buttons
          Row(
            children: [
              ElevatedButton.icon(
                onPressed: () {
                  final bm = context.read<BookmarkProvider>();
                  bm.toggleBookmark(shop);
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(
                        bm.isBookmarked(shop)
                            ? '${shop.name} bookmarked!'
                            : 'Bookmark removed.',
                      ),
                      behavior: SnackBarBehavior.floating,
                      duration: const Duration(seconds: 2),
                    ),
                  );
                },
                icon: Consumer<BookmarkProvider>(
                  builder: (ctx, bm, _) => Icon(
                    bm.isBookmarked(shop)
                        ? Icons.bookmark
                        : Icons.bookmark_border,
                    size: 16,
                  ),
                ),
                label: Consumer<BookmarkProvider>(
                  builder: (ctx, bm, _) => Text(
                    bm.isBookmarked(shop) ? 'SAVED' : 'BOOKMARK',
                    style: const TextStyle(
                      fontSize: 12,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                style: ElevatedButton.styleFrom(
                  backgroundColor: AppColors.primary,
                  foregroundColor: Colors.white,
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 10,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                ),
              ),
              const SizedBox(width: 10),
              OutlinedButton.icon(
                onPressed: () {
                  Share.share(
                    '🛍️ Check out ${shop.name} on ShopNearMe!\nLocation: ${shop.city}\nhttps://maps.google.com/?q=${shop.latitude},${shop.longitude}',
                    subject: 'Shop on ShopNearMe',
                  );
                },
                icon: const Icon(Icons.share_outlined, size: 16),
                label: const Text(
                  'SHARE',
                  style: TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                ),
                style: OutlinedButton.styleFrom(
                  foregroundColor: Colors.grey[700],
                  side: BorderSide(color: Colors.grey[300]!),
                  padding: const EdgeInsets.symmetric(
                    horizontal: 16,
                    vertical: 10,
                  ),
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(20),
                  ),
                ),
              ),
            ],
          ),
          const SizedBox(height: 6),
        ],
      ),
    );
  }

  // ── Products Tab ───────────────────────────────────────────────────────────
  Widget _buildProductsTab() {
    if (_isLoading) {
      return const Center(child: CircularProgressIndicator());
    }
    if (_products.isEmpty) {
      return const Center(child: Text('No products available in this shop'));
    }
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Text(
          'Products / Menu',
          style: AppStyles.headingSub.copyWith(fontSize: 18),
        ),
        const SizedBox(height: 16),
        ..._products.map((p) => _buildProductItem(p)),
      ],
    );
  }

  // ── Overview Tab ───────────────────────────────────────────────────────────
  Widget _buildOverviewTab(Shop shop, String? distanceText) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        // "Visit Our Store" section
        Container(
          decoration: BoxDecoration(
            color: Colors.grey[50],
            borderRadius: BorderRadius.circular(16),
            border: Border.all(color: Colors.grey[200]!),
          ),
          padding: const EdgeInsets.all(20),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // LIVE LOCATION badge
              Container(
                padding: const EdgeInsets.symmetric(
                  horizontal: 10,
                  vertical: 4,
                ),
                decoration: BoxDecoration(
                  color: Colors.red[50],
                  borderRadius: BorderRadius.circular(20),
                  border: Border.all(color: AppColors.primary.withOpacity(0.3)),
                ),
                child: Row(
                  mainAxisSize: MainAxisSize.min,
                  children: [
                    Container(
                      width: 6,
                      height: 6,
                      decoration: const BoxDecoration(
                        color: AppColors.primary,
                        shape: BoxShape.circle,
                      ),
                    ),
                    const SizedBox(width: 6),
                    Text(
                      'LIVE LOCATION',
                      style: TextStyle(
                        color: AppColors.primary,
                        fontSize: 10,
                        fontWeight: FontWeight.bold,
                        letterSpacing: 1,
                      ),
                    ),
                  ],
                ),
              ),
              const SizedBox(height: 12),
              Text(
                'Visit Our Store',
                style: AppStyles.headingSub.copyWith(fontSize: 24),
              ),
              const SizedBox(height: 16),
              // Shop info row
              Row(
                children: [
                  const Icon(Icons.location_pin, color: AppColors.primary),
                  const SizedBox(width: 10),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        shop.name,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      if (distanceText != null)
                        Text(
                          '${shop.city.toUpperCase()} · $distanceText',
                          style: TextStyle(
                            color: Colors.grey[600],
                            fontSize: 11,
                            fontWeight: FontWeight.w600,
                            letterSpacing: 0.5,
                          ),
                        ),
                    ],
                  ),
                ],
              ),
              const SizedBox(height: 16),
              // Map Preview Card
              GestureDetector(
                onTap: () => Navigator.push(
                  context,
                  MaterialPageRoute(builder: (_) => const MapScreen()),
                ),
                child: Container(
                  height: 130,
                  decoration: BoxDecoration(
                    borderRadius: BorderRadius.circular(12),
                    color: Colors.blueGrey[100],
                  ),
                  clipBehavior: Clip.antiAlias,
                  child: Stack(
                    fit: StackFit.expand,
                    children: [
                      // World-map looking background
                      Image.network(
                        'https://upload.wikimedia.org/wikipedia/commons/thumb/8/80/World_map_-_low_resolution.svg/1200px-World_map_-_low_resolution.svg.png',
                        fit: BoxFit.cover,
                        color: Colors.blueGrey[200],
                        colorBlendMode: BlendMode.multiply,
                        errorBuilder: (ctx, e, st) => Container(
                          color: Colors.blueGrey[100],
                          child: const Icon(
                            Icons.map_outlined,
                            size: 48,
                            color: Colors.white,
                          ),
                        ),
                      ),
                      // "Open Interactive Map" pill in center
                      Center(
                        child: Container(
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 10,
                          ),
                          decoration: BoxDecoration(
                            color: Colors.white,
                            borderRadius: BorderRadius.circular(24),
                            boxShadow: [
                              BoxShadow(
                                color: Colors.black.withOpacity(0.15),
                                blurRadius: 8,
                              ),
                            ],
                          ),
                          child: Row(
                            mainAxisSize: MainAxisSize.min,
                            children: [
                              const Icon(
                                Icons.map_outlined,
                                color: AppColors.primary,
                                size: 18,
                              ),
                              const SizedBox(width: 8),
                              Text(
                                'Open Interactive Map',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  fontSize: 13,
                                ),
                              ),
                            ],
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),
              const SizedBox(height: 16),
              // Direction button
              SizedBox(
                width: double.infinity,
                child: ElevatedButton.icon(
                  onPressed: _openDirections,
                  icon: const Icon(Icons.navigation_outlined, size: 18),
                  label: const Text(
                    'Direction',
                    style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                  ),
                  style: ElevatedButton.styleFrom(
                    backgroundColor: AppColors.primary,
                    foregroundColor: Colors.white,
                    padding: const EdgeInsets.symmetric(vertical: 14),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(30),
                    ),
                    elevation: 0,
                  ),
                ),
              ),
            ],
          ),
        ),
        const SizedBox(height: 24),
        // Description
        if (shop.description != null) ...[
          Text('About', style: AppStyles.headingSub.copyWith(fontSize: 18)),
          const SizedBox(height: 8),
          Text(
            shop.description!,
            style: AppStyles.bodySmall.copyWith(
              fontSize: 14,
              height: 1.6,
              color: Colors.grey[700],
            ),
          ),
          const SizedBox(height: 24),
        ],
        // Details row
        _buildDetailRow(Icons.location_city_outlined, shop.city),
        if (shop.offers != null)
          _buildDetailRow(Icons.local_offer_outlined, shop.offers!),
      ],
    );
  }

  Widget _buildDetailRow(IconData icon, String text) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Icon(icon, size: 20, color: AppColors.primary),
          const SizedBox(width: 10),
          Expanded(
            child: Text(
              text,
              style: AppStyles.bodySmall.copyWith(fontSize: 14),
            ),
          ),
        ],
      ),
    );
  }

  // ── Reviews Tab ────────────────────────────────────────────────────────────
  Widget _buildReviewsTab() {
    return SingleChildScrollView(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Write a review card
          Container(
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: Colors.grey[200]!),
              boxShadow: [
                BoxShadow(
                  color: Colors.black.withOpacity(0.04),
                  blurRadius: 10,
                  offset: const Offset(0, 2),
                ),
              ],
            ),
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Write a Review',
                  style: AppStyles.headingSub.copyWith(fontSize: 16),
                ),
                const SizedBox(height: 12),
                // Star selector
                Row(
                  children: List.generate(5, (index) {
                    final star = index + 1;
                    return GestureDetector(
                      onTap: () => setState(() => _reviewRating = star),
                      child: Padding(
                        padding: const EdgeInsets.only(right: 4),
                        child: Icon(
                          star <= _reviewRating
                              ? Icons.star_rounded
                              : Icons.star_outline_rounded,
                          color: const Color(0xFFFFC107),
                          size: 30,
                        ),
                      ),
                    );
                  }),
                ),
                const SizedBox(height: 4),
                Text(
                  '$_reviewRating/5',
                  style: AppStyles.bodySmall.copyWith(
                    color: Colors.grey[500],
                    fontSize: 13,
                  ),
                ),
                const SizedBox(height: 12),
                Container(
                  decoration: BoxDecoration(
                    color: Colors.grey[50],
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey[200]!),
                  ),
                  child: TextField(
                    controller: _reviewController,
                    maxLines: 4,
                    decoration: InputDecoration(
                      hintText: 'Share your experience...',
                      hintStyle: TextStyle(
                        color: Colors.grey[400],
                        fontSize: 14,
                      ),
                      border: InputBorder.none,
                      contentPadding: const EdgeInsets.all(14),
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Align(
                  alignment: Alignment.centerRight,
                  child: ElevatedButton(
                    onPressed: () async {
                      if (_reviewController.text.trim().isEmpty) return;
                      final success = await context.read<ReviewProvider>().postReview(
                            shopId: widget.shop.id!,
                            rating: _reviewRating.toDouble(),
                            text: _reviewController.text.trim(),
                          );
                      if (success) {
                        if (mounted) {
                          ScaffoldMessenger.of(context).showSnackBar(
                            const SnackBar(content: Text('Review submitted!')),
                          );
                          _reviewController.clear();
                          setState(() => _reviewRating = 5);
                          _fetchShopStats(); // Refresh stats to update average rating
                        }
                      }
                    },
                    style: ElevatedButton.styleFrom(
                      backgroundColor: AppColors.primary,
                      foregroundColor: Colors.white,
                      padding: const EdgeInsets.symmetric(
                        horizontal: 24,
                        vertical: 12,
                      ),
                      shape: RoundedRectangleBorder(
                        borderRadius: BorderRadius.circular(20),
                      ),
                    ),
                    child: const Text(
                      'Post Review',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 20),
          Text(
            'Recent Reviews',
            style: AppStyles.headingSub.copyWith(fontSize: 16),
          ),
          const SizedBox(height: 12),
          Consumer<ReviewProvider>(
            builder: (ctx, rp, _) {
              final reviews = rp.getReviewsForShop(widget.shop.id!);
              if (rp.isLoading && reviews.isEmpty) {
                return const Center(child: CircularProgressIndicator());
              }
              if (reviews.isEmpty) {
                return const Padding(
                  padding: EdgeInsets.only(top: 20),
                  child: Center(child: Text('No reviews yet. Be the first!')),
                );
              }
              return Column(
                children: reviews.map((r) => _buildReviewCard(r)).toList(),
              );
            },
          ),
        ],
      ),
    );
  }

  Widget _buildReviewCard(Review review) {
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(12),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              CircleAvatar(
                radius: 18,
                backgroundColor: AppColors.primary.withAlpha(38),
                child: Text(
                  review.user.name[0],
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    color: AppColors.primary,
                  ),
                ),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      review.user.name,
                      style: const TextStyle(fontWeight: FontWeight.bold),
                    ),
                    Wrap(
                      children: [
                        ...List.generate(
                          review.rating.toInt(),
                          (_) => const Icon(
                            Icons.star_rounded,
                            color: Color(0xFFFFC107),
                            size: 14,
                          ),
                        ),
                        ...List.generate(
                          5 - review.rating.toInt(),
                          (_) => const Icon(
                            Icons.star_outline_rounded,
                            color: Color(0xFFFFC107),
                            size: 14,
                          ),
                        ),
                      ],
                    ),
                  ],
                ),
              ),
              Text(
                '${review.createdAt.day}/${review.createdAt.month}/${review.createdAt.year}',
                style: TextStyle(color: Colors.grey[400], fontSize: 12),
              ),
            ],
          ),
          const SizedBox(height: 8),
          Text(review.text, style: TextStyle(color: Colors.grey[700], fontSize: 13)),
        ],
      ),
    );
  }

  // ── Product Item ───────────────────────────────────────────────────────────
  Widget _buildProductItem(Product product) {
    return Card(
      margin: const EdgeInsets.only(bottom: 12),
      elevation: 0,
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(12),
        side: BorderSide(color: Colors.grey[200]!),
      ),
      child: Padding(
        padding: const EdgeInsets.all(10),
        child: Row(
          children: [
            // Product image
            ClipRRect(
              borderRadius: BorderRadius.circular(8),
              child: product.imageUrl != null
                  ? Image.network(
                      product.imageUrl!,
                      width: 70,
                      height: 70,
                      fit: BoxFit.cover,
                      errorBuilder: (ctx, e, st) => _buildProductPlaceholder(),
                    )
                  : _buildProductPlaceholder(),
            ),
            const SizedBox(width: 12),
            Expanded(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    product.name,
                    style: const TextStyle(fontWeight: FontWeight.bold),
                  ),
                  if (product.description != null)
                    Text(
                      product.description!,
                      maxLines: 1,
                      overflow: TextOverflow.ellipsis,
                      style: TextStyle(color: Colors.grey[500], fontSize: 12),
                    ),
                  const SizedBox(height: 4),
                  Text(
                    '₹${product.price} ${product.unit != null ? 'per ${product.unit}' : ''}',
                    style: const TextStyle(
                      color: Colors.green,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ],
              ),
            ),
            Consumer<BookmarkProvider>(
              builder: (ctx, bm, _) => IconButton(
                onPressed: () => bm.toggleWishlist(product.id!),
                icon: Icon(
                  bm.isWishlisted(product.id!)
                      ? Icons.favorite
                      : Icons.favorite_border,
                  color: bm.isWishlisted(product.id!)
                      ? Colors.redAccent
                      : Colors.grey,
                  size: 22,
                ),
              ),
            ),
            ElevatedButton(
              onPressed: product.isAvailable ? () {} : null,
              style: ElevatedButton.styleFrom(
                backgroundColor: product.isAvailable
                    ? AppColors.primary
                    : Colors.grey[300],
                foregroundColor: Colors.white,
                minimumSize: const Size(56, 36),
                padding: const EdgeInsets.symmetric(horizontal: 14),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(8),
                ),
                elevation: 0,
              ),
              child: Text(
                product.isAvailable ? 'ADD' : 'OUT',
                style: const TextStyle(
                  fontSize: 12,
                  fontWeight: FontWeight.bold,
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }

  Widget _buildPlaceholderImage() {
    return Container(
      decoration: const BoxDecoration(
        gradient: LinearGradient(
          colors: [AppColors.primary, AppColors.secondary],
        ),
      ),
      child: const Center(
        child: Icon(Icons.store, size: 80, color: Colors.white),
      ),
    );
  }

  Widget _buildProductPlaceholder() {
    return Container(
      width: 70,
      height: 70,
      decoration: BoxDecoration(
        color: Colors.grey[100],
        borderRadius: BorderRadius.circular(8),
      ),
      child: const Icon(Icons.shopping_bag_outlined, color: Colors.grey),
    );
  }
}
