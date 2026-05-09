package com.sanjose.inventory.repository;

import com.sanjose.inventory.entity.TrackingLog;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TrackingLogRepository extends JpaRepository<TrackingLog, Long> {
    List<TrackingLog> findAllByOrderByCreatedAtDesc();
    List<TrackingLog> findByEquipmentRecordIdOrderByCreatedAtDesc(Long equipmentRecordId);
}
