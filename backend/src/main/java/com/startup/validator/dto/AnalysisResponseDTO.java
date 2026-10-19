package com.startup.validator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisResponseDTO {
    // Existing fields for backward compatibility
    private Long id;
    private Long ideaId;
    private String summary;
    private List<String> advantages;
    private List<String> disadvantages;
    private String marketPotential;
    private List<String> suggestions;
    private Integer successScore;

    // Enhanced structured fields
    private String startupName;
    private String industry;
    private String analysisDate;
    private String executiveSummary;
    private Integer readinessScore; // 1-100 scale
    private String scoreExplanation;
    private List<Map<String, Object>> evaluationDimensions;
    private List<String> strengths;
    private List<String> weaknesses;
    private List<String> opportunities;
    private List<String> threats;
    private List<Map<String, Object>> risks;
    private List<Map<String, Object>> recommendations;
    private String marketAssessment;
}
