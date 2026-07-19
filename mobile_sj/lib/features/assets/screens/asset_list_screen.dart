import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../model/asset_model.dart';
import '../provider/asset_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/status_badge.dart';
import '../../../shared/widgets/paginated_list_view.dart';
import '../../../shared/widgets/app_search_field.dart';
import '../../../shared/widgets/main_shell.dart';
import '../../../features/auth/provider/auth_provider.dart';
import '../../../core/platform.dart';
import '../widgets/asset_filter_sheet.dart';

class AssetListScreen extends ConsumerStatefulWidget {
  const AssetListScreen({super.key});

  @override
  ConsumerState<AssetListScreen> createState() => _AssetListScreenState();
}

class _AssetListScreenState extends ConsumerState<AssetListScreen> {
  final _searchCtrl = TextEditingController();

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final search = ref.watch(assetSearchProvider);
    final state = ref.watch(assetsPagedProvider(search));
    final isAdmin = ref.watch(authProvider).value?.isAdmin ?? false;
    final filtersActive = assetFiltersActive(ref);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Assets'),
        actions: [
          IconButton(
            icon: AnimatedSwitcher(
              duration: AppTheme.motionFast,
              switchInCurve: AppTheme.motionCurve,
              switchOutCurve: AppTheme.motionCurve,
              transitionBuilder: (child, animation) => ScaleTransition(scale: animation, child: child),
              child: Badge(
                key: ValueKey(filtersActive),
                isLabelVisible: filtersActive,
                smallSize: 8,
                child: const Icon(Icons.filter_list_rounded),
              ),
            ),
            tooltip: 'Filter',
            onPressed: () => showAssetFilterSheet(context, ref),
          ),
          if (isDesktopPlatform)
            IconButton(
              icon: const Icon(Icons.refresh_rounded),
              onPressed: () => ref.invalidate(assetsPagedProvider(search)),
            ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(64),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: AppSearchField(
              controller: _searchCtrl,
              hintText: 'Search by property number, description...',
              onChanged: (v) => ref.read(assetSearchProvider.notifier).state = v,
            ),
          ),
        ),
      ),
      floatingActionButton: isAdmin
          ? Padding(
              padding: const EdgeInsets.only(bottom: kMainShellBarHeight),
              child: FloatingActionButton(
                backgroundColor: AppTheme.brand,
                child: const Icon(Icons.add_rounded, color: Colors.white),
                onPressed: () async {
                  final result = await context.push<bool>('/assets/new');
                  if (result == true) ref.invalidate(assetsPagedProvider(search));
                },
              ),
            )
          : null,
      body: PaginatedListView<AssetModel>(
        state: state,
        emptyMessage: 'No assets found.',
        extraBottomPadding: context.mainShellBottomInset,
        onLoadMore: () => ref.read(assetsPagedProvider(search).notifier).loadMore(),
        onRefresh: () => ref.read(assetsPagedProvider(search).notifier).refresh(),
        itemBuilder: (context, asset, i) => _AssetCard(
          asset: asset,
          onTap: () => context.push('/assets/${asset.id}'),
        ),
      ),
    );
  }
}

class _AssetCard extends StatelessWidget {
  final AssetModel asset;
  final VoidCallback onTap;

  const _AssetCard({required this.asset, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Row(
                children: [
                  Expanded(
                    child: Text(asset.propertyNumber,
                        style: const TextStyle(color: AppTheme.brand, fontSize: 12, fontWeight: FontWeight.w600)),
                  ),
                  StatusBadge.lifecycle(asset.lifecycleStatus),
                ],
              ),
              const SizedBox(height: 6),
              Text(asset.description,
                  style: TextStyle(color: context.colors.textPrimary, fontSize: 15, fontWeight: FontWeight.w500),
                  maxLines: 2, overflow: TextOverflow.ellipsis),
              const SizedBox(height: 8),
              Row(
                children: [
                  Icon(Icons.business_outlined, size: 13, color: context.colors.textSecondary),
                  const SizedBox(width: 4),
                  Expanded(
                    child: Text(asset.office.officeName,
                        style: TextStyle(color: context.colors.textTertiary, fontSize: 12),
                        overflow: TextOverflow.ellipsis),
                  ),
                  const SizedBox(width: 8),
                  StatusBadge.condition(asset.condition),
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }
}
