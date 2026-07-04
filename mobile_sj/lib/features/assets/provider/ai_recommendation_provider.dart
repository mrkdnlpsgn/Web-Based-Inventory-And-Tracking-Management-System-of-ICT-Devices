import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/ai_recommendation_service.dart';
import '../model/ai_recommendation_model.dart';

final aiRecommendationServiceProvider = Provider<AiRecommendationService>((ref) => AiRecommendationService());

final aiRecommendationProvider =
    FutureProvider.autoDispose.family<AiRecommendationModel?, int>((ref, assetId) {
  return ref.watch(aiRecommendationServiceProvider).getLatest(assetId);
});

final aiRecommendationSummaryProvider = FutureProvider.autoDispose<Map<String, int>>((ref) {
  return ref.watch(aiRecommendationServiceProvider).getSummary();
});
