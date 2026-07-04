import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../data/account_service.dart';
import '../model/account_model.dart';

final accountServiceProvider = Provider<AccountService>((ref) => AccountService());

final accountSearchProvider = StateProvider<String>((ref) => '');

final accountsProvider = FutureProvider.autoDispose<List<AccountModel>>((ref) {
  final search = ref.watch(accountSearchProvider);
  return ref.watch(accountServiceProvider).getAll(search: search);
});
