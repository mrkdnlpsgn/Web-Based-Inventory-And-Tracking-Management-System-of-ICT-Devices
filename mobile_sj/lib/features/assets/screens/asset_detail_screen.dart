import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../model/asset_model.dart';
import '../provider/asset_provider.dart';
import '../screens/asset_form_screen.dart';
import '../data/asset_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/status_badge.dart';
import '../../../shared/widgets/delete_dialog.dart';
import '../../auth/provider/auth_provider.dart';
import '../../asset_history/model/asset_history_model.dart';
import '../../asset_history/provider/asset_history_provider.dart';

class AssetDetailScreen extends ConsumerWidget {
  final int assetId;
  const AssetDetailScreen({super.key, required this.assetId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final assetAsync = ref.watch(assetDetailProvider(assetId));
    final isAdmin = ref.watch(authProvider).value?.isAdmin ?? false;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Asset Detail'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () {
              ref.invalidate(assetDetailProvider(assetId));
              ref.invalidate(assetHistoryProvider(assetId));
            },
          ),
          if (isAdmin && assetAsync.value != null) ...[
            IconButton(
              icon: const Icon(Icons.edit_outlined),
              onPressed: () async {
                final result = await Navigator.push(context,
                    MaterialPageRoute(builder: (_) => AssetFormScreen(asset: assetAsync.value)));
                if (result == true) ref.invalidate(assetDetailProvider(assetId));
              },
            ),
            IconButton(
              icon: const Icon(Icons.delete_outline_rounded, color: Colors.red),
              onPressed: () async {
                final reason = await showDeleteDialog(context);
                if (reason == null || !context.mounted) return;
                try {
                  await AssetService().delete(assetId, reason: reason);
                  ref.invalidate(assetsPagedProvider(ref.read(assetSearchProvider)));
                  if (context.mounted) context.pop();
                } catch (e) {
                  if (context.mounted) {
                    ScaffoldMessenger.of(context).showSnackBar(SnackBar(
                      content: Text(e.toString()),
                      backgroundColor: Colors.red.shade800,
                    ));
                  }
                }
              },
            ),
          ],
        ],
      ),
      body: assetAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.brand)),
        error: (err, _) => Center(
          child: Text(err.toString(), style: const TextStyle(color: Colors.white54), textAlign: TextAlign.center),
        ),
        data: (asset) => _AssetDetailBody(asset: asset),
      ),
    );
  }
}

class _AssetDetailBody extends ConsumerWidget {
  final AssetModel asset;
  const _AssetDetailBody({required this.asset});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return DefaultTabController(
      length: 2,
      child: Column(
        children: [
          const TabBar(
            indicatorColor: AppTheme.brand,
            labelColor: AppTheme.brand,
            unselectedLabelColor: Colors.white38,
            tabs: [
              Tab(text: 'Details'),
              Tab(text: 'History'),
            ],
          ),
          Expanded(
            child: TabBarView(
              children: [
                _DetailsTab(asset: asset),
                _HistoryTab(assetId: asset.id),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

class _DetailsTab extends StatelessWidget {
  final AssetModel asset;
  const _DetailsTab({required this.asset});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.all(16),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  children: [
                    Text(asset.propertyNumber,
                        style: const TextStyle(color: AppTheme.brand, fontSize: 13, fontWeight: FontWeight.w600)),
                    const Spacer(),
                    StatusBadge.lifecycle(asset.lifecycleStatus),
                  ],
                ),
                const SizedBox(height: 8),
                Text(asset.description,
                    style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                StatusBadge.condition(asset.condition),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        _card('Asset Details', [
          _row('Category', asset.category.categoryName),
          _row('Office', asset.office.officeName),
          _row('Location', asset.location),
          if (asset.accountablePerson != null) _row('Accountable Person', asset.accountablePerson!),
          _row('Quantity', asset.quantity.toString()),
          if (asset.physicalCount != null) _row('Physical Count', asset.physicalCount.toString()),
        ]),
        const SizedBox(height: 12),
        _card('Financial', [
          _row('Unit Value', '₱${asset.unitValue.toStringAsFixed(2)}'),
          _row('Acquisition Date', asset.acquisitionDate),
          _row('Total Value', '₱${(asset.unitValue * asset.quantity).toStringAsFixed(2)}'),
        ]),
        if (asset.remarks != null && asset.remarks!.isNotEmpty) ...[
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _sectionTitle('Remarks'),
                  Text(asset.remarks!, style: const TextStyle(color: Colors.white70, height: 1.5)),
                ],
              ),
            ),
          ),
        ],
        const SizedBox(height: 12),
        _card('Record Info', [
          _row('Created', _fmt(asset.createdAt)),
          _row('Last Updated', _fmt(asset.updatedAt)),
        ]),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _card(String title, List<Widget> rows) => Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [_sectionTitle(title), ...rows],
          ),
        ),
      );

  Widget _sectionTitle(String t) => Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: Text(t,
            style: const TextStyle(color: Colors.white54, fontSize: 12,
                fontWeight: FontWeight.w600, letterSpacing: 0.8)),
      );

  Widget _row(String label, String value) => Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(width: 150, child: Text(label, style: const TextStyle(color: Colors.white38, fontSize: 13))),
            Expanded(child: Text(value, style: const TextStyle(color: Colors.white, fontSize: 13))),
          ],
        ),
      );

  String _fmt(String raw) {
    try {
      final dt = DateTime.parse(raw);
      return '${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')}';
    } catch (_) {
      return raw;
    }
  }
}

class _HistoryTab extends ConsumerWidget {
  final int assetId;
  const _HistoryTab({required this.assetId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final historyAsync = ref.watch(assetHistoryProvider(assetId));
    return historyAsync.when(
      loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.brand)),
      error: (err, _) => Center(child: Text(err.toString(), style: const TextStyle(color: Colors.white54))),
      data: (history) => history.isEmpty
          ? const Center(child: Text('No history available.', style: TextStyle(color: Colors.white54)))
          : ListView.builder(
              padding: const EdgeInsets.all(16),
              itemCount: history.length,
              itemBuilder: (context, i) => _HistoryTile(item: history[i], isLast: i == history.length - 1),
            ),
    );
  }
}

class _HistoryTile extends StatelessWidget {
  final AssetHistoryModel item;
  final bool isLast;
  const _HistoryTile({required this.item, required this.isLast});

  Color get _eventColor => switch (item.eventType) {
        'REGISTERED' => Colors.grey,
        'ASSIGNED' => AppTheme.statusAssigned,
        'TRANSFERRED' => AppTheme.statusTransferred,
        'MAINTENANCE' => AppTheme.statusMaintenance,
        'DISPOSAL' => AppTheme.statusDisposed,
        'ARCHIVED' => Colors.grey.shade600,
        _ => Colors.grey,
      };

  IconData get _eventIcon => switch (item.eventType) {
        'REGISTERED' => Icons.add_circle_outline_rounded,
        'ASSIGNED' => Icons.person_add_outlined,
        'TRANSFERRED' => Icons.swap_horiz_rounded,
        'MAINTENANCE' => Icons.build_outlined,
        'DISPOSAL' => Icons.delete_outline_rounded,
        'ARCHIVED' => Icons.archive_outlined,
        _ => Icons.circle_outlined,
      };

  @override
  Widget build(BuildContext context) {
    return IntrinsicHeight(
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          // Timeline line
          Column(
            children: [
              Container(
                width: 32,
                height: 32,
                decoration: BoxDecoration(
                  color: _eventColor.withValues(alpha: 0.15),
                  shape: BoxShape.circle,
                  border: Border.all(color: _eventColor.withValues(alpha: 0.5)),
                ),
                child: Icon(_eventIcon, size: 16, color: _eventColor),
              ),
              if (!isLast)
                Expanded(
                  child: Container(width: 1, color: AppTheme.border, margin: const EdgeInsets.symmetric(vertical: 4)),
                ),
            ],
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Padding(
              padding: EdgeInsets.only(bottom: isLast ? 0 : 20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  const SizedBox(height: 6),
                  Text(item.eventType.replaceAll('_', ' '),
                      style: TextStyle(color: _eventColor, fontSize: 13, fontWeight: FontWeight.w600)),
                  Text(_fmt(item.eventDate),
                      style: const TextStyle(color: Colors.white38, fontSize: 12)),
                  if (item.fromOffice != null || item.toOffice != null) ...[
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        if (item.fromOffice != null)
                          Text(item.fromOffice!.officeName,
                              style: const TextStyle(color: Colors.white54, fontSize: 12)),
                        if (item.fromOffice != null && item.toOffice != null)
                          const Padding(
                            padding: EdgeInsets.symmetric(horizontal: 6),
                            child: Icon(Icons.arrow_forward_rounded, size: 12, color: Colors.white38),
                          ),
                        if (item.toOffice != null)
                          Text(item.toOffice!.officeName,
                              style: const TextStyle(color: Colors.white, fontSize: 12)),
                      ],
                    ),
                  ],
                  if (item.notes != null && item.notes!.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(item.notes!, style: const TextStyle(color: Colors.white54, fontSize: 12)),
                  ],
                  Text('by ${item.performedBy.fullName}',
                      style: const TextStyle(color: Colors.white38, fontSize: 11)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }

  String _fmt(String raw) {
    try {
      final dt = DateTime.parse(raw);
      return '${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')}';
    } catch (_) {
      return raw;
    }
  }
}
