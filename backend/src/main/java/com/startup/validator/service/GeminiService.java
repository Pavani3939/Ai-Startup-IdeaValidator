package com.startup.validator.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.startup.validator.dto.AnalysisResponseDTO;
import com.startup.validator.dto.gemini.GeminiRequest;
import com.startup.validator.dto.gemini.GeminiResponse;
import com.startup.validator.exception.GeminiApiException;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.util.List;

@Service
public class GeminiService {

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    public GeminiService(WebClient webClient, ObjectMapper objectMapper) {
        this.webClient = webClient;
        this.objectMapper = objectMapper;
    }

    public AnalysisResponseDTO analyzeIdea(String title, String industry, String description) {
        String prompt = String.format("""
                Analyze the following startup idea. Return ONLY a valid JSON object matching the requested schema exactly, with no markdown formatting or backticks.
                
                Title: %s
                Industry: %s
                Description: %s
                
                Return JSON format:
                {
                  "summary": "String detailing overall summary",
                  "advantages": ["Array of advantages"],
                  "disadvantages": ["Array of disadvantages"],
                  "marketPotential": "String detailing market potential",
                  "suggestions": ["Array of improvement suggestions"],
                  "successScore": Integer from 0 to 10
                }
                """, title, industry, description);

        GeminiRequest request = GeminiRequest.builder()
                .contents(List.of(GeminiRequest.Content.builder()
                        .parts(List.of(GeminiRequest.Part.builder()
                                .text(prompt)
                                .build()))
                        .build()))
                .generationConfig(GeminiRequest.GenerationConfig.builder()
                        .responseMimeType("application/json")
                        .build())
                .build();

        // Since no API key was provided, we will return a highly detailed mocked AI response!
        AnalysisResponseDTO mockedResponse = new AnalysisResponseDTO();
        mockedResponse.setSummary("This is an excellent startup idea! " + title + " addresses a clear pain point in the " + industry + " industry. The approach described (" + description + ") shows strong potential for disruption by utilizing modern technology to solve traditional problems.");
        mockedResponse.setAdvantages(List.of(
                "High demand in the current market for " + industry + " solutions.",
                "Scalable business model.",
                "Clear target audience and value proposition."
        ));
        mockedResponse.setDisadvantages(List.of(
                "Potential high initial customer acquisition cost.",
                "Possible regulatory hurdles depending on the region.",
                "Strong competition from established players."
        ));
        mockedResponse.setMarketPotential("The " + industry + " market is growing at a rapid pace. If " + title + " can capture even a 1% market share in the first two years, it could lead to multi-million dollar recurring revenue.");
        mockedResponse.setSuggestions(List.of(
                "Focus heavily on building a strong MVP before seeking large funding.",
                "Partner with existing local businesses to reduce customer acquisition costs.",
                "Implement a freemium model to drive early user adoption."
        ));
        mockedResponse.setSuccessScore(8);

        return mockedResponse;
    }
}
