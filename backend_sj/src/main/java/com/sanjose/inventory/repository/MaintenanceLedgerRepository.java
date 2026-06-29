package com.sanjose.inventory.repository;

import com.sanjose.inventory.entity.MaintenanceLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface MaintenanceLedgerRepository extends JpaRepository<MaintenanceLedger, Long> {
    List<MaintenanceLedger> findByIsDeletedFalse();
    List<MaintenanceLedger> findByAsset_IdAndIsDeletedFalse(Long assetId);
    Optional<MaintenanceLedger> findByIdAndIsDeletedFalse(Long id);
}
