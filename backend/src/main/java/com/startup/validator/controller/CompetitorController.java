package com.startup.validator.controller;

import com.startup.validator.dto.CompetitorDTO;
import com.startup.validator.entity.StartupIdea;
import com.startup.validator.repository.IdeaRepository;
import com.startup.validator.repository.UserRepository;
import com.startup.validator.service.CompetitorService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ideas")
public class CompetitorController {

    private final CompetitorService competitorService;
    private final IdeaRepository ideaRepository;
    private final UserRepository userRepository;

    public CompetitorController(CompetitorService competitorService, IdeaRepository ideaRepository, UserRepository userRepository) {
        this.competitorService = competitorService;
        this.ideaRepository = ideaRepository;
        this.userRepository = userRepository;
    }

    private Long resolveUserId(UserDetails userDetails) {
        if (userDetails != null) {
            return userRepository.findByEmail(userDetails.getUsername())
                    .map(u -> u.getId())
                    .orElse(null);
        }
        return null;
    }

    private StartupIdea getIdeaIfOwned(Long ideaId, Long userId) {
        return ideaRepository.findById(ideaId)
                .filter(i -> userId != null && i.getUser() != null && userId.equals(i.getUser().getId()))
                .orElseThrow(() -> new IllegalArgumentException("Idea not found or not owned by user"));
    }

    @GetMapping("/{id}/competitors")
    public ResponseEntity<List<CompetitorDTO>> getCompetitors(@PathVariable Long id,
                                                               @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        getIdeaIfOwned(id, userId);
        List<CompetitorDTO> competitors = competitorService.getCompetitorsByIdeaId(id);
        return ResponseEntity.ok(competitors);
    }

    @PostMapping("/{id}/competitors/analyze")
    public ResponseEntity<List<CompetitorDTO>> analyzeCompetitors(@PathVariable Long id,
                                                                   @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        getIdeaIfOwned(id, userId);
        List<CompetitorDTO> competitors = competitorService.analyzeCompetitors(id);
        return ResponseEntity.ok(competitors);
    }
}
