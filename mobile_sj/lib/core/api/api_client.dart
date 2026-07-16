import 'dart:io' show Platform;
import 'package:cookie_jar/cookie_jar.dart';
import 'package:dio/dio.dart';
import 'package:dio_cookie_manager/dio_cookie_manager.dart';
import 'package:flutter/foundation.dart' show kIsWeb;
import 'package:path_provider/path_provider.dart';

class ApiClient {
  ApiClient._();
  static final ApiClient instance = ApiClient._();

  late final Dio dio;
  late final PersistCookieJar _cookieJar;

  // Android emulator → 10.0.2.2 (the emulator's alias for the host's localhost; a real
  // localhost inside the emulator's own virtual network resolves to the emulator itself).
  // Every other target (Windows/web/desktop, or a real device on the same Wi-Fi as the
  // backend) reaches the backend via the host machine directly.
  // Real device over Wi-Fi still needs this changed by hand to http://<your-PC-IP>:8080/api.
  static String get baseUrl =>
      !kIsWeb && Platform.isAndroid ? 'http://192.168.68.110:8080/api' : 'http://localhost:8080/api';

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
