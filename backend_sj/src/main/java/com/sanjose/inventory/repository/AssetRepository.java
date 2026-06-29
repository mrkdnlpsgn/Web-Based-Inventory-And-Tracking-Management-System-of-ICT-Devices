package com.sanjose.inventory.repository;

import com.sanjose.inventory.entity.Asset;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;

public interface AssetRepository extends JpaRepository<Asset, Long> {
    List<Asset> findByIsDeletedFalse();
    Optional<Asset> findByIdAndIsDeletedFalse(Long id);
    boolean existsByPropertyNumber(String propertyNumber);
    List<Asset> findByOffice_IdAndIsDeletedFalse(Long officeId);
    List<Asset> findByConditionAndIsDeletedFalse(Asset.AssetCondition condition);
}
