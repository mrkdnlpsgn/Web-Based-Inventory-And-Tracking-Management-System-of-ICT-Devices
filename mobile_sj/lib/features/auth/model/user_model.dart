class UserModel {
  final String username;
  final String role; // ADMIN | STAFF

  const UserModel({required this.username, required this.role});

  // /api/auth/me returns { username, authorities: [{ authority: "ROLE_ADMIN" }] }
  factory UserModel.fromJson(Map<String, dynamic> json) {
    final authorities = (json['authorities'] as List?) ?? [];
    final rawRole = authorities.isNotEmpty
        ? (authorities.first['authority'] as String)
        : 'ROLE_STAFF';
    return UserModel(
      username: json['username'] as String,
      role: rawRole.replaceFirst('ROLE_', ''),
    );
  }

  bool get isAdmin => role == 'ADMIN';
}
