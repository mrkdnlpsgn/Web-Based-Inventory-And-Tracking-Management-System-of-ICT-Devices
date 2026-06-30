package com.sanjose.inventory.service;

import com.sanjose.inventory.config.SpHelper;
import com.sanjose.inventory.dto.DeviceRequest;
import com.sanjose.inventory.dto.EquipmentRequest;
import com.sanjose.inventory.entity.DeviceRecord;
import com.sanjose.inventory.entity.EquipmentRecord;
import com.sanjose.inventory.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.sql.Timestamp;
import java.util.ArrayList;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class EquipmentService {

    private final JdbcTemplate jdbcTemplate;

    private static final RowMapper<EquipmentRecord> EQUIPMENT_MAPPER = (rs, rn) -> {
        EquipmentRecord e = new EquipmentRecord();
        e.setId(rs.getLong("id"));
        e.setType(rs.getString("type"));
        e.setEquipmentType(rs.getString("equipmentType"));
        e.setItemCode(rs.getString("itemCode"));
        e.setArticle(rs.getString("article"));
        e.setOffice(rs.getString("office"));
        e.setLocation(rs.getString("location"));
        e.setDescription(rs.getString("description"));
        e.setAccountablePerson(rs.getString("accountablePerson"));
        e.setAccountablePersonPhone(rs.getString("accountablePersonPhone"));
        e.setAccountablePersonEmail(rs.getString("accountablePersonEmail"));
        e.setDeviceCount(rs.getObject("deviceCount", Integer.class));
        Timestamp created = rs.getTimestamp("createdAt");
        e.setCreatedAt(created != null ? created.toLocalDateTime() : null);
        Timestamp updated = rs.getTimestamp("updatedAt");
        e.setUpdatedAt(updated != null ? updated.toLocalDateTime() : null);
        e.setDevices(new ArrayList<>());
        return e;
    };

    private static final RowMapper<DeviceRecord> DEVICE_MAPPER = (rs, rn) -> {
        DeviceRecord d = new DeviceRecord();
        d.setId(rs.getLong("id"));
        d.setEquipmentId(rs.getLong("equipmentId"));
        d.setItemCode(rs.getString("itemCode"));
        d.setSerialNumber(rs.getString("serialNumber"));
        d.setModel(rs.getString("model"));
        d.setAmountValue(rs.getBigDecimal("amountValue"));
        Date acq = rs.getDate("acquisitionDate");
        d.setAcquisitionDate(acq != null ? acq.toLocalDate() : null);
        Timestamp created = rs.getTimestamp("createdAt");
        d.setCreatedAt(created != null ? created.toLocalDateTime() : null);
        Timestamp updated = rs.getTimestamp("updatedAt");
        d.setUpdatedAt(updated != null ? updated.toLocalDateTime() : null);
        return d;
    };

    public List<EquipmentRecord> findAll() {
        List<EquipmentRecord> list = jdbcTemplate.query("CALL sp_equipment_get_all()", EQUIPMENT_MAPPER);
        list.forEach(e -> e.setDevices(fetchDevices(e.getId())));
        return list;
    }

    public EquipmentRecord findById(Long id) {
        List<EquipmentRecord> list = jdbcTemplate.query("CALL sp_equipment_get_by_id(?)", EQUIPMENT_MAPPER, id);
        if (list.isEmpty()) throw new ResourceNotFoundException("Equipment not found: " + id);
        EquipmentRecord e = list.get(0);
        e.setDevices(fetchDevices(id));
        return e;
    }

    public EquipmentRecord create(EquipmentRequest req) {
        Long newId = SpHelper.callWithOutLong(jdbcTemplate,
            "CALL sp_equipment_create(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            req.getType(), req.getEquipmentType(), req.getItemCode(),
            req.getArticle(), req.getOffice(), req.getLocation(),
            req.getDescription(), req.getAccountablePerson(),
            req.getAccountablePersonPhone(), req.getAccountablePersonEmail(),
            req.getDeviceCount() != null ? req.getDeviceCount() : 0);
        return findById(newId);
    }

    public EquipmentRecord update(Long id, EquipmentRequest req) {
        findById(id); // verify exists
        jdbcTemplate.update("CALL sp_equipment_update(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            id,
            req.getType(), req.getEquipmentType(), req.getItemCode(),
            req.getArticle(), req.getOffice(), req.getLocation(),
            req.getDescription(), req.getAccountablePerson(),
            req.getAccountablePersonPhone(), req.getAccountablePersonEmail(),
            req.getDeviceCount() != null ? req.getDeviceCount() : 0);
        return findById(id);
    }

    public void delete(Long id) {
        findById(id); // verify exists
        jdbcTemplate.update("CALL sp_equipment_delete(?)", id);
    }

    public DeviceRecord addDevice(Long equipmentId, DeviceRequest req) {
        findById(equipmentId); // verify parent exists
        Long newId = SpHelper.callWithOutLong(jdbcTemplate,
            "CALL sp_device_add(?, ?, ?, ?, ?, ?, ?)",
            equipmentId, req.getItemCode(), req.getSerialNumber(),
            req.getModel(), req.getAmountValue(), req.getAcquisitionDate());
        return fetchDeviceById(newId);
    }

    public DeviceRecord updateDevice(Long equipmentId, Long deviceId, DeviceRequest req) {
        findById(equipmentId); // verify parent exists
        jdbcTemplate.update("CALL sp_device_update(?, ?, ?, ?, ?, ?)",
            deviceId, req.getItemCode(), req.getSerialNumber(),
            req.getModel(), req.getAmountValue(), req.getAcquisitionDate());
        return fetchDeviceById(deviceId);
    }

    public void deleteDevice(Long equipmentId, Long deviceId) {
        findById(equipmentId); // verify parent exists
        jdbcTemplate.update("CALL sp_device_delete(?)", deviceId);
    }

    private List<DeviceRecord> fetchDevices(Long equipmentId) {
        return jdbcTemplate.query("CALL sp_devices_get_by_equipment(?)", DEVICE_MAPPER, equipmentId);
    }

    private DeviceRecord fetchDeviceById(Long deviceId) {
        List<DeviceRecord> list = jdbcTemplate.query(
            "SELECT device_id AS id, equipment_id AS equipmentId, item_code AS itemCode, " +
            "serial_number AS serialNumber, model, amount_value AS amountValue, " +
            "acquisition_date AS acquisitionDate, created_at AS createdAt, updated_at AS updatedAt " +
            "FROM device_records WHERE device_id = ?",
            DEVICE_MAPPER, deviceId);
        if (list.isEmpty()) throw new ResourceNotFoundException("Device not found: " + deviceId);
        return list.get(0);
    }
}
