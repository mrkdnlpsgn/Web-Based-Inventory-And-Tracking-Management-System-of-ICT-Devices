import 'package:dio/dio.dart';
import '../../../core/api/api_client.dart';
import '../../../core/api/api_exception.dart';
import '../model/asset_history_model.dart';

class AssetHistoryService {
  final Dio _dio = ApiClient.instance.dio;

  Future<List<AssetHistoryModel>> getAll({String? search}) async {
    try {
      final res = await _dio.get('/asset-history', queryParameters: {
        if (search != null && search.isNotEmpty) 'search': search,
      });
      return (res.data as List).map((e) => AssetHistoryModel.fromJson(e as Map<String, dynamic>)).toList();
    } catch (e) {
      throw ApiException.from(e);
    }
  }

  Future<List<AssetHistoryModel>> getByAsset(int assetId) async {
    try {
      final res = await _dio.get('/asset-history/asset/$assetId');
      return (res.data as List).map((e) => AssetHistoryModel.fromJson(e as Map<String, dynamic>)).toList();
    } catch (e) {
      throw ApiException.from(e);
    }
  }
}
