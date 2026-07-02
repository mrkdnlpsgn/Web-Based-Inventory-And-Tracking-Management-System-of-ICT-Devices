import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/asset_history_service.dart';
import '../model/asset_history_model.dart';

final assetHistoryServiceProvider = Provider<AssetHistoryService>((ref) => AssetHistoryService());

final assetHistoryProvider =
    FutureProvider.autoDispose.family<List<AssetHistoryModel>, int>((ref, assetId) {
  return ref.watch(assetHistoryServiceProvider).getByAsset(assetId);
});
