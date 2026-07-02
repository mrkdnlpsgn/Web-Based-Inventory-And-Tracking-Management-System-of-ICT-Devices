import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../model/maintenance_model.dart';
import '../provider/maintenance_provider.dart';
import '../screens/maintenance_form_screen.dart';
import '../data/maintenance_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/delete_dialog.dart';
import '../../auth/provider/auth_provider.dart';

class MaintenanceDetailScreen extends ConsumerWidget {
  final int maintenanceId;
  const MaintenanceDetailScreen({super.key, required this.maintenanceId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(maintenanceDetailProvider(maintenanceId));
    final isAdmin = ref.watch(authProvider).value?.isAdmin ?? false;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Maintenance Detail'),
        actions: [
          if (isAdmin && async.value != null) ...[
            IconButton(
              icon: const Icon(Icons.edit_outlined),
              onPressed: () async {
                final result = await Navigator.push(context,
                    MaterialPageRoute(builder: (_) => MaintenanceFormScreen(maintenance: async.value)));
                if (result == true) ref.invalidate(maintenanceDetailProvider(maintenanceId));
              },
            ),
            IconButton(
              icon: const Icon(Icons.delete_outline_rounded, color: Colors.red),
              onPressed: () async {
                final reason = await showDeleteDialog(context);
                if (reason == null || !context.mounted) return;
                try {
                  await MaintenanceService().delete(maintenanceId, reason: reason);
                  ref.invalidate(maintenancePagedProvider(ref.read(maintenanceSearchProvider)));
                  if (context.mounted) context.pop();
                } catch (e) {
                  if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(e.toString()), backgroundColor: Colors.red.shade800));
                }
              },
            ),
          ],
        ],
      ),
      body: async.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.brand)),
        error: (err, _) => Center(child: Text(err.toString(), style: const TextStyle(color: Colors.white54))),
        data: (item) => _Body(item: item),
      ),
    );
  }
}

class _Body extends StatelessWidget {
  final MaintenanceModel item;
  const _Body({required this.item});

  Color get _statusColor => switch (item.status) {
        'COMPLETED' => AppTheme.brand,
        'ONGOING' => AppTheme.statusMaintenance,
        _ => AppTheme.statusAssigned,
      };

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
                    _chip(item.maintenanceType.replaceAll('_', ' '), AppTheme.statusAssigned),
                    const SizedBox(width: 8),
                    _chip(item.status, _statusColor),
                  ],
                ),
                const SizedBox(height: 10),
                Text(item.asset.description,
                    style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(item.asset.propertyNumber,
                    style: const TextStyle(color: AppTheme.brand, fontSize: 13)),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        _card('Maintenance Info', [
          _row('Date', item.maintenanceDate),
          if (item.assignedTo != null) _row('Assigned To', item.assignedTo!),
          if (item.cost != null) _row('Cost', '₱${item.cost!.toStringAsFixed(2)}'),
          _row('Recorded By', item.recordedBy.fullName),
        ]),
        const SizedBox(height: 12),
        _card('Findings', [], body: item.findings),
        const SizedBox(height: 12),
        _card('Actions Taken', [], body: item.actionsTaken),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _chip(String label, Color color) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(6),
          border: Border.all(color: color.withValues(alpha: 0.4)),
        ),
        child: Text(label, style: TextStyle(color: color, fontSize: 12, fontWeight: FontWeight.w600)),
      );

  Widget _card(String title, List<Widget> rows, {String? body}) => Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(title,
                  style: const TextStyle(
                      color: Colors.white54, fontSize: 12, fontWeight: FontWeight.w600, letterSpacing: 0.8)),
              const SizedBox(height: 12),
              if (body != null)
                Text(body, style: const TextStyle(color: Colors.white70, height: 1.5))
              else
                ...rows,
            ],
          ),
        ),
      );

  Widget _row(String label, String value) => Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: Row(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            SizedBox(width: 140, child: Text(label, style: const TextStyle(color: Colors.white38, fontSize: 13))),
            Expanded(child: Text(value, style: const TextStyle(color: Colors.white, fontSize: 13))),
          ],
        ),
      );
}
