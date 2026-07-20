import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import 'package:package_info_plus/package_info_plus.dart';
import '../../../core/api/api_client.dart';
import '../../../core/theme/app_theme.dart';
import '../../../shared/widgets/status_badge.dart';
import '../../../shared/widgets/main_shell.dart';
import '../../auth/provider/auth_provider.dart';
import '../provider/settings_provider.dart';

class SettingsScreen extends ConsumerWidget {
  const SettingsScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final settings = ref.watch(settingsProvider);
    final notifier = ref.read(settingsProvider.notifier);
    final user = ref.watch(authProvider).value;

    return Scaffold(
      appBar: AppBar(title: const Text('Settings')),
      body: ListView(
        padding: EdgeInsets.fromLTRB(16, 16, 16, 16 + context.mainShellBottomInset),
        children: [
          _sectionLabel(context, 'APPEARANCE'),
          const SizedBox(height: 12),
          Card(
            child: Padding(
              padding: const EdgeInsets.all(16),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text('Theme',
                      style: TextStyle(color: context.colors.textPrimary, fontWeight: FontWeight.w600, fontSize: 15)),
                  const SizedBox(height: 4),
                  Text('Choose how San Jose GSO looks on this device.',
                      style: TextStyle(color: context.colors.textTertiary, fontSize: 13)),
                  const SizedBox(height: 14),
                  SegmentedButton<ThemeMode>(
                    segments: const [
                      ButtonSegment(value: ThemeMode.system, icon: Icon(Icons.brightness_auto_rounded), label: Text('System')),
                      ButtonSegment(value: ThemeMode.light, icon: Icon(Icons.light_mode_rounded), label: Text('Light')),
                      ButtonSegment(value: ThemeMode.dark, icon: Icon(Icons.dark_mode_rounded), label: Text('Dark')),
                    ],
                    selected: {settings.themeMode},
                    onSelectionChanged: (selection) => notifier.setThemeMode(selection.first),
                  ),
                  const Divider(height: 32),
                  Text('Text Size',
                      style: TextStyle(color: context.colors.textPrimary, fontWeight: FontWeight.w600, fontSize: 15)),
                  const SizedBox(height: 4),
                  Text('Adjust text size for easier reading.',
                      style: TextStyle(color: context.colors.textTertiary, fontSize: 13)),
                  const SizedBox(height: 14),
                  SegmentedButton<TextSizeOption>(
                    segments: TextSizeOption.values
                        .map((opt) => ButtonSegment(value: opt, label: Text(opt.label)))
                        .toList(),
                    selected: {settings.textSize},
                    onSelectionChanged: (selection) => notifier.setTextSize(selection.first),
                  ),
                ],
              ),
            ),
          ),
          const SizedBox(height: 24),
          _sectionLabel(context, 'ACCOUNT'),
          const SizedBox(height: 12),
          if (user != null) ...[
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                color: AppTheme.brand.withValues(alpha: 0.1),
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: AppTheme.brand.withValues(alpha: 0.3)),
              ),
              child: Row(
                children: [
                  Container(
                    width: 40,
                    height: 40,
                    alignment: Alignment.center,
                    decoration: BoxDecoration(
                      color: AppTheme.brand.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Text(
                      user.username.isNotEmpty ? user.username[0].toUpperCase() : '?',
                      style: const TextStyle(color: AppTheme.brand, fontWeight: FontWeight.w700, fontSize: 18),
                    ),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(user.username,
                            style: TextStyle(color: context.colors.textPrimary, fontWeight: FontWeight.w600, fontSize: 15)),
                        const SizedBox(height: 4),
                        StatusBadge(
                          label: user.role,
                          color: user.isAdmin ? AppTheme.brand : AppTheme.statusAssigned,
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 12),
          ],
          Card(
            child: ListTile(
              leading: const Icon(Icons.lock_reset_rounded, color: AppTheme.brand),
              title: Text('Change Password', style: TextStyle(color: context.colors.textPrimary)),
              trailing: Icon(Icons.chevron_right_rounded, color: context.colors.textSecondary),
              onTap: () => context.push('/settings/change-password'),
            ),
          ),
          const SizedBox(height: 24),
          _sectionLabel(context, 'CONNECTION'),
          const SizedBox(height: 12),
          const _ServerAddressCard(),
          const SizedBox(height: 24),
          _sectionLabel(context, 'ABOUT'),
          const SizedBox(height: 12),
          Card(
            child: ListTile(
              leading: const Icon(Icons.privacy_tip_outlined, color: AppTheme.brand),
              title: Text('Privacy, Terms & Conditions', style: TextStyle(color: context.colors.textPrimary)),
              trailing: Icon(Icons.chevron_right_rounded, color: context.colors.textSecondary),
              onTap: () => context.push('/legal'),
            ),
          ),
          const SizedBox(height: 12),
          const _AboutCard(),
        ],
      ),
    );
  }

  Widget _sectionLabel(BuildContext context, String label) => Text(
        label,
        style: TextStyle(
          color: context.colors.textTertiary,
          fontSize: 12,
          fontWeight: FontWeight.w600,
          letterSpacing: 0.8,
        ),
      );
}

enum _TestResult { none, testing, success, failure }

class _ServerAddressCard extends ConsumerStatefulWidget {
  const _ServerAddressCard();

  @override
  ConsumerState<_ServerAddressCard> createState() => _ServerAddressCardState();
}

class _ServerAddressCardState extends ConsumerState<_ServerAddressCard> {
  late final TextEditingController _ctrl;
  _TestResult _testResult = _TestResult.none;
  String? _testError;

  @override
  void initState() {
    super.initState();
    _ctrl = TextEditingController(text: ref.read(settingsProvider).serverAddress);
  }

  @override
  void dispose() {
    _ctrl.dispose();
    super.dispose();
  }

  Future<void> _test() async {
    final address = _ctrl.text.trim();
    if (address.isEmpty) return;
    setState(() { _testResult = _TestResult.testing; _testError = null; });
    try {
      final res = await Dio().get(
        'http://$address/actuator/health',
        options: Options(sendTimeout: const Duration(seconds: 6), receiveTimeout: const Duration(seconds: 6)),
      );
      setState(() => _testResult = (res.statusCode ?? 0) == 200 ? _TestResult.success : _TestResult.failure);
    } on DioException catch (e) {
      setState(() {
        _testResult = _TestResult.failure;
        _testError = e.type == DioExceptionType.connectionTimeout || e.type == DioExceptionType.connectionError
            ? 'Could not reach that address. Check the IP/port and that both devices are on the same network.'
            : e.message;
      });
    } catch (_) {
      setState(() => _testResult = _TestResult.failure);
    }
  }

  Future<void> _save() async {
    await ref.read(settingsProvider.notifier).setServerAddress(_ctrl.text.trim());
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Server address saved.'), behavior: SnackBarBehavior.floating),
      );
    }
  }

  Future<void> _reset() async {
    _ctrl.text = ApiClient.defaultAddress;
    await ref.read(settingsProvider.notifier).setServerAddress(null);
    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Reset to default server address.'), behavior: SnackBarBehavior.floating),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Text('Server Address',
                style: TextStyle(color: context.colors.textPrimary, fontWeight: FontWeight.w600, fontSize: 15)),
            const SizedBox(height: 4),
            Text('The backend host:port this app connects to — change this if the IP changes (e.g. a different Wi-Fi network).',
                style: TextStyle(color: context.colors.textTertiary, fontSize: 13)),
            const SizedBox(height: 14),
            TextField(
              controller: _ctrl,
              keyboardType: TextInputType.url,
              autocorrect: false,
              decoration: const InputDecoration(labelText: 'Host:Port', hintText: 'e.g. 192.168.1.7:8080'),
              onChanged: (_) => setState(() => _testResult = _TestResult.none),
            ),
            if (_testResult != _TestResult.none) ...[
              const SizedBox(height: 8),
              Row(
                children: [
                  if (_testResult == _TestResult.testing)
                    const SizedBox(width: 14, height: 14,
                        child: CircularProgressIndicator(strokeWidth: 2, color: AppTheme.brand))
                  else
                    Icon(
                      _testResult == _TestResult.success ? Icons.check_circle_rounded : Icons.error_rounded,
                      size: 16,
                      color: _testResult == _TestResult.success ? AppTheme.brand : Colors.red,
                    ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: Text(
                      _testResult == _TestResult.testing
                          ? 'Testing connection…'
                          : _testResult == _TestResult.success
                              ? 'Connected successfully.'
                              : _testError ?? 'Could not connect.',
                      style: TextStyle(
                        fontSize: 12.5,
                        color: _testResult == _TestResult.failure ? Colors.red.shade300 : context.colors.textSecondary,
                      ),
                    ),
                  ),
                ],
              ),
            ],
            const SizedBox(height: 14),
            Row(
              children: [
                Expanded(
                  child: OutlinedButton(
                    onPressed: _testResult == _TestResult.testing ? null : _test,
                    child: const Text('Test Connection'),
                  ),
                ),
                const SizedBox(width: 10),
                Expanded(
                  child: ElevatedButton(
                    onPressed: _save,
                    child: const Text('Save'),
                  ),
                ),
              ],
            ),
            TextButton(
              onPressed: _reset,
              child: Text('Reset to default (${ApiClient.defaultAddress})',
                  style: TextStyle(color: context.colors.textTertiary, fontSize: 12.5)),
            ),
          ],
        ),
      ),
    );
  }
}

class _AboutCard extends StatelessWidget {
  const _AboutCard();

  @override
  Widget build(BuildContext context) {
    return Card(
      child: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Row(
              children: [
                Container(
                  width: 40,
                  height: 40,
                  decoration: BoxDecoration(
                    color: AppTheme.brand.withValues(alpha: 0.15),
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Icon(Icons.location_city_rounded, color: AppTheme.brand, size: 22),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text('San Jose GSO',
                        style: TextStyle(color: context.colors.textPrimary, fontWeight: FontWeight.w600, fontSize: 15)),
                    Text('Enterprise Asset Management',
                        style: TextStyle(color: context.colors.textTertiary, fontSize: 12)),
                  ],
                ),
              ],
            ),
            const SizedBox(height: 16),
            FutureBuilder<PackageInfo>(
              future: PackageInfo.fromPlatform(),
              builder: (context, snapshot) {
                final version = snapshot.hasData
                    ? 'Version ${snapshot.data!.version} (${snapshot.data!.buildNumber})'
                    : 'Version —';
                return Text(version, style: TextStyle(color: context.colors.textTertiary, fontSize: 12.5));
              },
            ),
            const SizedBox(height: 4),
            Text('San Jose Municipal Hall · Batangas · Republic of the Philippines',
                style: TextStyle(color: context.colors.textTertiary, fontSize: 12.5)),
            const SizedBox(height: 4),
            Text('For access issues, contact the ICT Administrator.',
                style: TextStyle(color: context.colors.textTertiary, fontSize: 12.5)),
          ],
        ),
      ),
    );
  }
}
