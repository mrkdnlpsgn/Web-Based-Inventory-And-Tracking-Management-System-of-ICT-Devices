import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../model/account_model.dart';
import '../data/account_service.dart';
import '../../assets/model/asset_model.dart';
import '../../../shared/provider/reference_provider.dart';
import '../../../shared/widgets/delete_dialog.dart';
import '../../../core/theme/app_theme.dart';
import '../../../core/api/api_exception.dart';
import '../../auth/provider/auth_provider.dart';

class AccountFormScreen extends ConsumerStatefulWidget {
  final AccountModel? account; // null = create, non-null = edit
  const AccountFormScreen({super.key, this.account});

  @override
  ConsumerState<AccountFormScreen> createState() => _AccountFormScreenState();
}

class _AccountFormScreenState extends ConsumerState<AccountFormScreen> {
  final _formKey = GlobalKey<FormState>();
  bool _loading = false;

  late final TextEditingController _username;
  late final TextEditingController _fullName;
  late final TextEditingController _password;

  String _role = 'STAFF';
  int? _officeId;
  bool _isActive = true;

  bool get _isEdit => widget.account != null;

  @override
  void initState() {
    super.initState();
    final a = widget.account;
    _username = TextEditingController(text: a?.username ?? '');
    _fullName = TextEditingController(text: a?.fullName ?? '');
    _password = TextEditingController();
    _role = a?.role ?? 'STAFF';
    _officeId = a?.officeId;
    _isActive = a?.isActive ?? true;
  }

  @override
  void dispose() {
    _username.dispose();
    _fullName.dispose();
    _password.dispose();
    super.dispose();
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _loading = true);
    try {
      final data = {
        'username': _username.text.trim(),
        'fullName': _fullName.text.trim(),
        'role': _role,
        'officeId': _officeId,
        'isActive': _isActive,
        if (_password.text.trim().isNotEmpty) 'password': _password.text.trim(),
      };
      final service = AccountService();
      if (_isEdit) {
        await service.update(widget.account!.id, data);
      } else {
        await service.create(data);
      }
      if (mounted) Navigator.pop(context, true);
    } on ApiException catch (e) {
      _showError(e.message);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _toggleActive() async {
    setState(() => _loading = true);
    try {
      await AccountService().update(widget.account!.id, {
        'fullName': widget.account!.fullName,
        'role': widget.account!.role,
        'officeId': widget.account!.officeId,
        'isActive': !_isActive,
      });
      if (mounted) Navigator.pop(context, true);
    } on ApiException catch (e) {
      _showError(e.message);
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _delete() async {
    final confirm = await showDeleteDialog(context, requireReason: false);
    if (confirm == null || !mounted) return;
    setState(() => _loading = true);
    try {
      await AccountService().delete(widget.account!.id);
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
    final officesAsync = ref.watch(officesProvider);
    final isSelf = _isEdit && widget.account!.username == ref.watch(authProvider).value?.username;

    return Scaffold(
      appBar: AppBar(
        title: Text(_isEdit ? 'Edit Account' : 'New Account'),
        actions: [
          if (_isEdit && !isSelf) ...[
            IconButton(
              icon: Icon(_isActive ? Icons.block_rounded : Icons.check_circle_outline_rounded,
                  color: _isActive ? Colors.orange : AppTheme.brand),
              tooltip: _isActive ? 'Deactivate' : 'Reactivate',
              onPressed: _loading ? null : _toggleActive,
            ),
            IconButton(
              icon: const Icon(Icons.delete_outline_rounded, color: Colors.red),
              tooltip: 'Delete',
              onPressed: _loading ? null : _delete,
            ),
          ],
        ],
      ),
      body: officesAsync.when(
        loading: () => const Center(child: CircularProgressIndicator(color: AppTheme.brand)),
        error: (e, _) => Center(child: Text(e.toString())),
        data: (offices) => Form(
          key: _formKey,
          child: ListView(
            padding: const EdgeInsets.all(16),
            children: [
              if (isSelf)
                Padding(
                  padding: const EdgeInsets.only(bottom: 14),
                  child: Container(
                    padding: const EdgeInsets.all(12),
                    decoration: BoxDecoration(
                      color: AppTheme.statusMaintenance.withValues(alpha: 0.1),
                      borderRadius: BorderRadius.circular(8),
                      border: Border.all(color: AppTheme.statusMaintenance.withValues(alpha: 0.3)),
                    ),
                    child: const Text(
                      "This is your own account — deactivate and delete are disabled here to prevent locking yourself out.",
                      style: TextStyle(color: AppTheme.statusMaintenance, fontSize: 12),
                    ),
                  ),
                ),
              _field(_username, 'Username', required: true, enabled: !_isEdit),
              _field(_fullName, 'Full Name', required: true),
              _field(_password, 'Password',
                  required: !_isEdit,
                  obscure: true,
                  hint: _isEdit ? 'Leave blank to keep current password' : 'Leave blank for default: changeme123'),
              _dropdown<String>(
                label: 'Role',
                value: _role,
                items: const ['ADMIN', 'STAFF'],
                itemLabel: (r) => r,
                onChanged: (r) => setState(() => _role = r!),
              ),
              _dropdown<OfficeModel?>(
                label: 'Office (optional)',
                value: offices.where((o) => o.id == _officeId).firstOrNull,
                items: [null, ...offices],
                itemLabel: (o) => o?.officeName ?? 'None',
                onChanged: (o) => setState(() => _officeId = o?.id),
                requireValue: false,
              ),
              SwitchListTile(
                value: _isActive,
                onChanged: isSelf ? null : (v) => setState(() => _isActive = v),
                activeThumbColor: AppTheme.brand,
                title: const Text('Active', style: TextStyle(color: Colors.white)),
                contentPadding: EdgeInsets.zero,
              ),
              const SizedBox(height: 24),
              SizedBox(
                height: 50,
                child: ElevatedButton(
                  onPressed: _loading ? null : _submit,
                  child: _loading
                      ? const SizedBox(width: 20, height: 20,
                          child: CircularProgressIndicator(strokeWidth: 2, color: Colors.white))
                      : Text(_isEdit ? 'Save Changes' : 'Create Account'),
                ),
              ),
              const SizedBox(height: 24),
            ],
          ),
        ),
      ),
    );
  }

  Widget _field(TextEditingController ctrl, String label,
      {bool required = false, bool obscure = false, bool enabled = true, String? hint}) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: TextFormField(
        controller: ctrl,
        obscureText: obscure,
        enabled: enabled,
        decoration: InputDecoration(labelText: label, hintText: hint),
        validator: required ? (v) => (v == null || v.trim().isEmpty) ? 'Required' : null : null,
      ),
    );
  }

  Widget _dropdown<T>({
    required String label,
    required T value,
    required List<T> items,
    required String Function(T) itemLabel,
    required void Function(T?) onChanged,
    bool requireValue = true,
  }) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 14),
      child: DropdownButtonFormField<T>(
        initialValue: value,
        isExpanded: true,
        decoration: InputDecoration(labelText: label),
        dropdownColor: AppTheme.surface,
        items: items.map((e) => DropdownMenuItem(
          value: e,
          child: Text(itemLabel(e), overflow: TextOverflow.ellipsis),
        )).toList(),
        onChanged: onChanged,
        validator: requireValue ? (v) => v == null ? 'Required' : null : null,
      ),
    );
  }
}
