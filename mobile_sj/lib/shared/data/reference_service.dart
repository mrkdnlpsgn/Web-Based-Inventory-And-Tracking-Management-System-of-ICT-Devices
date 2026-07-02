import 'package:dio/dio.dart';
import '../../core/api/api_client.dart';
import '../../core/api/api_exception.dart';
import '../../features/assets/model/asset_model.dart';

class ReferenceService {
  final Dio _dio = ApiClient.instance.dio;

  Future<List<CategoryModel>> getCategories() async {
    try {
      final res = await _dio.get('/categories');
      return (res.data as List).map((e) => CategoryModel.fromJson(e as Map<String, dynamic>)).toList();
    } catch (e) {
      throw ApiException.from(e);
    }
  }

  Future<List<OfficeModel>> getOffices() async {
    try {
      final res = await _dio.get('/offices');
      return (res.data as List).map((e) => OfficeModel.fromJson(e as Map<String, dynamic>)).toList();
    } catch (e) {
      throw ApiException.from(e);
    }
  }
}
