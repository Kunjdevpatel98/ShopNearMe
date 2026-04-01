import 'package:flutter/material.dart';
import '../models/review.dart';
import '../services/api_service.dart';

class ReviewProvider extends ChangeNotifier {
  final ApiService _apiService = ApiService();
  final Map<int, List<Review>> _shopReviews = {};
  bool _isLoading = false;

  bool get isLoading => _isLoading;

  List<Review> getReviewsForShop(int shopId) => _shopReviews[shopId] ?? [];

  Future<void> fetchReviews(int shopId) async {
    _isLoading = true;
    notifyListeners();

    try {
      final response = await _apiService.dio.get('/reviews/shop/$shopId');
      if (response.statusCode == 200) {
        final List<Review> reviews = (response.data as List)
            .map((json) => Review.fromJson(json))
            .toList();
        _shopReviews[shopId] = reviews;
      }
    } catch (e) {
      print('Error fetching reviews: $e');
    } finally {
      _isLoading = false;
      notifyListeners();
    }
  }

  Future<bool> postReview({
    required int shopId,
    required double rating,
    required String text,
  }) async {
    try {
      final response = await _apiService.dio.post(
        '/reviews',
        data: {
          'shopId': shopId,
          'rating': rating,
          'text': text,
        },
      );

      if (response.statusCode == 200) {
        // Refresh reviews for this shop
        await fetchReviews(shopId);
        return true;
      }
    } catch (e) {
      print('Error posting review: $e');
    }
    return false;
  }
}
