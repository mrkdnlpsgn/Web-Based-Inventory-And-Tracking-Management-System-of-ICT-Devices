import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/disposal_justification_service.dart';
import '../model/disposal_justification_model.dart';

final disposalJustificationServiceProvider =
    Provider<DisposalJustificationService>((ref) => DisposalJustificationService());

final disposalJustificationProvider =
    FutureProvider.autoDispose.family<DisposalJustificationModel?, int>((ref, disposalId) {
  return ref.watch(disposalJustificationServiceProvider).getLatest(disposalId);
});
