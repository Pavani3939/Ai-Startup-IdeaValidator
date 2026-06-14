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
}
