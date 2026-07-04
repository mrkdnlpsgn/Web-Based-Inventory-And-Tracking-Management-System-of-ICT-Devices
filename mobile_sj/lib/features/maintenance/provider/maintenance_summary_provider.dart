import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/maintenance_summary_service.dart';
import '../model/maintenance_summary_model.dart';

final maintenanceSummaryServiceProvider =
    Provider<MaintenanceSummaryService>((ref) => MaintenanceSummaryService());

final maintenanceSummaryProvider =
    FutureProvider.autoDispose.family<MaintenanceSummaryModel?, int>((ref, maintenanceId) {
  return ref.watch(maintenanceSummaryServiceProvider).getLatest(maintenanceId);
});
