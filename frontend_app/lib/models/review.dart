import 'user.dart';

class Review {
  final int? id;
  final User user;
  final double rating;
  final String text;
  final DateTime createdAt;

  Review({
    this.id,
    required this.user,
    required this.rating,
    required this.text,
    required this.createdAt,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['id'],
      user: User.fromJson(json['user']),
      rating: (json['rating'] ?? 0.0).toDouble(),
      text: json['text'] ?? '',
      createdAt: json['createdAt'] != null 
          ? DateTime.parse(json['createdAt']) 
          : DateTime.now(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'user': user.toJson(),
      'rating': rating,
      'text': text,
      'createdAt': createdAt.toIso8601String(),
    };
  }
}
