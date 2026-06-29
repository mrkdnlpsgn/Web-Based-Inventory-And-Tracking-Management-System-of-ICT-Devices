package com.sanjose.inventory.service;

import com.sanjose.inventory.dto.OfficeRequest;
import com.sanjose.inventory.entity.Office;
import com.sanjose.inventory.entity.User;
import com.sanjose.inventory.exception.ResourceNotFoundException;
import com.sanjose.inventory.repository.OfficeRepository;
import com.sanjose.inventory.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class OfficeService {

    private final OfficeRepository officeRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    public List<Office> findAll() {
        return officeRepository.findAll();
    }

    public Office findById(Long id) {
        return officeRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Office not found: " + id));
    }

    public Office create(OfficeRequest req) {
        Office office = Office.builder()
                .officeName(req.getOfficeName())
                .build();
        if (req.getHeadUserId() != null) {
            User head = userRepository.findById(req.getHeadUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + req.getHeadUserId()));
            office.setHeadUser(head);
        }
        Office saved = officeRepository.save(office);
        auditLogService.log("OFFICE_CREATED", "Offices", saved.getId(), "office", "Created: " + saved.getOfficeName());
        return saved;
    }

    public Office update(Long id, OfficeRequest req) {
        Office office = findById(id);
        office.setOfficeName(req.getOfficeName());
        if (req.getHeadUserId() != null) {
            User head = userRepository.findById(req.getHeadUserId())
                    .orElseThrow(() -> new ResourceNotFoundException("User not found: " + req.getHeadUserId()));
            office.setHeadUser(head);
        } else {
            office.setHeadUser(null);
        }
        Office saved = officeRepository.save(office);
        auditLogService.log("OFFICE_UPDATED", "Offices", saved.getId(), "office", "Updated: " + saved.getOfficeName());
        return saved;
    }

    public void delete(Long id) {
        Office office = findById(id);
        officeRepository.delete(office);
        auditLogService.log("OFFICE_DELETED", "Offices", id, "office", "Deleted: " + office.getOfficeName());
    }
}
