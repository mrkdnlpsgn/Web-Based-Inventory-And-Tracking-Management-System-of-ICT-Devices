import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../model/equipment_model.dart';
import '../data/equipment_service.dart';
import '../provider/equipment_provider.dart';
import '../../../core/api/api_exception.dart';

class EquipmentFormScreen extends ConsumerStatefulWidget {
  final EquipmentModel? equipment;
  const EquipmentFormScreen({super.key, this.equipment});

  @override
  ConsumerState<EquipmentFormScreen> createState() => _EquipmentFormScreenState();
}

class _EquipmentFormScreenState extends ConsumerState<EquipmentFormScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _loading = false;

  late final TextEditingController _type;
  late final TextEditingController _equipmentType;
  late final TextEditingController _itemCode;
  late final TextEditingController _article;
  late final TextEditingController _office;
  late final TextEditingController _location;
  late final TextEditingController _description;
  late final TextEditingController _accountablePerson;
  late final TextEditingController _phone;
  late final TextEditingController _email;

  bool get _isEdit => widget.equipment != null;

  @override
  void initState() {
    super.initState();
    final e = widget.equipment;
    _type = TextEditingController(text: e?.type ?? '');
    _equipmentType = TextEditingController(text: e?.equipmentType ?? '');
    _itemCode = TextEditingController(text: e?.itemCode ?? '');
    _article = TextEditingController(text: e?.article ?? '');
    _office = TextEditingController(text: e?.office ?? '');
    _location = TextEditingController(text: e?.location ?? '');
    _description = TextEditingController(text: e?.description ?? '');
    _accountablePerson = TextEditingController(text: e?.accountablePerson ?? '');
    _phone = TextEditingController(text: e?.accountablePersonPhone ?? '');
    _email = TextEditingController(text: e?.accountablePersonEmail ?? '');
  }

  @override
  void dispose() {
    for (final c in [_type, _equipmentType, _itemCode, _article, _office,
        _location, _description, _accountablePerson, _phone, _email]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    try {
      final data = {
        'type': _type.text.trim(),
        'equipmentType': _equipmentType.text.trim(),
        'itemCode': _itemCode.text.trim(),
        'article': _article.text.trim(),
        'office': _office.text.trim(),
        'location': _location.text.trim(),
        'description': _description.text.trim().isEmpty ? null : _description.text.trim(),
        'accountablePerson': _accountablePerson.text.trim(),
        'accountablePersonPhone': _phone.text.trim().isEmpty ? null : _phone.text.trim(),
        'accountablePersonEmail': _email.text.trim().isEmpty ? null : _email.text.trim(),
      };
      final service = EquipmentService();
      if (_isEdit) {
        await service.update(widget.equipment!.id, data);
      } else {
        await service.create(data);
      }
      ref.invalidate(equipmentPagedProvider(ref.read(equipmentSearchProvider)));
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
      {bool required = false, TextInputType? keyboardType, int maxLines = 1}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: TextFormField(
        controller: ctrl,
        keyboardType: keyboardType,
        maxLines: maxLines,
        decoration: InputDecoration(labelText: label),
        validator: required ? (v) => (v == null || v.trim().isEmpty) ? 'Required' : null : null,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: Text(_isEdit ? 'Edit Equipment' : 'New Equipment')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _field(_itemCode, 'Item Code', required: true),
            _field(_article, 'Article / Name', required: true),
            _field(_type, 'Type', required: true),
            _field(_equipmentType, 'Equipment Type', required: true),
            _field(_office, 'Office', required: true),
            _field(_location, 'Location', required: true),
            _field(_accountablePerson, 'Accountable Person', required: true),
            _field(_phone, 'Phone', keyboardType: TextInputType.phone),
            _field(_email, 'Email', keyboardType: TextInputType.emailAddress),
            _field(_description, 'Description', maxLines: 3),
            const SizedBox(height: 24),
            SizedBox(
              height: 50,
              child: ElevatedButton(
                onPressed: _loading ? null : _submit,
                child: _loading
                    ? const SizedBox(width: 20, height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : Text(_isEdit ? 'Save Changes' : 'Create Equipment'),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }
}
