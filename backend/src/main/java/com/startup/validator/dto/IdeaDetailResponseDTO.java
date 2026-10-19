package com.startup.validator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IdeaDetailResponseDTO {
    private Long id;
    private String title;
    private String description;
    private String industry;
    private String targetAudience;
    private String problemStatement;
    private String proposedSolution;
    private String businessModel;
    private String targetGeography;
    private Double estimatedBudget;
    private Double expectedMonthlyExpenses;
    private Double expectedMonthlyRevenue;
    private String currentStage;
    private String knownCompetitors;
    private String additionalNotes;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    private AnalysisResponseDTO analysisReport;
    private FinancialResponseDTO financialProjection;
    private List<CompetitorDTO> competitors;
    private List<RoadmapTaskDTO> roadmapTasks;
}
