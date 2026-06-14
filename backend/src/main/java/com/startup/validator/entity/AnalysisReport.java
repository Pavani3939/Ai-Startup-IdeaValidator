package com.startup.validator.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "analysis_reports")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisReport {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(columnDefinition = "TEXT")
    private String summary;

    @Type(JsonType.class)
    @Column(columnDefinition = "json")
    private List<String> advantages;

    @Type(JsonType.class)
    @Column(columnDefinition = "json")
    private List<String> disadvantages;

    @Column(name = "market_potential", columnDefinition = "TEXT")
    private String marketPotential;

    @Type(JsonType.class)
    @Column(name = "improvement_suggestions", columnDefinition = "json")
    private List<String> improvementSuggestions;

    @Column(name = "success_score")
    private Integer successScore;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "startup_idea_id", unique = true)
    private StartupIdea startupIdea;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
