package com.startup.validator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinancialResponseDTO {
    private Long id;
    private Long startupIdeaId;
    private Double initialInvestment;
    private Double monthlyFixedCosts;
    private Double variableCostPerUnit;
    private Double sellingPricePerUnit;
    private Integer expectedUnits;

    // Deterministic Calculated outputs
    private Double estimatedRevenue;
    private Double estimatedVariableCosts;
    private Double estimatedTotalCosts;
    private Double estimatedOperatingProfit;
    private Double operatingMarginPercent;
    private Integer breakEvenUnits;
    private Double breakEvenRevenue;
    private Double contributionMarginPerUnit;
    private LocalDateTime createdAt;
    private String financialNotes;
}
