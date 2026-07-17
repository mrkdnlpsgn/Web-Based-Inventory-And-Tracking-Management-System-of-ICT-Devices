package com.sanjose.inventory.repository;

import com.sanjose.inventory.entity.MaintenancePhoto;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface MaintenancePhotoRepository extends JpaRepository<MaintenancePhoto, Long> {
    List<MaintenancePhoto> findByMaintenance_IdOrderByUploadedAtDesc(Long maintenanceId);
}
