package com.sanjose.inventory.repository;

import com.sanjose.inventory.entity.AssetHistory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface AssetHistoryRepository extends JpaRepository<AssetHistory, Long> {
    List<AssetHistory> findByAsset_IdOrderByEventDateDesc(Long assetId);
    List<AssetHistory> findAllByOrderByEventDateDesc();
}
