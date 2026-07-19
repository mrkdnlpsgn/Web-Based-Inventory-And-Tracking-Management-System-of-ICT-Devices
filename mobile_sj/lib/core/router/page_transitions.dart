import 'package:flutter/material.dart';
import 'package:go_router/go_router.dart';
import '../theme/app_theme.dart';

/// Subtle fade + slight upward slide, used in place of go_router's default
/// platform slide transition for every route — a restrained, consistent
/// motion language across the app rather than per-platform defaults.
CustomTransitionPage<void> fadeThroughPage(BuildContext context, GoRouterState state, Widget child) {
  final reduceMotion = context.prefersReducedMotion;
  return CustomTransitionPage<void>(
    key: state.pageKey,
    child: child,
    transitionDuration: AppTheme.motionMedium,
    reverseTransitionDuration: AppTheme.motionFast,
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      final curved = CurvedAnimation(parent: animation, curve: AppTheme.motionCurve);
      if (reduceMotion) {
        return FadeTransition(opacity: curved, child: child);
      }
      return FadeTransition(
        opacity: curved,
        child: SlideTransition(
          position: Tween<Offset>(begin: const Offset(0, 0.02), end: Offset.zero).animate(curved),
          child: child,
        ),
      );
    },
  );
}

/// Same motion as [fadeThroughPage], packaged for a plain `Navigator.push`
/// (e.g. a one-off screen mid-flow that isn't a deep-linkable go_router route)
/// so it doesn't fall back to the platform-default push transition.
PageRouteBuilder<void> fadeThroughRoute(Widget child) {
  return PageRouteBuilder<void>(
    transitionDuration: AppTheme.motionMedium,
    reverseTransitionDuration: AppTheme.motionFast,
    pageBuilder: (context, animation, secondaryAnimation) => child,
    transitionsBuilder: (context, animation, secondaryAnimation, child) {
      final curved = CurvedAnimation(parent: animation, curve: AppTheme.motionCurve);
      return FadeTransition(
        opacity: curved,
        child: SlideTransition(
          position: Tween<Offset>(begin: const Offset(0, 0.02), end: Offset.zero).animate(curved),
          child: child,
        ),
      );
    },
  );
}
