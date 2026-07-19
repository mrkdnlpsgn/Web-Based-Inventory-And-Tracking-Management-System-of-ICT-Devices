import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/provider/auth_provider.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/auth/screens/forgot_password_screen.dart';
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
import '../../features/recycle_bin/screens/recycle_bin_screen.dart';
import '../../features/qr_scanner/screens/qr_scanner_screen.dart';
import '../../features/settings/screens/settings_screen.dart';
import '../../features/settings/screens/change_password_screen.dart';
import '../../shared/widgets/main_shell.dart';
import 'page_transitions.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  final notifier = _RouterNotifier(ref);
  return GoRouter(
    initialLocation: '/login',
    refreshListenable: notifier,
    redirect: notifier.redirect,
    routes: [
      GoRoute(path: '/login', pageBuilder: (c, s) => fadeThroughPage(c, s, const LoginScreen())),
      GoRoute(path: '/forgot-password', pageBuilder: (c, s) => fadeThroughPage(c, s, const ForgotPasswordScreen())),
      // The four most-used destinations live in a bottom-nav shell so switching
      // between them preserves each tab's own navigation stack. Everything else
      // (Maintenance, Disposal, Reports, Accounts) stays a plain push below,
      // reachable from the Dashboard's module cards, and covers the bottom bar.
      StatefulShellRoute.indexedStack(
        builder: (_, __, navigationShell) => MainShell(navigationShell: navigationShell),
        branches: [
          StatefulShellBranch(routes: [
            GoRoute(path: '/dashboard', pageBuilder: (c, s) => fadeThroughPage(c, s, const DashboardScreen())),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/assets',
              pageBuilder: (c, s) => fadeThroughPage(c, s, const AssetListScreen()),
              routes: [
                // Static "new" must be declared before the ":id" wildcard below it, or
                // go_router (which matches routes in list order) would treat "new" as
                // an :id value instead of resolving this literal route.
                GoRoute(path: 'new', pageBuilder: (c, s) => fadeThroughPage(c, s, const AssetFormScreen())),
                GoRoute(
                  path: ':id',
                  pageBuilder: (c, s) => fadeThroughPage(c, s, AssetDetailScreen(assetId: int.parse(s.pathParameters['id']!))),
                ),
                GoRoute(
                  path: ':id/edit',
                  pageBuilder: (c, s) => fadeThroughPage(c, s, AssetFormScreen(asset: s.extra as AssetModel?)),
                ),
              ],
            ),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(path: '/qr-scanner', pageBuilder: (c, s) => fadeThroughPage(c, s, const QrScannerScreen())),
          ]),
          StatefulShellBranch(routes: [
            GoRoute(
              path: '/settings',
              pageBuilder: (c, s) => fadeThroughPage(c, s, const SettingsScreen()),
              routes: [
                GoRoute(path: 'change-password', pageBuilder: (c, s) => fadeThroughPage(c, s, const ChangePasswordScreen())),
              ],
            ),
          ]),
        ],
      ),
      GoRoute(path: '/maintenance', pageBuilder: (c, s) => fadeThroughPage(c, s, const MaintenanceListScreen())),
      GoRoute(path: '/maintenance/new', pageBuilder: (c, s) => fadeThroughPage(c, s, const MaintenanceFormScreen())),
      GoRoute(
        path: '/maintenance/:id',
        pageBuilder: (c, s) => fadeThroughPage(c, s, MaintenanceDetailScreen(maintenanceId: int.parse(s.pathParameters['id']!))),
      ),
      GoRoute(
        path: '/maintenance/:id/edit',
        pageBuilder: (c, s) => fadeThroughPage(c, s, MaintenanceFormScreen(maintenance: s.extra as MaintenanceModel?)),
      ),
      GoRoute(path: '/disposal', pageBuilder: (c, s) => fadeThroughPage(c, s, const DisposalListScreen())),
      GoRoute(path: '/disposal/new', pageBuilder: (c, s) => fadeThroughPage(c, s, const DisposalFormScreen())),
      GoRoute(
        path: '/disposal/:id',
        pageBuilder: (c, s) => fadeThroughPage(c, s, DisposalDetailScreen(disposalId: int.parse(s.pathParameters['id']!))),
      ),
      GoRoute(
        path: '/disposal/:id/edit',
        pageBuilder: (c, s) => fadeThroughPage(c, s, DisposalFormScreen(disposal: s.extra as DisposalModel?)),
      ),
      GoRoute(path: '/accounts', pageBuilder: (c, s) => fadeThroughPage(c, s, const AccountListScreen())),
      GoRoute(path: '/accounts/new', pageBuilder: (c, s) => fadeThroughPage(c, s, const AccountFormScreen())),
      GoRoute(
        path: '/accounts/:id/edit',
        pageBuilder: (c, s) => fadeThroughPage(c, s, AccountFormScreen(account: s.extra as AccountModel?)),
      ),
      GoRoute(path: '/reports', pageBuilder: (c, s) => fadeThroughPage(c, s, const ReportsListScreen())),
      GoRoute(
        path: '/reports/:id',
        pageBuilder: (c, s) => fadeThroughPage(c, s, ReportPreviewScreen(reportId: s.pathParameters['id']!)),
      ),
      GoRoute(path: '/recycle-bin', pageBuilder: (c, s) => fadeThroughPage(c, s, const RecycleBinScreen())),
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
    final onForgotPassword = state.matchedLocation == '/forgot-password';
    if (!isLoggedIn && !onLogin && !onForgotPassword) return '/login';
    if (isLoggedIn && (onLogin || onForgotPassword)) return '/dashboard';
    return null;
  }
}
