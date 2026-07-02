import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../features/assets/model/asset_model.dart';
import '../../features/assets/provider/asset_provider.dart';
import '../../core/theme/app_theme.dart';

Future<AssetModel?> showAssetPicker(BuildContext context, WidgetRef ref) {
  return showModalBottomSheet<AssetModel>(
    context: context,
    isScrollControlled: true,
    backgroundColor: AppTheme.surface,
    shape: const RoundedRectangleBorder(
      borderRadius: BorderRadius.vertical(top: Radius.circular(16)),
    ),
    builder: (ctx) => _AssetPickerSheet(ref: ref),
  );
}

class _AssetPickerSheet extends ConsumerStatefulWidget {
  final WidgetRef ref;
  const _AssetPickerSheet({required this.ref});

  @override
  ConsumerState<_AssetPickerSheet> createState() => _AssetPickerSheetState();
}

class _AssetPickerSheetState extends ConsumerState<_AssetPickerSheet> {
  final _ctrl = TextEditingController();

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final search = ref.watch(assetSearchProvider);
    final state = ref.watch(assetsPagedProvider(search));

    return DraggableScrollableSheet(
      initialChildSize: 0.75,
      maxChildSize: 0.95,
      minChildSize: 0.5,
      expand: false,
      builder: (_, scrollCtrl) => Column(
        children: [
          Container(
            margin: const EdgeInsets.symmetric(vertical: 8),
            width: 40, height: 4,
            decoration: BoxDecoration(color: Colors.white24, borderRadius: BorderRadius.circular(2)),
          ),
          Padding(
            padding: const EdgeInsets.fromLTRB(16, 4, 16, 12),
            child: TextField(
              controller: _ctrl,
              autofocus: true,
              decoration: const InputDecoration(
                hintText: 'Search assets...',
                hintStyle: TextStyle(color: Colors.white38, fontSize: 14),
                prefixIcon: Icon(Icons.search_rounded, size: 20),
                contentPadding: EdgeInsets.symmetric(vertical: 10),
              ),
              onChanged: (v) => ref.read(assetSearchProvider.notifier).state = v,
            ),
          ),
          Expanded(
            child: state.isLoading
                ? const Center(child: CircularProgressIndicator(color: AppTheme.brand))
                : state.error != null && state.items.isEmpty
                    ? Center(child: Text(state.error.toString(), style: const TextStyle(color: Colors.white54)))
                    : NotificationListener<ScrollNotification>(
                        onNotification: (notification) {
                          if (notification.metrics.pixels >= notification.metrics.maxScrollExtent - 200) {
                            ref.read(assetsPagedProvider(search).notifier).loadMore();
                          }
                          return false;
                        },
                        child: ListView.builder(
                          controller: scrollCtrl,
                          itemCount: state.items.length + (state.hasMore ? 1 : 0),
                          itemBuilder: (_, i) {
                            if (i >= state.items.length) {
                              return const Padding(
                                padding: EdgeInsets.symmetric(vertical: 16),
                                child: Center(
                                  child: SizedBox(
                                    width: 20,
                                    height: 20,
                                    child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.brand),
                                  ),
                                ),
                              );
                            }
                            final asset = state.items[i];
                            return ListTile(
                              title: Text(asset.description, style: const TextStyle(color: Colors.white, fontSize: 14)),
                              subtitle: Text(asset.propertyNumber, style: const TextStyle(color: AppTheme.brand, fontSize: 12)),
                              onTap: () {
                                ref.read(assetSearchProvider.notifier).state = '';
                                Navigator.pop(context, asset);
                              },
                            );
                          },
                        ),
                      ),
          ),
        ],
      ),
    );
  }
}
