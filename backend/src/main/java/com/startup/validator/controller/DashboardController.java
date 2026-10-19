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

    @GetMapping
    public ResponseEntity<DashboardDTO> getDashboard(@AuthenticationPrincipal UserDetails userDetails) {
        Long userId = null;
        if (userDetails != null) {
            userId = userRepository.findByEmail(userDetails.getUsername())
                    .map(User::getId)
                    .orElse(null);
        }

        if (userId == null) {
            // Default demo metrics fallback
            userId = userRepository.findByEmail("demo@startupvalidator.com")
                    .map(User::getId)
                    .orElse(1L);
        }

        DashboardDTO metrics = ideaService.getDashboardMetrics(userId);
        return ResponseEntity.ok(metrics);
    }
}
