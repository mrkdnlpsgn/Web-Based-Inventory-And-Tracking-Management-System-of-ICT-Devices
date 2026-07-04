import 'package:dio/dio.dart';
import '../../../core/api/api_client.dart';
import '../../../core/api/api_exception.dart';
import '../model/audit_log_digest_model.dart';

class AuditLogDigestService {
  final Dio _dio = ApiClient.instance.dio;

  Future<AuditLogDigestModel?> getLatest() async {
    try {
      final res = await _dio.get('/audit-logs/digest');
      return AuditLogDigestModel.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) return null;
      throw ApiException.from(e);
    }
  }

  Future<AuditLogDigestModel> generate() async {
    try {
      final res = await _dio.post('/audit-logs/digest');
      return AuditLogDigestModel.fromJson(res.data as Map<String, dynamic>);
    } catch (e) {
      throw ApiException.from(e);
    }
  }
}
