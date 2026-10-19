package com.startup.validator.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;

@Entity
@Table(name = "financial_projections")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FinancialProjection {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "startup_idea_id")
    private StartupIdea startupIdea;

    @Column(name = "initial_investment")
    private Double initialInvestment;

    @Column(name = "monthly_fixed_costs")
    private Double monthlyFixedCosts;

    @Column(name = "variable_cost_per_unit")
    private Double variableCostPerUnit;

    @Column(name = "selling_price_per_unit")
    private Double sellingPricePerUnit;

    @Column(name = "expected_units")
    private Integer expectedUnits;

    @Column(name = "estimated_revenue")
    private Double estimatedRevenue;

    @Column(name = "estimated_variable_costs")
    private Double estimatedVariableCosts;

    @Column(name = "estimated_total_costs")
    private Double estimatedTotalCosts;

    @Column(name = "estimated_operating_profit")
    private Double estimatedOperatingProfit;

    @Column(name = "operating_margin_percent")
    private Double operatingMarginPercent;

    @Column(name = "break_even_units")
    private Integer breakEvenUnits;

    @Column(name = "break_even_revenue")
    private Double breakEvenRevenue;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
