import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../../assets/data/asset_service.dart';
import '../../assets/model/asset_model.dart';

/// All assets, fetched once for client-side scan/manual-code lookup — mirrors the
/// web QR Scanner page, which also matches scanned codes against an in-memory list
/// rather than a dedicated backend lookup endpoint.
final qrLookupAssetsProvider = FutureProvider.autoDispose<List<AssetModel>>((ref) {
  return AssetService().getAll(size: 100000);
});

/// Parses a scanned/typed code and returns the matching asset, or null if none found.
/// Accepts the app's QR payload format `asset:{id}:{propertyNumber}`, a bare numeric
/// id, or a bare property number (manual entry).
AssetModel? findAssetForCode(List<AssetModel> assets, String rawCode) {
  final code = rawCode.trim();
  if (code.isEmpty) return null;

  String? id;
  String? propertyNumber;
  if (code.startsWith('asset:')) {
    final parts = code.split(':');
    if (parts.length >= 2) id = parts[1];
    if (parts.length >= 3) propertyNumber = parts[2];
  } else {
    id = code;
    propertyNumber = code;
  }

  for (final a in assets) {
    if (id != null && a.id.toString() == id) return a;
    if (propertyNumber != null && a.propertyNumber.toLowerCase() == propertyNumber.toLowerCase()) return a;
  }
  return null;
}
