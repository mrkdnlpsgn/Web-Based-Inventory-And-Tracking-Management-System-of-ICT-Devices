import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../model/maintenance_model.dart';
import '../provider/maintenance_provider.dart';
import '../screens/maintenance_form_screen.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/paginated_list_view.dart';
import '../../../features/auth/provider/auth_provider.dart';

class MaintenanceListScreen extends ConsumerStatefulWidget {
  const MaintenanceListScreen({super.key});

  @override
  ConsumerState<MaintenanceListScreen> createState() => _MaintenanceListScreenState();
}

class _MaintenanceListScreenState extends ConsumerState<MaintenanceListScreen> {
  final _searchCtrl = TextEditingController();

  @override
  void dispose() {
    _searchCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final search = ref.watch(maintenanceSearchProvider);
    final state = ref.watch(maintenancePagedProvider(search));
    final isAdmin = ref.watch(authProvider).value?.isAdmin ?? false;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Maintenance'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => ref.invalidate(maintenancePagedProvider(search)),
          ),
        ],
        bottom: PreferredSize(
          preferredSize: const Size.fromHeight(64),
          child: Padding(
            padding: const EdgeInsets.fromLTRB(16, 0, 16, 12),
            child: TextField(
              controller: _searchCtrl,
              decoration: InputDecoration(
                hintText: 'Search maintenance records...',
                hintStyle: const TextStyle(color: Colors.white38, fontSize: 14),
                prefixIcon: const Icon(Icons.search_rounded, size: 20),
                suffixIcon: _searchCtrl.text.isNotEmpty
                    ? IconButton(
                        icon: const Icon(Icons.clear_rounded, size: 18),
                        onPressed: () {
                          _searchCtrl.clear();
                          ref.read(maintenanceSearchProvider.notifier).state = '';
                        },
                      )
                    : null,
                contentPadding: const EdgeInsets.symmetric(vertical: 10),
              ),
              onChanged: (v) => ref.read(maintenanceSearchProvider.notifier).state = v,
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
                    MaterialPageRoute(builder: (_) => const MaintenanceFormScreen()));
                if (result == true) ref.invalidate(maintenancePagedProvider(search));
              },
            )
          : null,
      body: PaginatedListView<MaintenanceModel>(
        state: state,
        emptyMessage: 'No maintenance records.',
        onLoadMore: () => ref.read(maintenancePagedProvider(search).notifier).loadMore(),
        onRefresh: () => ref.read(maintenancePagedProvider(search).notifier).refresh(),
        itemBuilder: (context, item, i) => _MaintenanceCard(
          item: item,
          onTap: () => context.push('/maintenance/${item.id}'),
        ),
      ),
    );
  }
}

class _MaintenanceCard extends StatelessWidget {
  final MaintenanceModel item;
  final VoidCallback onTap;

  const _MaintenanceCard({required this.item, required this.onTap});

  Color get _statusColor => switch (item.status) {
        'COMPLETED' => AppTheme.brand,
        'ONGOING' => AppTheme.statusMaintenance,
        _ => AppTheme.statusAssigned,
      };

  Color get _typeColor => switch (item.maintenanceType) {
        'PREVENTIVE' => AppTheme.statusAssigned,
        'CORRECTIVE' => AppTheme.statusMaintenance,
        _ => Colors.purple,
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
                  _Badge(label: item.maintenanceType, color: _typeColor),
                  const Spacer(),
                  _Badge(label: item.status, color: _statusColor),
                ],
              ),
              const SizedBox(height: 8),
              Text(
                item.asset.description,
                style: const TextStyle(color: Colors.white, fontSize: 15, fontWeight: FontWeight.w500),
                maxLines: 1,
                overflow: TextOverflow.ellipsis,
              ),
              const SizedBox(height: 4),
              Text(
                item.asset.propertyNumber,
                style: const TextStyle(color: AppTheme.brand, fontSize: 12),
              ),
              const SizedBox(height: 8),
              Row(
                children: [
                  const Icon(Icons.calendar_today_outlined, size: 13, color: Colors.white38),
                  const SizedBox(width: 4),
                  Text(item.maintenanceDate, style: const TextStyle(color: Colors.white54, fontSize: 12)),
                  if (item.assignedTo != null) ...[
                    const SizedBox(width: 12),
                    const Icon(Icons.person_outline_rounded, size: 13, color: Colors.white38),
                    const SizedBox(width: 4),
                    Expanded(
                      child: Text(item.assignedTo!, style: const TextStyle(color: Colors.white54, fontSize: 12), overflow: TextOverflow.ellipsis),
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
}

class _Badge extends StatelessWidget {
  final String label;
  final Color color;
  const _Badge({required this.label, required this.color});

  String get _display => label.replaceAll('_', ' ');

  @override
  Widget build(BuildContext context) => Container(
        padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
        decoration: BoxDecoration(
          color: color.withValues(alpha: 0.15),
          borderRadius: BorderRadius.circular(5),
          border: Border.all(color: color.withValues(alpha: 0.4)),
        ),
        child: Text(_display, style: TextStyle(color: color, fontSize: 11, fontWeight: FontWeight.w600)),
      );
}
