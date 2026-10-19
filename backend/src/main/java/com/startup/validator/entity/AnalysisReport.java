package com.startup.validator.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Type;
import io.hypersistence.utils.hibernate.type.json.JsonType;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

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

    // --- New structured analysis fields ---

    @Column(name = "executive_summary", columnDefinition = "TEXT")
    private String executiveSummary;

    @Column(name = "readiness_score")
    private Integer readinessScore;

    @Column(name = "score_explanation", columnDefinition = "TEXT")
    private String scoreExplanation;

    @Type(JsonType.class)
    @Column(name = "evaluation_dimensions", columnDefinition = "json")
    private List<Map<String, Object>> evaluationDimensions;

    @Type(JsonType.class)
    @Column(columnDefinition = "json")
    private List<String> strengths;

    @Type(JsonType.class)
    @Column(columnDefinition = "json")
    private List<String> weaknesses;

    @Type(JsonType.class)
    @Column(columnDefinition = "json")
    private List<String> opportunities;

    @Type(JsonType.class)
    @Column(columnDefinition = "json")
    private List<String> threats;

    @Type(JsonType.class)
    @Column(columnDefinition = "json")
    private List<Map<String, Object>> risks;

    @Type(JsonType.class)
    @Column(name = "recommendations_list", columnDefinition = "json")
    private List<Map<String, Object>> recommendations;

    @Column(name = "market_assessment", columnDefinition = "TEXT")
    private String marketAssessment;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "startup_idea_id", unique = true)
    private StartupIdea startupIdea;

    @OneToMany(mappedBy = "analysis", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<Competitor> competitors;

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
    }
}
