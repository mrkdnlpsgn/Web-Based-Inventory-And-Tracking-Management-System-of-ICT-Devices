package com.sanjose.inventory.repository;

import com.sanjose.inventory.entity.DeviceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DeviceRecordRepository extends JpaRepository<DeviceRecord, Long> {
    List<DeviceRecord> findByEquipmentRecordId(Long equipmentRecordId);
    long countByEquipmentRecord_Id(Long equipmentRecordId);
}
