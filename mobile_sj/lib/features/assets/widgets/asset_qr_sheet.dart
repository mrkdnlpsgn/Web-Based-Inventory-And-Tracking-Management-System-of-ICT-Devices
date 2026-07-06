import 'package:flutter/material.dart';
import 'package:qr_flutter/qr_flutter.dart';
import 'package:pdf/pdf.dart';
import 'package:pdf/widgets.dart' as pw;
import 'package:printing/printing.dart';
import '../../../core/theme/app_theme.dart';
import '../model/asset_model.dart';

/// The QR payload format shared with the web app's QR generator and this
/// app's QR Asset Lookup scanner (`asset:{id}:{propertyNumber}`) — keep all
/// three in sync if this ever changes.
String qrPayloadFor(AssetModel asset) => 'asset:${asset.id}:${asset.propertyNumber}';

Future<void> showAssetQrSheet(BuildContext context, AssetModel asset) {
  return showModalBottomSheet(
    context: context,
    isScrollControlled: true,
    showDragHandle: true,
    backgroundColor: context.colors.surface,
    shape: const RoundedRectangleBorder(borderRadius: BorderRadius.vertical(top: Radius.circular(20))),
    builder: (_) => _AssetQrSheet(asset: asset),
  );
}

class _AssetQrSheet extends StatefulWidget {
  final AssetModel asset;
  const _AssetQrSheet({required this.asset});

  @override
  State<_AssetQrSheet> createState() => _AssetQrSheetState();
}

class _AssetQrSheetState extends State<_AssetQrSheet> {
  bool _printing = false;

  Future<void> _print() async {
    setState(() => _printing = true);
    try {
      final asset = widget.asset;
      final doc = pw.Document();
      doc.addPage(
        pw.Page(
          pageFormat: const PdfPageFormat(226.8, 340.2), // ~80x120mm label
          margin: const pw.EdgeInsets.all(18),
          build: (context) => pw.Column(
            mainAxisAlignment: pw.MainAxisAlignment.center,
            crossAxisAlignment: pw.CrossAxisAlignment.center,
            children: [
              pw.Text('SAN JOSE GSO', style: pw.TextStyle(fontSize: 10, fontWeight: pw.FontWeight.bold)),
              pw.SizedBox(height: 2),
              pw.Text('ICT Asset Tag', style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey600)),
              pw.SizedBox(height: 16),
              pw.BarcodeWidget(
                barcode: pw.Barcode.qrCode(),
                data: qrPayloadFor(asset),
                width: 140,
                height: 140,
              ),
              pw.SizedBox(height: 14),
              pw.Text(asset.propertyNumber, style: pw.TextStyle(fontSize: 13, fontWeight: pw.FontWeight.bold)),
              pw.SizedBox(height: 4),
              pw.Text(asset.description,
                  textAlign: pw.TextAlign.center, style: const pw.TextStyle(fontSize: 8, color: PdfColors.grey700)),
            ],
          ),
        ),
      );
      await Printing.layoutPdf(onLayout: (format) async => doc.save());
    } finally {
      if (mounted) setState(() => _printing = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    final asset = widget.asset;
    return Padding(
      padding: const EdgeInsets.fromLTRB(24, 4, 24, 24),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text('Asset QR Code',
              style: TextStyle(color: context.colors.textPrimary, fontSize: 16, fontWeight: FontWeight.w600)),
          const SizedBox(height: 4),
          Text('Scan with QR Asset Lookup to check this asset\'s status',
              textAlign: TextAlign.center,
              style: TextStyle(color: context.colors.textTertiary, fontSize: 12)),
          const SizedBox(height: 20),
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              border: Border.all(color: context.colors.border),
            ),
            child: QrImageView(
              data: qrPayloadFor(asset),
              size: 220,
              backgroundColor: Colors.white,
            ),
          ),
          const SizedBox(height: 16),
          Text(asset.propertyNumber,
              style: const TextStyle(color: AppTheme.brand, fontWeight: FontWeight.w700, fontSize: 15)),
          const SizedBox(height: 2),
          Text(asset.description,
              textAlign: TextAlign.center, style: TextStyle(color: context.colors.textSecondary, fontSize: 13)),
          const SizedBox(height: 20),
          SizedBox(
            width: double.infinity,
            child: ElevatedButton.icon(
              onPressed: _printing ? null : _print,
              icon: _printing
                  ? const SizedBox(
                      width: 16, height: 16, child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                  : const Icon(Icons.print_outlined),
              label: Text(_printing ? 'Preparing…' : 'Print Label'),
            ),
          ),
        ],
      ),
    );
  }
}
