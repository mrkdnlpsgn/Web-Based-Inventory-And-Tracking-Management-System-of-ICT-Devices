import 'package:flutter/material.dart';

class AppTheme {
  static const Color brand = Color(0xFF1FAD55);     // matches web brand-500
  static const Color brandDark = Color(0xFF178A44);
  static const Color bg = Color(0xFF09090B);         // zinc-950
  static const Color surface = Color(0xFF18181B);    // zinc-900
  static const Color border = Color(0xFF27272A);     // zinc-800

  // Lifecycle status colors — mirrors web
  static const Color statusAssigned = Color(0xFF3B82F6);       // blue
  static const Color statusMaintenance = Color(0xFFF59E0B);    // amber
  static const Color statusDisposed = Color(0xFFEF4444);       // red
  static const Color statusTransferred = Color(0xFF60A5FA);    // blue-400
  static const Color statusRegistered = Color(0xFF6B7280);     // gray

  static ThemeData get dark => ThemeData(
        useMaterial3: true,
        brightness: Brightness.dark,
        scaffoldBackgroundColor: bg,
        colorScheme: const ColorScheme.dark(
          primary: brand,
          onPrimary: Colors.white,
          surface: surface,
          onSurface: Colors.white,
          outline: border,
        ),
        appBarTheme: const AppBarTheme(
          backgroundColor: surface,
          foregroundColor: Colors.white,
          elevation: 0,
          surfaceTintColor: Colors.transparent,
          titleTextStyle: TextStyle(
            color: Colors.white,
            fontSize: 18,
            fontWeight: FontWeight.w600,
          ),
        ),
        cardTheme: CardThemeData(
          color: surface,
          elevation: 0,
          shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12),
            side: const BorderSide(color: border),
          ),
        ),
        inputDecorationTheme: InputDecorationTheme(
          filled: true,
          fillColor: surface,
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: border),
          ),
          enabledBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: border),
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: brand, width: 1.5),
          ),
          errorBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(8),
            borderSide: const BorderSide(color: Colors.red),
          ),
          labelStyle: const TextStyle(color: Colors.white54),
        ),
        elevatedButtonTheme: ElevatedButtonThemeData(
          style: ElevatedButton.styleFrom(
            backgroundColor: brand,
            foregroundColor: Colors.white,
            disabledBackgroundColor: brand.withValues(alpha: 0.4),
            padding: const EdgeInsets.symmetric(vertical: 14),
            shape:
                RoundedRectangleBorder(borderRadius: BorderRadius.circular(8)),
            elevation: 0,
            textStyle: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.w600,
            ),
          ),
        ),
        dividerTheme: const DividerThemeData(color: border, thickness: 1),
        listTileTheme: const ListTileThemeData(
          tileColor: surface,
          iconColor: Colors.white54,
        ),
      );
}
