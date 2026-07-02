import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/disposal_service.dart';
import '../model/disposal_model.dart';
import '../../../shared/provider/paginated_list_notifier.dart';

final disposalServiceProvider = Provider<DisposalService>((ref) => DisposalService());

final disposalSearchProvider = StateProvider<String>((ref) => '');

final disposalPagedProvider = StateNotifierProvider.autoDispose
    .family<PaginatedListNotifier<DisposalModel>, PaginatedListState<DisposalModel>, String>((ref, search) {
  final service = ref.watch(disposalServiceProvider);
  return PaginatedListNotifier<DisposalModel>(
    (search, page, size) => service.getAll(search: search, page: page, size: size),
    search.isEmpty ? null : search,
  );
});

final disposalDetailProvider =
    FutureProvider.autoDispose.family<DisposalModel, int>((ref, id) {
  return ref.watch(disposalServiceProvider).getById(id);
});

final disposalByAssetProvider =
    FutureProvider.autoDispose.family<List<DisposalModel>, int>((ref, assetId) {
  return ref.watch(disposalServiceProvider).getByAsset(assetId);
});
