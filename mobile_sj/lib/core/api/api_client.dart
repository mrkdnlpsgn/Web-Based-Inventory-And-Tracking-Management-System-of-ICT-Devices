import 'package:cookie_jar/cookie_jar.dart';
import 'package:dio/dio.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:path_provider/path_provider.dart';

class ApiClient {
  ApiClient._();
  static final ApiClient instance = ApiClient._();

  late final Dio dio;
  late final PersistCookieJar _cookieJar;

  // Android emulator       → 10.0.2.2 (maps to host localhost)
  // Windows desktop / web  → change to http://localhost:8080/api
  // Real device (WiFi)     → change to http://<your-PC-IP>:8080/api
  static const String baseUrl = 'http://10.0.2.2:8080/api';

  Future<void> init() async {
    final dir = await getApplicationDocumentsDirectory();
    _cookieJar = PersistCookieJar(
      storage: FileStorage('${dir.path}/.cookies/'),
    );

    dio = Dio(BaseOptions(
      baseUrl: baseUrl,
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 15),
      contentType: 'application/json',
    ));

    // Automatically stores the jwt HttpOnly cookie and sends it with every request
    dio.interceptors.add(CookieManager(_cookieJar));
  }

  Future<void> clearCookies() async => _cookieJar.deleteAll();
}
