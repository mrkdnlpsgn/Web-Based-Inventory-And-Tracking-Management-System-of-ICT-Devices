package com.sanjose.inventory.repository;

import com.sanjose.inventory.entity.DeletedAsset;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface DeletedAssetRepository extends JpaRepository<DeletedAsset, Long> {
    List<DeletedAsset> findAllByOrderByDeletedAtDesc();
}
