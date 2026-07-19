import 'package:flutter/material.dart';
import 'package:flutter/services.dart' show HapticFeedback;
import '../../core/theme/app_theme.dart';

Future<String?> showDeleteDialog(BuildContext context, {bool requireReason = true}) {
  return showDialog<String>(
    context: context,
    builder: (ctx) => _DeleteDialog(requireReason: requireReason),
  );
}

class _DeleteDialog extends StatefulWidget {
  final bool requireReason;
  const _DeleteDialog({required this.requireReason});

  @override
  State<_DeleteDialog> createState() => _DeleteDialogState();
}

class _DeleteDialogState extends State<_DeleteDialog> {
  final _ctrl = TextEditingController();

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return AlertDialog(
      backgroundColor: context.colors.surface,
      title: Text('Confirm Delete', style: TextStyle(color: context.colors.textPrimary)),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text('This action cannot be undone.',
              style: TextStyle(color: context.colors.textTertiary, fontSize: 13)),
          if (widget.requireReason) ...[
            const SizedBox(height: 16),
            TextField(
              controller: _ctrl,
              maxLines: 2,
              decoration: InputDecoration(
                labelText: 'Reason for deletion',
                hintText: 'Required',
                hintStyle: TextStyle(color: context.colors.textTertiary),
              ),
            ),
          ],
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: Text('Cancel', style: TextStyle(color: context.colors.textTertiary)),
        ),
        TextButton(
          onPressed: () {
            if (widget.requireReason && _ctrl.text.trim().isEmpty) return;
            HapticFeedback.mediumImpact();
            Navigator.pop(context, widget.requireReason ? _ctrl.text.trim() : 'deleted');
          },
          child: const Text('Delete', style: TextStyle(color: Colors.red)),
        ),
      ],
    );
  }
}
