package com.sanjose.inventory.service;

import com.sanjose.inventory.dto.MaintenancePhotoResponse;
import com.sanjose.inventory.entity.MaintenanceLedger;
import com.sanjose.inventory.entity.MaintenancePhoto;
import com.sanjose.inventory.entity.User;
import com.sanjose.inventory.exception.ResourceNotFoundException;
import com.sanjose.inventory.repository.MaintenanceLedgerRepository;
import com.sanjose.inventory.repository.MaintenancePhotoRepository;
import com.sanjose.inventory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class MaintenancePhotoService {

    private static final String SUBDIR = "maintenance";

    private final MaintenancePhotoRepository photoRepository;
    private final MaintenanceLedgerRepository maintenanceRepository;
    private final UserRepository userRepository;
    private final FileStorageService fileStorageService;
    private final AuditLogService auditLogService;

    public List<MaintenancePhotoResponse> list(Long maintenanceId) {
        getMaintenance(maintenanceId); // 404 if the record doesn't exist
        return photoRepository.findByMaintenance_IdOrderByUploadedAtDesc(maintenanceId).stream()
            .map(MaintenancePhotoResponse::from)
            .toList();
    }

    public MaintenancePhotoResponse upload(Long maintenanceId, MultipartFile file) {
        MaintenanceLedger maintenance = getMaintenance(maintenanceId);
        User uploader = currentUser();

        String relativePath = fileStorageService.storeImage(file, SUBDIR);

        MaintenancePhoto photo = MaintenancePhoto.builder()
            .maintenance(maintenance)
            .filePath(relativePath)
            .originalFilename(file.getOriginalFilename())
            .contentType(file.getContentType())
            .fileSize(file.getSize())
            .uploadedBy(uploader)
            .build();
        photo = photoRepository.save(photo);

        auditLogService.log("MAINTENANCE_PHOTO_UPLOADED", "Maintenance", maintenanceId, "maintenance",
            "Evidence photo added" + (maintenance.getAsset() != null ? " for asset: " + maintenance.getAsset().getPropertyNumber() : ""));

        return MaintenancePhotoResponse.from(photo);
    }

    public void delete(Long maintenanceId, Long photoId) {
        getMaintenance(maintenanceId); // 404 if the record doesn't exist
        MaintenancePhoto photo = photoRepository.findById(photoId)
            .orElseThrow(() -> new ResourceNotFoundException("Photo not found: " + photoId));
        if (!photo.getMaintenance().getId().equals(maintenanceId)) {
            throw new ResourceNotFoundException("Photo not found: " + photoId);
        }

        fileStorageService.delete(photo.getFilePath());
        photoRepository.delete(photo);

        auditLogService.log("MAINTENANCE_PHOTO_DELETED", "Maintenance", maintenanceId, "maintenance",
            "Evidence photo removed");
    }

    private MaintenanceLedger getMaintenance(Long maintenanceId) {
        return maintenanceRepository.findByIdAndIsDeletedFalse(maintenanceId)
            .orElseThrow(() -> new ResourceNotFoundException("Maintenance record not found: " + maintenanceId));
    }

    private User currentUser() {
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        return userRepository.findByUsernameIgnoreCase(username).orElse(null);
    }
}
