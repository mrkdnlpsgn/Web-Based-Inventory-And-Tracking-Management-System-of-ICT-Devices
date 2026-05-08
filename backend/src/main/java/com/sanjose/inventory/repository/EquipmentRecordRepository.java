package com.sanjose.inventory.repository;

import com.sanjose.inventory.entity.EquipmentRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EquipmentRecordRepository extends JpaRepository<EquipmentRecord, Long> {
    List<EquipmentRecord> findByOfficeIgnoreCase(String office);
    boolean existsByItemCode(String itemCode);
}
