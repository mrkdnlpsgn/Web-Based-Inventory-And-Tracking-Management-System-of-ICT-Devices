package com.sanjose.inventory.service;

import com.sanjose.inventory.dto.MaintenanceLedgerRequest;
import com.sanjose.inventory.entity.*;
import com.sanjose.inventory.exception.ResourceNotFoundException;
import com.sanjose.inventory.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MaintenanceLedgerService {

    private final MaintenanceLedgerRepository maintenanceLedgerRepository;
    private final DeletedMaintenanceRepository deletedMaintenanceRepository;
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public List<MaintenanceLedger> findAll() {
        return maintenanceLedgerRepository.findByIsDeletedFalse();
    }

    public List<MaintenanceLedger> findByAsset(Long assetId) {
        return maintenanceLedgerRepository.findByAsset_IdAndIsDeletedFalse(assetId);
    }

    public MaintenanceLedger findById(Long id) {
        return maintenanceLedgerRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Maintenance record not found: " + id));
    }

    public MaintenanceLedger create(MaintenanceLedgerRequest req) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User recorder = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        Asset asset = assetRepository.findByIdAndIsDeletedFalse(req.getAssetId())
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found: " + req.getAssetId()));

        MaintenanceLedger m = MaintenanceLedger.builder()
                .asset(asset)
                .maintenanceType(MaintenanceLedger.MaintenanceType.valueOf(req.getMaintenanceType()))
                .findings(req.getFindings())
                .actionsTaken(req.getActionsTaken())
                .maintenanceDate(req.getMaintenanceDate())
                .cost(req.getCost())
                .status(MaintenanceLedger.MaintenanceStatus.valueOf(req.getStatus()))
                .recordedBy(recorder)
                .build();

        if (req.getAssignedToId() != null) {
            m.setAssignedTo(userRepository.findById(req.getAssignedToId()).orElse(null));
        }

        MaintenanceLedger saved = maintenanceLedgerRepository.save(m);
        auditLogService.log("MAINTENANCE_CREATED", "Maintenance", saved.getId(), "maintenance",
                "Maintenance for asset: " + asset.getPropertyNumber());
        return saved;
    }

    public MaintenanceLedger update(Long id, MaintenanceLedgerRequest req) {
        MaintenanceLedger m = findById(id);
        m.setMaintenanceType(MaintenanceLedger.MaintenanceType.valueOf(req.getMaintenanceType()));
        m.setFindings(req.getFindings());
        m.setActionsTaken(req.getActionsTaken());
        m.setMaintenanceDate(req.getMaintenanceDate());
        m.setCost(req.getCost());
        m.setStatus(MaintenanceLedger.MaintenanceStatus.valueOf(req.getStatus()));
        if (req.getAssignedToId() != null) {
            m.setAssignedTo(userRepository.findById(req.getAssignedToId()).orElse(null));
        }
        MaintenanceLedger saved = maintenanceLedgerRepository.save(m);
        auditLogService.log("MAINTENANCE_UPDATED", "Maintenance", saved.getId(), "maintenance",
                "Updated maintenance for asset: " + m.getAsset().getPropertyNumber());
        return saved;
    }

    public void delete(Long id, String deleteReason) {
        MaintenanceLedger m = findById(id);
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User deleter = userRepository.findByUsernameIgnoreCase(username).orElse(m.getRecordedBy());

        DeletedMaintenance snapshot = DeletedMaintenance.builder()
                .maintenanceId(m.getId())
                .assetId(m.getAsset().getId())
                .propertyNumber(m.getAsset().getPropertyNumber())
                .assetDescription(m.getAsset().getDescription())
                .maintenanceType(m.getMaintenanceType().name())
                .findings(m.getFindings())
                .actionsTaken(m.getActionsTaken())
                .assignedToUserId(m.getAssignedTo() != null ? m.getAssignedTo().getId() : null)
                .assignedToName(m.getAssignedTo() != null ? m.getAssignedTo().getFullName() : null)
                .maintenanceDate(m.getMaintenanceDate())
                .cost(m.getCost())
                .status(m.getStatus().name())
                .recordedByUserId(m.getRecordedBy().getId())
                .recordedByName(m.getRecordedBy().getFullName())
                .originalCreatedAt(m.getCreatedAt())
                .deletedByUserId(deleter.getId())
                .deletedByUsername(deleter.getUsername())
                .deleteReason(deleteReason)
                .build();
        deletedMaintenanceRepository.save(snapshot);

        m.setIsDeleted(true);
        m.setDeletedAt(LocalDateTime.now());
        m.setDeletedBy(deleter.getId());
        m.setDeleteReason(deleteReason);
        maintenanceLedgerRepository.save(m);

        auditLogService.log("MAINTENANCE_DELETED", "Maintenance", id, "maintenance",
                "Deleted maintenance for asset: " + m.getAsset().getPropertyNumber());
    }
}
