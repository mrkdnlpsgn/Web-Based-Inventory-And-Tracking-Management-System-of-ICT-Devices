import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/asset_service.dart';
import '../model/asset_model.dart';
import '../../../shared/provider/paginated_list_notifier.dart';

final assetServiceProvider = Provider<AssetService>((ref) => AssetService());

final assetSearchProvider = StateProvider<String>((ref) => '');

final assetsPagedProvider = StateNotifierProvider.autoDispose
    .family<PaginatedListNotifier<AssetModel>, PaginatedListState<AssetModel>, String>((ref, search) {
  final service = ref.watch(assetServiceProvider);
  return PaginatedListNotifier<AssetModel>(
    (search, page, size) => service.getAll(search: search, page: page, size: size),
    search.isEmpty ? null : search,
  );
});

final assetDetailProvider =
    FutureProvider.autoDispose.family<AssetModel, int>((ref, id) {
  return ref.watch(assetServiceProvider).getById(id);
});
