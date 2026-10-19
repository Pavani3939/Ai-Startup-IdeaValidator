package com.startup.validator.repository;

import com.startup.validator.entity.Competitor;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CompetitorRepository extends JpaRepository<Competitor, Long> {
    List<Competitor> findByAnalysisId(Long analysisId);
    List<Competitor> findByAnalysisStartupIdeaId(Long startupIdeaId);
}
