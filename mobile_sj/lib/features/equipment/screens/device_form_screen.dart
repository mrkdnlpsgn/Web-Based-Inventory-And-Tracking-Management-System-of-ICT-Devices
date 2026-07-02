import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../model/equipment_model.dart';
import '../data/equipment_service.dart';
import '../provider/equipment_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/api/api_exception.dart';

class DeviceFormScreen extends ConsumerStatefulWidget {
  final int equipmentId;
  final DeviceModel? device;
  const DeviceFormScreen({super.key, required this.equipmentId, this.device});

  @override
  ConsumerState<DeviceFormScreen> createState() => _DeviceFormScreenState();
}

class _DeviceFormScreenState extends ConsumerState<DeviceFormScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _loading = false;

  late final TextEditingController _itemCode;
  late final TextEditingController _serialNumber;
  late final TextEditingController _model;
  late final TextEditingController _amountValue;
  DateTime? _acquisitionDate;

  bool get _isEdit => widget.device != null;

  @override
  void initState() {
    super.initState();
    final d = widget.device;
    _itemCode = TextEditingController(text: d?.itemCode ?? '');
    _serialNumber = TextEditingController(text: d?.serialNumber ?? '');
    _model = TextEditingController(text: d?.model ?? '');
    _amountValue = TextEditingController(text: d?.amountValue?.toStringAsFixed(2) ?? '');
    if (d?.acquisitionDate != null) _acquisitionDate = DateTime.tryParse(d!.acquisitionDate!);
  }

  @override
  void dispose() {
    for (final c in [_itemCode, _serialNumber, _model, _amountValue]) c.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    try {
      final data = {
        'itemCode': _itemCode.text.trim().isEmpty ? null : _itemCode.text.trim(),
        'serialNumber': _serialNumber.text.trim().isEmpty ? null : _serialNumber.text.trim(),
        'model': _model.text.trim().isEmpty ? null : _model.text.trim(),
        'amountValue': _amountValue.text.trim().isEmpty ? null : double.parse(_amountValue.text.trim()),
        'acquisitionDate': _acquisitionDate?.toIso8601String().substring(0, 10),
      };
      final service = EquipmentService();
      if (_isEdit) {
        await service.updateDevice(widget.equipmentId, widget.device!.id, data);
      } else {
        await service.addDevice(widget.equipmentId, data);
      }
      ref.invalidate(equipmentDetailProvider(widget.equipmentId));
      if (mounted) Navigator.pop(context, true);
    } on ApiException catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text(e.message), backgroundColor: Colors.red.shade800, behavior: SnackBarBehavior.floating),
      );
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Widget _field(TextEditingController ctrl, String label,
      {TextInputType? keyboardType, bool required = false}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: TextFormField(
        controller: ctrl,
        keyboardType: keyboardType,
        decoration: InputDecoration(labelText: label),
        validator: required ? (v) => (v == null || v.trim().isEmpty) ? 'Required' : null : null,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(_isEdit ? 'Edit Device' : 'Add Device')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _field(_model, 'Model'),
            _field(_serialNumber, 'Serial Number'),
            _field(_itemCode, 'Item Code'),
            _field(_amountValue, 'Value (₱)', keyboardType: TextInputType.number),
            Padding(
              padding: const EdgeInsets.only(bottom: 14),
              child: InkWell(
                onTap: () async {
                  final picked = await showDatePicker(
                    context: context,
                    initialDate: _acquisitionDate ?? DateTime.now(),
                    firstDate: DateTime(1990),
                    lastDate: DateTime.now(),
                    builder: (ctx, child) => Theme(
                      data: Theme.of(ctx).copyWith(
                        colorScheme: const ColorScheme.dark(primary: AppTheme.brand, surface: AppTheme.surface),
                      ),
                      child: child!,
                    ),
                  );
                  if (picked != null) setState(() => _acquisitionDate = picked);
                },
                child: InputDecorator(
                  decoration: const InputDecoration(labelText: 'Acquisition Date'),
                  child: Text(
                    _acquisitionDate != null
                        ? _acquisitionDate!.toIso8601String().substring(0, 10)
                        : 'Tap to select (optional)',
                    style: TextStyle(
                        color: _acquisitionDate != null ? Colors.white : Colors.white38),
                  ),
                ),
              ),
            ),
            const SizedBox(height: 24),
            SizedBox(
              height: 50,
              child: ElevatedButton(
                onPressed: _loading ? null : _submit,
                child: _loading
                    ? const SizedBox(width: 20, height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : Text(_isEdit ? 'Save Changes' : 'Add Device'),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
