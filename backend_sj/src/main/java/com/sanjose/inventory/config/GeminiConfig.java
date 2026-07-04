package com.sanjose.inventory.config;

import com.google.genai.Client;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

@Component
public class GeminiConfig {

    @Value("${ai.recommendations.enabled:false}")
    private boolean enabled;

    @Value("${gemini.api-key:}")
    private String apiKey;

    public void requireConfigured() {
        if (!enabled || apiKey.isBlank()) {
            throw new IllegalStateException(
                "AI features are not configured. Set GEMINI_API_KEY and AI_RECOMMENDATIONS_ENABLED=true.");
        }
    }

    public Client buildClient() {
        return Client.builder().apiKey(apiKey).build();
    }
}
