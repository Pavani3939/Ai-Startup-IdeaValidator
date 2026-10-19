package com.startup.validator.controller;

import com.startup.validator.dto.FinancialRequestDTO;
import com.startup.validator.dto.FinancialResponseDTO;
import com.startup.validator.service.FinancialService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ideas")
public class FinancialController {

    private final FinancialService financialService;

    public FinancialController(FinancialService financialService) {
        this.financialService = financialService;
    }

    @GetMapping("/{id}/financial-projection")
    public ResponseEntity<FinancialResponseDTO> getFinancialProjection(@PathVariable Long id) {
        FinancialResponseDTO response = financialService.getLatestProjection(id);
        if (response == null) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(response);
    }

    @PostMapping("/{id}/financial-projection")
    public ResponseEntity<FinancialResponseDTO> calculateFinancialProjection(
            @PathVariable Long id,
            @Valid @RequestBody FinancialRequestDTO request) {
        FinancialResponseDTO response = financialService.calculateAndSave(id, request);
        return ResponseEntity.ok(response);
    }
}
