import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/report_definitions.dart';
import '../model/report_definition.dart';

final reportDefinitionsProvider = Provider<List<ReportDefinition>>((ref) => buildReportDefinitions());

final reportDataProvider = FutureProvider.autoDispose.family<List<dynamic>, String>((ref, reportId) {
  final report = ref.watch(reportDefinitionsProvider).firstWhere((r) => r.id == reportId);
  return report.load();
});
