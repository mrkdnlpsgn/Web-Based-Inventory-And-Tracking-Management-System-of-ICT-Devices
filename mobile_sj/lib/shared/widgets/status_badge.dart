import 'package:flutter/material.dart';
import '../../core/theme/app_theme.dart';

class StatusBadge extends StatelessWidget {
  final String label;
  final Color color;

  const StatusBadge({super.key, required this.label, required this.color});

  static StatusBadge condition(String value) {
    final color = switch (value) {
      'SERVICEABLE' => AppTheme.brand,
      'REPAIRABLE' => AppTheme.statusMaintenance,
      'UNSERVICEABLE' => AppTheme.statusDisposed,
      _ => Colors.grey,
    };
    final display = switch (value) {
      'SERVICEABLE' => 'Serviceable',
      'REPAIRABLE' => 'Repairable',
      'UNSERVICEABLE' => 'Unserviceable',
      _ => value,
    };
    return StatusBadge(label: display, color: color);
  }

  static StatusBadge lifecycle(String value) {
    final color = switch (value) {
      'REGISTERED' => AppTheme.statusRegistered,
      'ASSIGNED' => AppTheme.statusAssigned,
      'TRANSFERRED' => AppTheme.statusTransferred,
      'UNDER_MAINTENANCE' => AppTheme.statusMaintenance,
      'DISPOSED' => AppTheme.statusDisposed,
      'ARCHIVED' => Colors.grey.shade600,
      _ => Colors.grey,
    };
    final display = switch (value) {
      'REGISTERED' => 'Registered',
      'ASSIGNED' => 'Assigned',
      'TRANSFERRED' => 'Transferred',
      'UNDER_MAINTENANCE' => 'Under Maintenance',
      'DISPOSED' => 'Disposed',
      'ARCHIVED' => 'Archived',
      _ => value,
    };
    return StatusBadge(label: display, color: color);
  }

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
      decoration: BoxDecoration(
        color: color.withValues(alpha: 0.15),
        borderRadius: BorderRadius.circular(6),
        border: Border.all(color: color.withValues(alpha: 0.4)),
      ),
      child: Text(
        label,
        style: TextStyle(
          color: color,
          fontSize: 12,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.2,
        ),
      ),
    );
  }
}
