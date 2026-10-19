package com.startup.validator.repository;

import com.startup.validator.entity.FinancialProjection;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FinancialProjectionRepository extends JpaRepository<FinancialProjection, Long> {
    List<FinancialProjection> findByStartupIdeaId(Long startupIdeaId);
    Optional<FinancialProjection> findTopByStartupIdeaIdOrderByCreatedAtDesc(Long startupIdeaId);
}
