import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../auth/provider/auth_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/status_badge.dart';
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
        title: const Text('Dashboard'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout_rounded),
            tooltip: 'Logout',
            onPressed: () async {
              final confirm = await showDialog<bool>(
                context: context,
                builder: (ctx) => AlertDialog(
                  backgroundColor: AppTheme.surface,
                  title: const Text('Sign Out'),
                  content: const Text('Are you sure you want to sign out?'),
                  actions: [
                    TextButton(
                      onPressed: () => Navigator.pop(ctx, false),
                      child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
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
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: AppTheme.brand.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: const Icon(Icons.person_rounded, color: AppTheme.brand, size: 24),
                  ),
                  const SizedBox(width: 12),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(user.username,
                          style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 15)),
                      Text(user.role,
                          style: const TextStyle(color: AppTheme.brand, fontSize: 12, fontWeight: FontWeight.w500)),
                    ],
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
        ],
        ),
      ),
    );
  }

  Widget _sectionLabel(BuildContext context, String label) => Text(
        label,
        style: Theme.of(context).textTheme.bodySmall?.copyWith(
              color: Colors.white38,
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
                        style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 15)),
                    const SizedBox(height: 2),
                    Text(subtitle, style: const TextStyle(color: Colors.white54, fontSize: 13)),
                  ],
                ),
              ),
              const Icon(Icons.chevron_right_rounded, color: Colors.white38),
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
      loading: () => const Padding(
        padding: EdgeInsets.symmetric(vertical: 24),
        child: Center(child: CircularProgressIndicator(color: AppTheme.brand)),
      ),
      error: (e, _) => Padding(
        padding: const EdgeInsets.symmetric(vertical: 16),
        child: Text('Failed to load stats: $e', style: const TextStyle(color: Colors.white54, fontSize: 13)),
      ),
      data: (stats) => Column(
        children: [
          GridView.count(
            crossAxisCount: 2,
            shrinkWrap: true,
            physics: const NeverScrollableScrollPhysics(),
            mainAxisSpacing: 10,
            crossAxisSpacing: 10,
            childAspectRatio: 1.7,
            children: [
              _StatTile(
                icon: Icons.inventory_2_outlined,
                label: 'Total Assets',
                value: stats.totalAssets.toString(),
                color: AppTheme.brand,
              ),
              _StatTile(
                icon: Icons.payments_outlined,
                label: 'Asset Value',
                value: _fmtMoney(stats.totalValue),
                color: AppTheme.statusAssigned,
              ),
              _StatTile(
                icon: Icons.build_outlined,
                label: 'Under Maintenance',
                value: stats.underMaintenance.toString(),
                color: AppTheme.statusMaintenance,
              ),
              _StatTile(
                icon: Icons.delete_outline_rounded,
                label: 'Disposed',
                value: stats.disposed.toString(),
                color: AppTheme.statusDisposed,
              ),
            ],
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
      loading: () => const Card(
        child: Padding(
          padding: EdgeInsets.all(24),
          child: Center(child: CircularProgressIndicator(color: AppTheme.brand)),
        ),
      ),
      error: (e, _) => Card(
        child: Padding(
          padding: const EdgeInsets.all(14),
          child: Text('Failed to load AI recommendations: $e',
              style: const TextStyle(color: Colors.white38, fontSize: 12)),
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
                const Expanded(
                  child: Text('AI ACTIVITY DIGEST',
                      style: TextStyle(color: Colors.white54, fontSize: 12,
                          fontWeight: FontWeight.w600, letterSpacing: 0.8)),
                ),
                _generating
                    ? const SizedBox(width: 16, height: 16,
                        child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.brand))
                    : IconButton(
                        icon: const Icon(Icons.refresh_rounded, size: 18, color: Colors.white54),
                        tooltip: 'Generate digest',
                        onPressed: _generate,
                        visualDensity: VisualDensity.compact,
                        padding: EdgeInsets.zero,
                        constraints: const BoxConstraints(),
                      ),
              ],
            ),
            const SizedBox(height: 12),
            digestAsync.when(
              loading: () => const Padding(
                padding: EdgeInsets.symmetric(vertical: 8),
                child: Center(child: CircularProgressIndicator(color: AppTheme.brand)),
              ),
              error: (e, _) => Text(e.toString(), style: const TextStyle(color: Colors.white38, fontSize: 12)),
              data: (digest) {
                if (digest == null) {
                  return const Text('No digest yet. Tap refresh to generate one.',
                      style: TextStyle(color: Colors.white38, fontSize: 13));
                }
                return Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(digest.digest, style: const TextStyle(color: Colors.white70, fontSize: 13, height: 1.5)),
                    const SizedBox(height: 10),
                    Text(
                      'Covers ${digest.coveredEntries} recent entries · generated ${_fmtDateTime(digest.generatedAt)}',
                      style: const TextStyle(color: Colors.white38, fontSize: 11),
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

class _StatTile extends StatelessWidget {
  final IconData icon;
  final String label;
  final String value;
  final Color color;

  const _StatTile({required this.icon, required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(14),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(icon, color: color, size: 20),
            const SizedBox(height: 8),
            Text(value,
                style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w700, fontSize: 18)),
            const SizedBox(height: 2),
            Text(label,
                style: const TextStyle(color: Colors.white54, fontSize: 11),
                maxLines: 1, overflow: TextOverflow.ellipsis),
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
            Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600, fontSize: 14)),
            const SizedBox(height: 12),
            if (total == 0)
              Text(emptyMessage, style: const TextStyle(color: Colors.white38, fontSize: 12))
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
                        child: Text(labelOf(k), style: const TextStyle(color: Colors.white54, fontSize: 12)),
                      ),
                      Text('$count', style: const TextStyle(color: Colors.white, fontSize: 12, fontWeight: FontWeight.w600)),
                      const SizedBox(width: 6),
                      SizedBox(
                        width: 32,
                        child: Text('$pct%', textAlign: TextAlign.right,
                            style: const TextStyle(color: Colors.white38, fontSize: 11)),
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
