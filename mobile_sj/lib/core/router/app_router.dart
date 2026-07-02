import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';
import '../../features/auth/provider/auth_provider.dart';
import '../../features/auth/screens/login_screen.dart';
import '../../features/dashboard/screens/dashboard_screen.dart';
import '../../features/assets/screens/asset_list_screen.dart';
import '../../features/assets/screens/asset_detail_screen.dart';
import '../../features/maintenance/screens/maintenance_list_screen.dart';
import '../../features/maintenance/screens/maintenance_detail_screen.dart';
import '../../features/disposal/screens/disposal_list_screen.dart';
import '../../features/disposal/screens/disposal_detail_screen.dart';
import '../../features/equipment/screens/equipment_list_screen.dart';
import '../../features/equipment/screens/equipment_detail_screen.dart';

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
      GoRoute(
        path: '/assets/:id',
        builder: (_, state) => AssetDetailScreen(assetId: int.parse(state.pathParameters['id']!)),
      ),
      GoRoute(path: '/maintenance', builder: (_, __) => const MaintenanceListScreen()),
      GoRoute(
        path: '/maintenance/:id',
        builder: (_, state) => MaintenanceDetailScreen(maintenanceId: int.parse(state.pathParameters['id']!)),
      ),
      GoRoute(path: '/disposal', builder: (_, __) => const DisposalListScreen()),
      GoRoute(
        path: '/disposal/:id',
        builder: (_, state) => DisposalDetailScreen(disposalId: int.parse(state.pathParameters['id']!)),
      ),
      GoRoute(path: '/equipment', builder: (_, __) => const EquipmentListScreen()),
      GoRoute(
        path: '/equipment/:id',
        builder: (_, state) => EquipmentDetailScreen(equipmentId: int.parse(state.pathParameters['id']!)),
      ),
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
