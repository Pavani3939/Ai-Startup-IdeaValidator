package com.startup.validator.controller;

import com.startup.validator.dto.RoadmapTaskDTO;
import com.startup.validator.service.RoadmapService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
public class RoadmapController {

    private final RoadmapService roadmapService;

    public RoadmapController(RoadmapService roadmapService) {
        this.roadmapService = roadmapService;
    }

    @GetMapping("/api/ideas/{id}/roadmap")
    public ResponseEntity<List<RoadmapTaskDTO>> getRoadmap(@PathVariable Long id) {
        List<RoadmapTaskDTO> tasks = roadmapService.getRoadmapByIdeaId(id);
        return ResponseEntity.ok(tasks);
    }

    @PostMapping("/api/ideas/{id}/roadmap/tasks")
    public ResponseEntity<RoadmapTaskDTO> addTask(@PathVariable Long id, @Valid @RequestBody RoadmapTaskDTO dto) {
        RoadmapTaskDTO created = roadmapService.addTask(id, dto);
        return ResponseEntity.ok(created);
    }

    @PutMapping("/api/roadmap/tasks/{taskId}")
    public ResponseEntity<RoadmapTaskDTO> updateTask(@PathVariable Long taskId, @RequestBody RoadmapTaskDTO dto) {
        RoadmapTaskDTO updated = roadmapService.updateTask(taskId, dto);
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/api/roadmap/tasks/{taskId}")
    public ResponseEntity<?> deleteTask(@PathVariable Long taskId) {
        roadmapService.deleteTask(taskId);
        return ResponseEntity.ok(Map.of("message", "Task deleted successfully"));
    }
}
