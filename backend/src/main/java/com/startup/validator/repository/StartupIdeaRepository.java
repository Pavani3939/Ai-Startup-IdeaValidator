package com.startup.validator.repository;

import com.startup.validator.entity.StartupIdea;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface StartupIdeaRepository extends JpaRepository<StartupIdea, Long> {
}
