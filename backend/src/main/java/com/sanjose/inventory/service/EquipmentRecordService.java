package com.sanjose.inventory.service;

import com.sanjose.inventory.dto.DeviceRecordRequest;
import com.sanjose.inventory.dto.EquipmentRecordRequest;
import com.sanjose.inventory.entity.DeviceRecord;
import com.sanjose.inventory.entity.EquipmentRecord;
import com.sanjose.inventory.exception.ResourceNotFoundException;
import com.sanjose.inventory.repository.DeviceRecordRepository;
import com.sanjose.inventory.repository.EquipmentRecordRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
public class EquipmentRecordService {

    private final EquipmentRecordRepository equipmentRepo;
    private final DeviceRecordRepository deviceRepo;
    private final AuditLogService auditLogService;

    // ── Equipment CRUD ────────────────────────────────────────────────────────

    public List<EquipmentRecord> findAll() {
        return equipmentRepo.findAll();
    }

    public EquipmentRecord findById(Long id) {
        return equipmentRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment record not found with id: " + id));
    }

    @Transactional
    public EquipmentRecord create(EquipmentRecordRequest req) {
        EquipmentRecord record = EquipmentRecord.builder()
                .type(req.type())
                .equipmentType(req.equipmentType())
                .itemCode(req.itemCode())
                .article(req.article())
                .model(req.model())
                .serialNumber(req.serialNumber())
                .amountValue(req.amountValue())
                .acquisitionDate(parseDate(req.acquisitionDate()))
                .office(req.office())
                .location(req.location())
                .description(req.description())
                .accountablePerson(req.accountablePerson())
                .deviceCount(req.deviceCount() != null ? req.deviceCount() : 0)
                .build();
        EquipmentRecord saved = equipmentRepo.save(record);
        auditLogService.log("CREATE", "EQUIPMENT",
                "Added equipment: " + saved.getArticle() + " (" + saved.getItemCode() + ")");
        return saved;
    }

    @Transactional
    public EquipmentRecord update(Long id, EquipmentRecordRequest req) {
        EquipmentRecord record = equipmentRepo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment record not found with id: " + id));
        record.setType(req.type());
        record.setEquipmentType(req.equipmentType());
        record.setItemCode(req.itemCode());
        record.setArticle(req.article());
        record.setModel(req.model());
        record.setSerialNumber(req.serialNumber());
        record.setAmountValue(req.amountValue());
        record.setAcquisitionDate(parseDate(req.acquisitionDate()));
        record.setOffice(req.office());
        record.setLocation(req.location());
        record.setDescription(req.description());
        record.setAccountablePerson(req.accountablePerson());
        record.setDeviceCount(req.deviceCount() != null ? req.deviceCount() : 0);
        EquipmentRecord updated = equipmentRepo.save(record);
        auditLogService.log("UPDATE", "EQUIPMENT",
                "Updated equipment: " + updated.getArticle() + " (" + updated.getItemCode() + ")");
        return updated;
    }

    @Transactional
    public void delete(Long id) {
        EquipmentRecord record = findById(id);
        equipmentRepo.deleteById(id);
        auditLogService.log("DELETE", "EQUIPMENT",
                "Deleted equipment: " + record.getArticle() + " (" + record.getItemCode() + ")");
    }

    // ── Device CRUD ───────────────────────────────────────────────────────────

    @Transactional
    public DeviceRecord addDevice(Long equipmentId, DeviceRecordRequest req) {
        EquipmentRecord record = findById(equipmentId);
        DeviceRecord device = DeviceRecord.builder()
                .equipmentRecord(record)
                .model(req.model())
                .serialNumber(req.serialNumber())
                .amountValue(req.amountValue())
                .acquisitionDate(parseDate(req.acquisitionDate()))
                .build();
        DeviceRecord saved = deviceRepo.save(device);
        auditLogService.log("CREATE", "DEVICE",
                "Added device '" + req.model() + "' (S/N: " + req.serialNumber() + ") to " + record.getArticle());
        return saved;
    }

    @Transactional
    public DeviceRecord updateDevice(Long equipmentId, Long deviceId, DeviceRecordRequest req) {
        DeviceRecord device = deviceRepo.findById(deviceId)
                .filter(d -> d.getEquipmentRecord().getId().equals(equipmentId))
                .orElseThrow(() -> new ResourceNotFoundException("Device not found with id: " + deviceId));
        device.setModel(req.model());
        device.setSerialNumber(req.serialNumber());
        device.setAmountValue(req.amountValue());
        device.setAcquisitionDate(parseDate(req.acquisitionDate()));
        DeviceRecord updated = deviceRepo.save(device);
        auditLogService.log("UPDATE", "DEVICE",
                "Updated device '" + req.model() + "' (ID: " + deviceId + ")");
        return updated;
    }

    @Transactional
    public void deleteDevice(Long equipmentId, Long deviceId) {
        DeviceRecord device = deviceRepo.findById(deviceId)
                .filter(d -> d.getEquipmentRecord().getId().equals(equipmentId))
                .orElseThrow(() -> new ResourceNotFoundException("Device not found with id: " + deviceId));
        deviceRepo.delete(device);
        auditLogService.log("DELETE", "DEVICE",
                "Deleted device ID " + deviceId + " from equipment ID " + equipmentId);
    }

    // ── Helpers ───────────────────────────────────────────────────────────────

    private LocalDate parseDate(String date) {
        if (date == null || date.isBlank()) return null;
        return LocalDate.parse(date);
    }
}
