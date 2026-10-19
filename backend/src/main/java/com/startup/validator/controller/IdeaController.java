package com.startup.validator.controller;

import com.startup.validator.dto.AnalysisResponseDTO;
import com.startup.validator.dto.HistoryResponseDTO;
import com.startup.validator.dto.IdeaDetailResponseDTO;
import com.startup.validator.dto.IdeaRequestDTO;
import com.startup.validator.entity.AnalysisReport;
import com.startup.validator.entity.StartupIdea;
import com.startup.validator.entity.User;
import com.startup.validator.repository.AnalysisReportRepository;
import com.startup.validator.repository.StartupIdeaRepository;
import com.startup.validator.repository.UserRepository;
import com.startup.validator.service.IdeaService;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/ideas")
public class IdeaController {

    private final IdeaService ideaService;
    private final AnalysisReportRepository reportRepository;
    private final UserRepository userRepository;
    private final StartupIdeaRepository ideaRepository;

    public IdeaController(IdeaService ideaService,
                          AnalysisReportRepository reportRepository,
                          UserRepository userRepository,
                          StartupIdeaRepository ideaRepository) {
        this.ideaService = ideaService;
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.ideaRepository = ideaRepository;
    }

    @PostMapping("/analyze")
    public ResponseEntity<?> analyzeIdea(@Valid @RequestBody IdeaRequestDTO request,
                                         @AuthenticationPrincipal UserDetails userDetails) {
        String description = request.getDescription();
        if (description == null || description.length() < 20 || !description.contains(" ")) {
            return ResponseEntity.badRequest().body(Map.of("message", "Invalid input: Please provide a descriptive overview of your startup concept."));
        }
        String userEmail = userDetails != null ? userDetails.getUsername() : null;
        AnalysisResponseDTO response = ideaService.processIdea(request, userEmail);
        return ResponseEntity.ok(response);
    }

    // Helper to resolve authenticated user ID
    private Long resolveUserId(UserDetails userDetails) {
        if (userDetails != null) {
            return userRepository.findByEmail(userDetails.getUsername())
                    .map(User::getId)
                    .orElse(null);
        }
        return null;
    }

    // Helper to verify ownership of a startup idea
    private StartupIdea getIdeaIfOwned(Long ideaId, Long userId) {
        return ideaRepository.findById(ideaId)
                .filter(i -> userId != null && i.getUser() != null && userId.equals(i.getUser().getId()))
                .orElseThrow(() -> new IllegalArgumentException("Idea not found or not owned by user"));
    }

    @GetMapping
    public ResponseEntity<Page<HistoryResponseDTO>> getUserIdeas(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @AuthenticationPrincipal UserDetails userDetails) {

        Long userId = resolveUserId(userDetails);
        if (userId == null) {
            // Unauthenticated users receive no data
            return ResponseEntity.ok(Page.empty());
        }
        Page<AnalysisReport> reports = reportRepository.findByUserId(userId,
                PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, sortBy)));
        Page<HistoryResponseDTO> dtoPage = reports.map(r -> new HistoryResponseDTO(
                r.getId(),
                r.getStartupIdea() != null ? r.getStartupIdea().getTitle() : "Idea",
                r.getStartupIdea() != null ? r.getStartupIdea().getIndustry() : "General",
                r.getExecutiveSummary() != null ? r.getExecutiveSummary() : r.getSummary(),
                r.getSuccessScore(),
                r.getCreatedAt(),
                r.getReadinessScore() != null ? r.getReadinessScore() : (r.getSuccessScore() != null ? r.getSuccessScore() * 10 : 70)
        ));
        return ResponseEntity.ok(dtoPage);
    }

    @GetMapping("/{id}")
    public ResponseEntity<IdeaDetailResponseDTO> getIdeaById(@PathVariable Long id,
                                                             @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        // Ensure the authenticated user owns the idea (or allow demo fallback if unauthenticated)
        if (userId != null) {
            getIdeaIfOwned(id, userId);
        }
        IdeaDetailResponseDTO detail = ideaService.getIdeaDetail(id, userId);
        return ResponseEntity.ok(detail);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteIdea(@PathVariable Long id,
                                        @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        if (userId != null) {
            getIdeaIfOwned(id, userId);
        }
        ideaService.deleteIdea(id, userId);
        return ResponseEntity.ok(Map.of("message", "Idea deleted successfully"));
    }

    @GetMapping("/history")
    public ResponseEntity<Page<HistoryResponseDTO>> getHistory(@RequestParam(defaultValue = "0") int page,
                                                                @RequestParam(defaultValue = "10") int size,
                                                                @RequestParam(defaultValue = "createdAt") String sortBy,
                                                                @AuthenticationPrincipal UserDetails userDetails) {
        return getUserIdeas(page, size, sortBy, userDetails);
    }
}
