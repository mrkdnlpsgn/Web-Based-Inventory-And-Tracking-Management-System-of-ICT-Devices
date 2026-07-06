import 'package:flutter/foundation.dart';

/// True on desktop targets (Windows/Linux/macOS) where there's no pull-to-refresh
/// gesture, so screens that also offer pull-to-refresh should still show a manual
/// refresh action. False on touch platforms (Android/iOS) where showing both is
/// redundant chrome.
bool get isDesktopPlatform =>
    defaultTargetPlatform == TargetPlatform.windows ||
    defaultTargetPlatform == TargetPlatform.linux ||
    defaultTargetPlatform == TargetPlatform.macOS;
