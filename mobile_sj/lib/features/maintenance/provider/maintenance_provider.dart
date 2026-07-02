import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/maintenance_service.dart';
import '../model/maintenance_model.dart';
import '../../../shared/provider/paginated_list_notifier.dart';

final maintenanceServiceProvider = Provider<MaintenanceService>((ref) => MaintenanceService());

final maintenanceSearchProvider = StateProvider<String>((ref) => '');

final maintenancePagedProvider = StateNotifierProvider.autoDispose
    .family<PaginatedListNotifier<MaintenanceModel>, PaginatedListState<MaintenanceModel>, String>((ref, search) {
  final service = ref.watch(maintenanceServiceProvider);
  return PaginatedListNotifier<MaintenanceModel>(
    (search, page, size) => service.getAll(search: search, page: page, size: size),
    search.isEmpty ? null : search,
  );
});

final maintenanceDetailProvider =
    FutureProvider.autoDispose.family<MaintenanceModel, int>((ref, id) {
  return ref.watch(maintenanceServiceProvider).getById(id);
});

final maintenanceByAssetProvider =
    FutureProvider.autoDispose.family<List<MaintenanceModel>, int>((ref, assetId) {
  return ref.watch(maintenanceServiceProvider).getByAsset(assetId);
});
