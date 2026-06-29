package com.sanjose.inventory.repository;

import com.sanjose.inventory.entity.Office;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.Optional;

public interface OfficeRepository extends JpaRepository<Office, Long> {
    Optional<Office> findByOfficeName(String officeName);
    boolean existsByOfficeName(String officeName);
}
