package com.startup.validator.service;

import com.startup.validator.dto.FinancialRequestDTO;
import com.startup.validator.dto.FinancialResponseDTO;
import com.startup.validator.entity.FinancialProjection;
import com.startup.validator.entity.StartupIdea;
import com.startup.validator.exception.ResourceNotFoundException;
import com.startup.validator.repository.FinancialProjectionRepository;
import com.startup.validator.repository.StartupIdeaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;

@Service
public class FinancialService {

    private final FinancialProjectionRepository financialRepository;
    private final StartupIdeaRepository ideaRepository;

    public FinancialService(FinancialProjectionRepository financialRepository,
                            StartupIdeaRepository ideaRepository) {
        this.financialRepository = financialRepository;
        this.ideaRepository = ideaRepository;
    }

    public FinancialResponseDTO getLatestProjection(Long ideaId) {
        return financialRepository.findTopByStartupIdeaIdOrderByCreatedAtDesc(ideaId)
                .map(this::mapToDTO)
                .orElse(null);
    }

    @Transactional
    public FinancialResponseDTO calculateAndSave(Long ideaId, FinancialRequestDTO request) {
        StartupIdea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new ResourceNotFoundException("Startup idea not found: " + ideaId));

        validateInputs(request);

        double price = request.getSellingPricePerUnit();
        int units = request.getExpectedUnits();
        double variableCost = request.getVariableCostPerUnit();
        double fixedCost = request.getMonthlyFixedCosts();
        double initialInvestment = request.getInitialInvestment();

        // Deterministic calculations
        double revenue = round(price * units);
        double totalVariableCosts = round(variableCost * units);
        double totalCosts = round(fixedCost + totalVariableCosts);
        double operatingProfit = round(revenue - totalCosts);

        double contributionMargin = price - variableCost;
        Integer breakEvenUnits = null;
        Double breakEvenRevenue = null;

        if (contributionMargin > 0.0001) {
            breakEvenUnits = (int) Math.ceil(fixedCost / contributionMargin);
            breakEvenRevenue = round(breakEvenUnits * price);
        }

        Double operatingMargin = null;
        if (revenue > 0) {
            operatingMargin = round((operatingProfit / revenue) * 100.0);
        }

        FinancialProjection projection = new FinancialProjection();
        projection.setStartupIdea(idea);
        projection.setInitialInvestment(round(initialInvestment));
        projection.setMonthlyFixedCosts(round(fixedCost));
        projection.setVariableCostPerUnit(round(variableCost));
        projection.setSellingPricePerUnit(round(price));
        projection.setExpectedUnits(units);
        projection.setEstimatedRevenue(revenue);
        projection.setEstimatedVariableCosts(totalVariableCosts);
        projection.setEstimatedTotalCosts(totalCosts);
        projection.setEstimatedOperatingProfit(operatingProfit);
        projection.setOperatingMarginPercent(operatingMargin);
        projection.setBreakEvenUnits(breakEvenUnits);
        projection.setBreakEvenRevenue(breakEvenRevenue);

        projection = financialRepository.save(projection);

        return mapToDTO(projection);
    }

    private void validateInputs(FinancialRequestDTO request) {
        if (request.getInitialInvestment() == null || request.getInitialInvestment() < 0) {
            throw new IllegalArgumentException("Initial investment must be zero or positive.");
        }
        if (request.getMonthlyFixedCosts() == null || request.getMonthlyFixedCosts() < 0) {
            throw new IllegalArgumentException("Monthly fixed costs must be zero or positive.");
        }
        if (request.getVariableCostPerUnit() == null || request.getVariableCostPerUnit() < 0) {
            throw new IllegalArgumentException("Variable cost per unit must be zero or positive.");
        }
        if (request.getSellingPricePerUnit() == null || request.getSellingPricePerUnit() < 0) {
            throw new IllegalArgumentException("Selling price per unit must be zero or positive.");
        }
        if (request.getExpectedUnits() == null || request.getExpectedUnits() < 0) {
            throw new IllegalArgumentException("Expected monthly units must be zero or positive.");
        }
    }

    public FinancialResponseDTO mapToDTO(FinancialProjection p) {
        double contributionMargin = round(p.getSellingPricePerUnit() - p.getVariableCostPerUnit());

        String notes = "Calculated figures represent operating profit estimates prior to taxes, financing costs, and non-operating amortization.";
        if (contributionMargin <= 0) {
            notes += " Warning: Negative or zero contribution margin per unit means the product loses money on every unit sold before fixed costs.";
        }

        return FinancialResponseDTO.builder()
                .id(p.getId())
                .startupIdeaId(p.getStartupIdea().getId())
                .initialInvestment(p.getInitialInvestment())
                .monthlyFixedCosts(p.getMonthlyFixedCosts())
                .variableCostPerUnit(p.getVariableCostPerUnit())
                .sellingPricePerUnit(p.getSellingPricePerUnit())
                .expectedUnits(p.getExpectedUnits())
                .estimatedRevenue(p.getEstimatedRevenue())
                .estimatedVariableCosts(p.getEstimatedVariableCosts())
                .estimatedTotalCosts(p.getEstimatedTotalCosts())
                .estimatedOperatingProfit(p.getEstimatedOperatingProfit())
                .operatingMarginPercent(p.getOperatingMarginPercent())
                .breakEvenUnits(p.getBreakEvenUnits())
                .breakEvenRevenue(p.getBreakEvenRevenue())
                .contributionMarginPerUnit(contributionMargin)
                .createdAt(p.getCreatedAt())
                .financialNotes(notes)
                .build();
    }

    private double round(double value) {
        return BigDecimal.valueOf(value)
                .setScale(2, RoundingMode.HALF_UP)
                .doubleValue();
    }
}
