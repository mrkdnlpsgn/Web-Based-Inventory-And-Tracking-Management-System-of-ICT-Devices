import 'package:flutter/material.dart';
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
      backgroundColor: AppTheme.surface,
      title: const Text('Confirm Delete', style: TextStyle(color: Colors.white)),
      content: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          const Text('This action cannot be undone.',
              style: TextStyle(color: Colors.white54, fontSize: 13)),
          if (widget.requireReason) ...[
            const SizedBox(height: 16),
            TextField(
              controller: _ctrl,
              maxLines: 2,
              decoration: const InputDecoration(
                labelText: 'Reason for deletion',
                hintText: 'Required',
                hintStyle: TextStyle(color: Colors.white24),
              ),
            ),
          ],
        ],
      ),
      actions: [
        TextButton(
          onPressed: () => Navigator.pop(context),
          child: const Text('Cancel', style: TextStyle(color: Colors.white54)),
        ),
        TextButton(
          onPressed: () {
            if (widget.requireReason && _ctrl.text.trim().isEmpty) return;
            Navigator.pop(context, widget.requireReason ? _ctrl.text.trim() : 'deleted');
          },
          child: const Text('Delete', style: TextStyle(color: Colors.red)),
        ),
      ],
    );
  }
}
