import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../model/equipment_model.dart';
import '../provider/equipment_provider.dart';
import '../screens/equipment_form_screen.dart';
import '../screens/device_form_screen.dart';
import '../data/equipment_service.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/delete_dialog.dart';
import '../../auth/provider/auth_provider.dart';

class EquipmentDetailScreen extends ConsumerWidget {
  final int equipmentId;
  const EquipmentDetailScreen({super.key, required this.equipmentId});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final async = ref.watch(equipmentDetailProvider(equipmentId));
    final isAdmin = ref.watch(authProvider).value?.isAdmin ?? false;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Equipment Detail'),
        actions: [
          IconButton(
            icon: const Icon(Icons.refresh_rounded),
            onPressed: () => ref.invalidate(equipmentDetailProvider(equipmentId)),
          ),
          if (isAdmin && async.value != null) ...[
            IconButton(
              icon: const Icon(Icons.edit_outlined),
              onPressed: () async {
                final result = await Navigator.push(context,
                    MaterialPageRoute(builder: (_) => EquipmentFormScreen(equipment: async.value)));
                if (result == true) ref.invalidate(equipmentDetailProvider(equipmentId));
              },
            ),
            IconButton(
              icon: const Icon(Icons.delete_outline_rounded, color: Colors.red),
              onPressed: () async {
                final reason = await showDeleteDialog(context, requireReason: false);
                if (reason == null || !context.mounted) return;
                try {
                  await EquipmentService().delete(equipmentId);
                  ref.invalidate(equipmentPagedProvider(ref.read(equipmentSearchProvider)));
                  if (context.mounted) context.pop();
                } catch (e) {
                  if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(content: Text(e.toString()), backgroundColor: Colors.red.shade800));
                }
              },
            ),
          ],
        ],
      ),
      floatingActionButton: isAdmin
          ? FloatingActionButton.extended(
              backgroundColor: AppTheme.brand,
              icon: const Icon(Icons.add_rounded, color: Colors.white),
              label: const Text('Add Device', style: TextStyle(color: Colors.white)),
              onPressed: () async {
                final result = await Navigator.push(context,
                    MaterialPageRoute(builder: (_) => DeviceFormScreen(equipmentId: equipmentId)));
                if (result == true) ref.invalidate(equipmentDetailProvider(equipmentId));
              },
            )
          : null,
      body: async.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.brand)),
        error: (err, _) => Center(child: Text(err.toString(), style: const TextStyle(color: Colors.white54))),
        data: (item) => _Body(item: item, isAdmin: isAdmin, equipmentId: equipmentId, ref: ref),
      ),
    );
  }
}

class _Body extends StatelessWidget {
  final EquipmentModel item;
  final bool isAdmin;
  final int equipmentId;
  final WidgetRef ref;

  const _Body({required this.item, required this.isAdmin, required this.equipmentId, required this.ref});

  @override
  Widget build(BuildContext context) {
    return ListView(
      padding: const EdgeInsets.fromLTRB(16, 16, 16, 100),
      children: [
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text(item.itemCode,
                  style: const TextStyle(color: AppTheme.brand, fontSize: 13, fontWeight: FontWeight.w600)),
              const SizedBox(height: 6),
              Text(item.article,
                  style: const TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
              const SizedBox(height: 4),
              Text(item.equipmentType, style: const TextStyle(color: Colors.white54)),
            ]),
          ),
        ),
        const SizedBox(height: 12),
        _card('Details', [
          _row('Type', item.type),
          _row('Office', item.office),
          _row('Location', item.location),
          _row('Accountable Person', item.accountablePerson),
          if (item.accountablePersonPhone != null) _row('Phone', item.accountablePersonPhone!),
          if (item.accountablePersonEmail != null) _row('Email', item.accountablePersonEmail!),
          if (item.description != null && item.description!.isNotEmpty) _row('Description', item.description!),
        ]),
        const SizedBox(height: 12),
        Card(
          child: Padding(
            padding: const EdgeInsets.all(16),
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Row(children: [
                const Text('DEVICES',
                    style: TextStyle(color: Colors.white54, fontSize: 12,
                        fontWeight: FontWeight.w600, letterSpacing: 0.8)),
                const Spacer(),
                Container(
                  padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                  decoration: BoxDecoration(
                    color: AppTheme.brand.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text('${item.deviceCount}',
                      style: const TextStyle(color: AppTheme.brand, fontSize: 12, fontWeight: FontWeight.w700)),
                ),
              ]),
              const SizedBox(height: 12),
              if (item.devices.isEmpty)
                const Text('No devices loaded.', style: TextStyle(color: Colors.white38, fontSize: 13))
              else
                ...item.devices.map((d) => _DeviceTile(
                  device: d,
                  isAdmin: isAdmin,
                  equipmentId: equipmentId,
                  ref: ref,
                )),
            ]),
          ),
        ),
        const SizedBox(height: 24),
      ],
    );
  }

  Widget _card(String title, List<Widget> rows) => Card(
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
            Text(title,
                style: const TextStyle(color: Colors.white54, fontSize: 12,
                    fontWeight: FontWeight.w600, letterSpacing: 0.8)),
            const SizedBox(height: 12),
            ...rows,
          ]),
        ),
      );

  Widget _row(String label, String value) => Padding(
        padding: const EdgeInsets.only(bottom: 10),
        child: Row(crossAxisAlignment: CrossAxisAlignment.start, children: [
          SizedBox(width: 150, child: Text(label, style: const TextStyle(color: Colors.white38, fontSize: 13))),
          Expanded(child: Text(value, style: const TextStyle(color: Colors.white, fontSize: 13))),
        ]),
      );
}

class _DeviceTile extends StatelessWidget {
  final DeviceModel device;
  final bool isAdmin;
  final int equipmentId;
  final WidgetRef ref;

  const _DeviceTile({required this.device, required this.isAdmin, required this.equipmentId, required this.ref});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(bottom: 10),
      padding: const EdgeInsets.all(12),
      decoration: BoxDecoration(
        color: AppTheme.bg,
        borderRadius: BorderRadius.circular(8),
        border: Border.all(color: AppTheme.border),
      ),
      child: Row(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Expanded(
            child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              if (device.model != null)
                Text(device.model!,
                    style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w500, fontSize: 14)),
              if (device.serialNumber != null)
                Text('S/N: ${device.serialNumber}', style: const TextStyle(color: Colors.white54, fontSize: 12)),
              if (device.itemCode != null)
                Text('Code: ${device.itemCode}', style: const TextStyle(color: Colors.white38, fontSize: 12)),
              if (device.amountValue != null)
                Text('₱${device.amountValue!.toStringAsFixed(2)}',
                    style: const TextStyle(color: AppTheme.brand, fontSize: 12)),
            ]),
          ),
          if (isAdmin)
            Row(children: [
              InkWell(
                onTap: () async {
                  final result = await Navigator.push(context,
                      MaterialPageRoute(builder: (_) => DeviceFormScreen(equipmentId: equipmentId, device: device)));
                  if (result == true) ref.invalidate(equipmentDetailProvider(equipmentId));
                },
                child: const Padding(
                  padding: EdgeInsets.all(4),
                  child: Icon(Icons.edit_outlined, size: 18, color: Colors.white54),
                ),
              ),
              InkWell(
                onTap: () async {
                  final confirm = await showDeleteDialog(context, requireReason: false);
                  if (confirm == null || !context.mounted) return;
                  try {
                    await EquipmentService().deleteDevice(equipmentId, device.id);
                    ref.invalidate(equipmentDetailProvider(equipmentId));
                  } catch (e) {
                    if (context.mounted) ScaffoldMessenger.of(context).showSnackBar(
                      SnackBar(content: Text(e.toString()), backgroundColor: Colors.red.shade800));
                  }
                },
                child: const Padding(
                  padding: EdgeInsets.all(4),
                  child: Icon(Icons.delete_outline_rounded, size: 18, color: Colors.red),
                ),
              ),
            ]),
        ],
      ),
    );
  }
}
