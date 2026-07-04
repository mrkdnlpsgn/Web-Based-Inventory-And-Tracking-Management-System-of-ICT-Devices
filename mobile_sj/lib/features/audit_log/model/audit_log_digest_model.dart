class AuditLogDigestModel {
  final int id;
  final String digest;
  final int coveredEntries;
  final String generatedAt;

  const AuditLogDigestModel({
    required this.id,
    required this.digest,
    required this.coveredEntries,
    required this.generatedAt,
  });

  factory AuditLogDigestModel.fromJson(Map<String, dynamic> json) => AuditLogDigestModel(
        id: json['id'] as int,
        digest: json['digest'] as String,
        coveredEntries: json['coveredEntries'] as int,
        generatedAt: json['generatedAt'] as String,
      );
}
