package com.sanjose.inventory.service;

import com.sanjose.inventory.dto.AssetHistoryRequest;
import com.sanjose.inventory.entity.Asset;
import com.sanjose.inventory.entity.AssetHistory;
import com.sanjose.inventory.entity.Office;
import com.sanjose.inventory.entity.User;
import com.sanjose.inventory.exception.ResourceNotFoundException;
import com.sanjose.inventory.repository.AssetHistoryRepository;
import com.sanjose.inventory.repository.AssetRepository;
import com.sanjose.inventory.repository.OfficeRepository;
import com.sanjose.inventory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AssetHistoryService {

    private final AssetHistoryRepository assetHistoryRepository;
    private final AssetRepository assetRepository;
    private final OfficeRepository officeRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public List<AssetHistory> findAll() {
        return assetHistoryRepository.findAllByOrderByEventDateDesc();
    }

    public List<AssetHistory> findByAsset(Long assetId) {
        return assetHistoryRepository.findByAsset_IdOrderByEventDateDesc(assetId);
    }

    public AssetHistory create(AssetHistoryRequest req) {
        Asset asset = assetRepository.findByIdAndIsDeletedFalse(req.getAssetId())
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found: " + req.getAssetId()));
        User performer = userRepository.findById(req.getPerformedById())
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + req.getPerformedById()));

        AssetHistory history = AssetHistory.builder()
                .asset(asset)
                .eventType(AssetHistory.EventType.valueOf(req.getEventType()))
                .performedBy(performer)
                .notes(req.getNotes())
                .build();

        if (req.getFromOfficeId() != null) {
            history.setFromOffice(officeRepository.findById(req.getFromOfficeId()).orElse(null));
        }
        if (req.getToOfficeId() != null) {
            history.setToOffice(officeRepository.findById(req.getToOfficeId()).orElse(null));
        }

        AssetHistory saved = assetHistoryRepository.save(history);
        auditLogService.log("HISTORY_CREATED", "AssetHistory", saved.getId(), "asset_history",
                "Event: " + saved.getEventType() + " for asset " + asset.getPropertyNumber());
        return saved;
    }
}
