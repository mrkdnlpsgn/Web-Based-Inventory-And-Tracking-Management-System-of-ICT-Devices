import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../assets/provider/asset_provider.dart';

class DashboardStats {
  final int totalAssets;
  final double totalValue;
  final int underMaintenance;
  final int disposed;
  final Map<String, int> conditionDist;
  final Map<String, int> lifecycleDist;

  const DashboardStats({
    required this.totalAssets,
    required this.totalValue,
    required this.underMaintenance,
    required this.disposed,
    required this.conditionDist,
    required this.lifecycleDist,
  });
}

final dashboardStatsProvider = FutureProvider.autoDispose<DashboardStats>((ref) async {
  final service = ref.watch(assetServiceProvider);
  final assets = await service.getAll(size: 1000);

  final conditionDist = <String, int>{};
  final lifecycleDist = <String, int>{};
  double totalValue = 0;
  int underMaintenance = 0;
  int disposed = 0;

  for (final a in assets) {
    conditionDist[a.condition] = (conditionDist[a.condition] ?? 0) + 1;
    lifecycleDist[a.lifecycleStatus] = (lifecycleDist[a.lifecycleStatus] ?? 0) + 1;
    totalValue += a.unitValue * a.quantity;
    if (a.lifecycleStatus == 'UNDER_MAINTENANCE') underMaintenance++;
    if (a.lifecycleStatus == 'DISPOSED') disposed++;
  }

  return DashboardStats(
    totalAssets: assets.length,
    totalValue: totalValue,
    underMaintenance: underMaintenance,
    disposed: disposed,
    conditionDist: conditionDist,
    lifecycleDist: lifecycleDist,
  );
});
