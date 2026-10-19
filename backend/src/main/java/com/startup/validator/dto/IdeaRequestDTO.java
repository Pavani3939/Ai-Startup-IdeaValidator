package com.startup.validator.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class IdeaRequestDTO {

    @NotBlank(message = "Startup name is required")
    @Size(max = 255, message = "Title must be less than 255 characters")
    private String title;

    @NotBlank(message = "Description is required")
    private String description;

    @NotBlank(message = "Industry is required")
    private String industry;

    // Optional fields for deeper evaluation
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
}
