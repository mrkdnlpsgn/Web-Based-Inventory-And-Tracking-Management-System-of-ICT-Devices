import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/audit_log_digest_service.dart';
import '../model/audit_log_digest_model.dart';

final auditLogDigestServiceProvider = Provider<AuditLogDigestService>((ref) => AuditLogDigestService());

final auditLogDigestProvider = FutureProvider.autoDispose<AuditLogDigestModel?>((ref) {
  return ref.watch(auditLogDigestServiceProvider).getLatest();
});
