package com.startup.validator.controller;

import com.startup.validator.dto.CompetitorDTO;
import com.startup.validator.service.CompetitorService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ideas")
public class CompetitorController {

    private final CompetitorService competitorService;

    public CompetitorController(CompetitorService competitorService) {
        this.competitorService = competitorService;
    }

    @GetMapping("/{id}/competitors")
    public ResponseEntity<List<CompetitorDTO>> getCompetitors(@PathVariable Long id) {
        List<CompetitorDTO> competitors = competitorService.getCompetitorsByIdeaId(id);
        return ResponseEntity.ok(competitors);
    }

    @PostMapping("/{id}/competitors/analyze")
    public ResponseEntity<List<CompetitorDTO>> analyzeCompetitors(@PathVariable Long id) {
        List<CompetitorDTO> competitors = competitorService.analyzeCompetitors(id);
        return ResponseEntity.ok(competitors);
    }
}
