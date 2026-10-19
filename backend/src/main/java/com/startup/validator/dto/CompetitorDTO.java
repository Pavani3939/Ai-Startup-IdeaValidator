package com.startup.validator.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CompetitorDTO {
    private Long id;
    private String name;
    private String website;
    private String summary;
    private String targetSegment;
    private String strengths;
    private String weaknesses;
    private String differentiation;
    private String sourceUrl;
    private LocalDateTime retrievedAt;
}
