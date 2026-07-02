import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../model/disposal_model.dart';
import '../provider/disposal_provider.dart';
import '../screens/disposal_form_screen.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/paginated_list_view.dart';
import '../../../features/auth/provider/auth_provider.dart';

class DisposalListScreen extends ConsumerStatefulWidget {
  const DisposalListScreen({super.key});

  @override
  ConsumerState<DisposalListScreen> createState() => _DisposalListScreenState();
}

class _DisposalListScreenState extends ConsumerState<DisposalListScreen> {
  final _searchCtrl = TextEditingController();

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final search = ref.watch(disposalSearchProvider);
    final state = ref.watch(disposalPagedProvider(search));
    final isAdmin = ref.watch(authProvider).value?.isAdmin ?? false;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Disposal'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => ref.invalidate(disposalPagedProvider(search)),
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(64),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: TextField(
              controller: _searchCtrl,
              decoration: InputDecoration(
                hintText: 'Search disposal records...',
                hintStyle: const TextStyle(color: Colors.white38, fontSize: 14),
                prefixIcon: const Icon(Icons.search_rounded, size: 20),
                suffixIcon: _searchCtrl.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded, size: 18),
                        onPressed: () {
                          _searchCtrl.clear();
                          ref.read(disposalSearchProvider.notifier).state = '';
                        },
                      )
                    : null,
                contentPadding: const EdgeInsets.symmetric(vertical: 10),
              ),
              onChanged: (v) => ref.read(disposalSearchProvider.notifier).state = v,
            ),
          ),
        ),
      ),
      floatingActionButton: isAdmin
          ? FloatingActionButton(
              backgroundColor: AppTheme.brand,
              child: const Icon(Icons.add_rounded, color: Colors.white),
              onPressed: () async {
                final result = await Navigator.push(context,
                    MaterialPageRoute(builder: (_) => const DisposalFormScreen()));
                if (result == true) ref.invalidate(disposalPagedProvider(search));
              },
            )
          : null,
      body: PaginatedListView<DisposalModel>(
        state: state,
        emptyMessage: 'No disposal records.',
        onLoadMore: () => ref.read(disposalPagedProvider(search).notifier).loadMore(),
        onRefresh: () => ref.read(disposalPagedProvider(search).notifier).refresh(),
        itemBuilder: (context, item, i) => _DisposalCard(
          item: item,
          onTap: () => context.push('/disposal/${item.id}'),
        ),
      ),
    );
  }
}

class _DisposalCard extends StatelessWidget {
  final DisposalModel item;
  final VoidCallback onTap;
  const _DisposalCard({required this.item, required this.onTap});

  Color get _statusColor => switch (item.disposalStatus) {
        'COMPLETED' => AppTheme.brand,
        'APPROVED' => AppTheme.statusAssigned,
        _ => AppTheme.statusMaintenance,
      };

  Color get _methodColor => switch (item.recommendedMethod) {
        'AUCTION' => AppTheme.statusMaintenance,
        'DESTRUCTION' => AppTheme.statusDisposed,
        'DONATION' => AppTheme.brand,
        _ => AppTheme.statusAssigned,
      };

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
                  _chip(item.recommendedMethod, _methodColor),
                  const Spacer(),
                  _chip(item.disposalStatus, _statusColor),
                ],
              ),
              const SizedBox(height: 8),
              Text(item.asset.description,
                  style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w500),
                  maxLines: 1, overflow: TextOverflow.ellipsis),
              const SizedBox(height: 4),
              Text(item.asset.propertyNumber, style: const TextStyle(color: AppTheme.brand, fontSize: 12)),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.calendar_today_outlined, size: 13, color: Colors.white38),
                  const SizedBox(width: 4),
                  Text(item.inspectionDate, style: const TextStyle(color: Colors.white54, fontSize: 12)),
                  if (item.approvedBy != null) ...[
                    const SizedBox(width: 12),
                    const Icon(Icons.verified_outlined, size: 13, color: Colors.white38),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(item.approvedBy!,
                          style: const TextStyle(color: Colors.white54, fontSize: 12),
                          overflow: TextOverflow.ellipsis),
                    ),
                  ],
                ],
              ),
            ],
          ),
        ),
      ),
    );
  }

  Widget _chip(String label, Color color) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(5),
          border: Border.all(color: color.withValues(alpha: 0.4)),
        ),
        child: Text(label, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w600)),
      );
}
