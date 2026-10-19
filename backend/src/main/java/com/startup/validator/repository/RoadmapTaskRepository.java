package com.startup.validator.repository;

import com.startup.validator.entity.RoadmapTask;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoadmapTaskRepository extends JpaRepository<RoadmapTask, Long> {
    List<RoadmapTask> findByStartupIdeaIdOrderByCreatedAtAsc(Long startupIdeaId);
    List<RoadmapTask> findByStartupIdeaId(Long startupIdeaId);
}
