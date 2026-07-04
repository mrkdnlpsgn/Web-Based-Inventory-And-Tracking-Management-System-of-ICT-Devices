package com.sanjose.inventory.dto;

import com.fasterxml.jackson.annotation.JsonPropertyDescription;
import com.sanjose.inventory.entity.AiRecommendation;

public record AssetLifecycleAdvice(
    @JsonPropertyDescription("The recommended lifecycle action for this asset.")
    AiRecommendation.Recommendation recommendation,

    @JsonPropertyDescription("2-3 plain-language sentences a non-technical municipal employee can act on, explaining why this recommendation was made.")
    String rationale
) {}
