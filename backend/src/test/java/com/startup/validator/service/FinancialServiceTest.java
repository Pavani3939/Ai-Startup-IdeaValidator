package com.startup.validator.service;

import com.startup.validator.dto.FinancialRequestDTO;
import com.startup.validator.dto.FinancialResponseDTO;
import com.startup.validator.entity.FinancialProjection;
import com.startup.validator.entity.StartupIdea;
import com.startup.validator.repository.FinancialProjectionRepository;
import com.startup.validator.repository.StartupIdeaRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FinancialServiceTest {

    @Mock
    private FinancialProjectionRepository financialRepository;

    @Mock
    private StartupIdeaRepository ideaRepository;

    @InjectMocks
    private FinancialService financialService;

    private StartupIdea sampleIdea;

    @BeforeEach
    void setUp() {
        sampleIdea = new StartupIdea();
        sampleIdea.setId(1L);
        sampleIdea.setTitle("EcoTech SaaS");
    }

    @Test
    @DisplayName("Should accurately calculate revenue, costs, operating profit, and break-even metrics")
    void testStandardFinancialCalculations() {
        when(ideaRepository.findById(1L)).thenReturn(Optional.of(sampleIdea));
        when(financialRepository.save(any(FinancialProjection.class)))
                .thenAnswer(invocation -> {
                    FinancialProjection p = invocation.getArgument(0);
                    p.setId(101L);
                    return p;
                });

        FinancialRequestDTO request = new FinancialRequestDTO(
                10000.0, // initial investment
                3000.0,  // fixed monthly cost
                20.0,    // variable cost per unit
                100.0,   // selling price per unit
                100      // expected monthly units
        );

        FinancialResponseDTO response = financialService.calculateAndSave(1L, request);

        assertNotNull(response);
        // Revenue: 100 * 100 = 10,000
        assertEquals(10000.0, response.getEstimatedRevenue());
        // Variable Costs: 20 * 100 = 2,000
        assertEquals(2000.0, response.getEstimatedVariableCosts());
        // Total Costs: 3,000 (fixed) + 2,000 (variable) = 5,000
        assertEquals(5000.0, response.getEstimatedTotalCosts());
        // Operating Profit: 10,000 - 5,000 = 5,000
        assertEquals(5000.0, response.getEstimatedOperatingProfit());
        // Operating Margin: (5,000 / 10,000) * 100 = 50.0%
        assertEquals(50.0, response.getOperatingMarginPercent());
        // Contribution Margin: 100 - 20 = 80 per unit
        // Break-even units: ceil(3,000 / 80) = ceil(37.5) = 38 units
        assertEquals(38, response.getBreakEvenUnits());
        // Break-even revenue: 38 * 100 = 3,800
        assertEquals(3800.0, response.getBreakEvenRevenue());
    }

    @Test
    @DisplayName("Should handle zero revenue / units sold safely without dividing by zero")
    void testZeroUnitsEdgeCase() {
        when(ideaRepository.findById(1L)).thenReturn(Optional.of(sampleIdea));
        when(financialRepository.save(any(FinancialProjection.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        FinancialRequestDTO request = new FinancialRequestDTO(
                5000.0,
                1500.0,
                10.0,
                50.0,
                0 // 0 expected units
        );

        FinancialResponseDTO response = financialService.calculateAndSave(1L, request);

        assertEquals(0.0, response.getEstimatedRevenue());
        assertEquals(1500.0, response.getEstimatedTotalCosts());
        assertEquals(-1500.0, response.getEstimatedOperatingProfit());
        assertNull(response.getOperatingMarginPercent()); // Revenue is 0, so margin is not calculated
        assertEquals(38, response.getBreakEvenUnits()); // 1500 / 40 = 37.5 -> 38
    }

    @Test
    @DisplayName("Should handle non-positive contribution margin where break-even is impossible")
    void testNegativeContributionMargin() {
        when(ideaRepository.findById(1L)).thenReturn(Optional.of(sampleIdea));
        when(financialRepository.save(any(FinancialProjection.class)))
                .thenAnswer(invocation -> invocation.getArgument(0));

        FinancialRequestDTO request = new FinancialRequestDTO(
                5000.0,
                1000.0,
                50.0, // variable cost per unit exceeds price
                40.0, // selling price
                10
        );

        FinancialResponseDTO response = financialService.calculateAndSave(1L, request);

        assertNull(response.getBreakEvenUnits()); // Cannot break even with negative CM
        assertNull(response.getBreakEvenRevenue());
        assertTrue(response.getContributionMarginPerUnit() < 0);
    }

    @Test
    @DisplayName("Should reject invalid negative financial inputs")
    void testNegativeInputRejection() {
        when(ideaRepository.findById(1L)).thenReturn(Optional.of(sampleIdea));

        FinancialRequestDTO request = new FinancialRequestDTO(
                -500.0, 1000.0, 10.0, 50.0, 10
        );

        assertThrows(IllegalArgumentException.class, () -> financialService.calculateAndSave(1L, request));
    }
}
