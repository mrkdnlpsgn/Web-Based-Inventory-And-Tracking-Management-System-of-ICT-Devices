class UserModel {
  final String username;
  final String role; // ADMIN | STAFF

  const UserModel({required this.username, required this.role});

  // /api/auth/login returns { username, role: "ADMIN" }
  // /api/auth/me returns { username, authorities: [{ authority: "ROLE_ADMIN" }] }
  factory UserModel.fromJson(Map<String, dynamic> json) {
    String rawRole;
    if (json['role'] != null) {
      rawRole = json['role'] as String;
    } else {
      final authorities = (json['authorities'] as List?) ?? [];
      rawRole = authorities.isNotEmpty
          ? (authorities.first['authority'] as String)
          : 'ROLE_STAFF';
    }
    return UserModel(
      username: json['username'] as String,
      role: rawRole.replaceFirst('ROLE_', ''),
    );
  }

  bool get isAdmin => role == 'ADMIN';
}
