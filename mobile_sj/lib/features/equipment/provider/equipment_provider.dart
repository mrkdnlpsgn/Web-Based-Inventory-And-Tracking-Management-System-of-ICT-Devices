import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/equipment_service.dart';
import '../model/equipment_model.dart';
import '../../../shared/provider/paginated_list_notifier.dart';

final equipmentServiceProvider = Provider<EquipmentService>((ref) => EquipmentService());

final equipmentSearchProvider = StateProvider<String>((ref) => '');

final equipmentPagedProvider = StateNotifierProvider.autoDispose
    .family<PaginatedListNotifier<EquipmentModel>, PaginatedListState<EquipmentModel>, String>((ref, search) {
  final service = ref.watch(equipmentServiceProvider);
  return PaginatedListNotifier<EquipmentModel>(
    (search, page, size) => service.getAll(search: search, page: page, size: size),
    search.isEmpty ? null : search,
  );
});

final equipmentDetailProvider =
    FutureProvider.autoDispose.family<EquipmentModel, int>((ref, id) {
  return ref.watch(equipmentServiceProvider).getById(id);
});
