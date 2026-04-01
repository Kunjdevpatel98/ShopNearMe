import 'package:flutter/material.dart';
import '../models/shop.dart';
import '../models/product.dart';
import '../services/api_service.dart';

class BookmarkProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  List<Shop> _bookmarkedShops = [];
  List<int> _wishlistProductIds = []; // We only need IDs to check status
  List<Product> _wishlistProducts = []; // Full details for the wishlist screen

  List<Shop> get bookmarkedShops => List.unmodifiable(_bookmarkedShops);
  List<int> get wishlistProductIds => _wishlistProductIds;
  List<Product> get wishlistProducts => List.unmodifiable(_wishlistProducts);

  bool isBookmarked(Shop shop) => _bookmarkedShops.any((s) => s.id == shop.id);
  bool isWishlisted(int productId) => _wishlistProductIds.contains(productId);

  Future<void> fetchBookmarks() async {
    try {
      final response = await _apiService.dio.get('/bookmarks');
      if (response.statusCode == 200) {
        _bookmarkedShops = (response.data as List)
            .map((json) => Shop.fromJson(json))
            .toList();
        notifyListeners();
      }
    } catch (e) {
      print('Error fetching bookmarks: $e');
    }
  }

  Future<void> fetchWishlistIds() async {
    try {
      final response = await _apiService.dio.get('/wishlist/ids');
      if (response.statusCode == 200) {
        _wishlistProductIds = List<int>.from(response.data);
        notifyListeners();
      }
    } catch (e) {
      print('Error fetching wishlist IDs: $e');
    }
  }

  Future<void> fetchWishlistProducts() async {
    try {
      final response = await _apiService.dio.get('/wishlist');
      if (response.statusCode == 200) {
        _wishlistProducts = (response.data as List)
            .map((json) => Product.fromJson(json))
            .toList();
        notifyListeners();
      }
    } catch (e) {
      print('Error fetching wishlist products: $e');
    }
  }

  Future<void> toggleBookmark(Shop shop) async {
    if (shop.id == null) return;
    try {
      final response = await _apiService.dio.post('/bookmarks/${shop.id}');
      if (response.statusCode == 200) {
        final bool isNowBookmarked = response.data['bookmarked'];
        if (isNowBookmarked) {
          if (!isBookmarked(shop)) _bookmarkedShops.add(shop);
        } else {
          _bookmarkedShops.removeWhere((s) => s.id == shop.id);
        }
        notifyListeners();
      }
    } catch (e) {
      print('Error toggling bookmark: $e');
    }
  }

  Future<void> toggleWishlist(int productId) async {
    try {
      final response = await _apiService.dio.post('/wishlist/$productId');
      if (response.statusCode == 200) {
        final bool isNowLiked = response.data['liked'];
        if (isNowLiked) {
          if (!_wishlistProductIds.contains(productId)) {
            _wishlistProductIds.add(productId);
          }
        } else {
          _wishlistProductIds.remove(productId);
          _wishlistProducts.removeWhere((p) => p.id == productId);
        }
        notifyListeners();
      }
    } catch (e) {
      print('Error toggling wishlist: $e');
    }
  }

  Future<void> removeBookmark(Shop shop) async {
    // We can just reuse toggleBookmark if it already handles removal
    // but we might want a direct delete if the API supports it.
    // Given the toggle logic, calling it will remove it if it exists.
    if (isBookmarked(shop)) {
      await toggleBookmark(shop);
    }
  }

  Future<void> removeWishlist(int productId) async {
    if (isWishlisted(productId)) {
      await toggleWishlist(productId);
    }
  }
}
