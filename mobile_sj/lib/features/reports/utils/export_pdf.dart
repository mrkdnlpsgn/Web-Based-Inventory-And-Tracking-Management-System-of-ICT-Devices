import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../model/report_definition.dart';

Future<void> exportPdf(ReportDefinition report, List<dynamic> rows) async {
  final exportRows = report.extraRows != null ? report.extraRows!(rows) : rows;
  final doc = pw.Document();

  final headers = report.columns.map((c) => c.label).toList();
  final data = exportRows.map((row) => report.columns.map((c) => c.valueOf(row)).toList()).toList();

  doc.addPage(
    pw.MultiPage(
      pageFormat: PdfPageFormat.a4.landscape,
      margin: const pw.EdgeInsets.all(24),
      header: (context) => pw.Column(
        crossAxisAlignment: pw.CrossAxisAlignment.start,
        children: [
          pw.Text(report.title, style: pw.TextStyle(fontSize: 16, fontWeight: pw.FontWeight.bold)),
          pw.SizedBox(height: 3),
          pw.Text(
            'San Jose Municipal Hall · ICT Inventory & Tracking Management System · '
            'Generated: ${DateTime.now().toString().substring(0, 16)} · ${rows.length} record(s)',
            style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey600),
          ),
          pw.SizedBox(height: 10),
          pw.Divider(color: PdfColors.grey400),
        ],
      ),
      build: (context) => [
        pw.TableHelper.fromTextArray(
          headers: headers,
          data: data,
          headerStyle: pw.TextStyle(fontSize: 8, fontWeight: pw.FontWeight.bold, color: PdfColors.grey800),
          headerDecoration: const pw.BoxDecoration(color: PdfColors.grey200),
          cellStyle: const pw.TextStyle(fontSize: 7.5),
          cellAlignment: pw.Alignment.centerLeft,
          border: pw.TableBorder.all(color: PdfColors.grey300, width: 0.5),
          cellPadding: const pw.EdgeInsets.symmetric(horizontal: 5, vertical: 4),
        ),
        if (report.certification != null && report.certification!.isNotEmpty) ...[
          pw.SizedBox(height: 36),
          pw.Wrap(
            spacing: 24,
            runSpacing: 20,
            children: report.certification!
                .map((role) => pw.Container(
                      width: 150,
                      child: pw.Column(
                        crossAxisAlignment: pw.CrossAxisAlignment.center,
                        children: [
                          pw.Container(
                            width: 150,
                            decoration: const pw.BoxDecoration(
                              border: pw.Border(bottom: pw.BorderSide(color: PdfColors.black, width: 0.75)),
                            ),
                            height: 28,
                          ),
                          pw.SizedBox(height: 3),
                          pw.Text(role,
                              textAlign: pw.TextAlign.center,
                              style: const pw.TextStyle(fontSize: 7, color: PdfColors.grey800)),
                        ],
                      ),
                    ))
                .toList(),
          ),
        ],
      ],
      footer: (context) => pw.Padding(
        padding: const pw.EdgeInsets.only(top: 8),
        child: pw.Text(
          'This is a system-generated report. © ${DateTime.now().year} San Jose Municipal Hall.',
          style: const pw.TextStyle(fontSize: 7, color: PdfColors.grey500),
        ),
      ),
    ),
  );

  await Printing.layoutPdf(onLayout: (format) async => doc.save());
}
