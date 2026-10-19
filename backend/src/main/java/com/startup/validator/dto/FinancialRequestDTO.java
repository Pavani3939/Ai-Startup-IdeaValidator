package com.startup.validator.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class FinancialRequestDTO {

    @NotNull(message = "Initial investment is required")
    @Min(value = 0, message = "Initial investment must be non-negative")
    private Double initialInvestment;

    @NotNull(message = "Monthly fixed costs is required")
    @Min(value = 0, message = "Monthly fixed costs must be non-negative")
    private Double monthlyFixedCosts;

    @NotNull(message = "Variable cost per unit is required")
    @Min(value = 0, message = "Variable cost per unit must be non-negative")
    private Double variableCostPerUnit;

    @NotNull(message = "Selling price per unit is required")
    @Min(value = 0, message = "Selling price per unit must be non-negative")
    private Double sellingPricePerUnit;

    @NotNull(message = "Expected monthly units is required")
    @Min(value = 0, message = "Expected units must be non-negative")
    private Integer expectedUnits;
}
