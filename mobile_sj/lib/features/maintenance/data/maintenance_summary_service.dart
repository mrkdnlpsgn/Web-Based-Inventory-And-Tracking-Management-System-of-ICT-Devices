import 'package:dio/dio.dart';
import '../../../core/api/api_client.dart';
import '../../../core/api/api_exception.dart';
import '../model/maintenance_summary_model.dart';

class MaintenanceSummaryService {
  final Dio _dio = ApiClient.instance.dio;

  Future<MaintenanceSummaryModel?> getLatest(int maintenanceId) async {
    try {
      final res = await _dio.get('/maintenance/$maintenanceId/summary');
      return MaintenanceSummaryModel.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) return null;
      throw ApiException.from(e);
    }
  }

  Future<MaintenanceSummaryModel> generate(int maintenanceId) async {
    try {
      final res = await _dio.post('/maintenance/$maintenanceId/summary');
      return MaintenanceSummaryModel.fromJson(res.data as Map<String, dynamic>);
    } catch (e) {
      throw ApiException.from(e);
    }
  }
}
