package com.startup.validator.repository;

import com.startup.validator.entity.StartupIdea;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface StartupIdeaRepository extends JpaRepository<StartupIdea, Long> {
    Page<StartupIdea> findByUserId(Long userId, Pageable pageable);
    long countByUserId(Long userId);
    Optional<StartupIdea> findByIdAndUserId(Long id, Long userId);
}
