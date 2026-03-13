import 'shop.dart';

class Product {
  final int? id;
  final String name;
  final String? description;
  final double price;
  final double? originalPrice;
  final String? unit;
  final String? imageUrl;
  final bool isAvailable;
  final int? shopId;

  Product({
    this.id,
    required this.name,
    this.description,
    required this.price,
    this.originalPrice,
    this.unit,
    this.imageUrl,
    this.isAvailable = true,
    this.shopId,
  });

  Product copyWith({
    int? id,
    String? name,
    String? description,
    double? price,
    double? originalPrice,
    String? unit,
    String? imageUrl,
    bool? isAvailable,
    int? shopId,
  }) {
    return Product(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      price: price ?? this.price,
      originalPrice: originalPrice ?? this.originalPrice,
      unit: unit ?? this.unit,
      imageUrl: imageUrl ?? this.imageUrl,
      isAvailable: isAvailable ?? this.isAvailable,
      shopId: shopId ?? this.shopId,
    );
  }

  factory Product.fromJson(Map<String, dynamic> json) {
    return Product(
      id: json['id'],
      name: json['name'] ?? '',
      description: json['description'],
      price: (json['price'] ?? 0.0).toDouble(),
      originalPrice: json['originalPrice'] != null
          ? (json['originalPrice']).toDouble()
          : null,
      unit: json['unit'],
      imageUrl: json['imageUrl'],
      isAvailable: json['isAvailable'] ?? true,
      shopId: json['shopId'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'price': price,
      'originalPrice': originalPrice,
      'unit': unit,
      'imageUrl': imageUrl,
      'isAvailable': isAvailable,
      'shopId': shopId,
    };
  }
}
