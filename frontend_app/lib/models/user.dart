enum Role { USER, ADMIN, SHOPKEEPER }

class User {
  final int? id;
  final String name;
  final String email;
  final Role role;
  final String? phone;
  final String? profilePhotoUrl;

  User({
    this.id,
    required this.name,
    required this.email,
    required this.role,
    this.phone,
    this.profilePhotoUrl,
  });

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      id: json['id'],
      name: json['name'] ?? '',
      email: json['email'] ?? '',
      role: Role.values.firstWhere(
        (e) => e.name == json['role'],
        orElse: () => Role.USER,
      ),
      phone: json['phone'],
      profilePhotoUrl: json['profilePhotoUrl'],
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'email': email,
      'role': role.name,
      'phone': phone,
      'profilePhotoUrl': profilePhotoUrl,
    };
  }
}
