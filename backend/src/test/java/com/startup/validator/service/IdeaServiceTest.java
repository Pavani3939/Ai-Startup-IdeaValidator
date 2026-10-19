package com.startup.validator.service;

import com.startup.validator.dto.AnalysisResponseDTO;
import com.startup.validator.dto.IdeaDetailResponseDTO;
import com.startup.validator.dto.IdeaRequestDTO;
import com.startup.validator.entity.AnalysisReport;
import com.startup.validator.entity.StartupIdea;
import com.startup.validator.entity.User;
import com.startup.validator.repository.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IdeaServiceTest {

    @Mock
    private StartupIdeaRepository ideaRepository;

    @Mock
    private AnalysisReportRepository reportRepository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private GeminiService geminiService;

    @Mock
    private CompetitorRepository competitorRepository;

    @Mock
    private FinancialProjectionRepository financialRepository;

    @Mock
    private RoadmapTaskRepository roadmapRepository;

    @InjectMocks
    private IdeaService ideaService;

    private User sampleUser;

    @BeforeEach
    void setUp() {
        sampleUser = new User();
        sampleUser.setId(10L);
        sampleUser.setEmail("founder@startup.com");
        sampleUser.setName("Founder");
    }

    @Test
    @DisplayName("Should process idea, persist idea and report, and return mapped response")
    void testProcessIdea() {
        when(userRepository.findByEmail("founder@startup.com")).thenReturn(Optional.of(sampleUser));
        when(ideaRepository.save(any(StartupIdea.class))).thenAnswer(i -> {
            StartupIdea idea = i.getArgument(0);
            idea.setId(100L);
            return idea;
        });

        AnalysisResponseDTO mockAi = AnalysisResponseDTO.builder()
                .readinessScore(82)
                .successScore(8)
                .summary("Promising venture with viable economics.")
                .build();
        when(geminiService.analyzeIdea(any(IdeaRequestDTO.class))).thenReturn(mockAi);

        when(reportRepository.save(any(AnalysisReport.class))).thenAnswer(i -> {
            AnalysisReport r = i.getArgument(0);
            r.setId(500L);
            return r;
        });

        IdeaRequestDTO request = new IdeaRequestDTO();
        request.setTitle("DevFlow AI");
        request.setIndustry("Developer Tools");
        request.setDescription("Automated code review and refactoring assistant for enterprise git repositories.");

        AnalysisResponseDTO result = ideaService.processIdea(request, "founder@startup.com");

        assertNotNull(result);
        assertEquals(500L, result.getId());
        assertEquals(100L, result.getIdeaId());
        assertEquals(82, result.getReadinessScore());
        verify(ideaRepository).save(any(StartupIdea.class));
        verify(reportRepository).save(any(AnalysisReport.class));
    }

    @Test
    @DisplayName("Should throw exception if another user tries to view unauthorized private idea")
    void testUnauthorizedIdeaAccess() {
        StartupIdea idea = new StartupIdea();
        idea.setId(100L);
        idea.setUser(sampleUser); // owned by user 10

        when(ideaRepository.findById(100L)).thenReturn(Optional.of(idea));

        // User 99 attempts to access idea owned by User 10
        assertThrows(IllegalArgumentException.class, () -> ideaService.getIdeaDetail(100L, 99L));
    }
}
