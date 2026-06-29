package com.sanjose.inventory.service;

import com.sanjose.inventory.config.SpHelper;
import com.sanjose.inventory.dto.AssetRequest;
import com.sanjose.inventory.entity.Asset;
import com.sanjose.inventory.entity.Category;
import com.sanjose.inventory.entity.Office;
import com.sanjose.inventory.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.core.RowMapper;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.Date;
import java.sql.Timestamp;
import java.time.LocalDate;
import java.util.List;

@Service
@RequiredArgsConstructor
@Transactional
public class AssetService {

    private final JdbcTemplate jdbcTemplate;
    private final AuditLogService auditLogService;

    private static final RowMapper<Asset> ASSET_MAPPER = (rs, rn) -> {
        Asset a = new Asset();
        a.setId(rs.getLong("id"));
        a.setPropertyNumber(rs.getString("propertyNumber"));
        a.setDescription(rs.getString("description"));
        a.setQuantity(rs.getObject("quantity", Integer.class));
        Date acqDate = rs.getDate("acquisitionDate");
        a.setAcquisitionDate(acqDate != null ? acqDate.toLocalDate() : null);
        a.setUnitValue(rs.getBigDecimal("unitValue"));
        a.setPhysicalCount(rs.getObject("physicalCount", Integer.class));
        a.setLocation(rs.getString("location"));
        String cond = rs.getString("condition");
        a.setCondition(cond != null ? Asset.AssetCondition.valueOf(cond) : null);
        String lc = rs.getString("lifecycleStatus");
        a.setLifecycleStatus(lc != null ? Asset.LifecycleStatus.valueOf(lc) : null);
        a.setAccountablePerson(rs.getString("accountablePerson"));
        a.setQrCodePath(rs.getString("qrCodePath"));
        a.setSha256Hash(rs.getString("sha256Hash"));
        a.setRemarks(rs.getString("remarks"));
        Timestamp createdTs = rs.getTimestamp("createdAt");
        a.setCreatedAt(createdTs != null ? createdTs.toLocalDateTime() : null);
        Timestamp updatedTs = rs.getTimestamp("updatedAt");
        a.setUpdatedAt(updatedTs != null ? updatedTs.toLocalDateTime() : null);

        Long catId = rs.getObject("category_id", Long.class);
        if (catId != null) {
            Category c = new Category();
            c.setId(catId);
            c.setCategoryName(rs.getString("categoryName"));
            a.setCategory(c);
        }

        Long officeId = rs.getObject("office_id", Long.class);
        if (officeId != null) {
            Office o = new Office();
            o.setId(officeId);
            o.setOfficeName(rs.getString("officeName"));
            a.setOffice(o);
        }

        return a;
    };

    public List<Asset> findAll(String search) {
        if (search != null && !search.isBlank()) {
            return jdbcTemplate.query("CALL sp_assets_search(?)", ASSET_MAPPER, search.trim());
        }
        return jdbcTemplate.query("CALL sp_assets_get_all()", ASSET_MAPPER);
    }

    public Asset findById(Long id) {
        List<Asset> list = jdbcTemplate.query("CALL sp_assets_get_by_id(?)", ASSET_MAPPER, id);
        if (list.isEmpty()) throw new ResourceNotFoundException("Asset not found: " + id);
        return list.get(0);
    }

    public Asset create(AssetRequest req) {
        Long newId = SpHelper.callWithOutLong(jdbcTemplate,
            "CALL sp_assets_create(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            req.getPropertyNumber(), req.getDescription(),
            req.getCategoryId(), req.getQuantity() != null ? req.getQuantity() : 1,
            req.getAcquisitionDate(), req.getUnitValue(), req.getOfficeId(),
            req.getAccountablePerson(), req.getPhysicalCount(), req.getLocation(),
            req.getCondition(), req.getLifecycleStatus(),
            req.getQrCodePath(), req.getSha256Hash(), req.getRemarks());

        Asset saved = findById(newId);
        handleConditionLedger(saved);
        auditLogService.log("ASSET_CREATED", "Assets", newId, "asset",
            "Created asset: " + saved.getPropertyNumber());
        return findById(newId); // re-fetch after potential lifecycle update
    }

    public Asset update(Long id, AssetRequest req) {
        Asset before = findById(id);
        Asset.AssetCondition oldCondition = before.getCondition();

        jdbcTemplate.update("CALL sp_assets_update(?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
            id,
            req.getPropertyNumber(), req.getDescription(),
            req.getCategoryId(), req.getQuantity() != null ? req.getQuantity() : 1,
            req.getAcquisitionDate(), req.getUnitValue(), req.getOfficeId(),
            req.getAccountablePerson(), req.getPhysicalCount(), req.getLocation(),
            req.getCondition(), req.getLifecycleStatus(),
            req.getQrCodePath(), req.getSha256Hash(), req.getRemarks());

        Asset saved = findById(id);
        if (oldCondition != saved.getCondition()) {
            handleConditionLedger(saved);
        }
        auditLogService.log("ASSET_UPDATED", "Assets", id, "asset",
            "Updated asset: " + saved.getPropertyNumber());
        return findById(id); // re-fetch after potential lifecycle update
    }

    public void delete(Long id, String deleteReason) {
        Asset asset = findById(id);
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Long deleterId = getUserIdByUsername(username);
        jdbcTemplate.update("CALL sp_assets_soft_delete(?, ?, ?, ?)",
            id,
            deleterId != null ? deleterId.intValue() : 0,
            username,
            deleteReason);
        auditLogService.log("ASSET_DELETED", "Assets", id, "asset",
            "Deleted: " + asset.getPropertyNumber());
    }

    private void handleConditionLedger(Asset asset) {
        if (asset.getCondition() == null) return;
        String username = SecurityContextHolder.getContext().getAuthentication().getName();
        Long recorderId = getUserIdByUsername(username);
        int recId = recorderId != null ? recorderId.intValue() : 0;

        if (asset.getCondition() == Asset.AssetCondition.REPAIRABLE) {
            jdbcTemplate.update("CALL sp_disposal_delete_by_asset(?)", asset.getId());
            SpHelper.callWithOutLong(jdbcTemplate,
                "CALL sp_maintenance_create(?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
                asset.getId(), "REPAIR",
                "Asset flagged as repairable — requires maintenance",
                "Pending review and assignment",
                null, LocalDate.now(), null, "ONGOING", recId);
            jdbcTemplate.update("CALL sp_assets_update_lifecycle(?, ?)",
                asset.getId(), "UNDER_MAINTENANCE");

        } else if (asset.getCondition() == Asset.AssetCondition.UNSERVICEABLE) {
            jdbcTemplate.update("CALL sp_maintenance_delete_by_asset(?)", asset.getId());
            SpHelper.callWithOutLong(jdbcTemplate,
                "CALL sp_disposal_create(?, ?, ?, ?, ?, ?, ?, ?, ?)",
                asset.getId(),
                "Asset is unserviceable and flagged for disposal",
                "Auto-generated from asset condition change",
                "DESTRUCTION", "PENDING",
                LocalDate.now(), null, recId);
            jdbcTemplate.update("CALL sp_assets_update_lifecycle(?, ?)",
                asset.getId(), "DISPOSED");

        } else if (asset.getCondition() == Asset.AssetCondition.SERVICEABLE) {
            jdbcTemplate.update("CALL sp_maintenance_delete_by_asset(?)", asset.getId());
            jdbcTemplate.update("CALL sp_disposal_delete_by_asset(?)", asset.getId());
            jdbcTemplate.update("CALL sp_assets_update_lifecycle(?, ?)",
                asset.getId(), "REGISTERED");
        }
    }

    private Long getUserIdByUsername(String username) {
        List<Long> ids = jdbcTemplate.query(
            "CALL sp_users_get_by_username(?)", (rs, rn) -> rs.getLong("id"), username);
        return ids.isEmpty() ? null : ids.get(0);
    }
}
