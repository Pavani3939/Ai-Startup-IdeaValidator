package com.startup.validator.repository;

import com.startup.validator.entity.AnalysisReport;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface AnalysisReportRepository extends JpaRepository<AnalysisReport, Long> {
    Optional<AnalysisReport> findByStartupIdeaId(Long startupIdeaId);

    @Query("SELECT r FROM AnalysisReport r WHERE r.startupIdea.user.id = :userId")
    Page<AnalysisReport> findByUserId(@Param("userId") Long userId, Pageable pageable);

    @Query("SELECT COUNT(r) FROM AnalysisReport r WHERE r.startupIdea.user.id = :userId")
    long countByUserId(@Param("userId") Long userId);

    @Query("SELECT AVG(COALESCE(r.readinessScore, r.successScore * 10)) FROM AnalysisReport r WHERE r.startupIdea.user.id = :userId")
    Double getAverageReadinessScoreByUserId(@Param("userId") Long userId);
}
