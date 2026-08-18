// Shared form validation rules used by auth and checkout flows.

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const PHONE_RE = /^[0-9\-+\s]{7,}$/;

export const PASSWORD_RULES = [
  { label: 'At least 8 characters', test: (p) => String(p || '').length >= 8 },
  { label: 'One uppercase letter', test: (p) => /[A-Z]/.test(p || '') },
  { label: 'One lowercase letter', test: (p) => /[a-z]/.test(p || '') },
  { label: 'One number', test: (p) => /\d/.test(p || '') },
  { label: 'One special character', test: (p) => /[^A-Za-z0-9]/.test(p || '') },
];

export const PASSWORD_REQUIREMENTS_MESSAGE =
  'Password must be 8+ chars incl. upper, lower, number, symbol';

export function isValidEmail(email) {
  return EMAIL_RE.test(String(email || ''));
}

export function isValidPhone(phone) {
  return PHONE_RE.test(String(phone || ''));
}

export function isStrongPassword(password) {
  return PASSWORD_RULES.every((rule) => rule.test(password));
}
