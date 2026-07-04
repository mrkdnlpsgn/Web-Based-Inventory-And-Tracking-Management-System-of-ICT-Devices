import 'package:dio/dio.dart';
import '../../../core/api/api_client.dart';
import '../../../core/api/api_exception.dart';
import '../model/ai_recommendation_model.dart';

class AiRecommendationService {
  final Dio _dio = ApiClient.instance.dio;

  Future<AiRecommendationModel?> getLatest(int assetId) async {
    try {
      final res = await _dio.get('/assets/$assetId/recommendation');
      return AiRecommendationModel.fromJson(res.data as Map<String, dynamic>);
    } on DioException catch (e) {
      if (e.response?.statusCode == 404) return null;
      throw ApiException.from(e);
    }
  }

  Future<AiRecommendationModel> generate(int assetId) async {
    try {
      final res = await _dio.post('/assets/$assetId/recommendation');
      return AiRecommendationModel.fromJson(res.data as Map<String, dynamic>);
    } catch (e) {
      throw ApiException.from(e);
    }
  }

  Future<Map<String, int>> getSummary() async {
    try {
      final res = await _dio.get('/ai-recommendations/summary');
      final list = res.data as List;
      return {
        for (final item in list)
          (item as Map<String, dynamic>)['recommendation'] as String: item['count'] as int,
      };
    } catch (e) {
      throw ApiException.from(e);
    }
  }
}
