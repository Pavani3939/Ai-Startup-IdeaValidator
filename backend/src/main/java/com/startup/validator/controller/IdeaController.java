package com.startup.validator.controller;

import com.startup.validator.dto.AnalysisResponseDTO;
import com.startup.validator.dto.HistoryResponseDTO;
import com.startup.validator.dto.IdeaRequestDTO;
import com.startup.validator.entity.AnalysisReport;
import com.startup.validator.repository.AnalysisReportRepository;
import com.startup.validator.service.IdeaService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/ideas")
public class IdeaController {

    private final IdeaService ideaService;
    private final AnalysisReportRepository reportRepository;

    public IdeaController(IdeaService ideaService, AnalysisReportRepository reportRepository) {
        this.ideaService = ideaService;
        this.reportRepository = reportRepository;
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeIdea(@Valid @RequestBody IdeaRequestDTO request) {
        String description = request.getDescription();
        if (description == null || description.length() < 30 || description.chars().distinct().count() < 10 || !description.contains(" ")) {
            return ResponseEntity.badRequest().body(java.util.Map.of("message", "Invalid input: Please provide a meaningful and detailed business description instead of placeholder text."));
        }
        
        AnalysisResponseDTO response = ideaService.processIdea(request);
        return ResponseEntity.ok(response);
    }

    @GetMapping("/history")
    public ResponseEntity<Page<HistoryResponseDTO>> getHistory(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy) {
        
        Page<AnalysisReport> reports = reportRepository.findAll(PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortBy)));
        
        Page<HistoryResponseDTO> dtoPage = reports.map(report -> new HistoryResponseDTO(
                report.getId(),
                report.getStartupIdea().getTitle(),
                report.getStartupIdea().getIndustry(),
                report.getSummary(),
                report.getSuccessScore(),
                report.getCreatedAt()
        ));
        
        return ResponseEntity.ok(dtoPage);
    }
}
