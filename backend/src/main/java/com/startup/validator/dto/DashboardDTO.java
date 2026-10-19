package com.startup.validator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardDTO {
    private long totalIdeas;
    private double avgReadinessScore;
    private long highRiskCount;
    private long reportsGenerated;
}
