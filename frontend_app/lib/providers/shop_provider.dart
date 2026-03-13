import 'package:flutter/foundation.dart' hide Category;
import '../models/shop.dart';
import '../models/category.dart';
import '../models/product.dart';
import '../services/api_service.dart';
import '../services/location_service.dart';
import 'package:geolocator/geolocator.dart';

class ShopProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();

  List<Shop> _shops = [];
  List<Shop> _myShops = [];
  List<Category> _categories = [];
  bool _isLoading = false;
  String? _error;
  String? _locationError;
  Position? _userPosition;
  String? _userAddress;
  double? _maxDistanceFilter; // in meters

  List<Shop> get shops {
    if (_maxDistanceFilter == null) return _shops;
    return _shops.where((shop) {
      if (shop.distance == null) return true;
      return shop.distance! <= _maxDistanceFilter!;
    }).toList();
  }

  List<Shop> get myShops => _myShops;
  List<Category> get categories => _categories;
  bool get isLoading => _isLoading;
  String? get error => _error;
  String? get locationError => _locationError;
  Position? get userPosition => _userPosition;
  String? get userAddress => _userAddress;
  double? get maxDistanceFilter => _maxDistanceFilter;

  void setMaxDistanceFilter(double? distance) {
    _maxDistanceFilter = distance;
    notifyListeners();
  }

  Future<void> fetchCategories() async {
    try {
      final response = await _apiService.dio.get('/categories');
      if (response.statusCode == 200) {
        _categories = (response.data as List)
            .map((json) => Category.fromJson(json))
            .toList();
        notifyListeners();
      }
    } catch (e) {
      print('Error fetching categories: $e');
    }
  }

  Future<void> fetchShops({int? categoryId, String? search}) async {
    _setLoading(true);
    _error = null;
    try {
      final Map<String, dynamic> params = {};
      if (categoryId != null) params['categoryId'] = categoryId;
      if (search != null) params['search'] = search;

      final response = await _apiService.dio.get(
        '/shops',
        queryParameters: params,
      );
      if (response.statusCode == 200) {
        _shops = (response.data as List)
            .map((json) => Shop.fromJson(json))
            .toList();

        await _calculateDistances();
      }
    } catch (e) {
      _error = 'Failed to load shops';
      print('Error fetching shops: $e');
    } finally {
      _setLoading(false);
    }
  }

  Future<void> fetchMyShops() async {
    _setLoading(true);
    try {
      final response = await _apiService.dio.get('/shops/my-shops');
      if (response.statusCode == 200) {
        _myShops = (response.data as List)
            .map((json) => Shop.fromJson(json))
            .toList();
        notifyListeners();
      }
    } catch (e) {
      print('Error fetching my shops: $e');
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> updateShopStatus(int shopId, bool isOpen) async {
    try {
      final response = await _apiService.dio.put(
        '/shops/$shopId/status',
        data: {'isOpen': isOpen},
      );
      if (response.statusCode == 200) {
        // Update local state
        final index = _myShops.indexWhere((s) => s.id == shopId);
        if (index != -1) {
          _myShops[index] = _myShops[index].copyWith(isOpen: isOpen);
          notifyListeners();
        }
        return true;
      }
    } catch (e) {
      print('Error updating shop status: $e');
    }
    return false;
  }

  Future<bool> updateShop(int shopId, Map<String, dynamic> shopData) async {
    try {
      final response = await _apiService.dio.put(
        '/shops/$shopId',
        data: shopData,
      );
      if (response.statusCode == 200) {
        fetchMyShops(); // Refresh list
        return true;
      }
    } catch (e) {
      print('Error updating shop: $e');
    }
    return false;
  }

  Future<List<Product>> fetchProductsForShop(int shopId) async {
    try {
      final response = await _apiService.dio.get('/products/shop/$shopId');
      if (response.statusCode == 200) {
        return (response.data as List)
            .map((json) => Product.fromJson(json))
            .toList();
      }
    } catch (e) {
      print('Error fetching products: $e');
    }
    return [];
  }

  Future<bool> addProduct(int shopId, Map<String, dynamic> productData) async {
    try {
      final response = await _apiService.dio.post(
        '/products/shop/$shopId',
        data: productData,
      );
      return response.statusCode == 200;
    } catch (e) {
      print('Error adding product: $e');
      return false;
    }
  }

  Future<bool> toggleProductAvailability(int productId, bool isAvailable) async {
    try {
      final response = await _apiService.dio.put(
        '/products/$productId/availability',
        data: {'isAvailable': isAvailable},
      );
      return response.statusCode == 200;
    } catch (e) {
      print('Error toggling product availability: $e');
      return false;
    }
  }

  Future<bool> updateProduct(int productId, Map<String, dynamic> productData) async {
    try {
      final response = await _apiService.dio.put(
        '/products/$productId',
        data: productData,
      );
      return response.statusCode == 200;
    } catch (e) {
      print('Error updating product: $e');
      return false;
    }
  }

  Future<bool> deleteProduct(int productId) async {
    try {
      final response = await _apiService.dio.delete('/products/$productId');
      return response.statusCode == 200;
    } catch (e) {
      print('Error deleting product: $e');
      return false;
    }
  }

  Future<void> _calculateDistances() async {
    _locationError = null;
    try {
      _userPosition = await LocationService.getCurrentLocation();
      if (_userPosition != null) {
        // Fetch human readable address
        _userAddress = await LocationService.getAddressFromLatLng(
          _userPosition!.latitude,
          _userPosition!.longitude,
        );

        for (var shop in _shops) {
          shop.distance = LocationService.calculateDistance(
            _userPosition!.latitude,
            _userPosition!.longitude,
            shop.latitude,
            shop.longitude,
          );
        }
        // Sort shops by distance
        _shops.sort((a, b) {
          if (a.distance == null) return 1;
          if (b.distance == null) return -1;
          return a.distance!.compareTo(b.distance!);
        });
      } else {
        _locationError =
            "Could not determine your location. Please check GPS and permissions.";
      }
    } catch (e) {
      _locationError = "Location service error. Please try again.";
      print('Error in _calculateDistances: $e');
    }
    notifyListeners();
  }

  Future<bool> addShop(Map<String, dynamic> shopData) async {
    try {
      final response = await _apiService.dio.post(
        '/shops',
        data: shopData,
      );
      if (response.statusCode == 200) {
        await fetchMyShops(); // Refresh list
        return true;
      }
    } catch (e) {
      print('Error adding shop: $e');
    }
    return false;
  }

  Future<Map<String, dynamic>> fetchShopStats(int shopId) async {
    try {
      final response = await _apiService.dio.get('/orders/shop/$shopId/stats');
      if (response.statusCode == 200) {
        return response.data;
      }
    } catch (e) {
      print('Error fetching shop stats: $e');
    }
    return {};
  }

  Future<List<dynamic>> fetchShopOrders(int shopId) async {
    try {
      final response = await _apiService.dio.get('/orders/shop/$shopId');
      if (response.statusCode == 200) {
        return response.data as List;
      }
    } catch (e) {
      print('Error fetching shop orders: $e');
    }
    return [];
  }

  Future<bool> simulateOrderData(int shopId) async {
    try {
      final response = await _apiService.dio.post('/orders/$shopId/simulate');
      return response.statusCode == 200;
    } catch (e) {
      print('Error simulating order data: $e');
      return false;
    }
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }
}
