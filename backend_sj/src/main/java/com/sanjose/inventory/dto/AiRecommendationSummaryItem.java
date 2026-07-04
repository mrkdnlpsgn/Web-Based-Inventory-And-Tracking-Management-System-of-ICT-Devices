package com.sanjose.inventory.dto;

import com.sanjose.inventory.entity.AiRecommendation;

public record AiRecommendationSummaryItem(AiRecommendation.Recommendation recommendation, long count) {}
