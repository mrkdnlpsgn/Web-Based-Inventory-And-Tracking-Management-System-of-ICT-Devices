import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../model/asset_model.dart';
import '../provider/asset_provider.dart';
import '../data/asset_service.dart';
import '../provider/ai_recommendation_provider.dart';
import '../model/ai_recommendation_model.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/status_badge.dart';
import '../../../shared/widgets/delete_dialog.dart';
import '../../auth/provider/auth_provider.dart';
import '../../asset_history/model/asset_history_model.dart';
import '../../asset_history/provider/asset_history_provider.dart';
import '../widgets/asset_qr_sheet.dart';
import '../../../shared/widgets/error_state.dart';

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
          if (assetAsync.value != null)
            IconButton(
              icon: const Icon(Icons.qr_code_2_rounded),
              tooltip: 'Show QR code',
              onPressed: () => showAssetQrSheet(context, assetAsync.value!),
            ),
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
                final result = await context.push<bool>('/assets/$assetId/edit', extra: assetAsync.value);
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
        error: (err, _) => ErrorState(
          message: err.toString(),
          onRetry: () {
            ref.invalidate(assetDetailProvider(assetId));
            ref.invalidate(assetHistoryProvider(assetId));
          },
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
          TabBar(
            indicatorColor: AppTheme.brand,
            labelColor: AppTheme.brand,
            unselectedLabelColor: context.colors.textSecondary,
            tabs: const [
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
                    style: TextStyle(color: context.colors.textPrimary, fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 8),
                StatusBadge.condition(asset.condition),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        _AiRecommendationCard(assetId: asset.id),
        const SizedBox(height: 12),
        _card(context, 'Asset Details', [
          _row(context, 'Category', asset.category.categoryName),
          _row(context, 'Location', asset.office.officeName),
          if (asset.accountablePerson != null) _row(context, 'Accountable Person', asset.accountablePerson!),
          _row(context, 'Quantity', asset.quantity.toString()),
          if (asset.physicalCount != null) _row(context, 'Physical Count', asset.physicalCount.toString()),
        ]),
        const SizedBox(height: 12),
        _card(context, 'Financial', [
          _row(context, 'Unit Value', '₱${asset.unitValue.toStringAsFixed(2)}'),
          _row(context, 'Acquisition Date', asset.acquisitionDate),
          _row(context, 'Total Value', '₱${(asset.unitValue * asset.quantity).toStringAsFixed(2)}'),
        ]),
        if (asset.remarks != null && asset.remarks!.isNotEmpty) ...[
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  _sectionTitle(context, 'Remarks'),
                  Text(asset.remarks!, style: TextStyle(color: context.colors.textSecondary, height: 1.5)),
                ],
              ),
            ),
          ),
        ],
        const SizedBox(height: 12),
        _card(context, 'Record Info', [
          _row(context, 'Created', _fmt(asset.createdAt)),
          _row(context, 'Last Updated', _fmt(asset.updatedAt)),
        ]),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _card(BuildContext context, String title, List<Widget> rows) => Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [_sectionTitle(context, title), ...rows],
          ),
        ),
      );

  Widget _sectionTitle(BuildContext context, String t) => Padding(
        padding: const EdgeInsets.only(bottom: 12),
        child: Text(t,
            style: TextStyle(color: context.colors.textTertiary, fontSize: 12,
                fontWeight: FontWeight.w600, letterSpacing: 0.8)),
      );

  Widget _row(BuildContext context, String label, String value) => Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(width: 150, child: Text(label, style: TextStyle(color: context.colors.textSecondary, fontSize: 13))),
            Expanded(child: Text(value, style: TextStyle(color: context.colors.textPrimary, fontSize: 13))),
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
      error: (err, _) => Center(child: Text(err.toString(), style: TextStyle(color: context.colors.textTertiary))),
      data: (history) => history.isEmpty
          ? Center(child: Text('No history available.', style: TextStyle(color: context.colors.textTertiary)))
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
                  child: Container(width: 1, color: context.colors.border, margin: const EdgeInsets.symmetric(vertical: 4)),
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
                      style: TextStyle(color: context.colors.textSecondary, fontSize: 12)),
                  if (item.fromOffice != null || item.toOffice != null) ...[
                    const SizedBox(height: 4),
                    Row(
                      children: [
                        if (item.fromOffice != null)
                          Text(item.fromOffice!.officeName,
                              style: TextStyle(color: context.colors.textTertiary, fontSize: 12)),
                        if (item.fromOffice != null && item.toOffice != null)
                          Padding(
                            padding: const EdgeInsets.symmetric(horizontal: 6),
                            child: Icon(Icons.arrow_forward_rounded, size: 12, color: context.colors.textSecondary),
                          ),
                        if (item.toOffice != null)
                          Text(item.toOffice!.officeName,
                              style: TextStyle(color: context.colors.textPrimary, fontSize: 12)),
                      ],
                    ),
                  ],
                  if (item.notes != null && item.notes!.isNotEmpty) ...[
                    const SizedBox(height: 4),
                    Text(item.notes!, style: TextStyle(color: context.colors.textTertiary, fontSize: 12)),
                  ],
                  Text('by ${item.performedBy.fullName}',
                      style: TextStyle(color: context.colors.textSecondary, fontSize: 11)),
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

class _AiRecommendationCard extends ConsumerStatefulWidget {
  final int assetId;
  const _AiRecommendationCard({required this.assetId});

  @override
  ConsumerState<_AiRecommendationCard> createState() => _AiRecommendationCardState();
}

class _AiRecommendationCardState extends ConsumerState<_AiRecommendationCard> {
  bool _generating = false;
  bool _autoGenerateAttempted = false;

  Future<void> _generate({bool silent = false}) async {
    setState(() => _generating = true);
    try {
      await ref.read(aiRecommendationServiceProvider).generate(widget.assetId);
      ref.invalidate(aiRecommendationProvider(widget.assetId));
    } catch (e) {
      if (mounted && !silent) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(e.toString()),
          backgroundColor: Colors.red.shade800,
        ));
      }
    } finally {
      if (mounted) setState(() => _generating = false);
    }
  }

  Color _color(String rec) => switch (rec) {
        'MAINTAIN' => AppTheme.brand,
        'REPAIR' => AppTheme.statusMaintenance,
        'MONITOR' => AppTheme.statusAssigned,
        'REVIEW_FOR_DISPOSAL' => AppTheme.statusDisposed,
        'BUDGET_PRIORITY' => Colors.deepOrange,
        _ => Colors.grey,
      };

  String _label(String rec) => switch (rec) {
        'MAINTAIN' => 'Maintain',
        'REPAIR' => 'Repair',
        'MONITOR' => 'Monitor',
        'REVIEW_FOR_DISPOSAL' => 'Review for Disposal',
        'BUDGET_PRIORITY' => 'Budget Priority',
        _ => rec,
      };

  String _fmtDate(String raw) {
    try {
      final dt = DateTime.parse(raw);
      return '${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')}';
    } catch (_) {
      return raw;
    }
  }

  @override
  Widget build(BuildContext context) {
    final isAdmin = ref.watch(authProvider).value?.isAdmin ?? false;
    final recAsync = ref.watch(aiRecommendationProvider(widget.assetId));

    ref.listen<AsyncValue<AiRecommendationModel?>>(
      aiRecommendationProvider(widget.assetId),
      (previous, next) {
        if (isAdmin && !_generating && !_autoGenerateAttempted && next.hasValue && next.value == null) {
          _autoGenerateAttempted = true;
          _generate(silent: true);
        }
      },
    );

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.auto_awesome_rounded, size: 16, color: AppTheme.brand),
                const SizedBox(width: 8),
                Expanded(
                  child: Text('AI LIFECYCLE RECOMMENDATION',
                      style: TextStyle(color: context.colors.textTertiary, fontSize: 12,
                          fontWeight: FontWeight.w600, letterSpacing: 0.8)),
                ),
                if (isAdmin)
                  _generating
                      ? const SizedBox(width: 16, height: 16,
                          child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.brand))
                      : IconButton(
                          icon: Icon(Icons.refresh_rounded, size: 18, color: context.colors.textTertiary),
                          tooltip: 'Generate recommendation',
                          onPressed: _generate,
                          visualDensity: VisualDensity.compact,
                          padding: EdgeInsets.zero,
                          constraints: const BoxConstraints(),
                        ),
              ],
            ),
            const SizedBox(height: 12),
            recAsync.when(
              loading: () => const Padding(
                padding: EdgeInsets.symmetric(vertical: 8),
                child: Center(child: CircularProgressIndicator(color: AppTheme.brand)),
              ),
              error: (e, _) => Text(e.toString(), style: TextStyle(color: context.colors.textSecondary, fontSize: 12)),
              data: (rec) {
                if (rec == null) {
                  if (_generating) {
                    return Row(
                      children: [
                        const SizedBox(
                          width: 14, height: 14,
                          child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.brand),
                        ),
                        const SizedBox(width: 10),
                        Text('Generating recommendation…',
                            style: TextStyle(color: context.colors.textSecondary, fontSize: 13)),
                      ],
                    );
                  }
                  return Text(
                    isAdmin
                        ? 'No recommendation yet. Tap refresh to generate one.'
                        : 'No recommendation generated yet.',
                    style: TextStyle(color: context.colors.textSecondary, fontSize: 13),
                  );
                }
                final color = _color(rec.recommendation);
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                      decoration: BoxDecoration(
                        color: color.withValues(alpha: 0.15),
                        borderRadius: BorderRadius.circular(6),
                        border: Border.all(color: color.withValues(alpha: 0.4)),
                      ),
                      child: Text(_label(rec.recommendation),
                          style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w600)),
                    ),
                    const SizedBox(height: 10),
                    Text(rec.rationale, style: TextStyle(color: context.colors.textSecondary, fontSize: 13, height: 1.4)),
                    const SizedBox(height: 10),
                    Text('Generated ${_fmtDate(rec.generatedAt)} · advisory only, not a final decision',
                        style: TextStyle(color: context.colors.textSecondary, fontSize: 11)),
                  ],
                );
              },
            ),
          ],
        ),
      ),
    );
  }
}
