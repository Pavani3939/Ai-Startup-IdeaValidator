package com.startup.validator.service;

import com.startup.validator.dto.AnalysisResponseDTO;
import com.startup.validator.dto.IdeaRequestDTO;
import com.startup.validator.entity.AnalysisReport;
import com.startup.validator.entity.StartupIdea;
import com.startup.validator.entity.User;
import com.startup.validator.repository.AnalysisReportRepository;
import com.startup.validator.repository.StartupIdeaRepository;
import com.startup.validator.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class IdeaService {

    private final StartupIdeaRepository ideaRepository;
    private final AnalysisReportRepository reportRepository;
    private final UserRepository userRepository;
    private final GeminiService geminiService;

    public IdeaService(StartupIdeaRepository ideaRepository,
                       AnalysisReportRepository reportRepository,
                       UserRepository userRepository,
                       GeminiService geminiService) {
        this.ideaRepository = ideaRepository;
        this.reportRepository = reportRepository;
        this.userRepository = userRepository;
        this.geminiService = geminiService;
    }

    @Transactional
    public AnalysisResponseDTO processIdea(IdeaRequestDTO request) {
        // Mock user fetching
        User user = userRepository.findByEmail("demo@startupvalidator.com").orElseGet(() -> {
            User newUser = new User();
            newUser.setName("Demo User");
            newUser.setEmail("demo@startupvalidator.com");
            return userRepository.save(newUser);
        });

        // 1. Save Idea
        StartupIdea idea = new StartupIdea();
        idea.setTitle(request.getTitle());
        idea.setDescription(request.getDescription());
        idea.setIndustry(request.getIndustry());
        idea.setUser(user);
        idea = ideaRepository.save(idea);

        // 2. Call Gemini API
        AnalysisResponseDTO aiResponse = geminiService.analyzeIdea(request.getTitle(), request.getIndustry(), request.getDescription());

        // 3. Save Report
        AnalysisReport report = new AnalysisReport();
        report.setStartupIdea(idea);
        report.setSummary(aiResponse.getSummary());
        report.setAdvantages(aiResponse.getAdvantages());
        report.setDisadvantages(aiResponse.getDisadvantages());
        report.setMarketPotential(aiResponse.getMarketPotential());
        report.setImprovementSuggestions(aiResponse.getSuggestions());
        report.setSuccessScore(aiResponse.getSuccessScore());
        report = reportRepository.save(report);

        // 4. Return DTO
        aiResponse.setId(report.getId());
        aiResponse.setIdeaId(idea.getId());
        return aiResponse;
    }
}
