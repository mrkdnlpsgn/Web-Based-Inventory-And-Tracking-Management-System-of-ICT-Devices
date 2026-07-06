import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../auth/provider/auth_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/status_badge.dart';
import '../../../shared/widgets/skeleton.dart';
import '../../assets/provider/ai_recommendation_provider.dart';
import '../../audit_log/provider/audit_log_digest_provider.dart';
import '../provider/dashboard_provider.dart';

class DashboardScreen extends ConsumerWidget {
  const DashboardScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final user = ref.watch(authProvider).value;
    final isAdmin = user?.isAdmin ?? false;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            Container(
              width: 28,
              height: 28,
              decoration: BoxDecoration(
                shape: BoxShape.circle,
                border: Border.all(color: AppTheme.brand.withValues(alpha: 0.3), width: 1.5),
              ),
              child: const ClipOval(
                child: Image(image: AssetImage('assets/images/images.png'), fit: BoxFit.cover),
              ),
            ),
            const SizedBox(width: 10),
            const Text('Dashboard'),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout_rounded),
            tooltip: 'Logout',
            onPressed: () async {
              final confirm = await showDialog<bool>(
                context: context,
                builder: (ctx) => AlertDialog(
                  backgroundColor: context.colors.surface,
                  title: const Text('Sign Out'),
                  content: const Text('Are you sure you want to sign out?'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(ctx, false),
                      child: Text('Cancel', style: TextStyle(color: context.colors.textTertiary)),
                    ),
                    TextButton(
                      onPressed: () => Navigator.pop(ctx, true),
                      child: const Text('Sign Out', style: TextStyle(color: Colors.red)),
                    ),
                  ],
                ),
              );
              if (confirm == true) {
                await ref.read(authProvider.notifier).logout();
              }
            },
          ),
        ],
      ),
      body: RefreshIndicator(
        color: AppTheme.brand,
        onRefresh: () async {
          ref.invalidate(dashboardStatsProvider);
          ref.invalidate(aiRecommendationSummaryProvider);
          ref.invalidate(auditLogDigestProvider);
        },
        child: ListView(
        padding: const EdgeInsets.all(16),
        children: [
          if (user != null)
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.brand.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.brand.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: AppTheme.brand.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      user.username.isNotEmpty ? user.username[0].toUpperCase() : '?',
                      style: const TextStyle(color: AppTheme.brand, fontWeight: FontWeight.w700, fontSize: 18),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(user.username,
                            style: TextStyle(color: context.colors.textPrimary, fontWeight: FontWeight.w600, fontSize: 15)),
                        const SizedBox(height: 4),
                        StatusBadge(
                          label: user.role,
                          color: user.isAdmin ? AppTheme.brand : AppTheme.statusAssigned,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),

          const SizedBox(height: 24),

          _sectionLabel(context, 'OVERVIEW'),
          const SizedBox(height: 12),
          const _DashboardStatsSection(),

          const SizedBox(height: 24),

          _sectionLabel(context, 'MODULES'),
          const SizedBox(height: 12),

          _NavCard(
            icon: Icons.inventory_2_outlined,
            title: 'Assets',
            subtitle: 'Browse and search ICT assets',
            color: AppTheme.brand,
            onTap: () => context.push('/assets'),
          ),
          const SizedBox(height: 10),
          _NavCard(
            icon: Icons.build_outlined,
            title: 'Maintenance',
            subtitle: 'View maintenance ledger records',
            color: AppTheme.statusMaintenance,
            onTap: () => context.push('/maintenance'),
          ),
          const SizedBox(height: 10),
          _NavCard(
            icon: Icons.delete_outline_rounded,
            title: 'Disposal',
            subtitle: 'View disposal ledger records',
            color: AppTheme.statusDisposed,
            onTap: () => context.push('/disposal'),
          ),
          const SizedBox(height: 10),
          _NavCard(
            icon: Icons.summarize_outlined,
            title: 'Reports',
            subtitle: 'Generate and export inventory reports, including COA RPCPPE/IIRUP',
            color: AppTheme.brandDark,
            onTap: () => context.push('/reports'),
          ),
          const SizedBox(height: 10),
          _NavCard(
            icon: Icons.qr_code_scanner_rounded,
            title: 'QR Asset Lookup',
            subtitle: 'Scan or enter a property number to check an asset\'s status',
            color: AppTheme.statusTransferred,
            onTap: () => context.push('/qr-scanner'),
          ),
          if (isAdmin) ...[
            const SizedBox(height: 10),
            _NavCard(
              icon: Icons.manage_accounts_outlined,
              title: 'Manage Accounts',
              subtitle: 'Create and manage user accounts',
              color: AppTheme.statusAssigned,
              onTap: () => context.push('/accounts'),
            ),
          ],

          const SizedBox(height: 24),

          _sectionLabel(context, 'PREFERENCES'),
          const SizedBox(height: 12),
          _NavCard(
            icon: Icons.settings_outlined,
            title: 'Settings',
            subtitle: 'Theme, text size, and app info',
            color: AppTheme.statusRegistered,
            onTap: () => context.push('/settings'),
          ),
        ],
        ),
      ),
    );
  }

  Widget _sectionLabel(BuildContext context, String label) => Text(
        label,
        style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: context.colors.textSecondary,
              fontWeight: FontWeight.w600,
              letterSpacing: 1,
            ),
      );
}

class _NavCard extends StatelessWidget {
  final IconData icon;
  final String title;
  final String subtitle;
  final Color color;
  final VoidCallback onTap;

  const _NavCard({
    required this.icon,
    required this.title,
    required this.subtitle,
    required this.color,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return Card(
      child: InkWell(
        onTap: onTap,
        borderRadius: BorderRadius.circular(12),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
            children: [
              Container(
                padding: const EdgeInsets.all(10),
                decoration: BoxDecoration(
                  color: color.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(10),
                ),
                child: Icon(icon, color: color, size: 24),
              ),
              const SizedBox(width: 14),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(title,
                        style: TextStyle(color: context.colors.textPrimary, fontWeight: FontWeight.w600, fontSize: 15)),
                    const SizedBox(height: 2),
                    Text(subtitle, style: TextStyle(color: context.colors.textTertiary, fontSize: 13)),
                  ],
                ),
              ),
              Icon(Icons.chevron_right_rounded, color: context.colors.textSecondary),
            ],
          ),
        ),
      ),
    );
  }
}

String _fmtMoney(double v) {
  if (v >= 1000000) return '₱${(v / 1000000).toStringAsFixed(1)}M';
  if (v >= 1000) return '₱${(v / 1000).toStringAsFixed(0)}K';
  return '₱${v.toStringAsFixed(0)}';
}

const _conditionOrder = ['SERVICEABLE', 'REPAIRABLE', 'UNSERVICEABLE'];
const _lifecycleOrder = ['REGISTERED', 'ASSIGNED', 'TRANSFERRED', 'UNDER_MAINTENANCE', 'DISPOSED', 'ARCHIVED'];
const _recommendationOrder = ['MAINTAIN', 'REPAIR', 'MONITOR', 'REVIEW_FOR_DISPOSAL', 'BUDGET_PRIORITY'];

Color _recColor(String rec) => switch (rec) {
      'MAINTAIN' => AppTheme.brand,
      'REPAIR' => AppTheme.statusMaintenance,
      'MONITOR' => AppTheme.statusAssigned,
      'REVIEW_FOR_DISPOSAL' => AppTheme.statusDisposed,
      'BUDGET_PRIORITY' => Colors.deepOrange,
      _ => Colors.grey,
    };

String _recLabel(String rec) => switch (rec) {
      'MAINTAIN' => 'Maintain',
      'REPAIR' => 'Repair',
      'MONITOR' => 'Monitor',
      'REVIEW_FOR_DISPOSAL' => 'Review for Disposal',
      'BUDGET_PRIORITY' => 'Budget Priority',
      _ => rec,
    };

class _DashboardStatsSection extends ConsumerWidget {
  const _DashboardStatsSection();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final statsAsync = ref.watch(dashboardStatsProvider);
    final isAdmin = ref.watch(authProvider).value?.isAdmin ?? false;

    return statsAsync.when(
      loading: () => Shimmer(
        child: Column(
          children: [
            const _OverviewPanelSkeleton(),
            const SizedBox(height: 10),
            const _DistributionCardSkeleton(rows: 3),
            const SizedBox(height: 10),
            const _DistributionCardSkeleton(rows: 3),
            const SizedBox(height: 10),
            const _DistributionCardSkeleton(rows: 2),
            if (isAdmin) ...[
              const SizedBox(height: 10),
              const _DigestCardSkeleton(),
            ],
          ],
        ),
      ),
      error: (e, _) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 16),
        child: Text('Failed to load stats: $e', style: TextStyle(color: context.colors.textTertiary, fontSize: 13)),
      ),
      data: (stats) => Column(
        children: [
          _OverviewPanel(
            totalAssets: stats.totalAssets,
            totalValue: stats.totalValue,
            underMaintenance: stats.underMaintenance,
            disposed: stats.disposed,
          ),
          const SizedBox(height: 10),
          _DistributionCard(
            title: 'Asset Condition',
            total: stats.totalAssets,
            dist: stats.conditionDist,
            order: _conditionOrder,
            colorOf: (v) => StatusBadge.condition(v).color,
            labelOf: (v) => StatusBadge.condition(v).label,
          ),
          const SizedBox(height: 10),
          _DistributionCard(
            title: 'Lifecycle Status',
            total: stats.totalAssets,
            dist: stats.lifecycleDist,
            order: _lifecycleOrder,
            colorOf: (v) => StatusBadge.lifecycle(v).color,
            labelOf: (v) => StatusBadge.lifecycle(v).label,
          ),
          const SizedBox(height: 10),
          const _AiRecommendationSummaryCard(),
          if (isAdmin) ...[
            const SizedBox(height: 10),
            const _AuditLogDigestCard(),
          ],
        ],
      ),
    );
  }
}

class _AiRecommendationSummaryCard extends ConsumerWidget {
  const _AiRecommendationSummaryCard();

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final summaryAsync = ref.watch(aiRecommendationSummaryProvider);

    return summaryAsync.when(
      loading: () => const Shimmer(child: _DistributionCardSkeleton(rows: 3)),
      error: (e, _) => Card(
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Text('Failed to load AI recommendations: $e',
              style: TextStyle(color: context.colors.textSecondary, fontSize: 12)),
        ),
      ),
      data: (dist) => _DistributionCard(
        title: 'AI Recommendations',
        total: dist.values.fold(0, (a, b) => a + b),
        dist: dist,
        order: _recommendationOrder,
        colorOf: _recColor,
        labelOf: _recLabel,
        emptyMessage: 'No AI recommendations generated yet.',
      ),
    );
  }
}

class _AuditLogDigestCard extends ConsumerStatefulWidget {
  const _AuditLogDigestCard();

  @override
  ConsumerState<_AuditLogDigestCard> createState() => _AuditLogDigestCardState();
}

class _AuditLogDigestCardState extends ConsumerState<_AuditLogDigestCard> {
  bool _generating = false;

  Future<void> _generate() async {
    setState(() => _generating = true);
    try {
      await ref.read(auditLogDigestServiceProvider).generate();
      ref.invalidate(auditLogDigestProvider);
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text(e.toString()),
          backgroundColor: Colors.red.shade800,
        ));
      }
    } finally {
      if (mounted) setState(() => _generating = false);
    }
  }

  String _fmtDateTime(String raw) {
    try {
      final dt = DateTime.parse(raw);
      return '${dt.year}-${dt.month.toString().padLeft(2, '0')}-${dt.day.toString().padLeft(2, '0')} '
          '${dt.hour.toString().padLeft(2, '0')}:${dt.minute.toString().padLeft(2, '0')}';
    } catch (_) {
      return raw;
    }
  }

  @override
  Widget build(BuildContext context) {
    final digestAsync = ref.watch(auditLogDigestProvider);

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                const Icon(Icons.auto_awesome_rounded, size: 16, color: AppTheme.brand),
                const SizedBox(width: 8),
                Expanded(
                  child: Text('AI ACTIVITY DIGEST',
                      style: TextStyle(color: context.colors.textTertiary, fontSize: 12,
                          fontWeight: FontWeight.w600, letterSpacing: 0.8)),
                ),
                _generating
                    ? const SizedBox(width: 16, height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.brand))
                    : IconButton(
                        icon: Icon(Icons.refresh_rounded, size: 18, color: context.colors.textTertiary),
                        tooltip: 'Generate digest',
                        onPressed: _generate,
                        visualDensity: VisualDensity.compact,
                        constraints: const BoxConstraints(minWidth: 44, minHeight: 44),
                      ),
              ],
            ),
            const SizedBox(height: 12),
            digestAsync.when(
              loading: () => const Shimmer(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Bone(width: double.infinity, height: 13),
                    SizedBox(height: 8),
                    Bone(width: double.infinity, height: 13),
                    SizedBox(height: 8),
                    Bone(width: 160, height: 13),
                    SizedBox(height: 12),
                    Bone(width: 140, height: 11),
                  ],
                ),
              ),
              error: (e, _) => Text(e.toString(), style: TextStyle(color: context.colors.textSecondary, fontSize: 12)),
              data: (digest) {
                if (digest == null) {
                  return Text('No digest yet. Tap refresh to generate one.',
                      style: TextStyle(color: context.colors.textSecondary, fontSize: 13));
                }
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(digest.digest, style: TextStyle(color: context.colors.textSecondary, fontSize: 13, height: 1.5)),
                    const SizedBox(height: 10),
                    Text(
                      'Covers ${digest.coveredEntries} recent entries · generated ${_fmtDateTime(digest.generatedAt)}',
                      style: TextStyle(color: context.colors.textSecondary, fontSize: 11),
                    ),
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

class _OverviewPanel extends StatelessWidget {
  final int totalAssets;
  final double totalValue;
  final int underMaintenance;
  final int disposed;

  const _OverviewPanel({
    required this.totalAssets,
    required this.totalValue,
    required this.underMaintenance,
    required this.disposed,
  });

  @override
  Widget build(BuildContext context) {
    final width = MediaQuery.sizeOf(context).width;
    final isMediumOrLarger = width >= 600;
    final heroFontSize = isMediumOrLarger ? 52.0 : 40.0;
    final secondaryFontSize = isMediumOrLarger ? 30.0 : 24.0;

    return Container(
      padding: const EdgeInsets.all(20),
      decoration: BoxDecoration(
        color: AppTheme.brandButton,
        borderRadius: BorderRadius.circular(20),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Text('ASSET OVERVIEW',
                  style: TextStyle(
                      color: Colors.white.withValues(alpha: 0.7),
                      fontSize: 12,
                      fontWeight: FontWeight.w600,
                      letterSpacing: 1)),
              const Spacer(),
              Icon(Icons.inventory_2_rounded, color: Colors.white.withValues(alpha: 0.5), size: 18),
            ],
          ),
          const SizedBox(height: 18),
          Row(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(totalAssets.toString(),
                      style: TextStyle(
                          color: Colors.white, fontWeight: FontWeight.w800, fontSize: heroFontSize, height: 1)),
                  const SizedBox(height: 4),
                  Text('Total Assets', style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 13)),
                ],
              ),
              const SizedBox(width: 20),
              Container(width: 1, height: 40, color: Colors.white.withValues(alpha: 0.2)),
              const SizedBox(width: 20),
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(_fmtMoney(totalValue),
                        style: TextStyle(
                            color: Colors.white, fontWeight: FontWeight.w700, fontSize: secondaryFontSize, height: 1),
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis),
                    const SizedBox(height: 4),
                    Text('Asset Value', style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 13)),
                  ],
                ),
              ),
            ],
          ),
          const SizedBox(height: 18),
          Container(height: 1, color: Colors.white.withValues(alpha: 0.15)),
          const SizedBox(height: 14),
          Row(
            children: [
              Expanded(
                child: _MiniStat(
                    icon: Icons.build_rounded, label: 'Under Maintenance', value: underMaintenance.toString()),
              ),
              const SizedBox(width: 10),
              Expanded(
                child: _MiniStat(icon: Icons.delete_rounded, label: 'Disposed', value: disposed.toString()),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

class _MiniStat extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;

  const _MiniStat({required this.icon, required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 8),
      decoration: BoxDecoration(
        color: Colors.white.withValues(alpha: 0.1),
        borderRadius: BorderRadius.circular(10),
      ),
      child: Row(
        children: [
          Icon(icon, color: Colors.white.withValues(alpha: 0.85), size: 16),
          const SizedBox(width: 8),
          Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 15)),
          const SizedBox(width: 6),
          Expanded(
            child: Text(label,
                style: TextStyle(color: Colors.white.withValues(alpha: 0.7), fontSize: 11),
                maxLines: 1,
                overflow: TextOverflow.ellipsis),
          ),
        ],
      ),
    );
  }
}

class _OverviewPanelSkeleton extends StatelessWidget {
  const _OverviewPanelSkeleton();

  @override
  Widget build(BuildContext context) {
    return const Card(
      child: Padding(
        padding: EdgeInsets.all(20),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Bone(width: 110, height: 12),
            SizedBox(height: 18),
            Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                Bone(width: 70, height: 40),
                SizedBox(width: 20),
                Bone(width: 90, height: 26),
              ],
            ),
            SizedBox(height: 18),
            Bone(width: double.infinity, height: 1),
            SizedBox(height: 14),
            Row(
              children: [
                Expanded(child: Bone(width: double.infinity, height: 36, borderRadius: BorderRadius.all(Radius.circular(10)))),
                SizedBox(width: 10),
                Expanded(child: Bone(width: double.infinity, height: 36, borderRadius: BorderRadius.all(Radius.circular(10)))),
              ],
            ),
          ],
        ),
      ),
    );
  }
}

class _DistributionCardSkeleton extends StatelessWidget {
  final int rows;
  const _DistributionCardSkeleton({this.rows = 3});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Bone(width: 120, height: 14),
            const SizedBox(height: 14),
            const Bone(width: double.infinity, height: 8, borderRadius: BorderRadius.all(Radius.circular(4))),
            const SizedBox(height: 14),
            for (var i = 0; i < rows; i++) ...[
              Row(
                children: [
                  const Bone(width: 8, height: 8, borderRadius: BorderRadius.all(Radius.circular(4))),
                  const SizedBox(width: 8),
                  Expanded(child: Bone(width: 80 + (i * 20).toDouble(), height: 12)),
                  const SizedBox(width: 8),
                  const Bone(width: 20, height: 12),
                ],
              ),
              if (i != rows - 1) const SizedBox(height: 10),
            ],
          ],
        ),
      ),
    );
  }
}

class _DigestCardSkeleton extends StatelessWidget {
  const _DigestCardSkeleton();

  @override
  Widget build(BuildContext context) {
    return const Card(
      child: Padding(
        padding: EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Bone(width: 130, height: 12),
            SizedBox(height: 14),
            Bone(width: double.infinity, height: 13),
            SizedBox(height: 8),
            Bone(width: double.infinity, height: 13),
            SizedBox(height: 8),
            Bone(width: 160, height: 13),
          ],
        ),
      ),
    );
  }
}

class _DistributionCard extends StatelessWidget {
  final String title;
  final int total;
  final Map<String, int> dist;
  final List<String> order;
  final Color Function(String) colorOf;
  final String Function(String) labelOf;
  final String emptyMessage;

  const _DistributionCard({
    required this.title,
    required this.total,
    required this.dist,
    required this.order,
    required this.colorOf,
    required this.labelOf,
    this.emptyMessage = 'No assets registered yet.',
  });

  @override
  Widget build(BuildContext context) {
    final present = order.where((k) => (dist[k] ?? 0) > 0).toList();

    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text(title, style: TextStyle(color: context.colors.textPrimary, fontWeight: FontWeight.w600, fontSize: 14)),
            const SizedBox(height: 12),
            if (total == 0)
              Text(emptyMessage, style: TextStyle(color: context.colors.textSecondary, fontSize: 12))
            else ...[
              ClipRRect(
                borderRadius: BorderRadius.circular(4),
                child: SizedBox(
                  height: 8,
                  child: Row(
                    children: present.map((k) {
                      final count = dist[k] ?? 0;
                      return Expanded(
                        flex: count,
                        child: Container(color: colorOf(k)),
                      );
                    }).toList(),
                  ),
                ),
              ),
              const SizedBox(height: 12),
              ...present.map((k) {
                final count = dist[k] ?? 0;
                final pct = total == 0 ? 0 : (count * 100 / total).round();
                return Padding(
                  padding: const EdgeInsets.only(bottom: 6),
                  child: Row(
                    children: [
                      Container(
                        width: 8, height: 8,
                        decoration: BoxDecoration(color: colorOf(k), shape: BoxShape.circle),
                      ),
                      const SizedBox(width: 8),
                      Expanded(
                        child: Text(labelOf(k), style: TextStyle(color: context.colors.textTertiary, fontSize: 12)),
                      ),
                      Text('$count', style: TextStyle(color: context.colors.textPrimary, fontSize: 12, fontWeight: FontWeight.w600)),
                      const SizedBox(width: 6),
                      SizedBox(
                        width: 32,
                        child: Text('$pct%', textAlign: TextAlign.right,
                            style: TextStyle(color: context.colors.textSecondary, fontSize: 11)),
                      ),
                    ],
                  ),
                );
              }),
            ],
          ],
        ),
      ),
    );
  }
}
