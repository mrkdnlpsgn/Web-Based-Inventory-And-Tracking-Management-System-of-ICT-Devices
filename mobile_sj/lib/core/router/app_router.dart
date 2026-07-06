import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/provider/auth_provider.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/dashboard/screens/dashboard_screen.dart';
import '../../features/assets/screens/asset_list_screen.dart';
import '../../features/assets/screens/asset_detail_screen.dart';
import '../../features/assets/screens/asset_form_screen.dart';
import '../../features/assets/model/asset_model.dart';
import '../../features/maintenance/screens/maintenance_list_screen.dart';
import '../../features/maintenance/screens/maintenance_detail_screen.dart';
import '../../features/maintenance/screens/maintenance_form_screen.dart';
import '../../features/maintenance/model/maintenance_model.dart';
import '../../features/disposal/screens/disposal_list_screen.dart';
import '../../features/disposal/screens/disposal_detail_screen.dart';
import '../../features/disposal/screens/disposal_form_screen.dart';
import '../../features/disposal/model/disposal_model.dart';
import '../../features/accounts/screens/account_list_screen.dart';
import '../../features/accounts/screens/account_form_screen.dart';
import '../../features/accounts/model/account_model.dart';
import '../../features/reports/screens/reports_list_screen.dart';
import '../../features/reports/screens/report_preview_screen.dart';
import '../../features/qr_scanner/screens/qr_scanner_screen.dart';
import '../../features/settings/screens/settings_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final notifier = _RouterNotifier(ref);
  return GoRouter(
    initialLocation: '/login',
    refreshListenable: notifier,
    redirect: notifier.redirect,
    routes: [
      GoRoute(path: '/login', builder: (_, __) => const LoginScreen()),
      GoRoute(path: '/dashboard', builder: (_, __) => const DashboardScreen()),
      GoRoute(path: '/assets', builder: (_, __) => const AssetListScreen()),
      // Static "new" must be declared before the ":id" wildcard below it, or
      // go_router (which matches routes in list order) would treat "new" as
      // an :id value instead of resolving this literal route.
      GoRoute(path: '/assets/new', builder: (_, __) => const AssetFormScreen()),
      GoRoute(
        path: '/assets/:id',
        builder: (_, state) => AssetDetailScreen(assetId: int.parse(state.pathParameters['id']!)),
      ),
      GoRoute(
        path: '/assets/:id/edit',
        builder: (_, state) => AssetFormScreen(asset: state.extra as AssetModel?),
      ),
      GoRoute(path: '/maintenance', builder: (_, __) => const MaintenanceListScreen()),
      GoRoute(path: '/maintenance/new', builder: (_, __) => const MaintenanceFormScreen()),
      GoRoute(
        path: '/maintenance/:id',
        builder: (_, state) => MaintenanceDetailScreen(maintenanceId: int.parse(state.pathParameters['id']!)),
      ),
      GoRoute(
        path: '/maintenance/:id/edit',
        builder: (_, state) => MaintenanceFormScreen(maintenance: state.extra as MaintenanceModel?),
      ),
      GoRoute(path: '/disposal', builder: (_, __) => const DisposalListScreen()),
      GoRoute(path: '/disposal/new', builder: (_, __) => const DisposalFormScreen()),
      GoRoute(
        path: '/disposal/:id',
        builder: (_, state) => DisposalDetailScreen(disposalId: int.parse(state.pathParameters['id']!)),
      ),
      GoRoute(
        path: '/disposal/:id/edit',
        builder: (_, state) => DisposalFormScreen(disposal: state.extra as DisposalModel?),
      ),
      GoRoute(path: '/accounts', builder: (_, __) => const AccountListScreen()),
      GoRoute(path: '/accounts/new', builder: (_, __) => const AccountFormScreen()),
      GoRoute(
        path: '/accounts/:id/edit',
        builder: (_, state) => AccountFormScreen(account: state.extra as AccountModel?),
      ),
      GoRoute(path: '/reports', builder: (_, __) => const ReportsListScreen()),
      GoRoute(
        path: '/reports/:id',
        builder: (_, state) => ReportPreviewScreen(reportId: state.pathParameters['id']!),
      ),
      GoRoute(path: '/qr-scanner', builder: (_, __) => const QrScannerScreen()),
      GoRoute(path: '/settings', builder: (_, __) => const SettingsScreen()),
    ],
  );
});

class _RouterNotifier extends ChangeNotifier {
  final Ref _ref;

  _RouterNotifier(this._ref) {
    _ref.listen(authProvider, (_, __) => notifyListeners());
  }

  String? redirect(BuildContext context, GoRouterState state) {
    final authAsync = _ref.read(authProvider);
    if (authAsync.isLoading) return null;
    final isLoggedIn = authAsync.value != null;
    final onLogin = state.matchedLocation == '/login';
    if (!isLoggedIn && !onLogin) return '/login';
    if (isLoggedIn && onLogin) return '/dashboard';
    return null;
  }
}
