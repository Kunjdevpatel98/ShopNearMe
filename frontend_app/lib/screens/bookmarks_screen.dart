import 'package:flutter/material.dart';
import 'package:provider/provider.dart';
import '../providers/bookmark_provider.dart';
import '../models/shop.dart';
import '../models/product.dart';
import '../utils/style_constants.dart';
import 'shop_detail_screen.dart';

class BookmarksScreen extends StatefulWidget {
  const BookmarksScreen({super.key});

  @override
  State<BookmarksScreen> createState() => _BookmarksScreenState();
}

class _BookmarksScreenState extends State<BookmarksScreen> {
  @override
  void initState() {
    super.initState();
    Future.microtask(() {
      final provider = context.read<BookmarkProvider>();
      provider.fetchBookmarks();
      provider.fetchWishlistProducts();
    });
  }

  @override
  Widget build(BuildContext context) {
    final bookmarkProvider = context.watch<BookmarkProvider>();
    final bookmarks = bookmarkProvider.bookmarkedShops;
    final wishlist = bookmarkProvider.wishlistProducts;

    return Scaffold(
      backgroundColor: AppColors.background,
      appBar: AppBar(
        title: const Text('Saved Shops & Items',
            style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
        backgroundColor: Colors.white,
        elevation: 0,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 12),
            // ── My Bookmarks ────────────────────────────────────────────
            _buildSectionHeader(
              Icons.bookmark,
              'My Bookmarks',
              Colors.redAccent,
            ),
            const SizedBox(height: 16),
            if (bookmarks.isEmpty)
              _buildEmptyState(
                Icons.bookmark_border,
                'No bookmarks yet.\nSave your favourite shops!',
              )
            else
              ...bookmarks.map(
                (shop) => _buildBookmarkCard(context, shop, bookmarkProvider),
              ),
            const SizedBox(height: 32),
            // ── My Wishlist ─────────────────────────────────────────────
            _buildSectionHeader(
              Icons.favorite,
              'My Wishlist',
              Colors.pinkAccent,
            ),
            const SizedBox(height: 16),
            if (wishlist.isEmpty)
              _buildEmptyState(
                Icons.favorite_border,
                'No wishlisted items yet.\nTap the ♡ on a product!',
              )
            else
              _buildWishlistGrid(wishlist),
          ],
        ),
      ),
    );
  }

  Widget _buildSectionHeader(IconData icon, String title, Color color) {
    return Row(
      children: [
        Icon(icon, color: color, size: 22),
        const SizedBox(width: 8),
        Text(title, style: AppStyles.headingSub.copyWith(fontSize: 18)),
      ],
    );
  }

  Widget _buildEmptyState(IconData icon, String message) {
    return Container(
      width: double.infinity,
      padding: const EdgeInsets.symmetric(vertical: 32),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        children: [
          Icon(icon, size: 48, color: Colors.grey[300]),
          const SizedBox(height: 12),
          Text(
            message,
            textAlign: TextAlign.center,
            style: TextStyle(color: Colors.grey[400], fontSize: 13),
          ),
        ],
      ),
    );
  }

  Widget _buildBookmarkCard(
    BuildContext context,
    Shop shop,
    BookmarkProvider provider,
  ) {
    return Container(
      margin: const EdgeInsets.only(bottom: 14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey[200]!),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Shop image
          GestureDetector(
            onTap: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => ShopDetailScreen(shop: shop)),
            ),
            child: ClipRRect(
              borderRadius: const BorderRadius.vertical(
                top: Radius.circular(16),
              ),
              child: Stack(
                children: [
                  if (shop.imageUrl != null)
                    Image.network(
                      shop.imageUrl!,
                      height: 140,
                      width: double.infinity,
                      fit: BoxFit.cover,
                      errorBuilder: (ctx, e, st) => Container(
                        height: 140,
                        color: Colors.grey[100],
                        child: const Icon(
                          Icons.store,
                          size: 48,
                          color: Colors.grey,
                        ),
                      ),
                    )
                  else
                    Container(
                      height: 140,
                      color: Colors.grey[100],
                      child: const Icon(
                        Icons.store,
                        size: 48,
                        color: Colors.grey,
                      ),
                    ),
                  Positioned(
                    top: 10,
                    right: 10,
                    child: Container(
                      padding: const EdgeInsets.symmetric(
                        horizontal: 8,
                        vertical: 4,
                      ),
                      decoration: BoxDecoration(
                        color: shop.isOpen ? Colors.green : Colors.red,
                        borderRadius: BorderRadius.circular(12),
                      ),
                      child: Text(
                        shop.isOpen ? 'OPEN' : 'CLOSED',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),
          Padding(
            padding: const EdgeInsets.all(12),
            child: Row(
              children: [
                Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        shop.name,
                        style: const TextStyle(
                          fontWeight: FontWeight.bold,
                          fontSize: 16,
                        ),
                      ),
                      Text(
                        shop.city,
                        style: TextStyle(color: Colors.grey[500], fontSize: 12),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        shop.category.name,
                        style: TextStyle(color: Colors.grey[400], fontSize: 12),
                      ),
                    ],
                  ),
                ),
                // Remove bookmark button
                TextButton.icon(
                  onPressed: () => provider.removeBookmark(shop),
                  icon: const Icon(
                    Icons.delete_outline,
                    size: 16,
                    color: Colors.redAccent,
                  ),
                  label: const Text(
                    'Remove',
                    style: TextStyle(color: Colors.redAccent, fontSize: 12),
                  ),
                  style: TextButton.styleFrom(padding: EdgeInsets.zero),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildWishlistGrid(List<Product> products) {
    return GridView.builder(
      shrinkWrap: true,
      physics: const NeverScrollableScrollPhysics(),
      gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
        crossAxisCount: 2,
        childAspectRatio: 0.85,
        crossAxisSpacing: 12,
        mainAxisSpacing: 12,
      ),
      itemCount: products.length,
      itemBuilder: (context, index) {
        final product = products[index];
        return Container(
          decoration: BoxDecoration(
            color: Colors.white,
            borderRadius: BorderRadius.circular(12),
            border: Border.all(color: Colors.grey[200]!),
          ),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Expanded(
                child: ClipRRect(
                  borderRadius: const BorderRadius.vertical(
                    top: Radius.circular(12),
                  ),
                  child: product.imageUrl != null
                      ? Image.network(
                          product.imageUrl!,
                          width: double.infinity,
                          fit: BoxFit.cover,
                          errorBuilder: (ctx, e, st) => Container(
                            color: Colors.grey[100],
                            child: const Icon(
                              Icons.shopping_bag_outlined,
                              color: Colors.grey,
                            ),
                          ),
                        )
                      : Container(
                          color: Colors.grey[100],
                          child: const Icon(
                            Icons.shopping_bag_outlined,
                            color: Colors.grey,
                          ),
                        ),
                ),
              ),
              Padding(
                padding: const EdgeInsets.all(8),
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      product.name,
                      style: const TextStyle(
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                      overflow: TextOverflow.ellipsis,
                    ),
                    Text(
                      '₹${product.price}',
                      style: const TextStyle(
                        color: Colors.green,
                        fontWeight: FontWeight.bold,
                        fontSize: 13,
                      ),
                    ),
                    const SizedBox(height: 4),
                    // Explicit Remove button
                    SizedBox(
                      width: double.infinity,
                      child: TextButton.icon(
                        onPressed: () => context
                            .read<BookmarkProvider>()
                            .removeWishlist(product.id!),
                        icon: const Icon(
                          Icons.delete_outline,
                          size: 14,
                          color: Colors.redAccent,
                        ),
                        label: const Text(
                          'Remove',
                          style:
                              TextStyle(color: Colors.redAccent, fontSize: 11),
                        ),
                        style: TextButton.styleFrom(
                          padding: EdgeInsets.zero,
                          minimumSize: const Size(0, 30),
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                        ),
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
