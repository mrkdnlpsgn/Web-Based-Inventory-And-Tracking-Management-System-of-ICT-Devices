class AiRecommendationModel {
  final int id;
  final double assetAgeYears;
  final double totalRepairCost;
  final int repairFrequency;
  final int conditionScore;
  final String recommendation; // MAINTAIN | REPAIR | MONITOR | REVIEW_FOR_DISPOSAL | BUDGET_PRIORITY
  final String rationale;
  final String generatedAt;

  const AiRecommendationModel({
    required this.id,
    required this.assetAgeYears,
    required this.totalRepairCost,
    required this.repairFrequency,
    required this.conditionScore,
    required this.recommendation,
    required this.rationale,
    required this.generatedAt,
  });

  factory AiRecommendationModel.fromJson(Map<String, dynamic> json) => AiRecommendationModel(
        id: json['id'] as int,
        assetAgeYears: (json['assetAgeYears'] as num).toDouble(),
        totalRepairCost: (json['totalRepairCost'] as num).toDouble(),
        repairFrequency: json['repairFrequency'] as int,
        conditionScore: json['conditionScore'] as int,
        recommendation: json['recommendation'] as String,
        rationale: json['rationale'] as String,
        generatedAt: json['generatedAt'] as String,
      );
}
