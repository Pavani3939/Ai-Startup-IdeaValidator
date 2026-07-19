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
        if (apiKey == null || apiKey.contains("your-default-api-key") || apiKey.trim().isEmpty()) {
            AnalysisResponseDTO mockResponse = new AnalysisResponseDTO();
            
            int score = 1;
            if (description != null && !description.trim().isEmpty()) {
                String[] words = description.trim().split("\\s+");
                int wordCount = words.length;
                
                // 1. Length factor (up to 4 points)
                if (wordCount >= 50) score += 4;
                else if (wordCount >= 30) score += 3;
                else if (wordCount >= 15) score += 2;
                else if (wordCount >= 5) score += 1;
                
                // 2. Keyword matching (up to 3 points)
                String descLower = description.toLowerCase();
                String[] keywords = {"problem", "solution", "market", "revenue", "target", "customer", "user", "platform", "app", "technology", "scale", "monetize", "competitor"};
                int keywordMatches = 0;
                for (String kw : keywords) {
                    if (descLower.contains(kw)) keywordMatches++;
                }
                if (keywordMatches >= 4) score += 3;
                else if (keywordMatches >= 2) score += 2;
                else if (keywordMatches >= 1) score += 1;
                
                // 3. Context Matching (Title & Industry) (up to 3 points)
                int contextPoints = 0;
                boolean isIndustryMatched = industry != null && !industry.trim().isEmpty() && descLower.contains(industry.toLowerCase());
                if (isIndustryMatched) {
                    contextPoints += 2;
                }
                
                boolean isTitleMatched = false;
                if (title != null && !title.trim().isEmpty()) {
                    String[] titleWords = title.toLowerCase().split("\\s+");
                    for (String tw : titleWords) {
                        if (tw.length() >= 3 && descLower.contains(tw)) {
                            contextPoints += 1;
                            isTitleMatched = true;
                            break;
                        }
                    }
                }
                
                if (!isIndustryMatched && !isTitleMatched) {
                    mockResponse.setSuccessScore(1);
                    mockResponse.setSummary("Not matched. Your description does not appear to relate to your Idea Title or Technology/Industry.");
                    mockResponse.setAdvantages(List.of("N/A"));
                    mockResponse.setDisadvantages(List.of("N/A"));
                    mockResponse.setMarketPotential("N/A");
                    mockResponse.setSuggestions(List.of("Please ensure your description actually describes the Idea and Technology you entered."));
                    return mockResponse;
                }
                
                score += Math.min(3, contextPoints);

                // 4. Unique words ratio / Repetition penalty (up to 3 points)
                long uniqueWords = java.util.Arrays.stream(words).map(String::toLowerCase).distinct().count();
                double richness = wordCount > 0 ? (double) uniqueWords / wordCount : 0;
                
                if (richness > 0.7) score += 3;
                else if (richness > 0.5) score += 2;
                else if (richness > 0.3) score += 1;
                
                // Penalty for severe gibberish
                if (description.chars().distinct().count() < 10 || !description.contains(" ")) {
                    score = 1;
                }
            }
            
            // Cap score between 1 and 10
            score = Math.max(1, Math.min(10, score));
            mockResponse.setSuccessScore(score);
            
            if (score <= 3) {
                mockResponse.setSummary("This idea appears to lack substance or the description is too vague. A score of " + score + "/10 indicates that you need to provide a more detailed and coherent business proposition instead of placeholder text.");
                mockResponse.setAdvantages(List.of("None identified."));
                mockResponse.setDisadvantages(List.of("Lacks a clear problem statement.", "Target market is completely undefined.", "Value proposition is missing or incoherent."));
                mockResponse.setMarketPotential("Unknown. The idea needs significant refinement to assess any market potential.");
                mockResponse.setSuggestions(List.of("Clearly define the specific problem you are solving.", "Identify your target audience and user persona.", "Explain how your solution is uniquely positioned."));
            } else if (score <= 6) {
                mockResponse.setSummary("The idea has some potential but lacks crucial details. A score of " + score + "/10 suggests that while the foundation exists, it requires further elaboration on market strategy and revenue models.");
                mockResponse.setAdvantages(List.of("Identifies a basic concept in the " + industry + " industry.", "Shows some initial thought process."));
                mockResponse.setDisadvantages(List.of("Missing detailed target audience breakdown.", "Unclear revenue generation model.", "Competitive advantage is not well defined."));
                mockResponse.setMarketPotential("Moderate. Needs more research into the " + industry + " sector to determine actual viability.");
                mockResponse.setSuggestions(List.of("Detail your monetization strategy.", "Analyze your direct competitors.", "Expand on the technical feasibility of the product."));
            } else {
                mockResponse.setSummary("This is a highly promising startup idea! A score of " + score + "/10 indicates that '" + title + "' addresses a clear pain point in the " + industry + " industry. The detailed approach shows strong potential for disruption.");
                mockResponse.setAdvantages(List.of("High demand in the current market for comprehensive " + industry + " solutions.", "Well-articulated value proposition.", "Scalable business model based on the details provided."));
                mockResponse.setDisadvantages(List.of("Potential high initial customer acquisition cost.", "Possible regulatory hurdles depending on the region.", "Strong competition from established players."));
                mockResponse.setMarketPotential("The " + industry + " market is growing at a rapid pace. If '" + title + "' executes well, it could lead to substantial recurring revenue.");
                mockResponse.setSuggestions(List.of("Focus heavily on building a strong MVP before seeking large funding.", "Partner with existing local businesses to reduce customer acquisition costs.", "Implement a freemium model to drive early user adoption."));
            }
            return mockResponse;
        }

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

        try {
            GeminiResponse response = webClient.post()
                    .uri(apiUrl + "?key=" + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(request)
                    .retrieve()
                    .bodyToMono(GeminiResponse.class)
                    .block();

            if (response == null || response.getCandidates() == null || response.getCandidates().isEmpty()) {
                throw new GeminiApiException("Empty response from Gemini API");
            }

            String json = response.getCandidates()
                    .get(0)
                    .getContent()
                    .getParts()
                    .get(0)
                    .getText();

            // Strip potential markdown formatting that Gemini sometimes includes
            if (json.startsWith("```json")) {
                json = json.substring(7);
            }
            if (json.startsWith("```")) {
                json = json.substring(3);
            }
            if (json.endsWith("```")) {
                json = json.substring(0, json.length() - 3);
            }

            return objectMapper.readValue(json.trim(), AnalysisResponseDTO.class);

        } catch (Exception e) {
            throw new GeminiApiException("Failed to call or parse Gemini response", e);
        }
    }
}
