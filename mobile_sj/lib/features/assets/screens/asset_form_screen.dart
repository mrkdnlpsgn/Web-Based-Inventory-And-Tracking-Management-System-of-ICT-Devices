import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../model/asset_model.dart';
import '../data/asset_service.dart';
import '../provider/asset_provider.dart';
import '../../../shared/provider/reference_provider.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/api/api_exception.dart';

class AssetFormScreen extends ConsumerStatefulWidget {
  final AssetModel? asset; // null = create, non-null = edit
  const AssetFormScreen({super.key, this.asset});

  @override
  ConsumerState<AssetFormScreen> createState() => _AssetFormScreenState();
}

class _AssetFormScreenState extends ConsumerState<AssetFormScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _loading = false;

  late final TextEditingController _propertyNumber;
  late final TextEditingController _description;
  late final TextEditingController _quantity;
  late final TextEditingController _unitValue;
  late final TextEditingController _accountablePerson;
  late final TextEditingController _physicalCount;
  late final TextEditingController _location;
  late final TextEditingController _remarks;

  int? _categoryId;
  int? _officeId;
  String _condition = 'SERVICEABLE';
  String _lifecycleStatus = 'REGISTERED';
  DateTime? _acquisitionDate;

  bool get _isEdit => widget.asset != null;

  @override
  void initState() {
    super.initState();
    final a = widget.asset;
    _propertyNumber = TextEditingController(text: a?.propertyNumber ?? '');
    _description = TextEditingController(text: a?.description ?? '');
    _quantity = TextEditingController(text: a?.quantity.toString() ?? '1');
    _unitValue = TextEditingController(text: a?.unitValue.toStringAsFixed(2) ?? '');
    _accountablePerson = TextEditingController(text: a?.accountablePerson ?? '');
    _physicalCount = TextEditingController(text: a?.physicalCount?.toString() ?? '');
    _location = TextEditingController(text: a?.location ?? '');
    _remarks = TextEditingController(text: a?.remarks ?? '');
    _categoryId = a?.category.id;
    _officeId = a?.office.id;
    _condition = a?.condition ?? 'SERVICEABLE';
    _lifecycleStatus = a?.lifecycleStatus ?? 'REGISTERED';
    if (a?.acquisitionDate != null) {
      _acquisitionDate = DateTime.tryParse(a!.acquisitionDate);
    }
  }

  @override
  void dispose() {
    for (final c in [_propertyNumber, _description, _quantity, _unitValue,
        _accountablePerson, _physicalCount, _location, _remarks]) {
      c.dispose();
    }
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_acquisitionDate == null) {
      _showError('Please select an acquisition date.');
      return;
    }
    setState(() => _loading = true);
    try {
      final data = {
        'propertyNumber': _propertyNumber.text.trim(),
        'description': _description.text.trim(),
        'categoryId': _categoryId,
        'quantity': int.parse(_quantity.text.trim()),
        'acquisitionDate': _acquisitionDate!.toIso8601String().substring(0, 10),
        'unitValue': double.parse(_unitValue.text.trim()),
        'officeId': _officeId,
        'accountablePerson': _accountablePerson.text.trim().isEmpty ? null : _accountablePerson.text.trim(),
        'physicalCount': _physicalCount.text.trim().isEmpty ? null : int.parse(_physicalCount.text.trim()),
        'location': _location.text.trim(),
        'condition': _condition,
        'lifecycleStatus': _lifecycleStatus,
        'remarks': _remarks.text.trim().isEmpty ? null : _remarks.text.trim(),
      };
      final service = AssetService();
      if (_isEdit) {
        await service.update(widget.asset!.id, data);
      } else {
        await service.create(data);
      }
      ref.invalidate(assetsPagedProvider(ref.read(assetSearchProvider)));
      if (mounted) Navigator.pop(context, true);
    } on ApiException catch (e) {
      _showError(e.message);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  void _showError(String msg) {
    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(content: Text(msg), backgroundColor: Colors.red.shade800, behavior: SnackBarBehavior.floating),
    );
  }

  @override
  Widget build(BuildContext context) {
    final categoriesAsync = ref.watch(categoriesProvider);
    final officesAsync = ref.watch(officesProvider);

    return Scaffold(
      appBar: AppBar(title: Text(_isEdit ? 'Edit Asset' : 'New Asset')),
      body: categoriesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.brand)),
        error: (e, _) => Center(child: Text(e.toString())),
        data: (categories) => officesAsync.when(
          loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.brand)),
          error: (e, _) => Center(child: Text(e.toString())),
          data: (offices) => Form(
            key: _formKey,
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                _field(_propertyNumber, 'Property Number', required: true),
                _field(_description, 'Description', required: true),
                _dropdown<CategoryModel>(
                  label: 'Category',
                  value: categories.where((c) => c.id == _categoryId).firstOrNull,
                  items: categories,
                  itemLabel: (c) => c.categoryName,
                  onChanged: (c) => setState(() => _categoryId = c?.id),
                ),
                _field(_quantity, 'Quantity', keyboardType: TextInputType.number, required: true),
                _datePicker(),
                _field(_unitValue, 'Unit Value (₱)', keyboardType: TextInputType.number, required: true),
                _dropdown<OfficeModel>(
                  label: 'Office',
                  value: offices.where((o) => o.id == _officeId).firstOrNull,
                  items: offices,
                  itemLabel: (o) => o.officeName,
                  onChanged: (o) => setState(() => _officeId = o?.id),
                ),
                _field(_location, 'Location', required: true),
                _field(_accountablePerson, 'Accountable Person'),
                _field(_physicalCount, 'Physical Count', keyboardType: TextInputType.number),
                _enumDropdown('Condition', _condition,
                  ['SERVICEABLE', 'REPAIRABLE', 'UNSERVICEABLE'],
                  (v) => setState(() => _condition = v!)),
                _enumDropdown('Lifecycle Status', _lifecycleStatus,
                  ['REGISTERED', 'ASSIGNED', 'TRANSFERRED', 'UNDER_MAINTENANCE', 'DISPOSED', 'ARCHIVED'],
                  (v) => setState(() => _lifecycleStatus = v!)),
                _field(_remarks, 'Remarks', maxLines: 3),
                const SizedBox(height: 24),
                SizedBox(
                  height: 50,
                  child: ElevatedButton(
                    onPressed: _loading ? null : _submit,
                    child: _loading
                        ? const SizedBox(width: 20, height: 20,
                            child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                        : Text(_isEdit ? 'Save Changes' : 'Create Asset'),
                  ),
                ),
                const SizedBox(height: 24),
              ],
            ),
          ),
        ),
      ),
    );
  }

  Widget _field(TextEditingController ctrl, String label,
      {TextInputType? keyboardType, bool required = false, int maxLines = 1}) {
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

  Widget _dropdown<T>({
    required String label,
    required T? value,
    required List<T> items,
    required String Function(T) itemLabel,
    required void Function(T?) onChanged,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: DropdownButtonFormField<T>(
        initialValue: value,
        decoration: InputDecoration(labelText: label),
        dropdownColor: AppTheme.surface,
        items: items.map((e) => DropdownMenuItem(value: e, child: Text(itemLabel(e)))).toList(),
        onChanged: onChanged,
        validator: (v) => v == null ? 'Required' : null,
      ),
    );
  }

  Widget _enumDropdown(String label, String value, List<String> options, void Function(String?) onChanged) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: DropdownButtonFormField<String>(
        initialValue: value,
        decoration: InputDecoration(labelText: label),
        dropdownColor: AppTheme.surface,
        items: options.map((e) => DropdownMenuItem(value: e, child: Text(e.replaceAll('_', ' ')))).toList(),
        onChanged: onChanged,
      ),
    );
  }

  Widget _datePicker() {
    return Padding(
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
                : 'Tap to select',
            style: TextStyle(color: _acquisitionDate != null ? Colors.white : Colors.white38),
          ),
        ),
      ),
    );
  }
}
