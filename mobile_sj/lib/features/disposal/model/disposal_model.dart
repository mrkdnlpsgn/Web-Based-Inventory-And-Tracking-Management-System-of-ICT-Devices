import '../../assets/model/asset_model.dart';
import '../../maintenance/model/maintenance_model.dart';

class DisposalModel {
  final int id;
  final AssetModel asset;
  final String reason;
  final String inspectionFindings;
  final String recommendedMethod;  // AUCTION | DESTRUCTION | DONATION | TRANSFER
  final String disposalStatus;     // PENDING | APPROVED | COMPLETED
  final String inspectionDate;
  final String? approvedBy;
  final MaintenanceUserModel recordedBy;
  final String createdAt;

  const DisposalModel({
    required this.id,
    required this.asset,
    required this.reason,
    required this.inspectionFindings,
    required this.recommendedMethod,
    required this.disposalStatus,
    required this.inspectionDate,
    this.approvedBy,
    required this.recordedBy,
    required this.createdAt,
  });

  factory DisposalModel.fromJson(Map<String, dynamic> json) => DisposalModel(
        id: json['id'] as int,
        asset: AssetModel.fromJson(json['asset'] as Map<String, dynamic>),
        reason: json['reason'] as String,
        inspectionFindings: json['inspectionFindings'] as String,
        recommendedMethod: json['recommendedMethod'] as String,
        disposalStatus: json['disposalStatus'] as String,
        inspectionDate: json['inspectionDate'] as String,
        approvedBy: json['approvedBy'] as String?,
        recordedBy: MaintenanceUserModel.fromJson(json['recordedBy'] as Map<String, dynamic>),
        createdAt: json['createdAt'] as String,
      );
}
