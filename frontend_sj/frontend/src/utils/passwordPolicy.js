export const PASSWORD_REQUIREMENTS = [
  { key: 'length',    label: '8–128 characters',                      test: (p) => p.length >= 8 && p.length <= 128 },
  { key: 'uppercase', label: 'One uppercase letter (A–Z)',             test: (p) => /[A-Z]/.test(p) },
  { key: 'lowercase', label: 'One lowercase letter (a–z)',             test: (p) => /[a-z]/.test(p) },
  { key: 'digit',     label: 'One number (0–9)',                      test: (p) => /[0-9]/.test(p) },
  { key: 'special',   label: 'One special character (@$!%*?&_#^-)',   test: (p) => /[@$!%*?&_#^-]/.test(p) },
]

export function isPasswordComplex(password) {
  return PASSWORD_REQUIREMENTS.every((r) => r.test(password))
}
