import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/asset_service.dart';
import '../model/asset_model.dart';
import '../../../shared/provider/paginated_list_notifier.dart';

final assetServiceProvider = Provider<AssetService>((ref) => AssetService());

final assetSearchProvider = StateProvider<String>((ref) => '');

// Filter chips (Category/Office/Condition/Lifecycle) — separate providers so
// each can be watched independently; changing any one rebuilds the paged
// provider below with a fresh first page.
final assetCategoryFilterProvider = StateProvider<int?>((ref) => null);
final assetOfficeFilterProvider = StateProvider<int?>((ref) => null);
final assetConditionFilterProvider = StateProvider<String?>((ref) => null);
final assetLifecycleFilterProvider = StateProvider<String?>((ref) => null);

final assetsPagedProvider = StateNotifierProvider.autoDispose
    .family<PaginatedListNotifier<AssetModel>, PaginatedListState<AssetModel>, String>((ref, search) {
  final service = ref.watch(assetServiceProvider);
  final categoryId = ref.watch(assetCategoryFilterProvider);
  final officeId = ref.watch(assetOfficeFilterProvider);
  final condition = ref.watch(assetConditionFilterProvider);
  final lifecycleStatus = ref.watch(assetLifecycleFilterProvider);
  return PaginatedListNotifier<AssetModel>(
    (search, page, size) => service.getAll(
      search: search,
      page: page,
      size: size,
      categoryId: categoryId,
      officeId: officeId,
      condition: condition,
      lifecycleStatus: lifecycleStatus,
    ),
    search.isEmpty ? null : search,
  );
});

final assetDetailProvider =
    FutureProvider.autoDispose.family<AssetModel, int>((ref, id) {
  return ref.watch(assetServiceProvider).getById(id);
});
