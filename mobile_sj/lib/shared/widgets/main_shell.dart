import 'dart:ui';
import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../../core/theme/app_theme.dart';

/// Material 3's default [NavigationBar] content height (excludes safe-area inset).
const double kMainShellBarHeight = 80;

/// How far a shell tab's scrollable content needs to pad its bottom so the
/// last item clears the translucent bottom bar instead of sitting behind it —
/// [MainShell] uses `extendBody`, so each tab's own body is responsible for
/// its own clearance under the bar.
extension MainShellClearanceX on BuildContext {
  double get mainShellBottomInset => kMainShellBarHeight + MediaQuery.of(this).padding.bottom;
}

/// Bottom-nav shell for the app's four most-used destinations. Everything
/// else (Maintenance, Disposal, Reports, Accounts, and their sub-screens)
/// stays reachable via the Dashboard's module cards and pushes outside this
/// shell, so it isn't squeezed into the bar.
class MainShell extends StatelessWidget {
  final StatefulNavigationShell navigationShell;

  const MainShell({super.key, required this.navigationShell});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      // Each tab's content scrolls fully behind the bar (see mainShellBottomInset
      // above for how each tab clears it), so the blur below has real content
      // moving underneath it — a flat strip with nothing behind it wouldn't
      // read as a material at all.
      extendBody: true,
      body: navigationShell,
      bottomNavigationBar: ClipRect(
        child: BackdropFilter(
          filter: ImageFilter.blur(sigmaX: 20, sigmaY: 20),
          child: DecoratedBox(
            decoration: BoxDecoration(
              color: context.colors.surface.withValues(alpha: 0.75),
              border: Border(top: BorderSide(color: context.colors.border)),
            ),
            child: NavigationBar(
              selectedIndex: navigationShell.currentIndex,
              onDestinationSelected: (index) => navigationShell.goBranch(
                index,
                initialLocation: index == navigationShell.currentIndex,
              ),
              backgroundColor: Colors.transparent,
              surfaceTintColor: Colors.transparent,
              elevation: 0,
              indicatorColor: AppTheme.brand.withValues(alpha: 0.15),
              destinations: const [
                NavigationDestination(
                  icon: Icon(Icons.dashboard_outlined),
                  selectedIcon: Icon(Icons.dashboard_rounded),
                  label: 'Dashboard',
                ),
                NavigationDestination(
                  icon: Icon(Icons.inventory_2_outlined),
                  selectedIcon: Icon(Icons.inventory_2_rounded),
                  label: 'Assets',
                ),
                NavigationDestination(
                  icon: Icon(Icons.qr_code_scanner_outlined),
                  selectedIcon: Icon(Icons.qr_code_scanner_rounded),
                  label: 'Scan',
                ),
                NavigationDestination(
                  icon: Icon(Icons.settings_outlined),
                  selectedIcon: Icon(Icons.settings_rounded),
                  label: 'Settings',
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
