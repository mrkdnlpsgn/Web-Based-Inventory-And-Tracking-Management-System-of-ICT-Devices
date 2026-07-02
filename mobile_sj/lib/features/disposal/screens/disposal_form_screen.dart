import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../model/disposal_model.dart';
import '../data/disposal_service.dart';
import '../provider/disposal_provider.dart';
import '../../../features/assets/model/asset_model.dart';
import '../../../shared/widgets/asset_picker.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/api/api_exception.dart';

class DisposalFormScreen extends ConsumerStatefulWidget {
  final DisposalModel? disposal;
  final AssetModel? preselectedAsset;
  const DisposalFormScreen({super.key, this.disposal, this.preselectedAsset});

  @override
  ConsumerState<DisposalFormScreen> createState() => _DisposalFormScreenState();
}

class _DisposalFormScreenState extends ConsumerState<DisposalFormScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _loading = false;

  late final TextEditingController _reason;
  late final TextEditingController _inspectionFindings;
  late final TextEditingController _approvedBy;

  AssetModel? _selectedAsset;
  String _recommendedMethod = 'AUCTION';
  String _disposalStatus = 'PENDING';
  DateTime? _inspectionDate;

  bool get _isEdit => widget.disposal != null;

  @override
  void initState() {
    super.initState();
    final d = widget.disposal;
    _reason = TextEditingController(text: d?.reason ?? '');
    _inspectionFindings = TextEditingController(text: d?.inspectionFindings ?? '');
    _approvedBy = TextEditingController(text: d?.approvedBy ?? '');
    _recommendedMethod = d?.recommendedMethod ?? 'AUCTION';
    _disposalStatus = d?.disposalStatus ?? 'PENDING';
    _selectedAsset = widget.preselectedAsset;
    if (d?.inspectionDate != null) _inspectionDate = DateTime.tryParse(d!.inspectionDate);
  }

  @override
  void dispose() {
    for (final c in [_reason, _inspectionFindings, _approvedBy]) c.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedAsset == null) { _showError('Please select an asset.'); return; }
    if (_inspectionDate == null) { _showError('Please select an inspection date.'); return; }
    setState(() => _loading = true);
    try {
      final data = {
        'assetId': _selectedAsset!.id,
        'reason': _reason.text.trim(),
        'inspectionFindings': _inspectionFindings.text.trim(),
        'recommendedMethod': _recommendedMethod,
        'disposalStatus': _disposalStatus,
        'inspectionDate': _inspectionDate!.toIso8601String().substring(0, 10),
        'approvedBy': _approvedBy.text.trim().isEmpty ? null : _approvedBy.text.trim(),
      };
      final service = DisposalService();
      if (_isEdit) {
        await service.update(widget.disposal!.id, data);
      } else {
        await service.create(data);
      }
      ref.invalidate(disposalPagedProvider(ref.read(disposalSearchProvider)));
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
    return Scaffold(
      appBar: AppBar(title: Text(_isEdit ? 'Edit Disposal' : 'New Disposal')),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(16),
          children: [
            _assetSelector(),
            const SizedBox(height: 14),
            _enumDropdown('Recommended Method', _recommendedMethod,
              ['AUCTION', 'DESTRUCTION', 'DONATION', 'TRANSFER'], (v) => setState(() => _recommendedMethod = v!)),
            _enumDropdown('Status', _disposalStatus,
              ['PENDING', 'APPROVED', 'COMPLETED'], (v) => setState(() => _disposalStatus = v!)),
            _datePicker(),
            _field(_reason, 'Reason for Disposal', required: true, maxLines: 3),
            _field(_inspectionFindings, 'Inspection Findings', required: true, maxLines: 3),
            _field(_approvedBy, 'Approved By'),
            const SizedBox(height: 24),
            SizedBox(
              height: 50,
              child: ElevatedButton(
                onPressed: _loading ? null : _submit,
                child: _loading
                    ? const SizedBox(width: 20, height: 20,
                        child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                    : Text(_isEdit ? 'Save Changes' : 'Create Record'),
              ),
            ),
            const SizedBox(height: 24),
          ],
        ),
      ),
    );
  }

  Widget _assetSelector() {
    return InkWell(
      onTap: () async {
        final picked = await showAssetPicker(context, ref);
        if (picked != null) setState(() => _selectedAsset = picked);
      },
      child: InputDecorator(
        decoration: const InputDecoration(labelText: 'Asset'),
        child: _selectedAsset != null
            ? Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
                Text(_selectedAsset!.description, style: const TextStyle(color: Colors.white, fontSize: 14)),
                Text(_selectedAsset!.propertyNumber, style: const TextStyle(color: AppTheme.brand, fontSize: 12)),
              ])
            : const Text('Tap to select asset', style: TextStyle(color: Colors.white38)),
      ),
    );
  }

  Widget _field(TextEditingController ctrl, String label,
      {bool required = false, int maxLines = 1}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: TextFormField(
        controller: ctrl,
        maxLines: maxLines,
        decoration: InputDecoration(labelText: label),
        validator: required ? (v) => (v == null || v.trim().isEmpty) ? 'Required' : null : null,
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
        items: options.map((e) => DropdownMenuItem(value: e, child: Text(e))).toList(),
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
            initialDate: _inspectionDate ?? DateTime.now(),
            firstDate: DateTime(2000),
            lastDate: DateTime.now(),
            builder: (ctx, child) => Theme(
              data: Theme.of(ctx).copyWith(
                colorScheme: const ColorScheme.dark(primary: AppTheme.brand, surface: AppTheme.surface),
              ),
              child: child!,
            ),
          );
          if (picked != null) setState(() => _inspectionDate = picked);
        },
        child: InputDecorator(
          decoration: const InputDecoration(labelText: 'Inspection Date'),
          child: Text(
            _inspectionDate != null ? _inspectionDate!.toIso8601String().substring(0, 10) : 'Tap to select',
            style: TextStyle(color: _inspectionDate != null ? Colors.white : Colors.white38),
          ),
        ),
      ),
    );
  }
}
