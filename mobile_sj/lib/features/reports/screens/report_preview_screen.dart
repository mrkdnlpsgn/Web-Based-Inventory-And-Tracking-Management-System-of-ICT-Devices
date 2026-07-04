import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../../core/theme/app_theme.dart';
import '../provider/reports_provider.dart';
import '../utils/export_excel.dart';
import '../utils/export_pdf.dart';

const _kPreviewRowLimit = 20;

class ReportPreviewScreen extends ConsumerStatefulWidget {
  final String reportId;
  const ReportPreviewScreen({super.key, required this.reportId});

  @override
  ConsumerState<ReportPreviewScreen> createState() => _ReportPreviewScreenState();
}

class _ReportPreviewScreenState extends ConsumerState<ReportPreviewScreen> {
  bool _exporting = false;

  Future<void> _export(Future<void> Function() action) async {
    setState(() => _exporting = true);
    try {
      await action();
    } catch (e) {
      if (mounted) {
        ScaffoldMessenger.of(context).showSnackBar(SnackBar(
          content: Text('Export failed: $e'),
          backgroundColor: Colors.red.shade800,
        ));
      }
    } finally {
      if (mounted) setState(() => _exporting = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final report = ref.watch(reportDefinitionsProvider).firstWhere((r) => r.id == widget.reportId);
    final dataAsync = ref.watch(reportDataProvider(widget.reportId));

    return Scaffold(
      appBar: AppBar(
        title: Text(report.title),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => ref.invalidate(reportDataProvider(widget.reportId)),
          ),
        ],
      ),
      body: dataAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.brand)),
        error: (e, _) => Center(
          child: Padding(
            padding: const EdgeInsets.all(24),
            child: Text('Failed to load report: $e',
                style: const TextStyle(color: Colors.white54), textAlign: TextAlign.center),
          ),
        ),
        data: (rows) {
          if (rows.isEmpty) {
            return const Center(
              child: Text('No data available for this report.', style: TextStyle(color: Colors.white38)),
            );
          }

          final preview = rows.take(_kPreviewRowLimit).toList();

          return Column(
            children: [
              Padding(
                padding: const EdgeInsets.fromLTRB(16, 16, 16, 8),
                child: Row(
                  children: [
                    Text('${rows.length} ${rows.length == 1 ? 'record' : 'records'}',
                        style: const TextStyle(color: Colors.white70, fontWeight: FontWeight.w600, fontSize: 14)),
                    if (rows.length > _kPreviewRowLimit) ...[
                      const SizedBox(width: 8),
                      const Text('(showing first $_kPreviewRowLimit)',
                          style: TextStyle(color: Colors.white38, fontSize: 12)),
                    ],
                  ],
                ),
              ),
              Expanded(
                child: SingleChildScrollView(
                  padding: const EdgeInsets.fromLTRB(16, 0, 16, 16),
                  scrollDirection: Axis.horizontal,
                  child: SingleChildScrollView(
                    child: DataTable(
                      headingRowColor: WidgetStateProperty.all(AppTheme.surface),
                      columns: report.columns
                          .map((c) => DataColumn(
                              label: Text(c.label,
                                  style: const TextStyle(
                                      color: Colors.white54, fontWeight: FontWeight.w600, fontSize: 12))))
                          .toList(),
                      rows: preview
                          .map((row) => DataRow(
                                cells: report.columns
                                    .map((c) => DataCell(Text(c.valueOf(row),
                                        style: const TextStyle(color: Colors.white70, fontSize: 12))))
                                    .toList(),
                              ))
                          .toList(),
                    ),
                  ),
                ),
              ),
              if (_exporting) const LinearProgressIndicator(color: AppTheme.brand),
              DecoratedBox(
                decoration: const BoxDecoration(
                  color: AppTheme.surface,
                  border: Border(top: BorderSide(color: AppTheme.border)),
                ),
                child: SafeArea(
                  top: false,
                  child: Padding(
                    padding: const EdgeInsets.all(16),
                    child: Row(
                      children: [
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: _exporting ? null : () => _export(() => exportExcel(report, rows)),
                            icon: const Icon(Icons.grid_on_rounded, size: 18, color: Colors.greenAccent),
                            label: const Text('Export Excel'),
                          ),
                        ),
                        const SizedBox(width: 12),
                        Expanded(
                          child: OutlinedButton.icon(
                            onPressed: _exporting ? null : () => _export(() => exportPdf(report, rows)),
                            icon: const Icon(Icons.picture_as_pdf_outlined, size: 18, color: Colors.redAccent),
                            label: const Text('Print / PDF'),
                          ),
                        ),
                      ],
                    ),
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
