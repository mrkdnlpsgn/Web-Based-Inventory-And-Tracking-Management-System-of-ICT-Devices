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

    private final EquipmentRecordRepository equipmentRepository;
    private final DeviceRecordRepository deviceRepository;
    private final AuditLogService auditLogService;

    public List<EquipmentRecord> findAll() {
        return equipmentRepository.findAll();
    }

    public EquipmentRecord findById(Long id) {
        return equipmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Equipment record not found with id: " + id));
    }

    @Transactional
    public EquipmentRecord create(EquipmentRecordRequest req) {
        EquipmentRecord record = EquipmentRecord.builder()
                .type(req.type())
                .equipmentType(req.equipmentType())
                .itemCode(req.itemCode())
                .article(req.article())
                .office(req.office())
                .location(req.location())
                .description(req.description())
                .accountablePerson(req.accountablePerson())
                .deviceCount(req.deviceCount() != null ? req.deviceCount() : 0)
                .build();

        EquipmentRecord saved = equipmentRepository.save(record);

        auditLogService.log("CREATE", "EQUIPMENT",
                "Added equipment: " + req.article() + " (" + req.itemCode() + ")");

        return saved;
    }

    @Transactional
    public EquipmentRecord update(Long id, EquipmentRecordRequest req) {
        EquipmentRecord record = findById(id);

        record.setType(req.type());
        record.setEquipmentType(req.equipmentType());
        record.setItemCode(req.itemCode());
        record.setArticle(req.article());
        record.setOffice(req.office());
        record.setLocation(req.location());
        record.setDescription(req.description());
        record.setAccountablePerson(req.accountablePerson());
        record.setDeviceCount(req.deviceCount() != null ? req.deviceCount() : 0);

        EquipmentRecord saved = equipmentRepository.save(record);

        auditLogService.log("UPDATE", "EQUIPMENT",
                "Updated equipment: " + req.article() + " (" + req.itemCode() + ")");

        return saved;
    }

    @Transactional
    public void delete(Long id) {
        EquipmentRecord record = findById(id);
        equipmentRepository.deleteById(id);
        auditLogService.log("DELETE", "EQUIPMENT",
                "Deleted equipment: " + record.getArticle() + " (" + record.getItemCode() + ")");
    }

    @Transactional
    public DeviceRecord addDevice(Long equipmentId, DeviceRecordRequest req) {
        EquipmentRecord equipment = findById(equipmentId);

        DeviceRecord device = DeviceRecord.builder()
                .equipmentRecord(equipment)
                .itemCode(req.itemCode())
                .model(req.model())
                .serialNumber(req.serialNumber())
                .amountValue(req.amountValue())
                .acquisitionDate(parseDate(req.acquisitionDate()))
                .build();

        DeviceRecord saved = deviceRepository.save(device);

        auditLogService.log("CREATE", "DEVICE",
                "Added device '" + req.model() + "' (S/N: " + req.serialNumber() + ") to equipment ID " + equipmentId);

        return saved;
    }

    @Transactional
    public DeviceRecord updateDevice(Long equipmentId, Long deviceId, DeviceRecordRequest req) {
        DeviceRecord device = deviceRepository.findById(deviceId)
                .filter(d -> d.getEquipmentRecord().getId().equals(equipmentId))
                .orElseThrow(() -> new ResourceNotFoundException("Device not found with id: " + deviceId));

        device.setItemCode(req.itemCode());
        device.setModel(req.model());
        device.setSerialNumber(req.serialNumber());
        device.setAmountValue(req.amountValue());
        device.setAcquisitionDate(parseDate(req.acquisitionDate()));

        DeviceRecord saved = deviceRepository.save(device);

        auditLogService.log("UPDATE", "DEVICE",
                "Updated device '" + req.model() + "' (ID: " + deviceId + ")");

        return saved;
    }

    @Transactional
    public void deleteDevice(Long equipmentId, Long deviceId) {
        DeviceRecord device = deviceRepository.findById(deviceId)
                .filter(d -> d.getEquipmentRecord().getId().equals(equipmentId))
                .orElseThrow(() -> new ResourceNotFoundException("Device not found with id: " + deviceId));

        deviceRepository.deleteById(deviceId);

        auditLogService.log("DELETE", "DEVICE",
                "Deleted device ID " + deviceId + " from equipment ID " + equipmentId);
    }

    private LocalDate parseDate(String date) {
        if (date == null || date.isBlank()) return null;
        return LocalDate.parse(date);
    }
}
