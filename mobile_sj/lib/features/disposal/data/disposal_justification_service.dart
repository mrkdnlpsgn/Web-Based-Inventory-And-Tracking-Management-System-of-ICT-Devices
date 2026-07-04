import 'package:dio/dio.dart';
import '../../../core/api/api_client.dart';
import '../../../core/api/api_exception.dart';
import '../model/disposal_justification_model.dart';

class DisposalJustificationService {
  final Dio _dio = ApiClient.instance.dio;

  Future<DisposalJustificationModel?> getLatest(int disposalId) async {
    try {
      final res = await _dio.get('/disposal/$disposalId/justification');
      return DisposalJustificationModel.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) return null;
      throw ApiException.from(e);
    }
  }

  Future<DisposalJustificationModel> generate(int disposalId) async {
    try {
      final res = await _dio.post('/disposal/$disposalId/justification');
      return DisposalJustificationModel.fromJson(res.data as Map<String, dynamic>);
    } catch (e) {
      throw ApiException.from(e);
    }
  }
}
