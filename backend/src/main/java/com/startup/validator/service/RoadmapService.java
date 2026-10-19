package com.startup.validator.service;

import com.startup.validator.dto.RoadmapTaskDTO;
import com.startup.validator.entity.RoadmapTask;
import com.startup.validator.entity.StartupIdea;
import com.startup.validator.exception.ResourceNotFoundException;
import com.startup.validator.repository.RoadmapTaskRepository;
import com.startup.validator.repository.StartupIdeaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoadmapService {

    private final RoadmapTaskRepository roadmapRepository;
    private final StartupIdeaRepository ideaRepository;

    public RoadmapService(RoadmapTaskRepository roadmapRepository,
                          StartupIdeaRepository ideaRepository) {
        this.roadmapRepository = roadmapRepository;
        this.ideaRepository = ideaRepository;
    }

    public List<RoadmapTaskDTO> getRoadmapByIdeaId(Long ideaId) {
        List<RoadmapTask> tasks = roadmapRepository.findByStartupIdeaIdOrderByCreatedAtAsc(ideaId);
        if (tasks.isEmpty()) {
            // Auto-generate default roadmap for the idea if none exists
            tasks = generateDefaultRoadmap(ideaId);
        }
        return tasks.stream().map(this::mapToDTO).collect(Collectors.toList());
    }

    @Transactional
    public List<RoadmapTask> generateDefaultRoadmap(Long ideaId) {
        StartupIdea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new ResourceNotFoundException("Startup idea not found: " + ideaId));

        List<RoadmapTask> tasks = new ArrayList<>();

        // Phase 1: Validate Problem
        tasks.add(createTask(idea, "Phase 1: Validate Problem",
                "Conduct 15 target customer discovery interviews",
                "Interview prospective users to validate that the identified problem causes recurring pain and willingness to pay.",
                "HIGH", "Weeks 1-2"));

        tasks.add(createTask(idea, "Phase 1: Validate Problem",
                "Map competitive alternatives and current workarounds",
                "Document existing solutions, their pricing, and identify primary gaps your product will exploit.",
                "MEDIUM", "Weeks 2-3"));

        // Phase 2: Validate Solution
        tasks.add(createTask(idea, "Phase 2: Validate Solution",
                "Create interactive wireframe or clickable prototype",
                "Design key workflows and present to early interviewees to confirm user experience and solution fit.",
                "HIGH", "Weeks 3-4"));

        tasks.add(createTask(idea, "Phase 2: Validate Solution",
                "Launch teaser landing page with email waitlist",
                "Measure market interest through landing page conversion rates and collect feedback from early adopters.",
                "MEDIUM", "Weeks 4-5"));

        // Phase 3: Validate Business Model
        tasks.add(createTask(idea, "Phase 3: Validate Business Model",
                "Establish initial pricing and unit economics model",
                "Model cost of acquisition (CAC) and customer lifetime value (LTV) using the Financial Feasibility calculator.",
                "HIGH", "Weeks 5-6"));

        tasks.add(createTask(idea, "Phase 3: Validate Business Model",
                "Identify primary acquisition channel",
                "Test organic outreach, cold emails, content, or targeted test ads to identify the most cost-effective channel.",
                "MEDIUM", "Weeks 6-7"));

        // Phase 4: Build and Launch
        tasks.add(createTask(idea, "Phase 4: Build and Launch",
                "Develop tightly scoped Minimum Viable Product (MVP)",
                "Build only essential features required to solve the core customer problem without extra bloat.",
                "HIGH", "Weeks 7-10"));

        tasks.add(createTask(idea, "Phase 4: Build and Launch",
                "Onboard first 10 closed-beta users",
                "Provide white-glove onboarding for early users, gather bug reports, and iterate rapidly.",
                "HIGH", "Weeks 10-12"));

        // Phase 5: Measure and Improve
        tasks.add(createTask(idea, "Phase 5: Measure and Improve",
                "Measure retention, usage frequency, and NPS",
                "Establish core analytics tracking active engagement and customer satisfaction.",
                "MEDIUM", "Month 3+"));

        return roadmapRepository.saveAll(tasks);
    }

    private RoadmapTask createTask(StartupIdea idea, String phase, String title, String desc, String priority, String timeframe) {
        RoadmapTask task = new RoadmapTask();
        task.setStartupIdea(idea);
        task.setPhase(phase);
        task.setTitle(title);
        task.setDescription(desc);
        task.setPriority(priority);
        task.setStatus("PENDING");
        task.setEstimatedTimeframe(timeframe);
        return task;
    }

    @Transactional
    public RoadmapTaskDTO addTask(Long ideaId, RoadmapTaskDTO dto) {
        StartupIdea idea = ideaRepository.findById(ideaId)
                .orElseThrow(() -> new ResourceNotFoundException("Startup idea not found: " + ideaId));

        RoadmapTask task = new RoadmapTask();
        task.setStartupIdea(idea);
        task.setTitle(dto.getTitle());
        task.setDescription(dto.getDescription());
        task.setPriority(dto.getPriority() != null ? dto.getPriority() : "MEDIUM");
        task.setStatus(dto.getStatus() != null ? dto.getStatus() : "PENDING");
        task.setPhase(dto.getPhase() != null ? dto.getPhase() : "Phase 1: Validation");
        task.setEstimatedTimeframe(dto.getEstimatedTimeframe());

        task = roadmapRepository.save(task);
        return mapToDTO(task);
    }

    @Transactional
    public RoadmapTaskDTO updateTask(Long taskId, RoadmapTaskDTO dto) {
        RoadmapTask task = roadmapRepository.findById(taskId)
                .orElseThrow(() -> new ResourceNotFoundException("Roadmap task not found: " + taskId));

        if (dto.getTitle() != null) task.setTitle(dto.getTitle());
        if (dto.getDescription() != null) task.setDescription(dto.getDescription());
        if (dto.getPriority() != null) task.setPriority(dto.getPriority());
        if (dto.getStatus() != null) task.setStatus(dto.getStatus());
        if (dto.getPhase() != null) task.setPhase(dto.getPhase());
        if (dto.getEstimatedTimeframe() != null) task.setEstimatedTimeframe(dto.getEstimatedTimeframe());

        task = roadmapRepository.save(task);
        return mapToDTO(task);
    }

    @Transactional
    public void deleteTask(Long taskId) {
        if (!roadmapRepository.existsById(taskId)) {
            throw new ResourceNotFoundException("Roadmap task not found: " + taskId);
        }
        roadmapRepository.deleteById(taskId);
    }

    public RoadmapTaskDTO mapToDTO(RoadmapTask t) {
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
