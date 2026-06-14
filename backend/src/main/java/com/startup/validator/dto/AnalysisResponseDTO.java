package com.startup.validator.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisResponseDTO {
    private Long id;
    private Long ideaId;
    private String summary;
    private List<String> advantages;
    private List<String> disadvantages;
    private String marketPotential;
    private List<String> suggestions;
    private Integer successScore;
}
