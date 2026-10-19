package com.startup.validator.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class HistoryResponseDTO {
    private Long id;
    private String title;
    private String industry;
    private String summary;
    private Integer successScore;
    private LocalDateTime createdAt;
    private Integer readinessScore;

    public HistoryResponseDTO(Long id, String title, String industry, String summary, Integer successScore, LocalDateTime createdAt) {
        this.id = id;
        this.title = title;
        this.industry = industry;
        this.summary = summary;
        this.successScore = successScore;
        this.createdAt = createdAt;
        this.readinessScore = successScore != null ? (successScore <= 10 ? successScore * 10 : successScore) : null;
    }
}
