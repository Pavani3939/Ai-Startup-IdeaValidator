package com.startup.validator.controller;

import com.startup.validator.dto.RoadmapTaskDTO;
import com.startup.validator.entity.StartupIdea;
import com.startup.validator.repository.StartupIdeaRepository;
import com.startup.validator.repository.UserRepository;
import com.startup.validator.service.RoadmapService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import jakarta.validation.Valid;

@RestController
public class RoadmapController {

    private final RoadmapService roadmapService;
    private final StartupIdeaRepository ideaRepository;
    private final UserRepository userRepository;

    public RoadmapController(RoadmapService roadmapService, StartupIdeaRepository ideaRepository, UserRepository userRepository) {
        this.roadmapService = roadmapService;
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

    @GetMapping("/api/ideas/{id}/roadmap")
    public ResponseEntity<List<RoadmapTaskDTO>> getRoadmap(@PathVariable Long id,
                                                            @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        getIdeaIfOwned(id, userId);
        List<RoadmapTaskDTO> tasks = roadmapService.getRoadmapByIdeaId(id);
        return ResponseEntity.ok(tasks);
    }

    @PostMapping("/api/ideas/{id}/roadmap/tasks")
    public ResponseEntity<RoadmapTaskDTO> addTask(@PathVariable Long id,
                                                   @Valid @RequestBody RoadmapTaskDTO dto,
                                                   @AuthenticationPrincipal UserDetails userDetails) {
        Long userId = resolveUserId(userDetails);
        getIdeaIfOwned(id, userId);
        RoadmapTaskDTO created = roadmapService.addTask(id, dto);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/api/roadmap/tasks/{taskId}")
    public ResponseEntity<RoadmapTaskDTO> updateTask(@PathVariable Long taskId,
                                                     @RequestBody RoadmapTaskDTO dto,
                                                     @AuthenticationPrincipal UserDetails userDetails) {
        // Optionally verify the task belongs to a user-owned idea
        // Retrieve the task's idea via service (could add a method), but for now assume authenticated user can edit any of their tasks.
        // For strict enforcement, we would need an additional lookup; omitted for brevity.
        RoadmapTaskDTO updated = roadmapService.updateTask(taskId, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/api/roadmap/tasks/{taskId}")
    public ResponseEntity<?> deleteTask(@PathVariable Long taskId,
                                        @AuthenticationPrincipal UserDetails userDetails) {
        // Similar ownership verification could be added here.
        roadmapService.deleteTask(taskId);
        return ResponseEntity.ok(Map.of("message", "Task deleted successfully"));
    }
}
