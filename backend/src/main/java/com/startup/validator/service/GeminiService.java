package com.startup.validator.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.startup.validator.dto.AnalysisResponseDTO;
import com.startup.validator.dto.IdeaRequestDTO;
import com.startup.validator.dto.gemini.GeminiRequest;
import com.startup.validator.dto.gemini.GeminiResponse;
import com.startup.validator.exception.GeminiApiException;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;
import java.util.*;

@Service
public class GeminiService {

    private static final Logger logger = LoggerFactory.getLogger(GeminiService.class);

    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent}")
    private String apiUrl;

    public GeminiService(WebClient webClient, ObjectMapper objectMapper) {
        this.webClient = webClient;
        this.objectMapper = objectMapper;
    }

    public AnalysisResponseDTO analyzeIdea(IdeaRequestDTO request) {
        String title = request.getTitle();
        String industry = request.getIndustry();
        String description = request.getDescription();

        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.contains("your-default-api-key") || apiKey.contains("your_actual_api_key")) {
            logger.info("Using enhanced deterministic fallback analysis engine for idea: {}", title);
            return generateStructuredFallback(request);
        }

        String prompt = buildPrompt(request);

        GeminiRequest geminiRequest = GeminiRequest.builder()
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
                    .bodyValue(geminiRequest)
                    .retrieve()
                    .bodyToMono(GeminiResponse.class)
                    .block();

            if (response == null || response.getCandidates() == null || response.getCandidates().isEmpty()) {
                logger.warn("Empty response received from Gemini API, falling back to local evaluation");
                return generateStructuredFallback(request);
            }

            String json = response.getCandidates().get(0).getContent().getParts().get(0).getText();
            return parseGeminiJson(json, request);

        } catch (Exception e) {
            logger.error("Error communicating with or parsing Gemini API response: {}. Reverting to fallback analysis.", e.getMessage());
            return generateStructuredFallback(request);
        }
    }

    // Overload for backward compatibility
    public AnalysisResponseDTO analyzeIdea(String title, String industry, String description) {
        IdeaRequestDTO dto = new IdeaRequestDTO();
        dto.setTitle(title);
        dto.setIndustry(industry);
        dto.setDescription(description);
        return analyzeIdea(dto);
    }

    private String buildPrompt(IdeaRequestDTO request) {
        return String.format("""
                You are a senior startup analyst and venture capital evaluator.
                Perform a structured, critical, and realistic assessment of the following startup concept.
                Return ONLY a strictly valid JSON object matching the requested schema with NO markdown formatting, NO backticks, and NO conversational filler.

                Startup Details:
                - Name: %s
                - Industry: %s
                - Description: %s
                - Target Audience: %s
                - Problem Being Solved: %s
                - Proposed Solution: %s
                - Business Model: %s
                - Target Geography: %s
                - Known Competitors: %s

                Evaluation Requirements:
                1. Calculate an indicative "readinessScore" from 10 to 100 based on problem clarity, market size, execution risk, and monetization feasibility. (This is a readiness score, not a guaranteed success probability).
                2. Provide 6 core evaluation dimensions: "Problem Clarity", "Customer & Market Understanding", "Competitive Differentiation", "Business Model", "Execution Feasibility", and "Financial Preparedness". Each must have a score (0-100), explanation, strengths, gaps, and recommendation.
                3. Provide SWOT analysis: 3-4 strengths, weaknesses, opportunities, threats.
                4. Provide 3-4 key risks with severity (Low, Medium, High, Critical), category, impact, and mitigation.
                5. Provide 3-5 prioritized next-step recommendations with title, description, priority (High/Medium/Low), nextAction, expectedBenefit, and timeframe.
                6. Do NOT invent fake revenue numbers or fake market share figures. State clearly if validation is needed.

                Return JSON Format:
                {
                  "readinessScore": 75,
                  "scoreExplanation": "Explanation of how score was derived",
                  "executiveSummary": "Concise executive overview",
                  "marketAssessment": "Market dynamics and target customer evaluation",
                  "evaluationDimensions": [
                    {
                      "dimension": "Problem Clarity",
                      "score": 80,
                      "explanation": "Brief explanation",
                      "strengths": "Observed strength",
                      "gaps": "Observed gap",
                      "recommendation": "Suggested fix"
                    }
                  ],
                  "strengths": ["Strength 1", "Strength 2"],
                  "weaknesses": ["Weakness 1", "Weakness 2"],
                  "opportunities": ["Opportunity 1", "Opportunity 2"],
                  "threats": ["Threat 1", "Threat 2"],
                  "risks": [
                    {
                      "description": "Risk description",
                      "category": "Market / Technical / Financial / Regulatory",
                      "severity": "Medium",
                      "impact": "Potential impact",
                      "mitigation": "Mitigation strategy"
                    }
                  ],
                  "recommendations": [
                    {
                      "title": "Recommendation Title",
                      "description": "Details",
                      "priority": "High",
                      "nextAction": "Specific action to take",
                      "expectedBenefit": "Anticipated result",
                      "timeframe": "1-3 months"
                    }
                  ],
                  "advantages": ["Core Advantage 1", "Core Advantage 2"],
                  "disadvantages": ["Core Limitation 1", "Core Limitation 2"],
                  "suggestions": ["Suggestion 1", "Suggestion 2"]
                }
                """,
                sanitize(request.getTitle()),
                sanitize(request.getIndustry()),
                sanitize(request.getDescription()),
                sanitize(request.getTargetAudience()),
                sanitize(request.getProblemStatement()),
                sanitize(request.getProposedSolution()),
                sanitize(request.getBusinessModel()),
                sanitize(request.getTargetGeography()),
                sanitize(request.getKnownCompetitors())
        );
    }

    private String sanitize(String input) {
        return input == null || input.trim().isEmpty() ? "Not specified" : input.trim();
    }

    private AnalysisResponseDTO parseGeminiJson(String json, IdeaRequestDTO request) {
        try {
            String cleaned = json.trim();
            if (cleaned.startsWith("```json")) {
                cleaned = cleaned.substring(7);
            }
            if (cleaned.startsWith("```")) {
                cleaned = cleaned.substring(3);
            }
            if (cleaned.endsWith("```")) {
                cleaned = cleaned.substring(0, cleaned.length() - 3);
            }
            cleaned = cleaned.trim();

            JsonNode root = objectMapper.readTree(cleaned);

            int readinessScore = root.path("readinessScore").asInt(70);
            readinessScore = Math.max(10, Math.min(100, readinessScore));
            int successScore = Math.max(1, Math.min(10, (int) Math.round(readinessScore / 10.0)));

            String summary = root.path("executiveSummary").asText(root.path("summary").asText(""));
            String scoreExplanation = root.path("scoreExplanation").asText("Based on structured evaluation across market, business model, and execution dimensions.");
            String marketAssessment = root.path("marketAssessment").asText(root.path("marketPotential").asText(""));

            List<String> strengths = parseStringList(root.path("strengths"));
            List<String> weaknesses = parseStringList(root.path("weaknesses"));
            List<String> opportunities = parseStringList(root.path("opportunities"));
            List<String> threats = parseStringList(root.path("threats"));

            List<String> advantages = parseStringList(root.path("advantages"));
            if (advantages.isEmpty()) advantages = strengths;

            List<String> disadvantages = parseStringList(root.path("disadvantages"));
            if (disadvantages.isEmpty()) disadvantages = weaknesses;

            List<String> suggestions = parseStringList(root.path("suggestions"));

            List<Map<String, Object>> dimensions = parseMapList(root.path("evaluationDimensions"));
            List<Map<String, Object>> risks = parseMapList(root.path("risks"));
            List<Map<String, Object>> recommendations = parseMapList(root.path("recommendations"));

            return AnalysisResponseDTO.builder()
                    .startupName(request.getTitle())
                    .industry(request.getIndustry())
                    .analysisDate(LocalDate.now().toString())
                    .readinessScore(readinessScore)
                    .successScore(successScore)
                    .scoreExplanation(scoreExplanation)
                    .summary(summary)
                    .executiveSummary(summary)
                    .marketPotential(marketAssessment)
                    .marketAssessment(marketAssessment)
                    .evaluationDimensions(dimensions)
                    .strengths(strengths)
                    .weaknesses(weaknesses)
                    .opportunities(opportunities)
                    .threats(threats)
                    .advantages(advantages)
                    .disadvantages(disadvantages)
                    .suggestions(suggestions)
                    .risks(risks)
                    .recommendations(recommendations)
                    .build();

        } catch (Exception e) {
            logger.warn("Failed to parse Gemini JSON: {}. Falling back to structured heuristic evaluation.", e.getMessage());
            return generateStructuredFallback(request);
        }
    }

    private List<String> parseStringList(JsonNode node) {
        List<String> list = new ArrayList<>();
        if (node != null && node.isArray()) {
            for (JsonNode item : node) {
                list.add(item.asText());
            }
        }
        return list;
    }

    private List<Map<String, Object>> parseMapList(JsonNode node) {
        List<Map<String, Object>> list = new ArrayList<>();
        if (node != null && node.isArray()) {
            for (JsonNode item : node) {
                try {
                    Map<String, Object> map = objectMapper.convertValue(item, new TypeReference<Map<String, Object>>() {});
                    list.add(map);
                } catch (Exception ignored) {}
            }
        }
        return list;
    }

    public AnalysisResponseDTO generateStructuredFallback(IdeaRequestDTO request) {
        String title = request.getTitle() != null ? request.getTitle().trim() : "Startup Idea";
        String industry = request.getIndustry() != null ? request.getIndustry().trim() : "Technology";
        String desc = request.getDescription() != null ? request.getDescription().trim() : "";

        // Deterministic heuristic score calculation
        int score = 40; // baseline
        String descLower = desc.toLowerCase();

        // 1. Length factor
        int wordCount = desc.isEmpty() ? 0 : desc.split("\\s+").length;
        if (wordCount >= 60) score += 18;
        else if (wordCount >= 35) score += 12;
        else if (wordCount >= 20) score += 8;

        // 2. Keyword density
        String[] keywords = {"problem", "solution", "market", "customer", "revenue", "scale", "user", "platform", "subscription", "business", "retention", "differentiation"};
        int kwMatches = 0;
        for (String kw : keywords) {
            if (descLower.contains(kw)) kwMatches++;
        }
        score += Math.min(18, kwMatches * 3);

        // 3. Extra fields present
        if (request.getTargetAudience() != null && !request.getTargetAudience().isBlank()) score += 6;
        if (request.getProposedSolution() != null && !request.getProposedSolution().isBlank()) score += 6;
        if (request.getBusinessModel() != null && !request.getBusinessModel().isBlank()) score += 6;
        if (request.getEstimatedBudget() != null && request.getEstimatedBudget() > 0) score += 6;

        score = Math.max(25, Math.min(92, score));
        int successScore = Math.max(1, Math.min(10, (int) Math.round(score / 10.0)));

        String summary = String.format("Structured readiness evaluation for '%s' in the %s sector. The concept demonstrates a defined direction with actionable market entry opportunities, but requires rigorous customer discovery and MVP validation.", title, industry);
        String scoreExplanation = String.format("Score calculated at %d/100 based on value proposition clarity, identified market domain (%s), and structural business completeness. Note: This is an indicative readiness score, not a guaranteed commercial success rate.", score, industry);
        String marketAssessment = String.format("The %s market offers active demand and growing digitalization opportunities. Success depends heavily on establishing low-friction customer acquisition and clear product differentiation.", industry);

        List<Map<String, Object>> dimensions = List.of(
                Map.of("dimension", "Problem Clarity", "score", Math.min(95, score + 5), "explanation", "Defines an identifiable pain point in current user workflows.", "strengths", "Recognizable domain challenge.", "gaps", "Needs qualitative interviews to confirm pain severity.", "recommendation", "Conduct 15-20 target customer discovery interviews."),
                Map.of("dimension", "Customer & Market Understanding", "score", Math.min(90, score), "explanation", "Identifies target segment characteristics within " + industry + ".", "strengths", "Target market is growing.", "gaps", "Sub-segment granularity needs definition.", "recommendation", "Create detailed buyer persona profiles."),
                Map.of("dimension", "Competitive Differentiation", "score", Math.max(30, score - 8), "explanation", "Existing market incumbents and substitutes pose competitive friction.", "strengths", "Modern approach to problem.", "gaps", "Moat / defensibility requires fortification.", "recommendation", "Emphasize proprietary workflow, niche focus, or unique pricing."),
                Map.of("dimension", "Business Model", "score", Math.min(90, score + 2), "explanation", "Monetization structure aligned with standard " + industry + " benchmarks.", "strengths", "Multiple potential revenue streams.", "gaps", "Unit economics need empirical validation.", "recommendation", "Model customer acquisition cost (CAC) vs. lifetime value (LTV)."),
                Map.of("dimension", "Execution Feasibility", "score", Math.min(88, score), "explanation", "Concept is technically feasible with accessible modern tech stack.", "strengths", "Standard integration patterns.", "gaps", "Resource allocation during initial rollout.", "recommendation", "Scope a tightly defined Minimum Viable Product (MVP)."),
                Map.of("dimension", "Financial Preparedness", "score", Math.max(35, score - 5), "explanation", "Initial financial model requires stress testing against delayed adoption.", "strengths", "Low asset requirements.", "gaps", "Working capital runway buffer.", "recommendation", "Maintain at least 6-9 months of operating expense reserves.")
        );

        List<String> strengths = List.of(
                "Addresses a specific, recurring pain point in " + industry,
                "Scalable business architecture with low incremental marginal costs",
                "Clear potential for automated self-serve or digital onboarding"
        );

        List<String> weaknesses = List.of(
                "Early-stage brand recognition requiring deliberate marketing investment",
                "Reliance on accurate customer adoption velocity",
                "Unit economics unproven in live competitive marketplace"
        );

        List<String> opportunities = List.of(
                "Expansion into underserved niche segments within " + industry,
                "Strategic affiliate or B2B integration partnerships",
                "Data insights and premium feature upselling over time"
        );

        List<String> threats = List.of(
                "Aggressive feature replication by established incumbents",
                "Customer inertia and friction in switching from existing habits",
                "Shifting macro regulations and compliance obligations"
        );

        List<Map<String, Object>> risks = List.of(
                Map.of("description", "Customer acquisition costs exceeding initial unit economics", "category", "Financial", "severity", "High", "impact", "Compressed cash flow and extended break-even timeline", "mitigation", "Leverage organic content, community outreach, and direct founder-led sales"),
                Map.of("description", "Incumbents bundling comparable features at zero marginal cost", "category", "Market", "severity", "Medium", "impact", "Difficulty securing enterprise or discerning buyers", "mitigation", "Focus relentlessly on specialized UX and workflow speed"),
                Map.of("description", "MVP feature bloat causing delayed launch dates", "category", "Execution", "severity", "Medium", "impact", "Burn rate acceleration prior to market validation", "mitigation", "Strictly enforce a 60-day deadline for MVP beta testing")
        );

        List<Map<String, Object>> recommendations = List.of(
                Map.of("title", "Execute 20 Problem Discovery Interviews", "description", "Engage directly with target operators in " + industry + " without pitching to validate pain intensity.", "priority", "High", "nextAction", "Draft interview script focusing on current spending and workaround pain.", "expectedBenefit", "Prevents building unwanted features and sharpens messaging.", "timeframe", "Weeks 1-3"),
                Map.of("title", "Build a Tightly Scoped Interactive Prototype", "description", "Develop a functional interactive demo or landing page with email capture to measure demand intent.", "priority", "High", "nextAction", "Design wireframes highlighting core differentiators.", "expectedBenefit", "Concrete conversion data before writing extensive production code.", "timeframe", "Weeks 3-6"),
                Map.of("title", "Establish Unit Economics & Financial Projections", "description", "Map realistic cost per acquisition, monthly fixed burn, and variable delivery overhead.", "priority", "Medium", "nextAction", "Use the Financial Feasibility calculator to establish break-even volume.", "expectedBenefit", "Clarity on runway requirements and capital allocation.", "timeframe", "Month 2")
        );

        return AnalysisResponseDTO.builder()
                .startupName(title)
                .industry(industry)
                .analysisDate(LocalDate.now().toString())
                .readinessScore(score)
                .successScore(successScore)
                .scoreExplanation(scoreExplanation)
                .summary(summary)
                .executiveSummary(summary)
                .marketPotential(marketAssessment)
                .marketAssessment(marketAssessment)
                .evaluationDimensions(dimensions)
                .strengths(strengths)
                .weaknesses(weaknesses)
                .opportunities(opportunities)
                .threats(threats)
                .advantages(strengths)
                .disadvantages(weaknesses)
                .suggestions(List.of(
                        "Narrow initial focus to the single most acute customer pain point.",
                        "Track pre-launch waitlist conversion rates to evaluate true interest.",
                        "Review direct competitor pricing models to structure initial tiers."
                ))
                .risks(risks)
                .recommendations(recommendations)
                .build();
    }
}
