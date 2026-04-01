import 'user.dart';
import 'category.dart';

enum CommunicationMode { WHATSAPP, CALL, BOTH }

class Shop {
  final int? id;
  final String name;
  final String? description;
  final String address;
  final String city;
  final double latitude;
  final double longitude;
  final String? phone;
  final bool isOpen;
  final bool manualOpen;
  final Category category;
  final User? owner;
  final String? imageUrl;
  final String? openingTime;
  final String? closingTime;
  final bool isClosedOnSunday;
  final String? offers;
  final String? services;
  final String? tags;
  final CommunicationMode communicationMode;
  double? distance;

  Shop({
    this.id,
    required this.name,
    this.description,
    required this.address,
    required this.city,
    required this.latitude,
    required this.longitude,
    this.phone,
    required this.isOpen,
    required this.manualOpen,
    required this.category,
    this.owner,
    this.imageUrl,
    this.openingTime,
    this.closingTime,
    this.isClosedOnSunday = false,
    this.offers,
    this.services,
    this.tags,
    this.communicationMode = CommunicationMode.BOTH,
  });

  Shop copyWith({
    int? id,
    String? name,
    String? description,
    String? address,
    String? city,
    double? latitude,
    double? longitude,
    String? phone,
    bool? isOpen,
    bool? manualOpen,
    Category? category,
    User? owner,
    String? imageUrl,
    String? openingTime,
    String? closingTime,
    bool? isClosedOnSunday,
    String? offers,
    String? services,
    String? tags,
    CommunicationMode? communicationMode,
    double? distance,
  }) {
    return Shop(
      id: id ?? this.id,
      name: name ?? this.name,
      description: description ?? this.description,
      address: address ?? this.address,
      city: city ?? this.city,
      latitude: latitude ?? this.latitude,
      longitude: longitude ?? this.longitude,
      phone: phone ?? this.phone,
      isOpen: isOpen ?? this.isOpen,
      manualOpen: manualOpen ?? this.manualOpen,
      category: category ?? this.category,
      owner: owner ?? this.owner,
      imageUrl: imageUrl ?? this.imageUrl,
      openingTime: openingTime ?? this.openingTime,
      closingTime: closingTime ?? this.closingTime,
      isClosedOnSunday: isClosedOnSunday ?? this.isClosedOnSunday,
      offers: offers ?? this.offers,
      services: services ?? this.services,
      tags: tags ?? this.tags,
      communicationMode: communicationMode ?? this.communicationMode,
    )..distance = distance ?? this.distance;
  }

  factory Shop.fromJson(Map<String, dynamic> json) {
    return Shop(
      id: json['id'],
      name: json['name'] ?? '',
      description: json['description'],
      address: json['address'] ?? '',
      city: json['city'] ?? '',
      latitude: (json['latitude'] ?? 0.0).toDouble(),
      longitude: (json['longitude'] ?? 0.0).toDouble(),
      phone: json['phone'],
      isOpen: json['open'] ?? false,
      manualOpen: json['manualOpen'] ?? json['open'] ?? false,
      category: Category.fromJson(json['category'] ?? {}),
      owner: json['owner'] != null ? User.fromJson(json['owner']) : null,
      imageUrl: json['imageUrl'],
      openingTime: json['openingTime'],
      closingTime: json['closingTime'],
      isClosedOnSunday: json['isClosedOnSunday'] ?? false,
      offers: json['offers'],
      services: json['services'],
      tags: json['tags'],
      communicationMode: CommunicationMode.values.firstWhere(
        (e) => e.name == json['communicationMode'],
        orElse: () => CommunicationMode.BOTH,
      ),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'description': description,
      'address': address,
      'city': city,
      'latitude': latitude,
      'longitude': longitude,
      'phone': phone,
      'open': isOpen,
      'manualOpen': manualOpen,
      'category': category.toJson(),
      'owner': owner?.toJson(),
      'imageUrl': imageUrl,
      'openingTime': openingTime,
      'closingTime': closingTime,
      'isClosedOnSunday': isClosedOnSunday,
      'offers': offers,
      'services': services,
      'tags': tags,
      'communicationMode': communicationMode.name,
    };
  }
}
