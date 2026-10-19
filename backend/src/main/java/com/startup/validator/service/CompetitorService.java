package com.startup.validator.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.startup.validator.dto.CompetitorDTO;
import com.startup.validator.dto.gemini.GeminiRequest;
import com.startup.validator.dto.gemini.GeminiResponse;
import com.startup.validator.entity.AnalysisReport;
import com.startup.validator.entity.Competitor;
import com.startup.validator.entity.StartupIdea;
import com.startup.validator.exception.ResourceNotFoundException;
import com.startup.validator.repository.AnalysisReportRepository;
import com.startup.validator.repository.CompetitorRepository;
import com.startup.validator.repository.StartupIdeaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class CompetitorService {

    private static final Logger logger = LoggerFactory.getLogger(CompetitorService.class);

    private final CompetitorRepository competitorRepository;
    private final StartupIdeaRepository ideaRepository;
    private final AnalysisReportRepository reportRepository;
    private final WebClient webClient;
    private final ObjectMapper objectMapper;

    @Value("${gemini.api.key:}")
    private String apiKey;

    @Value("${gemini.api.url:https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent}")
    private String apiUrl;

    public CompetitorService(CompetitorRepository competitorRepository,
                             StartupIdeaRepository ideaRepository,
                             AnalysisReportRepository reportRepository,
                             WebClient webClient,
                             ObjectMapper objectMapper) {
        this.competitorRepository = competitorRepository;
        this.ideaRepository = ideaRepository;
        this.reportRepository = reportRepository;
        this.webClient = webClient;
        this.objectMapper = objectMapper;
    }

    public List<CompetitorDTO> getCompetitorsByIdeaId(Long ideaId) {
        return competitorRepository.findByAnalysisStartupIdeaId(ideaId)
                .stream()
                .map(this::mapToDTO)
                .collect(Collectors.toList());
    }

    @Transactional
    public List<CompetitorDTO> analyzeCompetitors(Long ideaId) {
        StartupIdea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new ResourceNotFoundException("Startup idea not found: " + ideaId));

        AnalysisReport report = reportRepository.findByStartupIdeaId(ideaId)
                .orElse(null);

        // Delete previous competitor analyses for this idea
        List<Competitor> existing = competitorRepository.findByAnalysisStartupIdeaId(ideaId);
        if (!existing.isEmpty()) {
            competitorRepository.deleteAll(existing);
        }

        List<Competitor> competitors;

        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.contains("your-default-api-key") || apiKey.contains("your_actual_api_key")) {
            competitors = generateFallbackCompetitors(idea, report);
        } else {
            competitors = callGeminiForCompetitors(idea, report);
            if (competitors.isEmpty()) {
                competitors = generateFallbackCompetitors(idea, report);
            }
        }

        competitors = competitorRepository.saveAll(competitors);
        return competitors.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    private List<Competitor> callGeminiForCompetitors(StartupIdea idea, AnalysisReport report) {
        String prompt = String.format("""
                You are a competitive intelligence analyst. Analyze the competitive landscape for this startup concept.
                Return ONLY a strictly valid JSON array of 3 to 4 realistic direct or indirect competitors.
                NO markdown backticks, NO markdown formatting, NO extra conversational text.

                Startup Name: %s
                Industry: %s
                Description: %s
                Known Competitors provided by founder: %s

                Each competitor item must match this exact schema:
                {
                  "name": "Competitor Name",
                  "website": "example.com (or descriptive domain)",
                  "summary": "Brief 1-2 sentence description of their offering",
                  "targetSegment": "Target customer segment",
                  "strengths": "Main strengths and market advantages",
                  "weaknesses": "Known limitations or complaints",
                  "differentiation": "How this startup can differentiate against them",
                  "sourceUrl": "Source citation / verification status: AI preliminary market assessment - independent verification advised"
                }
                """,
                idea.getTitle(), idea.getIndustry(), idea.getDescription(),
                idea.getKnownCompetitors() != null ? idea.getKnownCompetitors() : "None provided"
        );

        GeminiRequest geminiRequest = GeminiRequest.builder()
                .contents(List.of(GeminiRequest.Content.builder()
                        .parts(List.of(GeminiRequest.Part.builder().text(prompt).build()))
                        .build()))
                .generationConfig(GeminiRequest.GenerationConfig.builder()
                        .responseMimeType("application/json")
                        .build())
                .build();

        try {
            GeminiResponse response = webClient.post()
                    .uri(apiUrl + "?key=" + apiKey)
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(geminiRequest)
                    .retrieve()
                    .bodyToMono(GeminiResponse.class)
                    .block();

            if (response == null || response.getCandidates() == null || response.getCandidates().isEmpty()) {
                return List.of();
            }

            String json = response.getCandidates().get(0).getContent().getParts().get(0).getText().trim();
            if (json.startsWith("```json")) json = json.substring(7);
            if (json.startsWith("```")) json = json.substring(3);
            if (json.endsWith("```")) json = json.substring(0, json.length() - 3);
            json = json.trim();

            JsonNode root = objectMapper.readTree(json);
            List<Competitor> list = new ArrayList<>();
            if (root.isArray()) {
                for (JsonNode node : root) {
                    Competitor c = new Competitor();
                    c.setAnalysis(report);
                    c.setName(node.path("name").asText("Unnamed Competitor"));
                    c.setWebsite(node.path("website").asText(""));
                    c.setSummary(node.path("summary").asText(""));
                    c.setTargetSegment(node.path("targetSegment").asText(""));
                    c.setStrengths(node.path("strengths").asText(""));
                    c.setWeaknesses(node.path("weaknesses").asText(""));
                    c.setDifferentiation(node.path("differentiation").asText(""));
                    c.setSourceUrl("Preliminary AI assessment - verification required");
                    list.add(c);
                }
            }
            return list;
        } catch (Exception e) {
            logger.warn("Competitor AI generation failed: {}. Using structured fallback.", e.getMessage());
            return List.of();
        }
    }

    private List<Competitor> generateFallbackCompetitors(StartupIdea idea, AnalysisReport report) {
        String industry = idea.getIndustry();
        String title = idea.getTitle();

        List<Competitor> list = new ArrayList<>();

        Competitor c1 = new Competitor();
        c1.setAnalysis(report);
        c1.setName("Established " + industry + " Incumbent");
        c1.setWebsite("incumbent-example.com");
        c1.setSummary("Large market player offering enterprise-focused solutions in the " + industry + " domain with comprehensive feature suites.");
        c1.setTargetSegment("Enterprise organizations and mid-market companies.");
        c1.setStrengths("Brand awareness, deep financial reserves, established channel partnerships.");
        c1.setWeaknesses("Legacy user interface, high pricing tiers, slow feature release cycles.");
        c1.setDifferentiation(title + " can win by providing faster onboarding, a streamlined modern UX, and accessible self-serve pricing.");
        c1.setSourceUrl("Preliminary AI assessment - verification required");
        list.add(c1);

        Competitor c2 = new Competitor();
        c2.setAnalysis(report);
        c2.setName("Agile " + industry + " Challenger");
        c2.setWebsite("challenger-example.io");
        c2.setSummary("Venture-backed recent entrant targeting modern digital-first teams with point solutions.");
        c2.setTargetSegment("Startups, SMBs, and tech-forward practitioners.");
        c2.setStrengths("Modern interface, developer APIs, responsive customer service.");
        c2.setWeaknesses("Narrow focus, limited international localization, shallow enterprise compliance.");
        c2.setDifferentiation(title + " can stand out through specialized vertical customization and superior community-driven workflows.");
        c2.setSourceUrl("Preliminary AI assessment - verification required");
        list.add(c2);

        Competitor c3 = new Competitor();
        c3.setAnalysis(report);
        c3.setName("Internal Manual Workarounds / Spreadsheets");
        c3.setWebsite("N/A (Status Quo)");
        c3.setSummary("Prospective customers relying on legacy spreadsheets, emails, and manual fragmented processes to handle this task.");
        c3.setTargetSegment("Teams accustomed to zero incremental software spend.");
        c3.setStrengths("Zero upfront budget required, maximum customizability.");
        c3.setWeaknesses("High human error rates, zero automation, massive time inefficiencies.");
        c3.setDifferentiation(title + " provides automated validation, real-time collaboration, and actionable structured workflows.");
        c3.setSourceUrl("Market observation - verification required");
        list.add(c3);

        return list;
    }

    private CompetitorDTO mapToDTO(Competitor competitor) {
        return CompetitorDTO.builder()
                .id(competitor.getId())
                .name(competitor.getName())
                .website(competitor.getWebsite())
                .summary(competitor.getSummary())
                .targetSegment(competitor.getTargetSegment())
                .strengths(competitor.getStrengths())
                .weaknesses(competitor.getWeaknesses())
                .differentiation(competitor.getDifferentiation())
                .sourceUrl(competitor.getSourceUrl())
                .retrievedAt(competitor.getRetrievedAt())
                .build();
    }
}
