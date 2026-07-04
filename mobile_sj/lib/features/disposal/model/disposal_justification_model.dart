class DisposalJustificationModel {
  final int id;
  final int disposalId;
  final String justification;
  final String generatedAt;

  const DisposalJustificationModel({
    required this.id,
    required this.disposalId,
    required this.justification,
    required this.generatedAt,
  });

  factory DisposalJustificationModel.fromJson(Map<String, dynamic> json) => DisposalJustificationModel(
        id: json['id'] as int,
        disposalId: json['disposalId'] as int,
        justification: json['justification'] as String,
        generatedAt: json['generatedAt'] as String,
      );
}
