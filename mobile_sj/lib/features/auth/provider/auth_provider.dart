import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/auth_service.dart';
import '../model/user_model.dart';

final authServiceProvider = Provider<AuthService>((ref) => AuthService());

final authProvider = AsyncNotifierProvider<AuthNotifier, UserModel?>(AuthNotifier.new);

class AuthNotifier extends AsyncNotifier<UserModel?> {
  late AuthService _service;

  @override
  Future<UserModel?> build() async {
    _service = ref.read(authServiceProvider);
    // On app start, check if a valid session cookie already exists
    return _service.fetchCurrentUser();
  }

  Future<void> login(String identifier, String password) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(() => _service.login(identifier, password));
  }

  Future<void> completeForceChangePassword(String identifier, String currentPassword, String newPassword) async {
    state = const AsyncLoading();
    state = await AsyncValue.guard(
        () => _service.forceChangePassword(identifier, currentPassword, newPassword));
  }

  // Clears a MustChangePasswordRequired (or any) error left in state after the
  // caller has already handled it, so it isn't mistaken for a real auth failure.
  void clearError() {
    if (state.hasError) state = const AsyncData(null);
  }

  Future<void> logout() async {
    await _service.logout();
    state = const AsyncData(null);
  }

  Future<void> acknowledgePrivacy() async {
    final ackAt = await _service.acknowledgePrivacy();
    final current = state.value;
    if (current == null) return;
    state = AsyncData(UserModel(
      username: current.username,
      role: current.role,
      privacyAcknowledgedAt: ackAt,
    ));
  }
}
