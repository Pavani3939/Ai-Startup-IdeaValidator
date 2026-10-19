package com.startup.validator.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.startup.validator.dto.AnalysisResponseDTO;
import com.startup.validator.dto.IdeaRequestDTO;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.web.reactive.function.client.WebClient;

import static org.junit.jupiter.api.Assertions.*;

class GeminiServiceTest {

    private GeminiService geminiService;

    @BeforeEach
    void setUp() {
        WebClient webClient = WebClient.builder().build();
        ObjectMapper objectMapper = new ObjectMapper();
        geminiService = new GeminiService(webClient, objectMapper);
    }

    @Test
    @DisplayName("Should generate structured fallback assessment with 1-100 readiness score and dimensions")
    void testStructuredFallbackGeneration() {
        IdeaRequestDTO request = new IdeaRequestDTO();
        request.setTitle("CloudDoc AI");
        request.setIndustry("SaaS");
        request.setDescription("An automated document processing and verification platform for compliance teams in FinTech to speed up auditing.");
        request.setTargetAudience("FinTech compliance officers and auditing agencies");
        request.setProposedSolution("AI-assisted extraction and optical pattern validation");
        request.setBusinessModel("Monthly B2B SaaS subscription");

        AnalysisResponseDTO response = geminiService.generateStructuredFallback(request);

        assertNotNull(response);
        assertEquals("CloudDoc AI", response.getStartupName());
        assertEquals("SaaS", response.getIndustry());

        // Readiness score must be between 10 and 100
        assertTrue(response.getReadinessScore() >= 10 && response.getReadinessScore() <= 100);
        // Success score legacy must be 1-10
        assertTrue(response.getSuccessScore() >= 1 && response.getSuccessScore() <= 10);

        // Verify SWOT presence
        assertNotNull(response.getStrengths());
        assertFalse(response.getStrengths().isEmpty());
        assertNotNull(response.getWeaknesses());
        assertFalse(response.getWeaknesses().isEmpty());
        assertNotNull(response.getOpportunities());
        assertFalse(response.getOpportunities().isEmpty());
        assertNotNull(response.getThreats());
        assertFalse(response.getThreats().isEmpty());

        // Verify Evaluation Dimensions
        assertNotNull(response.getEvaluationDimensions());
        assertEquals(6, response.getEvaluationDimensions().size());

        // Verify Risks and Recommendations
        assertNotNull(response.getRisks());
        assertFalse(response.getRisks().isEmpty());
        assertNotNull(response.getRecommendations());
        assertFalse(response.getRecommendations().isEmpty());
    }
}
