import 'package:dio/dio.dart';
import '../../../core/api/api_client.dart';
import '../../../core/api/api_exception.dart';
import '../model/equipment_model.dart';

class EquipmentService {
  final Dio _dio = ApiClient.instance.dio;

  Future<List<EquipmentModel>> getAll({String? search, int page = 0, int size = 20}) async {
    try {
      final res = await _dio.get('/equipment', queryParameters: {
        if (search != null && search.isNotEmpty) 'search': search,
        'page': page,
        'size': size,
      });
      return (res.data as List).map((e) => EquipmentModel.fromJson(e as Map<String, dynamic>)).toList();
    } catch (e) {
      throw ApiException.from(e);
    }
  }

  Future<EquipmentModel> getById(int id) async {
    try {
      final res = await _dio.get('/equipment/$id');
      return EquipmentModel.fromJson(res.data as Map<String, dynamic>);
    } catch (e) {
      throw ApiException.from(e);
    }
  }

  Future<EquipmentModel> create(Map<String, dynamic> data) async {
    try {
      final res = await _dio.post('/equipment', data: data);
      return EquipmentModel.fromJson(res.data as Map<String, dynamic>);
    } catch (e) {
      throw ApiException.from(e);
    }
  }

  Future<EquipmentModel> update(int id, Map<String, dynamic> data) async {
    try {
      final res = await _dio.put('/equipment/$id', data: data);
      return EquipmentModel.fromJson(res.data as Map<String, dynamic>);
    } catch (e) {
      throw ApiException.from(e);
    }
  }

  Future<void> delete(int id) async {
    try {
      await _dio.delete('/equipment/$id');
    } catch (e) {
      throw ApiException.from(e);
    }
  }

  Future<DeviceModel> addDevice(int equipmentId, Map<String, dynamic> data) async {
    try {
      final res = await _dio.post('/equipment/$equipmentId/devices', data: data);
      return DeviceModel.fromJson(res.data as Map<String, dynamic>);
    } catch (e) {
      throw ApiException.from(e);
    }
  }

  Future<DeviceModel> updateDevice(int equipmentId, int deviceId, Map<String, dynamic> data) async {
    try {
      final res = await _dio.put('/equipment/$equipmentId/devices/$deviceId', data: data);
      return DeviceModel.fromJson(res.data as Map<String, dynamic>);
    } catch (e) {
      throw ApiException.from(e);
    }
  }

  Future<void> deleteDevice(int equipmentId, int deviceId) async {
    try {
      await _dio.delete('/equipment/$equipmentId/devices/$deviceId');
    } catch (e) {
      throw ApiException.from(e);
    }
  }
}
