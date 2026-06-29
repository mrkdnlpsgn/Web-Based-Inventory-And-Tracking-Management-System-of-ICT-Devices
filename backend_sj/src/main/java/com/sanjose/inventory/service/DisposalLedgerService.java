package com.sanjose.inventory.service;

import com.sanjose.inventory.dto.DisposalLedgerRequest;
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
public class DisposalLedgerService {

    private final DisposalLedgerRepository disposalLedgerRepository;
    private final DeletedDisposalRepository deletedDisposalRepository;
    private final AssetRepository assetRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public List<DisposalLedger> findAll() {
        return disposalLedgerRepository.findByIsDeletedFalse();
    }

    public List<DisposalLedger> findByAsset(Long assetId) {
        return disposalLedgerRepository.findByAsset_IdAndIsDeletedFalse(assetId);
    }

    public DisposalLedger findById(Long id) {
        return disposalLedgerRepository.findByIdAndIsDeletedFalse(id)
                .orElseThrow(() -> new ResourceNotFoundException("Disposal record not found: " + id));
    }

    public DisposalLedger create(DisposalLedgerRequest req) {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User recorder = userRepository.findByUsernameIgnoreCase(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));
        Asset asset = assetRepository.findByIdAndIsDeletedFalse(req.getAssetId())
                .orElseThrow(() -> new ResourceNotFoundException("Asset not found: " + req.getAssetId()));

        DisposalLedger d = DisposalLedger.builder()
                .asset(asset)
                .reason(req.getReason())
                .inspectionFindings(req.getInspectionFindings())
                .recommendedMethod(DisposalLedger.DisposalMethod.valueOf(req.getRecommendedMethod()))
                .disposalStatus(req.getDisposalStatus() != null
                        ? DisposalLedger.DisposalStatus.valueOf(req.getDisposalStatus())
                        : DisposalLedger.DisposalStatus.PENDING)
                .inspectionDate(req.getInspectionDate())
                .recordedBy(recorder)
                .build();

        if (req.getApprovedById() != null) {
            d.setApprovedBy(userRepository.findById(req.getApprovedById()).orElse(null));
        }

        DisposalLedger saved = disposalLedgerRepository.save(d);
        auditLogService.log("DISPOSAL_CREATED", "Disposal", saved.getId(), "disposal",
                "Disposal for asset: " + asset.getPropertyNumber());
        return saved;
    }

    public DisposalLedger update(Long id, DisposalLedgerRequest req) {
        DisposalLedger d = findById(id);
        d.setReason(req.getReason());
        d.setInspectionFindings(req.getInspectionFindings());
        d.setRecommendedMethod(DisposalLedger.DisposalMethod.valueOf(req.getRecommendedMethod()));
        if (req.getDisposalStatus() != null) {
            d.setDisposalStatus(DisposalLedger.DisposalStatus.valueOf(req.getDisposalStatus()));
        }
        d.setInspectionDate(req.getInspectionDate());
        if (req.getApprovedById() != null) {
            d.setApprovedBy(userRepository.findById(req.getApprovedById()).orElse(null));
        }
        DisposalLedger saved = disposalLedgerRepository.save(d);
        auditLogService.log("DISPOSAL_UPDATED", "Disposal", saved.getId(), "disposal",
                "Updated disposal for asset: " + d.getAsset().getPropertyNumber());
        return saved;
    }

    public void delete(Long id, String deleteReason) {
        DisposalLedger d = findById(id);
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        User deleter = userRepository.findByUsernameIgnoreCase(username).orElse(d.getRecordedBy());

        DeletedDisposal snapshot = DeletedDisposal.builder()
                .disposalId(d.getId())
                .assetId(d.getAsset().getId())
                .propertyNumber(d.getAsset().getPropertyNumber())
                .assetDescription(d.getAsset().getDescription())
                .reason(d.getReason())
                .inspectionFindings(d.getInspectionFindings())
                .recommendedMethod(d.getRecommendedMethod().name())
                .disposalStatus(d.getDisposalStatus().name())
                .inspectionDate(d.getInspectionDate())
                .approvedByUserId(d.getApprovedBy() != null ? d.getApprovedBy().getId() : null)
                .approvedByName(d.getApprovedBy() != null ? d.getApprovedBy().getFullName() : null)
                .recordedByUserId(d.getRecordedBy().getId())
                .recordedByName(d.getRecordedBy().getFullName())
                .originalCreatedAt(d.getCreatedAt())
                .deletedByUserId(deleter.getId())
                .deletedByUsername(deleter.getUsername())
                .deleteReason(deleteReason)
                .build();
        deletedDisposalRepository.save(snapshot);

        d.setIsDeleted(true);
        d.setDeletedAt(LocalDateTime.now());
        d.setDeletedBy(deleter.getId());
        d.setDeleteReason(deleteReason);
        disposalLedgerRepository.save(d);

        auditLogService.log("DISPOSAL_DELETED", "Disposal", id, "disposal",
                "Deleted disposal for asset: " + d.getAsset().getPropertyNumber());
    }
}
