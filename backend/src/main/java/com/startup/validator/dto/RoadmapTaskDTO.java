package com.startup.validator.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RoadmapTaskDTO {
    private Long id;
    private Long startupIdeaId;

    @NotBlank(message = "Task title is required")
    private String title;

    private String description;
    private String priority; // LOW, MEDIUM, HIGH
    private String status;   // PENDING, IN_PROGRESS, COMPLETED
    private String phase;    // e.g. "Phase 1: Validate Problem"
    private String estimatedTimeframe;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
