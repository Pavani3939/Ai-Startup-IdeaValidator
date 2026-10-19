package com.startup.validator.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "startup_ideas")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class StartupIdea {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private String industry;

    @Column(name = "target_audience", columnDefinition = "TEXT")
    private String targetAudience;

    @Column(name = "problem_statement", columnDefinition = "TEXT")
    private String problemStatement;

    @Column(name = "proposed_solution", columnDefinition = "TEXT")
    private String proposedSolution;

    @Column(name = "business_model")
    private String businessModel;

    @Column(name = "target_geography")
    private String targetGeography;

    @Column(name = "estimated_budget")
    private Double estimatedBudget;

    @Column(name = "expected_monthly_expenses")
    private Double expectedMonthlyExpenses;

    @Column(name = "expected_monthly_revenue")
    private Double expectedMonthlyRevenue;

    @Column(name = "current_stage")
    private String currentStage;

    @Column(name = "known_competitors", columnDefinition = "TEXT")
    private String knownCompetitors;

    @Column(name = "additional_notes", columnDefinition = "TEXT")
    private String additionalNotes;

    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @OneToOne(mappedBy = "startupIdea", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private AnalysisReport report;

    @OneToMany(mappedBy = "startupIdea", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<FinancialProjection> financialProjections = new ArrayList<>();

    @OneToMany(mappedBy = "startupIdea", cascade = CascadeType.ALL, fetch = FetchType.LAZY)
    private List<RoadmapTask> roadmapTasks = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = LocalDateTime.now();
        updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
