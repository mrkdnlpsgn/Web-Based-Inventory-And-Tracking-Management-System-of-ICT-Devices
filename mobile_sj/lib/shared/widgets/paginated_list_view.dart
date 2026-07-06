import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';
import '../provider/paginated_list_notifier.dart';
import 'skeleton.dart';
import 'error_state.dart';

class PaginatedListView<T> extends StatefulWidget {
  final PaginatedListState<T> state;
  final Widget Function(BuildContext context, T item, int index) itemBuilder;
  final VoidCallback onLoadMore;
  final Future<void> Function() onRefresh;
  final String emptyMessage;

  const PaginatedListView({
    super.key,
    required this.state,
    required this.itemBuilder,
    required this.onLoadMore,
    required this.onRefresh,
    required this.emptyMessage,
  });

  @override
  State<PaginatedListView<T>> createState() => _PaginatedListViewState<T>();
}

class _PaginatedListViewState<T> extends State<PaginatedListView<T>> {
  final _scrollCtrl = ScrollController();

  @override
  void initState() {
    super.initState();
    _scrollCtrl.addListener(_onScroll);
  }

  void _onScroll() {
    if (_scrollCtrl.position.pixels >= _scrollCtrl.position.maxScrollExtent - 200) {
      widget.onLoadMore();
    }
  }

  @override
  void dispose() {
    _scrollCtrl.removeListener(_onScroll);
    _scrollCtrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final s = widget.state;

    if (s.isLoading) {
      return const ListSkeleton();
    }

    if (s.error != null && s.items.isEmpty) {
      return ErrorState(message: s.error.toString(), onRetry: widget.onRefresh);
    }

    if (s.items.isEmpty) {
      return Center(child: Text(widget.emptyMessage, style: TextStyle(color: context.colors.textTertiary)));
    }

    return RefreshIndicator(
      color: AppTheme.brand,
      onRefresh: widget.onRefresh,
      child: ListView.separated(
        controller: _scrollCtrl,
        padding: const EdgeInsets.fromLTRB(16, 16, 16, 80),
        itemCount: s.items.length + (s.hasMore ? 1 : 0),
        separatorBuilder: (_, __) => const SizedBox(height: 10),
        itemBuilder: (context, i) {
          if (i >= s.items.length) {
            if (s.loadMoreError != null) {
              return Padding(
                padding: const EdgeInsets.symmetric(vertical: 16),
                child: Center(
                  child: Column(
                    mainAxisSize: MainAxisSize.min,
                    children: [
                      Text("Couldn't load more.",
                          style: TextStyle(color: context.colors.textTertiary, fontSize: 13)),
                      const SizedBox(height: 6),
                      TextButton.icon(
                        onPressed: widget.onLoadMore,
                        icon: const Icon(Icons.refresh_rounded, size: 16),
                        label: const Text('Retry'),
                        style: TextButton.styleFrom(foregroundColor: AppTheme.brand),
                      ),
                    ],
                  ),
                ),
              );
            }
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
          return widget.itemBuilder(context, s.items[i], i);
        },
      ),
    );
  }
}
