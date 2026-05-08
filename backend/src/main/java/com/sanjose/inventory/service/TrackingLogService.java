package com.sanjose.inventory.service;

import com.sanjose.inventory.dto.TrackingLogRequest;
import com.sanjose.inventory.dto.TrackingLogResponse;
import com.sanjose.inventory.entity.EquipmentRecord;
import com.sanjose.inventory.entity.TrackingLog;
import com.sanjose.inventory.exception.ResourceNotFoundException;
import com.sanjose.inventory.repository.EquipmentRecordRepository;
import com.sanjose.inventory.repository.TrackingLogRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.util.List;

@Service
@RequiredArgsConstructor
public class TrackingLogService {

    private final TrackingLogRepository repo;
    private final EquipmentRecordRepository equipmentRepo;
    private final AuditLogService auditLogService;

    public List<TrackingLogResponse> findAll() {
        return repo.findAllByOrderByCreatedAtDesc().stream()
                .map(this::toResponse)
                .toList();
    }

    public List<TrackingLogResponse> findByEquipmentId(Long equipmentId) {
        return repo.findByEquipmentRecordIdOrderByCreatedAtDesc(equipmentId).stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional
    public TrackingLogResponse create(TrackingLogRequest req) {
        EquipmentRecord equipment = equipmentRepo.findById(req.equipmentId())
                .orElseThrow(() -> new ResourceNotFoundException("Equipment not found: " + req.equipmentId()));
        TrackingLog log = TrackingLog.builder()
                .equipmentRecord(equipment)
                .action(req.action())
                .performedBy(req.performedBy())
                .location(req.location())
                .notes(req.notes())
                .build();
        TrackingLogResponse response = toResponse(repo.save(log));
        auditLogService.log("CREATE", "TRACKING",
                "Logged '" + req.action() + "' for " + equipment.getArticle()
                + " (" + equipment.getItemCode() + ") by " + req.performedBy());
        return response;
    }

    private TrackingLogResponse toResponse(TrackingLog log) {
        EquipmentRecord eq = log.getEquipmentRecord();
        return new TrackingLogResponse(
                log.getId(),
                eq.getId(),
                eq.getArticle(),
                eq.getItemCode(),
                eq.getSerialNumber(),
                eq.getEquipmentType(),
                eq.getOffice(),
                log.getAction(),
                log.getPerformedBy(),
                log.getLocation(),
                log.getNotes(),
                log.getCreatedAt()
        );
    }
}
