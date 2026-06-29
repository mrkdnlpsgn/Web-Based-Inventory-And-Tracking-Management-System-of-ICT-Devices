package com.sanjose.inventory.config;

import org.springframework.jdbc.core.JdbcTemplate;

import java.sql.Types;

public final class SpHelper {

    private SpHelper() {}

    /** Call a stored procedure that has one trailing OUT INT/BIGINT parameter. Returns the OUT value. */
    public static Long callWithOutLong(JdbcTemplate jdbc, String sql, Object... inParams) {
        return jdbc.execute((java.sql.Connection conn) -> {
            try (java.sql.CallableStatement cs = conn.prepareCall(sql)) {
                int i = 1;
                for (Object p : inParams) {
                    cs.setObject(i++, p);
                }
                cs.registerOutParameter(i, Types.BIGINT);
                cs.execute();
                long v = cs.getLong(i);
                return cs.wasNull() ? null : v;
            }
        });
    }

    /** Call a stored procedure that has one trailing OUT BOOLEAN parameter. Returns the OUT value. */
    public static Boolean callWithOutBoolean(JdbcTemplate jdbc, String sql, Object... inParams) {
        return jdbc.execute((java.sql.Connection conn) -> {
            try (java.sql.CallableStatement cs = conn.prepareCall(sql)) {
                int i = 1;
                for (Object p : inParams) {
                    cs.setObject(i++, p);
                }
                cs.registerOutParameter(i, Types.BOOLEAN);
                cs.execute();
                boolean v = cs.getBoolean(i);
                return cs.wasNull() ? null : v;
            }
        });
    }
}
