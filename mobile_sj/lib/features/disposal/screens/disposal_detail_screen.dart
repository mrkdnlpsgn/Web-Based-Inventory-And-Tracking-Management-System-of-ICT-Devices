import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../model/disposal_model.dart';
import '../provider/disposal_provider.dart';
import '../screens/disposal_form_screen.dart';
import '../data/disposal_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/delete_dialog.dart';
import '../../auth/provider/auth_provider.dart';

class DisposalDetailScreen extends ConsumerWidget {
  final int disposalId;
  const DisposalDetailScreen({super.key, required this.disposalId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(disposalDetailProvider(disposalId));
    final isAdmin = ref.watch(authProvider).value?.isAdmin ?? false;
    return Scaffold(
      appBar: AppBar(
        title: const Text('Disposal Detail'),
        actions: [
          if (isAdmin && async.value != null) ...[
            IconButton(
              icon: const Icon(Icons.edit_outlined),
              onPressed: () async {
                final result = await Navigator.push(context,
                    MaterialPageRoute(builder: (_) => DisposalFormScreen(disposal: async.value)));
                if (result == true) ref.invalidate(disposalDetailProvider(disposalId));
              },
            ),
            IconButton(
              icon: const Icon(Icons.delete_outline_rounded, color: Colors.red),
              onPressed: () async {
                final reason = await showDeleteDialog(context);
                if (reason == null || !context.mounted) return;
                try {
                  await DisposalService().delete(disposalId, reason: reason);
                  ref.invalidate(disposalPagedProvider(ref.read(disposalSearchProvider)));
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
  final DisposalModel item;
  const _Body({required this.item});

  Color get _statusColor => switch (item.disposalStatus) {
        'COMPLETED' => AppTheme.brand,
        'APPROVED' => AppTheme.statusAssigned,
        _ => AppTheme.statusMaintenance,
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
                    _chip(item.recommendedMethod, AppTheme.statusDisposed),
                    const SizedBox(width: 8),
                    _chip(item.disposalStatus, _statusColor),
                  ],
                ),
                const SizedBox(height: 10),
                Text(item.asset.description,
                    style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
                const SizedBox(height: 4),
                Text(item.asset.propertyNumber, style: const TextStyle(color: AppTheme.brand, fontSize: 13)),
              ],
            ),
          ),
        ),
        const SizedBox(height: 12),
        _card('Disposal Info', [
          _row('Inspection Date', item.inspectionDate),
          _row('Method', item.recommendedMethod),
          _row('Status', item.disposalStatus),
          if (item.approvedBy != null) _row('Approved By', item.approvedBy!),
          _row('Recorded By', item.recordedBy.fullName),
        ]),
        const SizedBox(height: 12),
        _card('Reason for Disposal', [], body: item.reason),
        const SizedBox(height: 12),
        _card('Inspection Findings', [], body: item.inspectionFindings),
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
                  style: const TextStyle(color: Colors.white54, fontSize: 12,
                      fontWeight: FontWeight.w600, letterSpacing: 0.8)),
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
