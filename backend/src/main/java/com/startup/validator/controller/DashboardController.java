package com.startup.validator.controller;

import com.startup.validator.dto.DashboardDTO;
import com.startup.validator.entity.User;
import com.startup.validator.repository.UserRepository;
import com.startup.validator.service.IdeaService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/dashboard")
public class DashboardController {

    private final IdeaService ideaService;
    private final UserRepository userRepository;

    public DashboardController(IdeaService ideaService, UserRepository userRepository) {
        this.ideaService = ideaService;
        this.userRepository = userRepository;
    }

    private Long resolveUserId(UserDetails userDetails) {
        if (userDetails != null) {
            return userRepository.findByEmail(userDetails.getUsername())
                    .map(User::getId)
                    .orElse(null);
        }
        return null;
    }

    @GetMapping
    public ResponseEntity<DashboardDTO> getDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        if (userId == null) {
            // Return empty metrics for unauthenticated users
            DashboardDTO empty = DashboardDTO.builder()
                    .totalIdeas(0L)
                    .avgReadinessScore(0.0)
                    .highRiskCount(0L)
                    .reportsGenerated(0L)
                    .build();
            return ResponseEntity.ok(empty);
        }
        DashboardDTO metrics = ideaService.getDashboardMetrics(userId);
        return ResponseEntity.ok(metrics);
    }
}
