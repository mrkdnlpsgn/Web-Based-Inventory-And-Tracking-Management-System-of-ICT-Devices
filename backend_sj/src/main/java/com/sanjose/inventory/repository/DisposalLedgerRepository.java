package com.sanjose.inventory.repository;

import com.sanjose.inventory.entity.DisposalLedger;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface DisposalLedgerRepository extends JpaRepository<DisposalLedger, Long> {
    List<DisposalLedger> findByIsDeletedFalse();
    List<DisposalLedger> findByAsset_IdAndIsDeletedFalse(Long assetId);
    Optional<DisposalLedger> findByIdAndIsDeletedFalse(Long id);
}
