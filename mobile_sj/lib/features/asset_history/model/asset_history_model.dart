import '../../maintenance/model/maintenance_model.dart';

class HistoryOfficeModel {
  final int id;
  final String officeName;

  const HistoryOfficeModel({required this.id, required this.officeName});

  factory HistoryOfficeModel.fromJson(Map<String, dynamic> json) => HistoryOfficeModel(
        id: json['id'] as int,
        officeName: json['officeName'] as String,
      );
}

class AssetHistoryModel {
  final int id;
  final String eventType; // REGISTERED | ASSIGNED | TRANSFERRED | MAINTENANCE | DISPOSAL | ARCHIVED
  final HistoryOfficeModel? fromOffice;
  final HistoryOfficeModel? toOffice;
  final MaintenanceUserModel performedBy;
  final String eventDate;
  final String? notes;

  const AssetHistoryModel({
    required this.id,
    required this.eventType,
    this.fromOffice,
    this.toOffice,
    required this.performedBy,
    required this.eventDate,
    this.notes,
  });

  factory AssetHistoryModel.fromJson(Map<String, dynamic> json) => AssetHistoryModel(
        id: json['id'] as int,
        eventType: json['eventType'] as String,
        fromOffice: json['fromOffice'] != null
            ? HistoryOfficeModel.fromJson(json['fromOffice'] as Map<String, dynamic>)
            : null,
        toOffice: json['toOffice'] != null
            ? HistoryOfficeModel.fromJson(json['toOffice'] as Map<String, dynamic>)
            : null,
        performedBy: MaintenanceUserModel.fromJson(json['performedBy'] as Map<String, dynamic>),
        eventDate: json['eventDate'] as String,
        notes: json['notes'] as String?,
      );
}
