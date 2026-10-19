package com.startup.validator.service;

import com.startup.validator.dto.*;
import com.startup.validator.entity.*;
import com.startup.validator.exception.ResourceNotFoundException;
import com.startup.validator.repository.*;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class IdeaService {

    private final StartupIdeaRepository ideaRepository;
    private final AnalysisReportRepository reportRepository;
    private final UserRepository userRepository;
    private final GeminiService geminiService;
    private final CompetitorRepository competitorRepository;
    private final FinancialProjectionRepository financialRepository;
    private final RoadmapTaskRepository roadmapRepository;

    public IdeaService(StartupIdeaRepository ideaRepository,
                       AnalysisReportRepository reportRepository,
                       UserRepository userRepository,
                       GeminiService geminiService,
                       CompetitorRepository competitorRepository,
                       FinancialProjectionRepository financialRepository,
                       RoadmapTaskRepository roadmapRepository) {
        this.ideaRepository = ideaRepository;
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.geminiService = geminiService;
        this.competitorRepository = competitorRepository;
        this.financialRepository = financialRepository;
        this.roadmapRepository = roadmapRepository;
    }

    @Transactional
    public AnalysisResponseDTO processIdea(IdeaRequestDTO request, String userEmail) {
        // Resolve user: use authenticated user if present, or fallback to default demo user
        User user = null;
        if (userEmail != null && !userEmail.isBlank()) {
            user = userRepository.findByEmail(userEmail.toLowerCase().trim()).orElse(null);
        }
        if (user == null) {
            user = userRepository.findByEmail("demo@startupvalidator.com").orElseGet(() -> {
                User newUser = new User();
                newUser.setName("Demo User");
                newUser.setEmail("demo@startupvalidator.com");
                newUser.setPasswordHash("$2a$10$7EqJtq98hPqEX7fNZaFWoO.8/f/fN7BqX2V7J7rC.P3kI.Q2sQf6W");
                return userRepository.save(newUser);
            });
        }

        // 1. Save Startup Idea with all fields
        StartupIdea idea = new StartupIdea();
        idea.setTitle(request.getTitle());
        idea.setDescription(request.getDescription());
        idea.setIndustry(request.getIndustry());
        idea.setTargetAudience(request.getTargetAudience());
        idea.setProblemStatement(request.getProblemStatement());
        idea.setProposedSolution(request.getProposedSolution());
        idea.setBusinessModel(request.getBusinessModel());
        idea.setTargetGeography(request.getTargetGeography());
        idea.setEstimatedBudget(request.getEstimatedBudget());
        idea.setExpectedMonthlyExpenses(request.getExpectedMonthlyExpenses());
        idea.setExpectedMonthlyRevenue(request.getExpectedMonthlyRevenue());
        idea.setCurrentStage(request.getCurrentStage());
        idea.setKnownCompetitors(request.getKnownCompetitors());
        idea.setAdditionalNotes(request.getAdditionalNotes());
        idea.setUser(user);
        idea = ideaRepository.save(idea);

        // 2. Call Structured AI Analysis (or fallback)
        AnalysisResponseDTO aiResponse = geminiService.analyzeIdea(request);

        // 3. Save Structured Report
        AnalysisReport report = new AnalysisReport();
        report.setStartupIdea(idea);
        report.setSummary(aiResponse.getSummary());
        report.setExecutiveSummary(aiResponse.getExecutiveSummary());
        report.setReadinessScore(aiResponse.getReadinessScore());
        report.setSuccessScore(aiResponse.getSuccessScore());
        report.setScoreExplanation(aiResponse.getScoreExplanation());
        report.setMarketPotential(aiResponse.getMarketPotential());
        report.setMarketAssessment(aiResponse.getMarketAssessment());
        report.setAdvantages(aiResponse.getAdvantages());
        report.setDisadvantages(aiResponse.getDisadvantages());
        report.setImprovementSuggestions(aiResponse.getSuggestions());
        report.setStrengths(aiResponse.getStrengths());
        report.setWeaknesses(aiResponse.getWeaknesses());
        report.setOpportunities(aiResponse.getOpportunities());
        report.setThreats(aiResponse.getThreats());
        report.setEvaluationDimensions(aiResponse.getEvaluationDimensions());
        report.setRisks(aiResponse.getRisks());
        report.setRecommendations(aiResponse.getRecommendations());
        report = reportRepository.save(report);

        // 4. Populate IDs and return
        aiResponse.setId(report.getId());
        aiResponse.setIdeaId(idea.getId());
        aiResponse.setStartupName(idea.getTitle());
        aiResponse.setIndustry(idea.getIndustry());

        return aiResponse;
    }

    // Overload for backward compatibility
    @Transactional
    public AnalysisResponseDTO processIdea(IdeaRequestDTO request) {
        return processIdea(request, null);
    }

    public Page<StartupIdea> getUserIdeas(Long userId, Pageable pageable) {
        return ideaRepository.findByUserId(userId, pageable);
    }

    public IdeaDetailResponseDTO getIdeaDetail(Long ideaId, Long userId) {
        StartupIdea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new ResourceNotFoundException("Startup idea not found: " + ideaId));

        // Check ownership if userId provided
        if (userId != null && idea.getUser() != null && !idea.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized to access this startup idea");
        }

        AnalysisReport report = reportRepository.findByStartupIdeaId(ideaId).orElse(null);
        AnalysisResponseDTO reportDTO = report != null ? mapReportToDTO(report) : null;

        FinancialProjection fp = financialRepository.findTopByStartupIdeaIdOrderByCreatedAtDesc(ideaId).orElse(null);
        FinancialResponseDTO fpDTO = fp != null ? mapFinancialToDTO(fp) : null;

        List<CompetitorDTO> competitors = competitorRepository.findByAnalysisStartupIdeaId(ideaId)
                .stream()
                .map(this::mapCompetitorToDTO)
                .collect(Collectors.toList());

        List<RoadmapTaskDTO> tasks = roadmapRepository.findByStartupIdeaIdOrderByCreatedAtAsc(ideaId)
                .stream()
                .map(this::mapRoadmapToDTO)
                .collect(Collectors.toList());

        return IdeaDetailResponseDTO.builder()
                .id(idea.getId())
                .title(idea.getTitle())
                .description(idea.getDescription())
                .industry(idea.getIndustry())
                .targetAudience(idea.getTargetAudience())
                .problemStatement(idea.getProblemStatement())
                .proposedSolution(idea.getProposedSolution())
                .businessModel(idea.getBusinessModel())
                .targetGeography(idea.getTargetGeography())
                .estimatedBudget(idea.getEstimatedBudget())
                .expectedMonthlyExpenses(idea.getExpectedMonthlyExpenses())
                .expectedMonthlyRevenue(idea.getExpectedMonthlyRevenue())
                .currentStage(idea.getCurrentStage())
                .knownCompetitors(idea.getKnownCompetitors())
                .additionalNotes(idea.getAdditionalNotes())
                .createdAt(idea.getCreatedAt())
                .updatedAt(idea.getUpdatedAt())
                .analysisReport(reportDTO)
                .financialProjection(fpDTO)
                .competitors(competitors)
                .roadmapTasks(tasks)
                .build();
    }

    @Transactional
    public void deleteIdea(Long ideaId, Long userId) {
        StartupIdea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new ResourceNotFoundException("Startup idea not found: " + ideaId));

        if (userId != null && idea.getUser() != null && !idea.getUser().getId().equals(userId)) {
            throw new IllegalArgumentException("Unauthorized to delete this startup idea");
        }

        ideaRepository.delete(idea);
    }

    public DashboardDTO getDashboardMetrics(Long userId) {
        long totalIdeas = ideaRepository.countByUserId(userId);
        Double avgScore = reportRepository.getAverageReadinessScoreByUserId(userId);
        long reportsGenerated = reportRepository.countByUserId(userId);

        // Approximate high risk count from reports
        long highRiskCount = 0;
        Page<AnalysisReport> reports = reportRepository.findByUserId(userId, Pageable.ofSize(50));
        for (AnalysisReport r : reports) {
            if (r.getRisks() != null) {
                for (var risk : r.getRisks()) {
                    Object severity = risk.get("severity");
                    if (severity != null && (severity.toString().equalsIgnoreCase("High") || severity.toString().equalsIgnoreCase("Critical"))) {
                        highRiskCount++;
                    }
                }
            }
        }

        return DashboardDTO.builder()
                .totalIdeas(totalIdeas)
                .avgReadinessScore(avgScore != null ? Math.round(avgScore * 10.0) / 10.0 : 0.0)
                .highRiskCount(highRiskCount)
                .reportsGenerated(reportsGenerated)
                .build();
    }

    public AnalysisResponseDTO mapReportToDTO(AnalysisReport r) {
        return AnalysisResponseDTO.builder()
                .id(r.getId())
                .ideaId(r.getStartupIdea() != null ? r.getStartupIdea().getId() : null)
                .startupName(r.getStartupIdea() != null ? r.getStartupIdea().getTitle() : null)
                .industry(r.getStartupIdea() != null ? r.getStartupIdea().getIndustry() : null)
                .analysisDate(r.getCreatedAt() != null ? r.getCreatedAt().toLocalDate().toString() : null)
                .summary(r.getSummary())
                .executiveSummary(r.getExecutiveSummary() != null ? r.getExecutiveSummary() : r.getSummary())
                .readinessScore(r.getReadinessScore() != null ? r.getReadinessScore() : (r.getSuccessScore() != null ? r.getSuccessScore() * 10 : 70))
                .successScore(r.getSuccessScore() != null ? r.getSuccessScore() : (r.getReadinessScore() != null ? r.getReadinessScore() / 10 : 7))
                .scoreExplanation(r.getScoreExplanation())
                .marketPotential(r.getMarketPotential())
                .marketAssessment(r.getMarketAssessment())
                .advantages(r.getAdvantages())
                .disadvantages(r.getDisadvantages())
                .suggestions(r.getImprovementSuggestions())
                .strengths(r.getStrengths() != null ? r.getStrengths() : r.getAdvantages())
                .weaknesses(r.getWeaknesses() != null ? r.getWeaknesses() : r.getDisadvantages())
                .opportunities(r.getOpportunities())
                .threats(r.getThreats())
                .evaluationDimensions(r.getEvaluationDimensions())
                .risks(r.getRisks())
                .recommendations(r.getRecommendations())
                .build();
    }

    private FinancialResponseDTO mapFinancialToDTO(FinancialProjection p) {
        double cm = p.getSellingPricePerUnit() - p.getVariableCostPerUnit();
        return FinancialResponseDTO.builder()
                .id(p.getId())
                .startupIdeaId(p.getStartupIdea().getId())
                .initialInvestment(p.getInitialInvestment())
                .monthlyFixedCosts(p.getMonthlyFixedCosts())
                .variableCostPerUnit(p.getVariableCostPerUnit())
                .sellingPricePerUnit(p.getSellingPricePerUnit())
                .expectedUnits(p.getExpectedUnits())
                .estimatedRevenue(p.getEstimatedRevenue())
                .estimatedVariableCosts(p.getEstimatedVariableCosts())
                .estimatedTotalCosts(p.getEstimatedTotalCosts())
                .estimatedOperatingProfit(p.getEstimatedOperatingProfit())
                .operatingMarginPercent(p.getOperatingMarginPercent())
                .breakEvenUnits(p.getBreakEvenUnits())
                .breakEvenRevenue(p.getBreakEvenRevenue())
                .contributionMarginPerUnit(cm)
                .createdAt(p.getCreatedAt())
                .build();
    }

    private CompetitorDTO mapCompetitorToDTO(Competitor c) {
        return CompetitorDTO.builder()
                .id(c.getId())
                .name(c.getName())
                .website(c.getWebsite())
                .summary(c.getSummary())
                .targetSegment(c.getTargetSegment())
                .strengths(c.getStrengths())
                .weaknesses(c.getWeaknesses())
                .differentiation(c.getDifferentiation())
                .sourceUrl(c.getSourceUrl())
                .retrievedAt(c.getRetrievedAt())
                .build();
    }

    private RoadmapTaskDTO mapRoadmapToDTO(RoadmapTask t) {
        return RoadmapTaskDTO.builder()
                .id(t.getId())
                .startupIdeaId(t.getStartupIdea() != null ? t.getStartupIdea().getId() : null)
                .title(t.getTitle())
                .description(t.getDescription())
                .priority(t.getPriority())
                .status(t.getStatus())
                .phase(t.getPhase())
                .estimatedTimeframe(t.getEstimatedTimeframe())
                .createdAt(t.getCreatedAt())
                .updatedAt(t.getUpdatedAt())
                .build();
    }
}
