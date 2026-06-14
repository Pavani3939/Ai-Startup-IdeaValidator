package com.startup.validator.controller;

import com.startup.validator.dto.AnalysisResponseDTO;
import com.startup.validator.entity.AnalysisReport;
import com.startup.validator.exception.ResourceNotFoundException;
import com.startup.validator.repository.AnalysisReportRepository;
import com.startup.validator.service.PdfService;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final AnalysisReportRepository reportRepository;
    private final PdfService pdfService;

    public ReportController(AnalysisReportRepository reportRepository, PdfService pdfService) {
        this.reportRepository = reportRepository;
        this.pdfService = pdfService;
    }

    @GetMapping("/{id}")
    public ResponseEntity<AnalysisResponseDTO> getReport(@PathVariable Long id) {
        AnalysisReport report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + id));

        AnalysisResponseDTO response = new AnalysisResponseDTO(
                report.getId(),
                report.getStartupIdea().getId(),
                report.getSummary(),
                report.getAdvantages(),
                report.getDisadvantages(),
                report.getMarketPotential(),
                report.getImprovementSuggestions(),
                report.getSuccessScore()
        );
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}/pdf")
    public ResponseEntity<byte[]> getReportPdf(@PathVariable Long id) {
        AnalysisReport report = reportRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Report not found with id: " + id));

        byte[] pdfBytes = pdfService.generateReportPdf(report);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "startup-analysis-" + id + ".pdf");

        return ResponseEntity.ok()
                .headers(headers)
                .body(pdfBytes);
    }
}
