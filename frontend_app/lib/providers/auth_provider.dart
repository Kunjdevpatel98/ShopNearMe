import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';
import '../models/user.dart';
import '../services/api_service.dart';
import '../utils/constants.dart';

class AuthProvider with ChangeNotifier {
  final ApiService _apiService = ApiService();
  final _storage = const FlutterSecureStorage();

  User? _user;
  String? _token;
  bool _isLoading = false;

  User? get user => _user;
  String? get token => _token;
  bool get isLoading => _isLoading;
  bool get isAuthenticated => _token != null;

  AuthProvider() {
    _loadAuthData();
  }

  Future<void> _loadAuthData() async {
    _token = await _storage.read(key: AppConstants.tokenKey);
    final userJson = await _storage.read(key: AppConstants.userKey);
    if (userJson != null) {
      _user = User.fromJson(jsonDecode(userJson));
    }
    notifyListeners();
  }

  Future<bool> login(String email, String password) async {
    _setLoading(true);
    try {
      final response = await _apiService.dio.post(
        '/auth/login',
        data: {'email': email, 'password': password},
      );

      if (response.statusCode == 200) {
        _token = response.data['token'];
        _user = User.fromJson(response.data['user']);

        await _storage.write(key: AppConstants.tokenKey, value: _token);
        await _storage.write(
          key: AppConstants.userKey,
          value: jsonEncode(_user!.toJson()),
        );

        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      print('Login error: $e');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> register(User user, String password) async {
    _setLoading(true);
    try {
      final userData = user.toJson();
      userData['password'] = password;

      final response = await _apiService.dio.post(
        '/auth/register',
        data: userData,
      );
      return response.statusCode == 200;
    } catch (e) {
      print('Registration error: $e');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<bool> updateProfile(User updatedUser) async {
    _setLoading(true);
    try {
      final response = await _apiService.dio.put(
        '/users/profile',
        data: updatedUser.toJson(),
      );

      if (response.statusCode == 200) {
        _user = User.fromJson(response.data);
        await _storage.write(
          key: AppConstants.userKey,
          value: jsonEncode(_user!.toJson()),
        );
        notifyListeners();
        return true;
      }
      return false;
    } catch (e) {
      print('Update profile error: $e');
      return false;
    } finally {
      _setLoading(false);
    }
  }

  Future<String?> changePassword(String currentPassword, String newPassword) async {
    _setLoading(true);
    try {
      final response = await _apiService.dio.put(
        '/users/password',
        data: {
          'currentPassword': currentPassword,
          'newPassword': newPassword,
        },
      );

      if (response.statusCode == 200) {
        return null; // Success
      }
      return "Failed to update password";
    } catch (e) {
      print('Change password error: $e');
      return e.toString();
    } finally {
      _setLoading(false);
    }
  }

  Future<void> logout() async {
    _token = null;
    _user = null;
    await _storage.deleteAll();
    notifyListeners();
  }

  void _setLoading(bool value) {
    _isLoading = value;
    notifyListeners();
  }
}
