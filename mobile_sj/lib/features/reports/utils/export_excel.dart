import 'dart:io';
import 'package:excel/excel.dart' as xl;
import 'package:path_provider/path_provider.dart';
import 'package:share_plus/share_plus.dart';
import '../model/report_definition.dart';

Future<void> exportExcel(ReportDefinition report, List<dynamic> rows) async {
  final exportRows = report.extraRows != null ? report.extraRows!(rows) : rows;

  final workbook = xl.Excel.createExcel();
  final sheetName = report.title.length > 31 ? report.title.substring(0, 31) : report.title;
  final sheet = workbook[sheetName];
  workbook.setDefaultSheet(sheetName);

  sheet.appendRow(report.columns.map((c) => xl.TextCellValue(c.label)).toList());
  for (final row in exportRows) {
    sheet.appendRow(report.columns.map((c) => xl.TextCellValue(c.valueOf(row))).toList());
  }

  final bytes = workbook.save();
  if (bytes == null) return;

  final dir = await getTemporaryDirectory();
  final stamp = DateTime.now().toIso8601String().substring(0, 10);
  final safeTitle = report.title.replaceAll(RegExp(r'\s+'), '_');
  final file = File('${dir.path}/${safeTitle}_$stamp.xlsx');
  await file.writeAsBytes(bytes, flush: true);

  await SharePlus.instance.share(
    ShareParams(files: [XFile(file.path)], subject: report.title),
  );
}
