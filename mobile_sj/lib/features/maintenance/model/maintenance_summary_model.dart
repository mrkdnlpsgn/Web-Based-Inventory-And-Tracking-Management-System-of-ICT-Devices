class MaintenanceSummaryModel {
  final int id;
  final int maintenanceId;
  final String summary;
  final String generatedAt;

  const MaintenanceSummaryModel({
    required this.id,
    required this.maintenanceId,
    required this.summary,
    required this.generatedAt,
  });

  factory MaintenanceSummaryModel.fromJson(Map<String, dynamic> json) => MaintenanceSummaryModel(
        id: json['id'] as int,
        maintenanceId: json['maintenanceId'] as int,
        summary: json['summary'] as String,
        generatedAt: json['generatedAt'] as String,
      );
}
