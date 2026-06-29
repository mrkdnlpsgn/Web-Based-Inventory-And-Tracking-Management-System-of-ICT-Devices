package com.sanjose.inventory.service;

import com.sanjose.inventory.dto.AssetRequest;
import com.sanjose.inventory.entity.*;
import com.sanjose.inventory.exception.ResourceNotFoundException;
import com.sanjose.inventory.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AssetService {

    private final AssetRepository assetRepository;
    private final CategoryRepository categoryRepository;
    private final OfficeRepository officeRepository;
    private final UserRepository userRepository;
    private final MaintenanceLedgerRepository maintenanceLedgerRepository;
    private final DisposalLedgerRepository disposalLedgerRepository;
    private final DeletedAssetRepository deletedAssetRepository;
    private final AuditLogService auditLogService;

    public List<Asset> findAll() {
        return assetRepository.findByIsDeletedFalse();
    }

    public Asset findById(Long id) {
        return assetRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found: " + id));
    }

    public Asset create(AssetRequest req) {
        Asset asset = buildAsset(new Asset(), req);
        asset = assetRepository.save(asset);
        handleConditionLedger(asset);
        auditLogService.log("ASSET_CREATED", "Assets", asset.getId(), "asset",
                "Created asset: " + asset.getPropertyNumber());
        return asset;
    }

    public Asset update(Long id, AssetRequest req) {
        Asset asset = findById(id);
        Asset.AssetCondition oldCondition = asset.getCondition();
        buildAsset(asset, req);
        asset = assetRepository.save(asset);
        // Only auto-create ledger if condition changed
        if (oldCondition != asset.getCondition()) {
            handleConditionLedger(asset);
        }
        auditLogService.log("ASSET_UPDATED", "Assets", asset.getId(), "asset",
                "Updated asset: " + asset.getPropertyNumber());
        return asset;
    }

    public void delete(Long id, String deleteReason) {
        Asset asset = findById(id);
        String currentUsername = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        User deleter = userRepository.findByUsernameIgnoreCase(currentUsername)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + currentUsername));

        // Archive snapshot
        DeletedAsset snapshot = DeletedAsset.builder()
                .assetId(asset.getId())
                .propertyNumber(asset.getPropertyNumber())
                .description(asset.getDescription())
                .categoryId(asset.getCategory().getId())
                .categoryName(asset.getCategory().getCategoryName())
                .quantity(asset.getQuantity())
                .acquisitionDate(asset.getAcquisitionDate())
                .unitValue(asset.getUnitValue())
                .officeId(asset.getOffice().getId())
                .officeName(asset.getOffice().getOfficeName())
                .accountablePersonId(null)
                .accountablePersonName(asset.getAccountablePerson())
                .location(asset.getLocation())
                .condition(asset.getCondition().name())
                .lifecycleStatus(asset.getLifecycleStatus().name())
                .qrCodePath(asset.getQrCodePath())
                .sha256Hash(asset.getSha256Hash())
                .remarks(asset.getRemarks())
                .originalCreatedAt(asset.getCreatedAt())
                .originalUpdatedAt(asset.getUpdatedAt())
                .deletedByUserId(deleter.getId())
                .deletedByUsername(deleter.getUsername())
                .deleteReason(deleteReason)
                .build();
        deletedAssetRepository.save(snapshot);

        // Soft delete
        asset.setIsDeleted(true);
        asset.setDeletedAt(LocalDateTime.now());
        asset.setDeletedBy(deleter.getId());
        asset.setDeleteReason(deleteReason);
        assetRepository.save(asset);

        auditLogService.log("ASSET_DELETED", "Assets", id, "asset",
                "Deleted: " + asset.getPropertyNumber());
    }

    private Asset buildAsset(Asset asset, AssetRequest req) {
        asset.setPropertyNumber(req.getPropertyNumber());
        asset.setDescription(req.getDescription());
        asset.setQuantity(req.getQuantity() != null ? req.getQuantity() : 1);
        asset.setAcquisitionDate(req.getAcquisitionDate());
        asset.setUnitValue(req.getUnitValue());
        asset.setLocation(req.getLocation());
        asset.setCondition(Asset.AssetCondition.valueOf(req.getCondition()));
        asset.setLifecycleStatus(Asset.LifecycleStatus.valueOf(req.getLifecycleStatus()));
        asset.setQrCodePath(req.getQrCodePath());
        asset.setSha256Hash(req.getSha256Hash());
        asset.setRemarks(req.getRemarks());
        asset.setCategory(categoryRepository.findById(req.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found: " + req.getCategoryId())));
        asset.setOffice(officeRepository.findById(req.getOfficeId())
                .orElseThrow(() -> new ResourceNotFoundException("Office not found: " + req.getOfficeId())));
        asset.setAccountablePerson(req.getAccountablePerson());
        return asset;
    }

    private void handleConditionLedger(Asset asset) {
        String currentUsername = org.springframework.security.core.context.SecurityContextHolder
                .getContext().getAuthentication().getName();
        User recorder = userRepository.findByUsernameIgnoreCase(currentUsername)
                .orElse(null);

        if (asset.getCondition() == Asset.AssetCondition.REPAIRABLE) {
            // Auto-create maintenance record
            MaintenanceLedger m = MaintenanceLedger.builder()
                    .asset(asset)
                    .maintenanceType(MaintenanceLedger.MaintenanceType.REPAIR)
                    .findings("Asset flagged as repairable — requires maintenance")
                    .actionsTaken("Pending review and assignment")
                    .maintenanceDate(LocalDate.now())
                    .status(MaintenanceLedger.MaintenanceStatus.ONGOING)
                    .recordedBy(recorder)
                    .build();
            maintenanceLedgerRepository.save(m);
            // Update lifecycle
            asset.setLifecycleStatus(Asset.LifecycleStatus.UNDER_MAINTENANCE);
            assetRepository.save(asset);

        } else if (asset.getCondition() == Asset.AssetCondition.UNSERVICEABLE) {
            // Auto-create disposal record
            DisposalLedger d = DisposalLedger.builder()
                    .asset(asset)
                    .reason("Asset is unserviceable and flagged for disposal")
                    .inspectionFindings("Auto-generated from asset condition change")
                    .recommendedMethod(DisposalLedger.DisposalMethod.DESTRUCTION)
                    .disposalStatus(DisposalLedger.DisposalStatus.PENDING)
                    .inspectionDate(LocalDate.now())
                    .recordedBy(recorder)
                    .build();
            disposalLedgerRepository.save(d);
            // Update lifecycle
            asset.setLifecycleStatus(Asset.LifecycleStatus.DISPOSED);
            assetRepository.save(asset);
        }
        // SERVICEABLE: no ledger created
    }
}
