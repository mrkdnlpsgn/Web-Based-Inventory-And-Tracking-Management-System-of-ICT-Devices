import 'package:dio/dio.dart';

class ApiException implements Exception {
  final int? statusCode;
  final String message;

  ApiException({this.statusCode, required this.message});

  @override
  String toString() => message;

  static ApiException from(Object e) {
    if (e is DioException) {
      final status = e.response?.statusCode;
      final data = e.response?.data;

      String msg = 'Something went wrong. Please try again.';

      if (data is Map && data['message'] != null) {
        msg = data['message'].toString();
      } else if (status == 401) {
        msg = 'Session expired. Please log in again.';
      } else if (status == 403) {
        msg = 'You do not have permission to do that.';
      } else if (status == 404) {
        msg = 'Resource not found.';
      } else if (e.type == DioExceptionType.connectionTimeout ||
          e.type == DioExceptionType.receiveTimeout) {
        msg = 'Request timed out. Check your network connection.';
      } else if (e.type == DioExceptionType.connectionError) {
        msg = 'Cannot reach the server. Check your network.';
      }

      return ApiException(statusCode: status, message: msg);
    }
    if (e is ApiException) return e;
    return ApiException(message: e.toString());
  }
}
