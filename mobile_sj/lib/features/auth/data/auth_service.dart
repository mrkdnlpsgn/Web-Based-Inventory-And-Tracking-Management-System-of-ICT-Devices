import 'package:dio/dio.dart';
import '../../../core/api/api_client.dart';
import '../../../core/api/api_exception.dart';
import '../model/user_model.dart';

class AuthService {
  final Dio _dio = ApiClient.instance.dio;

  // POST /api/auth/login — body uses "identifier" (username or email), not "email"
  Future<UserModel> login(String identifier, String password) async {
    try {
      final res = await _dio.post('/auth/login', data: {
        'identifier': identifier,
        'password': password,
      });
      // Backend returns { "user": { username, role, ... } }
      // Cookie is automatically stored by CookieManager
      return UserModel.fromJson(res.data['user'] as Map<String, dynamic>);
    } catch (e) {
      throw ApiException.from(e);
    }
  }

  // GET /api/auth/me — returns null on 401 (not logged in), throws on other errors
  Future<UserModel?> fetchCurrentUser() async {
    try {
      final res = await _dio.get('/auth/me');
      return UserModel.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      if (e.response?.statusCode == 401) return null;
      throw ApiException.from(e);
    }
  }

  Future<void> logout() async {
    try {
      await _dio.post('/auth/logout');
    } catch (_) {}
    await ApiClient.instance.clearCookies();
  }
}
